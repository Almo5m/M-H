'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  RING_PATH,
  HOME_STRETCH,
  YARD_SLOTS,
  CENTER,
  SAFE_INDICES,
  coordFor,
  type LudoColor,
} from '@/lib/games/ludo';

const COLOR_HEX: Record<LudoColor, number> = {
  red: 0xc97b6e,
  green: 0x8fae7d,
  yellow: 0xe3c567,
  blue: 0x7b93b0,
};

const COLORS: LudoColor[] = ['red', 'green', 'yellow', 'blue'];

function worldX(col: number) {
  return col - 7;
}
function worldZ(row: number) {
  return row - 7;
}

function makeDiceFaceTexture(pips: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFFBF6';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#241A2E';
  const positions: Record<number, [number, number][]> = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
    6: [[0.28, 0.25], [0.72, 0.25], [0.28, 0.5], [0.72, 0.5], [0.28, 0.75], [0.72, 0.75]],
  };
  for (const [px, py] of positions[pips]) {
    ctx.beginPath();
    ctx.arc(px * size, py * size, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

function makePawnMesh(color: number): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.15 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.12, 20), material);
  base.position.y = 0.06;
  base.castShadow = true;

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 20), material);
  body.position.y = 0.35;
  body.castShadow = true;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), material);
  head.position.y = 0.62;
  head.castShadow = true;

  group.add(base, body, head);
  return group;
}

interface LudoBoard3DProps {
  colors: Record<string, LudoColor>;
  tokens: Record<string, number[]>;
  myId: string;
  otherId: string;
  movableIndices: number[];
  onTokenClick: (index: number) => void;
  diceValue: number | null;
  rollTrigger: number; // increment to play a new roll animation
}

