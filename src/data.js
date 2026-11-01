const portfolio = {
  name: "Pramod Shekapure",
  firstName: "Pramod",
  initials: "PS",
  role: "Entry-Level DevOps / Cloud Engineer",
  titles: ["DevOps Engineer", "Cloud Engineer", "Automation"],
  intro:
    "I build dependable cloud infrastructure and automate the work in between. Curious by default, hands-on by nature, and always learning.",
  image: {
    alt: "Pramod Shekapure, DevOps and Cloud Engineer",
    placeholder: "/assets/pramod-portrait-placeholder.webp",
    webp: {
      400: "/assets/pramod-portrait-400.webp",
      800: "/assets/pramod-portrait-800.webp",
      1200: "/assets/pramod-portrait-1200.webp",
    },
    jpg: {
      400: "/assets/pramod-portrait-400.jpg",
      800: "/assets/pramod-portrait-800.jpg",
      1200: "/assets/pramod-portrait-1200.jpg",
    },
  },
  email: "hello@example.com",
  links: {
    linkedin: "https://www.linkedin.com/in/pramod-shekapure-874a43410",
    github: "https://github.com/Shekapurepramod",
  },
  about: {
    degree: "Bachelor of Computer Applications",
    institution: "SRTMUN Latur",
    years: "2022 — 2025",
    cgpa: "8.89 / 10",
    description:
      "Recent BCA graduate with hands-on experience across AWS, Docker, Kubernetes, Ansible, and GitHub Actions. I’m looking to grow in cloud engineering and automation while building systems people can rely on.",
  },
  skills: [
    {
      name: "Cloud",
      mark: "01",
      tools: ["AWS", "EC2", "S3", "VPC", "IAM", "ECR", "ECS", "CloudWatch", "Azure fundamentals"],
    },
    {
      name: "DevOps",
      mark: "02",
      tools: ["Git", "GitHub Actions", "Jenkins", "Docker", "Kubernetes", "Helm", "Ansible", "Terraform"],
    },
    {
      name: "Scripting",
      mark: "03",
      tools: ["Bash", "Python (basic)", "YAML"],
    },
    {
      name: "Systems",
      mark: "04",
      tools: ["Linux", "Ubuntu", "CentOS", "Networking basics", "Nginx"],
    },
    {
      name: "Database",
      mark: "05",
      tools: ["SQL"],
    },
    {
      name: "Monitoring",
      mark: "06",
      tools: ["CloudWatch", "Prometheus", "Grafana"],
    },
  ],
  pipeline: ["Code", "Build", "Test", "Deploy", "Monitor"],
  projects: [
    {
      number: "01",
      title: "Containerized deployment with GitHub Actions",
      description:
        "Builds, scans, and pushes an image on every push, then automates ECS deployment to cut manual release steps by 70%.",
      tools: ["Docker", "GitHub Actions", "AWS ECR", "ECS"],
      icon: "↗",
    },
    {
      number: "02",
      title: "Microservices on Kubernetes",
      description:
        "A three-service application packaged with Helm, with health probes, resource limits, and rolling updates built in.",
      tools: ["Kubernetes", "Helm", "Minikube"],
      icon: "◈",
    },
    {
      number: "03",
      title: "Server configuration automation",
      description:
        "Reusable Ansible playbooks configure Linux servers and Nginx, bringing setup time from about an hour to under 10 minutes.",
      tools: ["Ansible", "Linux", "Nginx"],
      icon: "⌘",
    },
  ],
  experience: {
    title: "Cloud & DevOps Trainee",
    dates: "Jul 2025 — Dec 2025",
    description:
      "Completed 100+ hours of hands-on labs in AWS, Linux, Git, Docker, and Jenkins CI/CD. Built a capstone project bringing together a deployment pipeline, containers, and monitoring dashboards.",
  },
  certifications: ["AWS Certified Cloud Practitioner", "Microsoft Azure Fundamentals (AZ-900)"],
};

export default portfolio;
