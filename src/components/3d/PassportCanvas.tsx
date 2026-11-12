import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface PassportCanvasProps {
  className?: string;
  interactive?: boolean;
  priority?: boolean;
}

/**
 * Procedural Turkish Passport front cover canvas texture generator.
 * Produces authentic Burgundy leather (#5E0016, Pantone 202 C) background,
 * subtle micro-grain noise, and vector-crisp hot-stamped gold foil typography,
 * Turkish Crescent & Star (Hilal ve Yıldız) insignia, and biometric e-passport chip.
 */
function createPassportCoverTexture(): {
  diffuseTexture: THREE.CanvasTexture;
  bumpTexture: THREE.CanvasTexture;
} {
  const width = 1024;
  const height = 1454; // 1.0 : 1.42 aspect ratio
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = 512;
  bumpCanvas.height = 727;
  const bCtx = bumpCanvas.getContext("2d");

  if (ctx) {
    // 1. Burgundy Leather Base Gradient
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.35,
      width * 0.1,
      width * 0.5,
      height * 0.5,
      width * 0.85,
    );
    bgGrad.addColorStop(0, "#741026");
    bgGrad.addColorStop(0.65, "#5E0016");
    bgGrad.addColorStop(1, "#3E000E");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Procedural Fine Leather Grain
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 14;
      const d0 = data[i] ?? 0;
      const d1 = data[i + 1] ?? 0;
      const d2 = data[i + 2] ?? 0;
      data[i] = Math.max(0, Math.min(255, d0 + noise));
      data[i + 1] = Math.max(0, Math.min(255, d1 + noise * 0.5));
      data[i + 2] = Math.max(0, Math.min(255, d2 + noise * 0.8));
    }
    ctx.putImageData(imgData, 0, 0);

    // Spine stitch / crease accent on left
    const creaseGrad = ctx.createLinearGradient(0, 0, 50, 0);
    creaseGrad.addColorStop(0, "rgba(0,0,0,0.6)");
    creaseGrad.addColorStop(0.4, "rgba(255,255,255,0.08)");
    creaseGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = creaseGrad;
    ctx.fillRect(0, 0, 50, height);

    // 3. Hot-Stamped Gold Foil Embellishments (#F5D061 / #ECC755)
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Header Arc / Title: TÜRKİYE CUMHURİYETİ
    ctx.fillStyle = "#F5D061";
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.font = "bold 56px 'Cinzel', 'Times New Roman', Georgia, serif";
    ctx.letterSpacing = "10px";
    ctx.fillText("TÜRKİYE CUMHURİYETİ", width / 2, 190);

    // Subheader: PASAPORT · PASSPORT
    ctx.font = "500 36px 'Cinzel', 'Times New Roman', Georgia, serif";
    ctx.letterSpacing = "12px";
    ctx.fillStyle = "#E8C15A";
    ctx.fillText("PASAPORT · PASSPORT", width / 2, 265);

    // Center Insignia: Turkish Crescent and Star (Hilal ve Yıldız)
    const cx = width / 2;
    const cy = height * 0.51;

    // Outer Crescent & Inner Cutout
    ctx.beginPath();
    ctx.arc(cx - 30, cy, 185, 0, Math.PI * 2, false);
    ctx.arc(cx + 15, cy, 148, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "#F5D061";
    ctx.fill();

    // 5-Pointed Star tilted towards crescent
    const starX = cx + 75;
    const starY = cy;
    const outerR = 64;
    const innerR = 27;
    const rot = -Math.PI / 10; // -18 degrees tilt
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const aOuter = rot + (i * 2 * Math.PI) / 5;
      const aInner = aOuter + Math.PI / 5;
      const x1 = starX + Math.cos(aOuter) * outerR;
      const y1 = starY + Math.sin(aOuter) * outerR;
      const x2 = starX + Math.cos(aInner) * innerR;
      const y2 = starY + Math.sin(aInner) * innerR;
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fillStyle = "#F5D061";
    ctx.fill();

    // Subtle insignia text: Law No. 5901 Naturalization
    ctx.font = "600 24px 'Courier New', monospace";
    ctx.letterSpacing = "6px";
    ctx.fillStyle = "rgba(245, 208, 97, 0.75)";
    ctx.fillText("LAW NO. 5901 NATURALIZATION", width / 2, cy + 260);

    // Bottom Foil: International Biometric e-Passport Symbol
    const chipY = height - 210;
    const chipW = 120;
    const chipH = 75;
    const chipR = 8;
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#F5D061";
    ctx.fillStyle = "#5E0016";

    // Rounded rectangle
    ctx.beginPath();
    ctx.roundRect(cx - chipW / 2, chipY - chipH / 2, chipW, chipH, chipR);
    ctx.stroke();

    // Center dividing line
    ctx.beginPath();
    ctx.moveTo(cx - chipW / 2, chipY);
    ctx.lineTo(cx + chipW / 2, chipY);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, chipY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gold borders along cover edges
    ctx.strokeStyle = "rgba(245, 208, 97, 0.35)";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, width - 80, height - 80);
  }

  // Generate Bump Texture
  if (bCtx) {
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, 512, 727);
    const bImg = bCtx.getImageData(0, 0, 512, 727);
    const bData = bImg.data;
    for (let i = 0; i < bData.length; i += 4) {
      const n = (Math.random() - 0.5) * 50;
      const v = Math.max(0, Math.min(255, 128 + n));
      bData[i] = v;
      bData[i + 1] = v;
      bData[i + 2] = v;
    }
    bCtx.putImageData(bImg, 0, 0);
  }

  const diffuseTexture = new THREE.CanvasTexture(canvas);
  diffuseTexture.generateMipmaps = true;
  diffuseTexture.minFilter = THREE.LinearMipmapLinearFilter;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(4, 4);

  return { diffuseTexture, bumpTexture };
}