export function LudoBoard3D({
  colors,
  tokens,
  myId,
  otherId,
  movableIndices,
  onTokenClick,
  diceValue,
  rollTrigger,
}: LudoBoard3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const tokenMeshesRef = useRef<{ mesh: THREE.Group; userId: string; index: number; movable: boolean }[]>([]);
  const diceRef = useRef<THREE.Mesh | null>(null);
  const onTokenClickRef = useRef(onTokenClick);
  onTokenClickRef.current = onTokenClick;

  // ---------- one-time scene setup ----------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x241a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 13, 10.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const dirLight = new THREE.DirectionalLight(0xffe9c7, 0.9);
    dirLight.position.set(6, 14, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    // board base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xfffbf6, roughness: 0.7 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(15.4, 0.3, 15.4), baseMat);
    base.position.y = -0.15;
    base.receiveShadow = true;
    scene.add(base);

    // corner yards
    const yardCorners: Record<LudoColor, [number, number]> = { red: [-4.5, -4.5], green: [4.5, -4.5], yellow: [4.5, 4.5], blue: [-4.5, 4.5] };
    for (const color of COLORS) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 0.1, 5.2),
        new THREE.MeshStandardMaterial({ color: COLOR_HEX[color], roughness: 0.6 }),
      );
      const [x, z] = yardCorners[color];
      mesh.position.set(x, 0.02, z);
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    // ring path cells
    RING_PATH.forEach((coord, index) => {
      const isSafe = SAFE_INDICES.has(index);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.12, 0.86),
        new THREE.MeshStandardMaterial({ color: isSafe ? 0xefe1d0 : 0xfffbf6, roughness: 0.5 }),
      );
      mesh.position.set(worldX(coord.col), 0.06, worldZ(coord.row));
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // home stretches
    for (const color of COLORS) {
      HOME_STRETCH[color].forEach((coord) => {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.86, 0.14, 0.86),
          new THREE.MeshStandardMaterial({ color: COLOR_HEX[color], roughness: 0.55 }),
        );
        mesh.position.set(worldX(coord.col), 0.07, worldZ(coord.row));
        mesh.receiveShadow = true;
        scene.add(mesh);
      });
    }

    // center pyramid
    const centerMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 0.7, 4),
      new THREE.MeshStandardMaterial({ color: 0xc7a96b, roughness: 0.3, metalness: 0.3 }),
    );
    centerMesh.position.set(worldX(CENTER.col), 0.45, worldZ(CENTER.row));
    centerMesh.rotation.y = Math.PI / 4;
    centerMesh.castShadow = true;
    scene.add(centerMesh);

    // die
    const faceMaterials = [1, 2, 3, 4, 5, 6].map(
      (pips) => new THREE.MeshStandardMaterial({ map: makeDiceFaceTexture(pips), roughness: 0.35 }),
    );
    const die = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), faceMaterials);
    die.position.set(0, 3, 6.3);
    die.castShadow = true;
    scene.add(die);
    diceRef.current = die;

    let frameId: number;
    let dieSpin = { x: 0, y: 0, active: false, timer: 0 };

    function animate() {
      const time = performance.now() / 1000;

      // gentle bob for movable tokens
      tokenMeshesRef.current.forEach(({ mesh, movable }) => {
        if (movable) mesh.position.y = 0.15 + Math.sin(time * 4) * 0.08;
      });

      if (dieSpin.active) {
        die.rotation.x += dieSpin.x;
        die.rotation.y += dieSpin.y;
        dieSpin.timer -= 1;
        if (dieSpin.timer <= 0) dieSpin.active = false;
      }
      (die as any).__spinControl = dieSpin;

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

    function handleClick(event: MouseEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycasterRef.current.setFromCamera(pointer, camera);
      const meshes = tokenMeshesRef.current.filter((t) => t.movable).map((t) => t.mesh);
      const intersects = raycasterRef.current.intersectObjects(meshes.flatMap((group) => group.children), true);
      if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        const hit = tokenMeshesRef.current.find((t) => t.movable && t.mesh.children.includes(hitObject as THREE.Mesh));
        if (hit) onTokenClickRef.current(hit.index);
      }
    }
    renderer.domElement.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  // ---------- re-render tokens whenever positions/movable set changes ----------
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    tokenMeshesRef.current.forEach(({ mesh }) => scene.remove(mesh));
    tokenMeshesRef.current = [];

    for (const userId of [myId, otherId]) {
      const color = colors[userId];
      tokens[userId]?.forEach((step, index) => {
        const isMine = userId === myId;
        const movable = isMine && movableIndices.includes(index);
        const coord = step === -1 ? YARD_SLOTS[color][index] : coordFor(color, step);
        const mesh = makePawnMesh(COLOR_HEX[color]);
        mesh.position.set(worldX(coord.col), 0.15, worldZ(coord.row));
        if (movable) {
          mesh.scale.setScalar(1.15);
        }
        scene.add(mesh);
        tokenMeshesRef.current.push({ mesh, userId, index, movable });
      });
    }
  }, [colors, tokens, myId, otherId, movableIndices]);

  // ---------- dice roll animation + settle on final value ----------
  useEffect(() => {
    const die = diceRef.current as any;
    if (!die || rollTrigger === 0) return;
    die.__spinControl = { x: 0.35, y: 0.28, active: true, timer: 40 };
  }, [rollTrigger]);

  useEffect(() => {
    const die = diceRef.current;
    if (!die || diceValue === null) return;
    const rotations: Record<number, [number, number, number]> = {
      1: [0, 0, 0],
      2: [0, Math.PI / 2, 0],
      3: [-Math.PI / 2, 0, 0],
      4: [Math.PI / 2, 0, 0],
      5: [0, -Math.PI / 2, 0],
      6: [Math.PI, 0, 0],
    };
    const timeout = setTimeout(() => {
      const [x, y, z] = rotations[diceValue];
      die.rotation.set(x, y, z);
    }, 700);
    return () => clearTimeout(timeout);
  }, [diceValue]);

  return <div ref={containerRef} className="mx-auto h-[420px] w-full max-w-md overflow-hidden rounded-2xl" />;
}
