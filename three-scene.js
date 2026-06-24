/* ===================================================
   JS GALAXY PLAYGROUND — three-scene.js
   Three.js r128 | Starfield + GLTF + Fallback mesh
   Responsive WebGLRenderer | Mouse parallax | Lighting
   =================================================== */

(function () {
  'use strict';

  /* ---- Guard: ensure Three.js is loaded ---- */
  if (typeof THREE === 'undefined') {
    console.warn('[three-scene] THREE is not loaded yet. Retrying...');
    window.addEventListener('load', init);
    return;
  }

  window.addEventListener('DOMContentLoaded', init);

  function init() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas) return;

    /* ================================================
       RENDERER
       =============================================== */
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    /* ================================================
       SCENE + CAMERA
       =============================================== */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0.5, 5);

    /* ================================================
       RESIZE HANDLER
       =============================================== */
    function resize() {
      const W = canvas.parentElement ? canvas.parentElement.clientWidth  : window.innerWidth;
      const H = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* ================================================
       LIGHTING
       =============================================== */
    // Ambient — soft dark fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    // Cyan key light — upper right
    const cyanLight = new THREE.PointLight(0x00eaff, 4, 20);
    cyanLight.position.set(4, 4, 3);
    cyanLight.castShadow = true;
    scene.add(cyanLight);

    // Magenta rim light — lower left
    const magentaLight = new THREE.PointLight(0xff4ecd, 3, 18);
    magentaLight.position.set(-4, -2, 2);
    scene.add(magentaLight);

    // Gold accent light — front
    const goldLight = new THREE.PointLight(0xffb000, 1.5, 12);
    goldLight.position.set(0, -3, 5);
    scene.add(goldLight);

    /* ================================================
       STARFIELD (1 000 particles)
       =============================================== */
    const STAR_COUNT = 1000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      starPositions[i * 3 + 0] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.12,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    /* ================================================
       FALLBACK MESH (shown while GLTF loads / if absent)
       A central glowing sphere + rotating torus ring
       =============================================== */
    const fallbackGroup = new THREE.Group();

    // Core sphere
    const sphereGeo = new THREE.SphereGeometry(0.85, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x0d0020,
      emissive: 0x00eaff,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.8,
      wireframe: false
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    coreSphere.castShadow = true;
    fallbackGroup.add(coreSphere);

    // Wireframe overlay on sphere
    const wireGeo  = new THREE.SphereGeometry(0.86, 18, 18);
    const wireMat  = new THREE.MeshBasicMaterial({ color: 0x00eaff, wireframe: true, transparent: true, opacity: 0.12 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    fallbackGroup.add(wireMesh);

    // Torus ring 1 — cyan
    const torus1Geo = new THREE.TorusGeometry(1.5, 0.025, 16, 120);
    const torus1Mat = new THREE.MeshStandardMaterial({
      color: 0x00eaff,
      emissive: 0x00eaff,
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.9
    });
    const torus1 = new THREE.Mesh(torus1Geo, torus1Mat);
    torus1.rotation.x = Math.PI / 2.5;
    torus1.rotation.z = 0.3;
    fallbackGroup.add(torus1);

    // Torus ring 2 — magenta
    const torus2Geo = new THREE.TorusGeometry(2.0, 0.018, 16, 120);
    const torus2Mat = new THREE.MeshStandardMaterial({
      color: 0xff4ecd,
      emissive: 0xff4ecd,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.9
    });
    const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
    torus2.rotation.x = Math.PI / 3;
    torus2.rotation.y = 0.5;
    fallbackGroup.add(torus2);

    // Torus ring 3 — gold (outermost)
    const torus3Geo = new THREE.TorusGeometry(2.6, 0.012, 16, 120);
    const torus3Mat = new THREE.MeshStandardMaterial({
      color: 0xffb000,
      emissive: 0xffb000,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });
    const torus3 = new THREE.Mesh(torus3Geo, torus3Mat);
    torus3.rotation.x = Math.PI / 1.8;
    torus3.rotation.z = -0.6;
    fallbackGroup.add(torus3);

    // Floating satellite spheres
    const satPositions = [
      { x: 1.5,  y: 0.8,  z: 0.5,  r: 0.12, color: 0x00eaff },
      { x: -1.8, y: -0.5, z: 0.3,  r: 0.09, color: 0xff4ecd },
      { x: 0.8,  y: -1.6, z: 0.2,  r: 0.1,  color: 0xffb000 },
      { x: -1.2, y: 1.4,  z: -0.3, r: 0.07, color: 0x00eaff }
    ];
    const satellites = [];
    satPositions.forEach(s => {
      const sGeo = new THREE.SphereGeometry(s.r, 16, 16);
      const sMat = new THREE.MeshStandardMaterial({
        color: s.color,
        emissive: s.color,
        emissiveIntensity: 1.5,
        roughness: 0.1,
        metalness: 0.8
      });
      const mesh = new THREE.Mesh(sGeo, sMat);
      mesh.position.set(s.x, s.y, s.z);
      mesh.userData.initPos = { x: s.x, y: s.y, z: s.z };
      mesh.userData.phase   = Math.random() * Math.PI * 2;
      fallbackGroup.add(mesh);
      satellites.push(mesh);
    });

    scene.add(fallbackGroup);

    /* ================================================
       GLTF LOADER — try to load astronaut
       Falls back gracefully to the mesh above
       =============================================== */
    let gltfModel = null;
    let modelLoaded = false;

    if (typeof THREE.GLTFLoader !== 'undefined') {
      const loader = new THREE.GLTFLoader();
      loader.load(
        'assets/models/astronaut.glb',
        (gltf) => {
          gltfModel = gltf.scene;

          // Center and scale the model
          const box    = new THREE.Box3().setFromObject(gltfModel);
          const center = box.getCenter(new THREE.Vector3());
          const size   = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale  = 2.5 / maxDim;

          gltfModel.scale.setScalar(scale);
          gltfModel.position.sub(center.multiplyScalar(scale));

          // Apply material tweaks for consistent lighting
          gltfModel.traverse(child => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness   = Math.min(child.material.roughness ?? 0.5, 0.7);
                child.material.metalness   = Math.max(child.material.metalness ?? 0.3, 0.3);
                child.material.envMapIntensity = 1.2;
              }
            }
          });

          scene.add(gltfModel);
          // Hide the fallback when model is loaded
          fallbackGroup.visible = false;
          modelLoaded = true;
          console.log('[three-scene] astronaut.glb loaded ✓');
        },
        undefined,
        (err) => {
          // Graceful fallback — keep the procedural mesh
          console.info('[three-scene] GLTF not found or errored — using fallback mesh.', err.message || '');
          fallbackGroup.visible = true;
        }
      );
    }

    /* ================================================
       MOUSE TRACKING
       =============================================== */
    const mouse = { x: 0, y: 0 };
    const targetMouse = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    /* ================================================
       ANIMATION LOOP
       =============================================== */
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse lerp
      targetMouse.x += (mouse.x - targetMouse.x) * 0.05;
      targetMouse.y += (mouse.y - targetMouse.y) * 0.05;

      /* ---- Starfield slow rotation ---- */
      stars.rotation.y = t * 0.018;
      stars.rotation.x = t * 0.006;

      /* ---- Fallback mesh animation ---- */
      if (fallbackGroup.visible) {
        // Gentle floating idle
        fallbackGroup.position.y = Math.sin(t * 0.6) * 0.12;

        // Mouse parallax rotation
        fallbackGroup.rotation.y = targetMouse.x * 0.4 + t * 0.12;
        fallbackGroup.rotation.x = -targetMouse.y * 0.25;

        // Individual torus ring rotations
        torus1.rotation.z += 0.008;
        torus2.rotation.x += 0.005;
        torus3.rotation.y += 0.003;

        // Satellite float
        satellites.forEach(s => {
          const p = s.userData.initPos;
          s.position.y = p.y + Math.sin(t * 0.9 + s.userData.phase) * 0.15;
          s.position.x = p.x + Math.cos(t * 0.7 + s.userData.phase) * 0.08;
        });

        // Pulsing emissive on core sphere
        const pulse = 0.25 + Math.sin(t * 2) * 0.12;
        sphereMat.emissiveIntensity = pulse;
      }

      /* ---- GLTF model animation ---- */
      if (modelLoaded && gltfModel) {
        gltfModel.position.y    = Math.sin(t * 0.5) * 0.18;
        gltfModel.rotation.y    = targetMouse.x * 0.5 + t * 0.08;
        gltfModel.rotation.x    = -targetMouse.y * 0.3;
      }

      /* ---- Animated lights ---- */
      cyanLight.intensity    = 3.5 + Math.sin(t * 1.5) * 0.7;
      magentaLight.intensity = 2.5 + Math.cos(t * 1.2) * 0.5;
      cyanLight.position.x   = 4 + Math.sin(t * 0.4) * 0.5;
      cyanLight.position.y   = 4 + Math.cos(t * 0.3) * 0.5;

      renderer.render(scene, camera);
    }

    animate();
  }

})();