import { useEffect, useRef } from "react";
import * as THREE from "three";

function createCloud() {
  const cloud = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x9fe5ff,
    metalness: 0.18,
    roughness: 0.28,
    emissive: 0x123e67,
    emissiveIntensity: 0.35,
  });
  [
    [-0.48, 0, 0, 0.46],
    [0, 0.2, 0, 0.58],
    [0.48, 0, 0, 0.4],
    [0, -0.12, 0.04, 0.43],
  ].forEach(([x, y, z, radius]) => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 18), material);
    sphere.position.set(x, y, z);
    cloud.add(sphere);
  });
  return cloud;
}

function createContainer() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.34, 0.86, 0.78),
    new THREE.MeshStandardMaterial({
      color: 0x12507b,
      metalness: 0.55,
      roughness: 0.32,
      emissive: 0x062039,
      emissiveIntensity: 0.5,
    }),
  );
  group.add(body);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(body.geometry),
    new THREE.LineBasicMaterial({ color: 0x48ceff, transparent: true, opacity: 0.8 }),
  );
  group.add(edges);
  return group;
}

function createServer() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x263957,
    metalness: 0.62,
    roughness: 0.3,
    emissive: 0x101f3c,
    emissiveIntensity: 0.55,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.24, 0.62), material);
  group.add(body);
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(body.geometry),
    new THREE.LineBasicMaterial({ color: 0x64e4ff, transparent: true, opacity: 0.8 }),
  );
  group.add(edge);
  const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x5cf2d5 });
  [-0.32, 0, 0.32].forEach((y) => {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), lightMaterial);
    light.position.set(-0.2, y, 0.33);
    group.add(light);
  });
  return group;
}

export default function CloudScene() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.6);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x9bc7ff, 1.3));
    const keyLight = new THREE.PointLight(0x54d9ff, 38, 15);
    keyLight.position.set(2.5, 3.2, 4);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x687aff, 28, 12);
    rimLight.position.set(-3, -1.5, 2);
    scene.add(rimLight);

    const cloud = createCloud();
    cloud.position.set(-1.35, 0.9, 0);
    cloud.scale.setScalar(0.95);
    scene.add(cloud);

    const container = createContainer();
    container.position.set(1.05, -0.9, 0.2);
    container.rotation.set(0.22, -0.48, -0.16);
    scene.add(container);

    const server = createServer();
    server.position.set(1.55, 1.15, -0.2);
    server.rotation.set(-0.12, -0.5, 0.1);
    server.scale.setScalar(0.86);
    scene.add(server);

    const particlesGeometry = new THREE.BufferGeometry();
    const points = new Float32Array(210 * 3);
    for (let i = 0; i < points.length; i += 3) {
      points[i] = (Math.random() - 0.5) * 9;
      points[i + 1] = (Math.random() - 0.5) * 6;
      points[i + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({ color: 0x7edfff, size: 0.018, transparent: true, opacity: 0.75 }),
    );
    scene.add(particles);

    let pointerX = 0;
    let pointerY = 0;
    let frameId = 0;
    let visible = true;
    const onPointerMove = (event) => {
      const bounds = host.getBoundingClientRect();
      pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    };
    const onVisibilityChange = () => {
      visible = !document.hidden;
      if (visible && !frameId) frameId = requestAnimationFrame(animate);
    };
    const resizeObserver = new ResizeObserver(() => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    });

    const animate = () => {
      frameId = 0;
      if (!visible) return;
      const time = performance.now() * 0.00035;
      const targetY = pointerX * 0.18;
      const targetX = -pointerY * 0.12;
      scene.rotation.y += (targetY + Math.sin(time) * 0.12 - scene.rotation.y) * 0.025;
      scene.rotation.x += (targetX + Math.cos(time * 0.7) * 0.05 - scene.rotation.x) * 0.025;
      cloud.position.y = 0.9 + Math.sin(time * 2.2) * 0.08;
      container.position.y = -0.9 + Math.sin(time * 1.7 + 1) * 0.07;
      server.position.y = 1.15 + Math.sin(time * 1.8 + 2) * 0.08;
      particles.rotation.y += 0.00035;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    resizeObserver.observe(host);
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      host.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      resizeObserver.disconnect();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="scene-canvas" ref={hostRef} aria-hidden="true" />;
}
