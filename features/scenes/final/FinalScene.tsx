'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { oceanVertexShader, oceanFragmentShader, skyVertexShader, skyFragmentShader } from './oceanShaders';

function createGlowTexture(color: string): THREE.Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

export function FinalScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 2000);
    camera.position.set(0, 6, 30);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ---------- Sky ----------
    const skyGeometry = new THREE.SphereGeometry(900, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: {
        uTopColor: { value: new THREE.Color('#2a2140') },
        uHorizonColor: { value: new THREE.Color('#f2926f') },
        uBottomColor: { value: new THREE.Color('#8a4a52') },
      },
    });
    scene.add(new THREE.Mesh(skyGeometry, skyMaterial));

    // ---------- Sun & moon ----------
    const sunDirection = new THREE.Vector3(-0.55, 0.18, -0.6).normalize();
    const sunPosition = sunDirection.clone().multiplyScalar(700);
    const sunSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture('rgba(255,214,150,1)'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    sunSprite.position.copy(sunPosition);
    sunSprite.scale.set(140, 140, 1);
    scene.add(sunSprite);

    const moonDirection = new THREE.Vector3(0.6, 0.35, 0.5).normalize();
    const moonSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createGlowTexture('rgba(226,232,240,1)'),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    moonSprite.position.copy(moonDirection.multiplyScalar(650));
    moonSprite.scale.set(60, 60, 1);
    scene.add(moonSprite);

    // ---------- Ocean ----------
    const oceanGeometry = new THREE.PlaneGeometry(1400, 1400, 220, 220);
    oceanGeometry.rotateX(-Math.PI / 2);

    const oceanMaterial = new THREE.ShaderMaterial({
      vertexShader: oceanVertexShader,
      fragmentShader: oceanFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: sunDirection },
        uSunColor: { value: new THREE.Color('#ffd9a0') },
        uDeepColor: { value: new THREE.Color('#0e3b45') },
        uShallowColor: { value: new THREE.Color('#e8917e') },
        uCameraPosition: { value: camera.position },
      },
    });

    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    scene.add(ocean);

    const clock = new THREE.Clock();
    let frameId: number;

    function animate() {
      const elapsed = clock.getElapsedTime();
      oceanMaterial.uniforms.uTime.value = elapsed;
      oceanMaterial.uniforms.uCameraPosition.value = camera.position;

      camera.position.x = Math.sin(elapsed * 0.05) * 6;
      camera.lookAt(0, 2, 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function handleResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      oceanGeometry.dispose();
      oceanMaterial.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetch('/api/story-seen', { method: 'POST' });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen">
      <div ref={containerRef} className="h-screen w-full" />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-warmWhite">
        <p className="font-arDisplay text-3xl drop-shadow-lg">إحنا هنا سوا</p>
        <p className="drop-shadow-lg">ومهما بعدنا، البحر ده شاهد إن الحكاية لسه مكملة.</p>
      </div>
    </section>
  );
}
