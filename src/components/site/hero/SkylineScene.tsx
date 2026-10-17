import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Deterministic pseudo-random so the skyline looks identical on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A small architectural model: faceted towers rising from a brass survey grid. Pure geometry, no assets.
 * It rises on load, drifts slowly, leans toward the pointer and turns with page scroll.
 * Rendering pauses whenever it is off-screen or the tab is hidden.
 */
export default function SkylineScene({ className = "" }: { className?: string }) {
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      return; // WebGL unavailable: the photograph behind it carries the hero on its own.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 9.6, 21.5);
    camera.lookAt(0, 2.6, 0);

    const world = new THREE.Group();
    scene.add(world);

    const faceMat = new THREE.MeshBasicMaterial({ color: 0x0f3a43, transparent: true, opacity: 0.34, depthWrite: false });
    const heroFaceMat = new THREE.MeshBasicMaterial({ color: 0x1b6270, transparent: true, opacity: 0.5, depthWrite: false });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xcaa261, transparent: true, opacity: 0.8 });
    const heroEdgeMat = new THREE.LineBasicMaterial({ color: 0xf0d08a, transparent: true, opacity: 1 });

    const rand = mulberry32(11);
    const towers: { group: THREE.Group; delay: number }[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const N = 9;
    const gap = 1.28;
    for (let ix = 0; ix < N; ix++) {
      for (let iz = 0; iz < N; iz++) {
        const x = (ix - (N - 1) / 2) * gap;
        const z = (iz - (N - 1) / 2) * gap;
        const d = Math.hypot(x, z);
        const isHero = ix === 4 && iz === 4;
        if (!isHero && (rand() < 0.28 || d > 5.4)) continue;
        const h = isHero ? 7.4 : Math.max(0.5, (4.6 - d * 0.62) * (0.55 + rand() * 0.75) + rand() * 0.6);
        const w = isHero ? 0.82 : 0.62 + rand() * 0.34;
        const geo = new THREE.BoxGeometry(w, h, w * (0.8 + rand() * 0.4));
        geo.translate(0, h / 2, 0);
        geometries.push(geo);
        const edges = new THREE.EdgesGeometry(geo);
        geometries.push(edges);
        const g = new THREE.Group();
        g.add(new THREE.Mesh(geo, isHero ? heroFaceMat : faceMat));
        g.add(new THREE.LineSegments(edges, isHero ? heroEdgeMat : edgeMat));
        g.position.set(x, 0, z);
        g.scale.y = 0.001;
        world.add(g);
        towers.push({ group: g, delay: d * 0.09 + rand() * 0.25 });
      }
    }

    const grid = new THREE.GridHelper(15, 30, 0xb78c4d, 0xb78c4d);
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.2;
    world.add(grid);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // The hero copy sits above the canvas, so the pointer is tracked on the window and mapped to the canvas box.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const clamp = (v: number) => Math.max(-0.75, Math.min(0.75, v));
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.tx = clamp((e.clientX - r.left) / r.width - 0.5);
      pointer.ty = clamp((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
    });
    io.observe(el);

    const start = performance.now();
    let raf = 0;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const t = (performance.now() - start) / 1000;
      for (const tower of towers) {
        const p = Math.min(1, Math.max(0, (t - 0.25 - tower.delay) / 1.1));
        tower.group.scale.y = Math.max(0.001, easeOut(p));
      }
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      world.rotation.y = -0.5 + t * 0.07 + pointer.x * 0.9 + window.scrollY * 0.0007;
      world.rotation.x = pointer.y * 0.1;
      world.position.y = -1.1;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      geometries.forEach((g) => g.dispose());
      [faceMat, heroFaceMat, edgeMat, heroEdgeMat, gridMat].forEach((m) => m.dispose());
      grid.geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} aria-hidden="true" className={className} />;
}