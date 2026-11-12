import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ArchitecturalBuildingCanvasProps {
  className?: string;
  interactive?: boolean;
  elevationScroll?: boolean;
}

/**
 * Three.js Modernist Residence Architectural 3D Model (Milestone 3).
 * Features:
 * - Cantilevered floor slabs with limestone/travertine stone fascia (#E8E4DC, roughness 0.82)
 * - Floor-to-ceiling recessed glass curtain walls (#D1ECF1, transmission 0.88, opacity 0.45)
 * - Vertical architectural bronze louvers / brise-soleil (#BFA15F, metalness 0.85)
 * - Warm interior emissive lighting glow (#FFE4B5, emissiveIntensity 0.45)
 * - Landscaped podium base with reflecting water pool and brass survey grid
 * - Smooth turntable rotation and interactive pointer orbit drag
 * - Clamped device pixel ratio (max 1.75)
 * - IntersectionObserver pausing when off-screen
 * - Complete unmount teardown
 */
export function ArchitecturalBuildingCanvas({
  className = "",
  interactive = true,
  elevationScroll = true,
}: ArchitecturalBuildingCanvasProps) {
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
      return; // WebGL unavailable
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;outline:none;";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(6.8, 4.8, 8.2);

    const buildingRoot = new THREE.Group();
    scene.add(buildingRoot);

    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];

    // =========================================================================
    // PBR MATERIALS DEFINITIONS
    // =========================================================================
    // 1. Travertine/Limestone Slabs (#E8E4DC, roughness: 0.82, metalness: 0.05)
    const travertineMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8e4dc,
      roughness: 0.82,
      metalness: 0.05,
    });
    materials.push(travertineMaterial);

    // 2. Architectural Glazing Curtain Walls (#D1ECF1, transmission: 0.88, opacity: 0.45, roughness: 0.08)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd1ecf1,
      transparent: true,
      opacity: 0.45,
      transmission: 0.88,
      roughness: 0.08,
      reflectivity: 0.92,
      depthWrite: false,
    });
    materials.push(glassMaterial);

    // 3. Vertical Bronze Louvers / Mullions (#BFA15F, metalness: 0.85, roughness: 0.25)
    const bronzeMaterial = new THREE.MeshStandardMaterial({
      color: 0xbfa15f,
      metalness: 0.85,
      roughness: 0.25,
    });
    materials.push(bronzeMaterial);

    // 4. Warm Interior Illumination Core (#FFE4B5, emissiveIntensity: 0.45)
    const interiorWarmMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe4b5,
      emissive: 0xffe4b5,
      emissiveIntensity: 0.45,
      roughness: 0.6,
    });
    materials.push(interiorWarmMaterial);

    // 5. Landscaped Podium Base (#12242B, dark slate travertine)
    const podiumMaterial = new THREE.MeshStandardMaterial({
      color: 0x12242b,
      roughness: 0.75,
      metalness: 0.15,
    });
    materials.push(podiumMaterial);

    // 6. Reflecting Water Pool (#09202A, glossy reflective)
    const waterPoolMaterial = new THREE.MeshStandardMaterial({
      color: 0x09202a,
      roughness: 0.08,
      metalness: 0.4,
      transparent: true,
      opacity: 0.88,
    });
    materials.push(waterPoolMaterial);

    // =========================================================================
    // ARCHITECTURAL GEOMETRY CONSTRUCTION
    // =========================================================================

    // A. Landscaped Podium Base
    const podiumGeo = new THREE.BoxGeometry(6.4, 0.25, 6.4);
    geometries.push(podiumGeo);
    const podium = new THREE.Mesh(podiumGeo, podiumMaterial);
    podium.position.y = -0.125;
    podium.receiveShadow = true;
    buildingRoot.add(podium);

    // Brass Survey Grid
    const surveyGrid = new THREE.GridHelper(6.0, 16, 0xc5a059, 0x5a4820);
    const surveyGridMat = surveyGrid.material as THREE.Material;
    surveyGridMat.transparent = true;
    surveyGridMat.opacity = 0.35;
    surveyGrid.position.y = 0.005;
    buildingRoot.add(surveyGrid);
    materials.push(surveyGridMat);

    // Reflecting Water Pool on East terrace
    const waterPoolGeo = new THREE.BoxGeometry(2.4, 0.06, 2.2);
    geometries.push(waterPoolGeo);
    const waterPool = new THREE.Mesh(waterPoolGeo, waterPoolMaterial);
    waterPool.position.set(1.6, 0.02, 1.6);
    buildingRoot.add(waterPool);

    // B. Ground Floor (Level 0)
    // Travertine Base Floor Slab
    const groundSlabGeo = new THREE.BoxGeometry(4.2, 0.18, 4.0);
    geometries.push(groundSlabGeo);
    const groundSlab = new THREE.Mesh(groundSlabGeo, travertineMaterial);
    groundSlab.position.y = 0.09;
    groundSlab.castShadow = true;
    groundSlab.receiveShadow = true;
    buildingRoot.add(groundSlab);

    // Ground Floor Glass Curtain Walls
    const groundGlassGeo = new THREE.BoxGeometry(3.6, 1.2, 3.4);
    geometries.push(groundGlassGeo);
    const groundGlass = new THREE.Mesh(groundGlassGeo, glassMaterial);
    groundGlass.position.y = 0.78;
    buildingRoot.add(groundGlass);

    // Ground Floor Warm Core
    const groundCoreGeo = new THREE.BoxGeometry(2.4, 1.1, 2.2);
    geometries.push(groundCoreGeo);
    const groundCore = new THREE.Mesh(groundCoreGeo, interiorWarmMaterial);
    groundCore.position.y = 0.78;
    buildingRoot.add(groundCore);

    // Ground Bronze Mullions (Corner columns)
    const colGeo = new THREE.BoxGeometry(0.08, 1.2, 0.08);
    geometries.push(colGeo);
    const colOffsets: [number, number, number][] = [
      [-1.8, 0.78, -1.7],
      [1.8, 0.78, -1.7],
      [-1.8, 0.78, 1.7],
      [1.8, 0.78, 1.7],
    ];
    colOffsets.forEach(([cx, cy, cz]) => {
      const col = new THREE.Mesh(colGeo, bronzeMaterial);
      col.position.set(cx, cy, cz);
      buildingRoot.add(col);
    });

    // C. First Floor (Level 1) Cantilevered Living Suite
    // Cantilevered Travertine Mid-Slab
    const midSlabGeo = new THREE.BoxGeometry(4.8, 0.2, 4.4);
    geometries.push(midSlabGeo);
    const midSlab = new THREE.Mesh(midSlabGeo, travertineMaterial);
    midSlab.position.set(-0.2, 1.48, 0.1);
    midSlab.castShadow = true;
    midSlab.receiveShadow = true;
    buildingRoot.add(midSlab);

    // Mid-Level Glass Curtain Walls
    const midGlassGeo = new THREE.BoxGeometry(4.0, 1.15, 3.6);
    geometries.push(midGlassGeo);
    const midGlass = new THREE.Mesh(midGlassGeo, glassMaterial);
    midGlass.position.set(-0.2, 2.15, 0.1);
    buildingRoot.add(midGlass);

    // Mid-Level Warm Interior Core
    const midCoreGeo = new THREE.BoxGeometry(2.8, 1.05, 2.4);
    geometries.push(midCoreGeo);
    const midCore = new THREE.Mesh(midCoreGeo, interiorWarmMaterial);
    midCore.position.set(-0.2, 2.15, 0.1);
    buildingRoot.add(midCore);

    // Vertical Bronze Louvers / Brise-Soleil (South facade)
    const louverGeo = new THREE.BoxGeometry(0.04, 1.15, 0.22);
    geometries.push(louverGeo);
    const louverCount = 9;
    const louverSpacing = 0.38;
    for (let i = 0; i < louverCount; i++) {
      const lx = -1.7 + i * louverSpacing;
      const louver = new THREE.Mesh(louverGeo, bronzeMaterial);
      louver.position.set(lx, 2.15, 1.95);
      louver.castShadow = true;
      buildingRoot.add(louver);
    }

    // D. Second Floor (Penthouse Level 2)
    // Penthouse Travertine Terrace Floor
    const pentFloorGeo = new THREE.BoxGeometry(4.2, 0.18, 3.8);
    geometries.push(pentFloorGeo);
    const pentFloor = new THREE.Mesh(pentFloorGeo, travertineMaterial);
    pentFloor.position.set(0.1, 2.82, -0.1);
    pentFloor.castShadow = true;
    buildingRoot.add(pentFloor);

    // Penthouse Glass Pavilion
    const pentGlassGeo = new THREE.BoxGeometry(3.2, 0.95, 2.8);
    geometries.push(pentGlassGeo);
    const pentGlass = new THREE.Mesh(pentGlassGeo, glassMaterial);
    pentGlass.position.set(0.1, 3.39, -0.1);
    buildingRoot.add(pentGlass);

    // Penthouse Warm Core
    const pentCoreGeo = new THREE.BoxGeometry(2.0, 0.85, 1.8);
    geometries.push(pentCoreGeo);
    const pentCore = new THREE.Mesh(pentCoreGeo, interiorWarmMaterial);
    pentCore.position.set(0.1, 3.39, -0.1);
    buildingRoot.add(pentCore);

    // Penthouse Cantilevered Roof Slab with Elegant Overhang
    const roofSlabGeo = new THREE.BoxGeometry(4.8, 0.16, 4.4);
    geometries.push(roofSlabGeo);
    const roofSlab = new THREE.Mesh(roofSlabGeo, travertineMaterial);
    roofSlab.position.set(0.1, 3.95, -0.1);
    roofSlab.castShadow = true;
    buildingRoot.add(roofSlab);

    // Bronze Fascia Roof Edging
    const roofEdges = new THREE.EdgesGeometry(roofSlabGeo);
    geometries.push(roofEdges);
    const edgeLines = new THREE.LineSegments(
      roofEdges,
      new THREE.LineBasicMaterial({ color: 0xc5a059, transparent: true, opacity: 0.8 }),
    );
    edgeLines.position.copy(roofSlab.position);
    buildingRoot.add(edgeLines);

    // =========================================================================
    // LIGHTING SETUP
    // =========================================================================
    // Warm Key Sunlight
    const keySunlight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keySunlight.position.set(7, 10, 6);
    keySunlight.castShadow = true;
    keySunlight.shadow.mapSize.width = 1024;
    keySunlight.shadow.mapSize.height = 1024;
    scene.add(keySunlight);

    // Soft Cyan Sky Fill
    const skyFillLight = new THREE.DirectionalLight(0x64b5f6, 0.7);
    skyFillLight.position.set(-6, 5, -5);
    scene.add(skyFillLight);

    // Warm Architectural Ambient Light
    const ambientLight = new THREE.AmbientLight(0x1a2e36, 0.8);
    scene.add(ambientLight);

    // Terrace Warm Point Light
    const terracePointLight = new THREE.PointLight(0xffd580, 1.5, 7);
    terracePointLight.position.set(1.5, 1.8, 1.8);
    scene.add(terracePointLight);

    // Focus camera
    camera.lookAt(0, 1.7, 0);

    // =========================================================================
    // RESPONSIVE RESIZE & INTERSECTION OBSERVER
    // =========================================================================
    const handleResize = () => {
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 420;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = !!entry?.isIntersecting;
    });
    intersectionObserver.observe(container);

    // =========================================================================
    // INTERACTION: TURNTABLE & POINTER DRAG ORBIT
    // =========================================================================
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let turntableAngle = 0.45;
    let targetPitch = 0.05;
    let currentPitch = 0.05;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      container.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !interactive) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      turntableAngle += dx * 0.008;
      targetPitch = Math.max(-0.25, Math.min(0.45, targetPitch + dy * 0.006));
    };

    const onPointerUp = () => {
      isDragging = false;
      container.style.cursor = interactive ? "grab" : "default";
    };

    container.style.cursor = interactive ? "grab" : "default";
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);

    // =========================================================================
    // ANIMATION RENDER LOOP
    // =========================================================================
    let animFrameId = 0;
    const clock = new THREE.Clock();

    const renderLoop = () => {
      animFrameId = requestAnimationFrame(renderLoop);

      if (!isVisible || document.hidden) return;

      const delta = clock.getDelta();

      // Smooth auto-turntable architectural rotation when user is not actively dragging
      if (!isDragging) {
        turntableAngle += delta * 0.22; // gentle rotation
      }

      currentPitch += (targetPitch - currentPitch) * 0.08;

      // Scroll elevation tilt inspection angle
      let scrollTilt = 0;
      if (elevationScroll && typeof window !== "undefined") {
        scrollTilt = (window.scrollY % 1000) * 0.0001;
      }

      buildingRoot.rotation.y = turntableAngle;
      buildingRoot.rotation.x = currentPitch + scrollTilt;

      renderer.render(scene, camera);
    };

    renderLoop();

    // Comprehensive Unmount Cleanup
    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);

      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement) {
        renderer.domElement.remove();
      }
    };
  }, [interactive, elevationScroll]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[320px] sm:h-[400px] select-none ${className}`}
      data-testid="building-canvas-container"
      aria-label="Modernist Architectural Residence 3D WebGL Interactive Showcase"
    />
  );
}

export default ArchitecturalBuildingCanvas;
