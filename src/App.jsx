import { Suspense, lazy, useEffect, useRef, useState } from "react";
import portfolio from "./data.js";

const CloudScene = lazy(() => import("./CloudScene.jsx"));
const portraitSizes = "(max-width: 480px) 220px, (max-width: 1024px) 300px, 420px";
const portraitWebpSrcSet = Object.entries(portfolio.image.webp)
  .map(([width, path]) => `${path} ${width}w`)
  .join(", ");
const portraitJpgSrcSet = Object.entries(portfolio.image.jpg)
  .map(([width, path]) => `${path} ${width}w`)
  .join(", ");

const icons = {
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19.05 4.7 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-7 0C5.27.65 4.09 1 4.09 1a5.07 5.07 0 0 0-.14 3.7A5.44 5.44 0 0 0 2.5 7.52c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 17.12V22" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  ),
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useTypingEffect(reduced) {
  const [titleIndex, setTitleIndex] = useState(0);
  const [text, setText] = useState(reduced ? portfolio.titles[0] : "");

  useEffect(() => {
    if (reduced) {
      setText(portfolio.titles[0]);
      return undefined;
    }
    let index = 0;
    let deleting = false;
    let timeout;
    const type = () => {
      const title = portfolio.titles[titleIndex];
      index += deleting ? -1 : 1;
      setText(title.slice(0, index));
      let delay = deleting ? 38 : 82;
      if (!deleting && index === title.length) {
        deleting = true;
        delay = 1400;
      } else if (deleting && index === 0) {
        deleting = false;
        setTitleIndex((current) => (current + 1) % portfolio.titles.length);
        delay = 260;
      }
      timeout = window.setTimeout(type, delay);
    };
    timeout = window.setTimeout(type, 450);
    return () => window.clearTimeout(timeout);
  }, [reduced, titleIndex]);

  return text;
}

function Reveal({ children, className = "", delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const elementRef = useRef(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      ref={elementRef}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function downloadResume() {
  const resume = [
    portfolio.name,
    portfolio.role,
    "",
    portfolio.email,
    portfolio.links.linkedin,
    portfolio.links.github,
    "",
    "PROFILE",
    portfolio.intro,
    portfolio.about.description,
    "",
    "EDUCATION",
    `${portfolio.about.degree} — ${portfolio.about.institution} (${portfolio.about.years})`,
    `CGPA: ${portfolio.about.cgpa}`,
    "",
    "SKILLS",
    ...portfolio.skills.map((skill) => `${skill.name}: ${skill.tools.join(", ")}`),
    "",
    "EXPERIENCE",
    `${portfolio.experience.title} | ${portfolio.experience.dates}`,
    portfolio.experience.description,
    "",
    "PROJECTS",
    ...portfolio.projects.flatMap((project) => [
      project.title,
      project.description,
      `Technologies: ${project.tools.join(", ")}`,
      "",
    ]),
    "CERTIFICATIONS",
    ...portfolio.certifications.map((certification) => `- ${certification}`),
  ].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([resume], { type: "text/plain;charset=utf-8" }));
  link.download = "Pramod-Shekapure-Resume.txt";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function sanitize(value, maxLength) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function ContactForm() {
  const [status, setStatus] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = sanitize(String(data.get("name") || ""), 80);
    const email = sanitize(String(data.get("email") || ""), 254);
    const message = sanitize(String(data.get("message") || ""), 2000);
    if (!name || !email || !message) {
      setStatus("Please complete each field before sending.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("Please enter a valid email address.");
      return;
    }
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`From: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${portfolio.email}?subject=${subject}&body=${body}`;
    setStatus("Your email app is opening with your message.");
    form.reset();
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <label>
        <span>Your name</span>
        <input name="name" type="text" autoComplete="name" maxLength="80" required placeholder="Jane Smith" />
      </label>
      <label>
        <span>Email address</span>
        <input name="email" type="email" autoComplete="email" maxLength="254" required placeholder="jane@example.com" />
      </label>
      <label>
        <span>Message</span>
        <textarea name="message" rows="4" maxLength="2000" required placeholder="Tell me a little about what you have in mind..." />
      </label>
      <div className="form-footer">
        <p className="form-status" role="status">{status}</p>
        <button className="button button-primary submit-button" type="submit">
          Send a message <span aria-hidden="true">↗</span>
        </button>
      </div>
      <p className="form-note">Your message opens in your email app — no data is stored here.</p>
    </form>
  );
}

function SocialLink({ platform }) {
  return (
    <a
      className="social-link"
      href={portfolio.links[platform]}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit Pramod on ${platform}`}
    >
      {icons[platform]}
      <span>{platform}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

function App() {
  const reducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageAvailable, setImageAvailable] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const typedTitle = useTypingEffect(reducedMotion);
  const lowEndDevice = Boolean(
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) ||
    (navigator.deviceMemory > 0 && navigator.deviceMemory <= 2) ||
    navigator.connection?.saveData,
  );
  const use3D = !reducedMotion && !lowEndDevice;

  function tiltPortrait(event) {
    if (reducedMotion || lowEndDevice) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    event.currentTarget.style.setProperty("--portrait-tilt-x", `${(0.5 - y) * 5}deg`);
    event.currentTarget.style.setProperty("--portrait-tilt-y", `${(x - 0.5) * 5}deg`);
  }

  function resetPortraitTilt(event) {
    event.currentTarget.style.setProperty("--portrait-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--portrait-tilt-y", "0deg");
  }

  useEffect(() => {
    const root = document.documentElement;
    const updateVisibility = () => root.classList.toggle("page-hidden", document.hidden);
    root.classList.toggle("low-end-device", lowEndDevice);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      root.classList.remove("low-end-device", "page-hidden");
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, [lowEndDevice]);

  useEffect(() => {
    const cards = document.querySelectorAll("[data-tilt]");
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reducedMotion || !supportsHover) return undefined;
    const handlers = [];
    cards.forEach((card) => {
      const move = (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
        card.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
      };
      const reset = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      };
      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", reset);
      handlers.push([card, move, reset]);
    });
    return () => handlers.forEach(([card, move, reset]) => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", reset);
    });
  }, [reducedMotion]);

  const navItems = [
    ["About", "#about"],
    ["Skills", "#skills"],
    ["Projects", "#projects"],
    ["Experience", "#experience"],
    ["Contact", "#contact"],
  ];

  return (
    <>
      <div className="site-shell">
        <header className="site-header">
          <a className="brand" href="#home" aria-label={`${portfolio.name}, home`}>
            <span className="brand-mark">P<span>.</span></span>
            <span className="brand-name">{portfolio.name}</span>
          </a>
          <button
            className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span />
          </button>
          <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>
              Let&apos;s talk <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </header>

        <main>
          <section className="hero-section section-wrap" id="home">
            <div className="hero-grid">
              <div className="hero-copy">
                <p className="eyebrow"><span className="eyebrow-dot" /> CLOUD · AUTOMATION · DELIVERY</p>
                <h1>Building what&apos;s<br />next, <span className="text-gradient">in the cloud.</span></h1>
                <p className="hero-role">
                  <span className="role-prefix">I&apos;m a </span>
                  <span className="typing-text">{typedTitle}</span>
                  <span className="typing-cursor" aria-hidden="true" />
                </p>
                <p className="hero-intro">{portfolio.intro}</p>
                <div className="hero-actions">
                  <a className="button button-primary" href="#projects">
                    View projects <span aria-hidden="true">↗</span>
                  </a>
                  <button className="button button-quiet" type="button" onClick={downloadResume}>
                    <span className="download-icon" aria-hidden="true">↓</span>
                    Download resume
                  </button>
                </div>
                <div className="hero-socials">
                  <span>Find me on</span>
                  <SocialLink platform="linkedin" />
                  <span className="social-divider" />
                  <SocialLink platform="github" />
                </div>
              </div>
              <div className={`hero-visual ${use3D ? "has-3d" : "no-3d"}`}>
                <div className="visual-glow" />
                {use3D ? (
                  <Suspense fallback={<div className="scene-loading" aria-hidden="true" />}>
                    <CloudScene />
                  </Suspense>
                ) : (
                  <div className="static-cloud-art" aria-hidden="true">
                    <span className="static-cloud">☁</span>
                    <span className="static-box" />
                    <span className="static-server"><i /><i /><i /></span>
                    <span className="static-orbit" />
                  </div>
                )}
                <div className="visual-label label-cloud"><span className="label-dot" /> cloud ready</div>
                <div className="visual-label label-deploy"><span>↗</span> deploy with confidence</div>
                <div className="visual-coordinates">INFRA / 001</div>
                <div className="portrait-wrap">
                  <div
                    className={`portrait-shell ${imageLoaded ? "is-loaded" : ""}`}
                    onPointerMove={tiltPortrait}
                    onPointerLeave={resetPortraitTilt}
                    onPointerUp={resetPortraitTilt}
                  >
                    {imageAvailable && (
                      <img
                        className="portrait-placeholder"
                        src={portfolio.image.placeholder}
                        width="32"
                        height="40"
                        alt=""
                        aria-hidden="true"
                      />
                    )}
                    {imageAvailable ? (
                      <picture className="portrait-picture">
                        <source type="image/webp" srcSet={portraitWebpSrcSet} sizes={portraitSizes} />
                        <img
                          className={`portrait-image ${imageLoaded ? "is-loaded" : ""}`}
                          src={portfolio.image.jpg[400]}
                          srcSet={portraitJpgSrcSet}
                          sizes={portraitSizes}
                          width="1200"
                          height="1500"
                          loading="eager"
                          fetchpriority="high"
                          decoding="async"
                          alt={portfolio.image.alt}
                          onLoad={() => setImageLoaded(true)}
                          onError={() => setImageAvailable(false)}
                        />
                      </picture>
                    ) : (
                      <div className="portrait-fallback" aria-hidden="true">{portfolio.initials}</div>
                    )}
                    <span className="portrait-orbit orbit-one" />
                    <span className="portrait-orbit orbit-two" />
                  </div>
                  <div className="portrait-caption">
                    <span className="caption-dot" />
                    <span>Curious mind. Cloud first.</span>
                  </div>
                </div>
              </div>
            </div>
            <a className="scroll-cue" href="#about"><span /> Scroll to explore</a>
            <div className="hero-index">01 <span /> 06</div>
          </section>

          <section className="section-wrap about-section" id="about">
            <Reveal>
              <div className="section-heading">
                <p className="section-kicker">01 / A LITTLE ABOUT ME</p>
                <h2>Curiosity, meet <span className="text-gradient">infrastructure.</span></h2>
              </div>
              <div className="about-grid">
                <div className="about-copy">
                  <p>{portfolio.about.description}</p>
                  <div className="about-footnote"><span className="tiny-spark">✳</span> Learning in public. Shipping with care.</div>
                </div>
                <div className="education-card glass-card" data-tilt>
                  <div className="education-top"><span className="card-overline">EDUCATION</span><span className="education-icon">⌂</span></div>
                  <h3>{portfolio.about.degree}</h3>
                  <p>{portfolio.about.institution} <span>·</span> {portfolio.about.years}</p>
                  <div className="education-bottom"><span>CGPA</span><strong>{portfolio.about.cgpa}</strong></div>
                  <span className="card-watermark">BCA</span>
                </div>
              </div>
            </Reveal>
          </section>

          <section className="section-wrap skills-section" id="skills">
            <Reveal>
              <div className="section-heading section-heading-row">
                <div>
                  <p className="section-kicker">02 / TOOLS I WORK WITH</p>
                  <h2>My <span className="text-gradient">toolkit.</span></h2>
                </div>
                <p className="section-aside">The right tool, used thoughtfully,<br />makes the hard things simpler.</p>
              </div>
              <div className="skills-grid">
                {portfolio.skills.map((skill, index) => (
                  <article className="skill-card glass-card" data-tilt key={skill.name} style={{ "--card-index": index }}>
                    <div className="skill-card-top">
                      <span className="skill-number">{skill.mark}</span>
                      <span className="skill-mark" aria-hidden="true">{["☁", "⌘", "</>", "▤", "◉", "◌"][index]}</span>
                    </div>
                    <h3>{skill.name}</h3>
                    <div className="skill-tags">
                      {skill.tools.map((tool) => <span className="skill-tag" key={tool}>{tool}</span>)}
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          </section>

          <section className="section-wrap pipeline-section" aria-label="Continuous delivery workflow">
            <Reveal>
              <div className="pipeline-heading">
                <span className="section-kicker">A BETTER WAY TO SHIP</span>
                <span className="pipeline-live"><i /> AUTOMATION IN MOTION</span>
              </div>
              <div className="pipeline-track">
                {portfolio.pipeline.map((step, index) => (
                  <div className="pipeline-step" key={step}>
                    <div className="pipeline-node">
                      <span className="pipeline-icon">{["⌘", "▣", "✓", "↗", "◉"][index]}</span>
                      <span className="pipeline-node-dot" />
                    </div>
                    <span className="pipeline-label">{step}</span>
                    {index < portfolio.pipeline.length - 1 && <span className="pipeline-connector"><i /></span>}
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <section className="section-wrap projects-section" id="projects">
            <Reveal>
              <div className="section-heading section-heading-row">
                <div>
                  <p className="section-kicker">03 / SELECTED WORK</p>
                  <h2>Things I&apos;ve <span className="text-gradient">built.</span></h2>
                </div>
                <span className="project-count">03 <span>PROJECTS</span></span>
              </div>
              <div className="projects-grid">
                {portfolio.projects.map((project, index) => (
                  <article className="project-card glass-card" data-tilt key={project.number}>
                    <div className="project-visual">
                      <span className="project-visual-number">PROJECT / {project.number}</span>
                      <span className={`project-glyph glyph-${index}`} aria-hidden="true">{project.icon}</span>
                      <span className="project-visual-orbit orbit-a" />
                      <span className="project-visual-orbit orbit-b" />
                      <span className="project-open" aria-hidden="true">↗</span>
                    </div>
                    <div className="project-content">
                      <div className="project-title-line"><span>{project.number}</span><h3>{project.title}</h3></div>
                      <p>{project.description}</p>
                      <div className="project-tools">{project.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          </section>

          <section className="section-wrap experience-section" id="experience">
            <Reveal>
              <div className="section-heading">
                <p className="section-kicker">04 / LEARNING BY DOING</p>
                <h2>Practice makes <span className="text-gradient">progress.</span></h2>
              </div>
              <div className="experience-card glass-card">
                <div className="experience-marker"><span /></div>
                <div className="experience-content">
                  <div className="experience-meta"><span>TRAINING</span><span>{portfolio.experience.dates}</span></div>
                  <h3>{portfolio.experience.title}</h3>
                  <p>{portfolio.experience.description}</p>
                  <div className="experience-tags"><span>100+ lab hours</span><span>AWS</span><span>CI/CD</span><span>Capstone</span></div>
                </div>
                <div className="experience-stamp"><strong>100<span>+</span></strong><span>HOURS<br />HANDS-ON</span></div>
              </div>
              <div className="certification-row">
                <span className="certification-label">CERTIFICATIONS</span>
                {portfolio.certifications.map((certification) => (
                  <span className="certification-pill" key={certification}><span>✳</span>{certification}</span>
                ))}
              </div>
            </Reveal>
          </section>

          <section className="contact-section" id="contact">
            <div className="section-wrap">
              <Reveal>
                <div className="contact-topline">
                  <p className="section-kicker">05 / YOUR NEXT GREAT IDEA</p>
                  <span className="contact-spark">✳</span>
                </div>
                <div className="contact-grid">
                  <div className="contact-copy">
                    <h2>Let&apos;s make<br />something <span className="text-gradient">work.</span></h2>
                    <p>Have a role, a project, or a tricky cloud question? My inbox is open.</p>
                    <div className="contact-socials">
                      <SocialLink platform="linkedin" />
                      <SocialLink platform="github" />
                    </div>
                  </div>
                  <ContactForm />
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        <footer className="site-footer section-wrap">
          <a className="brand footer-brand" href="#home">
            <span className="brand-mark">P<span>.</span></span>
            <span className="brand-name">{portfolio.name}</span>
          </a>
          <span className="footer-note">Made with curiosity &amp; a little caffeine.</span>
          <a className="back-top" href="#home">Back to top <span>↑</span></a>
          <span className="footer-copyright">© {new Date().getFullYear()} {portfolio.name}</span>
        </footer>
      </div>
    </>
  );
}

export default App;