/**
 * Three.js Turkish Passport 3D Model with PBR Burgundy Leather and Gold Foil (Milestone 3).
 * Features:
 * - Sinusoidal floating levitation drift
 * - Interactive 360° click-and-drag rotation
 * - Cursor perspective tracking tilt with dynamic gold glint shimmer point light
 * - Clamped device pixel ratio (max 1.75)
 * - IntersectionObserver pausing when off-screen
 * - Clean unmount disposal of all WebGL resources
 */
export function PassportCanvas({ className = "", interactive = true }: PassportCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Guard for SSR and JSDOM environments
    if (
      typeof window === "undefined" ||
      (typeof navigator !== "undefined" && navigator.userAgent.includes("jsdom"))
    ) {
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // WebGL context unavailable
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;outline:none;";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.set(0, 0, 5.8);

    // Root Group for overall transforms
    const passportRoot = new THREE.Group();
    scene.add(passportRoot);

    // Dimensions: 1.0 : 1.42 aspect ratio booklet (e.g. 2.1 x 2.98 x 0.12)
    const bookWidth = 2.1;
    const bookHeight = 2.98;
    const bookThickness = 0.12;

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    // Create Cover Textures
    const { diffuseTexture, bumpTexture } = createPassportCoverTexture();
    textures.push(diffuseTexture, bumpTexture);

    // PBR Leather Cover Material
    const coverMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x5e0016,
      map: diffuseTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.012,
      roughness: 0.62,
      metalness: 0.04,
      clearcoat: 0.25,
      clearcoatRoughness: 0.45,
    });
    materials.push(coverMaterial);

    // Plain Burgundy Back & Spine Material
    const burgundyMaterial = new THREE.MeshStandardMaterial({
      color: 0x5e0016,
      bumpMap: bumpTexture,
      bumpScale: 0.012,
      roughness: 0.65,
      metalness: 0.03,
    });
    materials.push(burgundyMaterial);

    // Inner Paper Block Material (Stratified Ivory)
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdfbf7,
      roughness: 0.88,
      metalness: 0.02,
    });
    materials.push(paperMaterial);

    // Gold Foil Gilded Trim Material
    const goldGildedMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5d061,
      metalness: 0.95,
      roughness: 0.22,
    });
    materials.push(goldGildedMaterial);

    // 1. Front Cover Mesh (Facing user)
    const frontCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, 0.014);
    geometries.push(frontCoverGeo);
    // Face materials: [+X, -X, +Y, -Y, +Z (front cover), -Z]
    const frontMeshMaterials = [
      burgundyMaterial,
      burgundyMaterial,
      burgundyMaterial,
      burgundyMaterial,
      coverMaterial, // Front face has the hot-stamped gold foil
      burgundyMaterial,
    ];
    const frontCover = new THREE.Mesh(frontCoverGeo, frontMeshMaterials);
    frontCover.position.set(0, 0, bookThickness / 2);
    frontCover.castShadow = true;
    passportRoot.add(frontCover);

    // 2. Inner Ivory Paper Block Core
    const paperCoreGeo = new THREE.BoxGeometry(
      bookWidth * 0.97,
      bookHeight * 0.98,
      bookThickness * 0.9,
    );
    geometries.push(paperCoreGeo);
    const paperCore = new THREE.Mesh(paperCoreGeo, paperMaterial);
    paperCore.position.set(bookWidth * 0.01, 0, 0);
    passportRoot.add(paperCore);

    // 3. Back Cover Mesh
    const backCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, 0.014);
    geometries.push(backCoverGeo);
    const backCover = new THREE.Mesh(backCoverGeo, burgundyMaterial);
    backCover.position.set(0, 0, -bookThickness / 2);
    backCover.receiveShadow = true;
    passportRoot.add(backCover);

    // 4. Rounded Spine Curl on left side
    const spineGeo = new THREE.CylinderGeometry(
      bookThickness / 2,
      bookThickness / 2,
      bookHeight,
      16,
      1,
      false,
      Math.PI / 2,
      Math.PI,
    );
    geometries.push(spineGeo);
    const spine = new THREE.Mesh(spineGeo, burgundyMaterial);
    spine.position.set(-bookWidth / 2, 0, 0);
    passportRoot.add(spine);

    // 5. Lighting Setup
    // Key directional light (warm white)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    keyLight.position.set(3, 4, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Cool rim light (subtle blue-gray)
    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.85);
    rimLight.position.set(-4, -2, -2);
    scene.add(rimLight);

    // Warm gold accent light from bottom right
    const goldAccentLight = new THREE.DirectionalLight(0xf5d061, 1.1);
    goldAccentLight.position.set(2, -3, 2);
    scene.add(goldAccentLight);

    // Ambient fill
    const ambientLight = new THREE.AmbientLight(0x2a1b1f, 0.65);
    scene.add(ambientLight);

    // Dynamic Cursor Glint Point Light: Moves with pointer to create specular shimmer on gold foil
    const cursorGlintLight = new THREE.PointLight(0xffe8a3, 1.4, 6);
    cursorGlintLight.position.set(0, 0, 2);
    scene.add(cursorGlintLight);

    // Resize Handler
    const handleResize = () => {
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 420;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Visibility Observer to pause rendering when offscreen
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = !!entry?.isIntersecting;
    });
    intersectionObserver.observe(container);

    // Interactivity: Drag & Perspective Tilt
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    const targetRotation = { x: 0.1, y: -0.15 };
    const currentRotation = { x: 0.1, y: -0.15 };
    const pointerNorm = { x: 0, y: 0, tx: 0, ty: 0 };

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      container.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      pointerNorm.tx = Math.max(-1, Math.min(1, normX));
      pointerNorm.ty = Math.max(-1, Math.min(1, normY));

      if (isDragging && interactive) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
        targetRotation.y += deltaX * 0.012;
        targetRotation.x += deltaY * 0.012;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
      container.style.cursor = interactive ? "grab" : "default";
    };

    container.style.cursor = interactive ? "grab" : "default";
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);

    // Animation Render Loop
    let animFrameId = 0;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animFrameId = requestAnimationFrame(renderLoop);

      if (!isVisible || document.hidden) return;

      const elapsedTime = clock.getElapsedTime();

      // Smooth pointer lerp
      pointerNorm.x += (pointerNorm.tx - pointerNorm.x) * 0.08;
      pointerNorm.y += (pointerNorm.ty - pointerNorm.y) * 0.08;

      // Cursor Glint Point Light follows pointer across passport face
      cursorGlintLight.position.x = pointerNorm.x * 1.5;
      cursorGlintLight.position.y = -pointerNorm.y * 1.8;
      cursorGlintLight.position.z = 1.4 + Math.sin(elapsedTime * 2) * 0.2;

      // Natural Sinusoidal Floating Levitation Drift
      const levitationY = Math.sin(elapsedTime * 1.6) * 0.07;
      const levitationTilt = Math.cos(elapsedTime * 1.1) * 0.04;
      passportRoot.position.y = levitationY;

      if (!isDragging) {
        // Perspective tilt tracking: ±18° yaw, ±12° pitch
        const perspectiveYaw = pointerNorm.x * 0.32;
        const perspectivePitch = -pointerNorm.y * 0.22;
        currentRotation.y +=
          (targetRotation.y + perspectiveYaw + levitationTilt - currentRotation.y) * 0.06;
        currentRotation.x += (targetRotation.x + perspectivePitch - currentRotation.x) * 0.06;
      } else {
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.15;
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.15;
      }

      passportRoot.rotation.x = currentRotation.x;
      passportRoot.rotation.y = currentRotation.y;

      renderer.render(scene, camera);
    };

    renderLoop();

    // Comprehensive Unmount Teardown
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement) {
        renderer.domElement.remove();
      }
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[320px] sm:h-[400px] select-none ${className}`}
      data-testid="passport-canvas-container"
      aria-label="Turkish Passport 3D WebGL Interactive Showcase"
    />
  );
}

export default PassportCanvas;
