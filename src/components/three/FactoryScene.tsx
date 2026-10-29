import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createCleanroomFloorTexture,
  createSMTWorkstation,
  createRoboticAssemblyStation,
  createLaserQAStation,
  createPackagingDockStation,
  createAGVVehicle,
  createProductUnit,
} from './proceduralModels';
import { WorkstationLine, ProductSKU } from '../../types/production';
import {
  Eye,
  Maximize2,
  Play,
  Pause,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Bot,
  Scan,
  Package,
  Compass,
} from 'lucide-react';

interface FactorySceneProps {
  workstations: WorkstationLine[];
  products: ProductSKU[];
  selectedLineId: string | null;
  onSelectLine: (lineId: string | null) => void;
  activeShifts: number;
}

export const FactoryScene: React.FC<FactorySceneProps> = ({
  workstations,
  products,
  selectedLineId,
  onSelectLine,
  activeShifts,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showFlowPaths, setShowFlowPaths] = useState<boolean>(true);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [viewPreset, setViewPreset] = useState<string>('isometric');

  // Camera transition target refs to interpolate smoothly without abrupt snaps
  const cameraTargetRef = useRef<{
    pos: THREE.Vector3;
    lookAt: THREE.Vector3;
    transitioning: boolean;
  }>({
    pos: new THREE.Vector3(14, 12, 16),
    lookAt: new THREE.Vector3(0, 0, 0),
    transitioning: false,
  });

  const controlsRef = useRef<OrbitControls | null>(null);
  const simSpeedRef = useRef<number>(simSpeed);
  simSpeedRef.current = simSpeed;

  const onSelectLineRef = useRef(onSelectLine);
  onSelectLineRef.current = onSelectLine;

  const selectedLineIdRef = useRef(selectedLineId);
  selectedLineIdRef.current = selectedLineId;

  // Camera presets
  const applyCameraPreset = useCallback((preset: string) => {
    setViewPreset(preset);
    const target = cameraTargetRef.current;
    target.transitioning = true;

    switch (preset) {
      case 'line-01':
        target.pos.set(-7, 4.5, 2.5);
        target.lookAt.set(-7, 1.2, -3);
        break;
      case 'line-02':
        target.pos.set(-7, 4.5, 9);
        target.lookAt.set(-7, 1.2, 3);
        break;
      case 'line-03':
        target.pos.set(3.5, 4.5, 2.5);
        target.lookAt.set(3.5, 1.2, -3);
        break;
      case 'line-04':
        target.pos.set(3.5, 4.5, 9);
        target.lookAt.set(3.5, 1.2, 3);
        break;
      case 'topdown':
        target.pos.set(0, 24, 0.01);
        target.lookAt.set(0, 0, 0);
        break;
      case 'isometric':
      default:
        target.pos.set(15, 13, 17);
        target.lookAt.set(0, 0.5, 0);
        break;
    }
  }, []);

  // Update camera target when selectedLineId changes externally
  useEffect(() => {
    if (selectedLineId) {
      applyCameraPreset(selectedLineId);
    }
  }, [selectedLineId, applyCameraPreset]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL to avoid frame starvation
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize clean renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setClearColor(0xf8fafc, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.Fog(0xf8fafc, 28, 65);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(15, 13, 17);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // don't go below floor
    controls.minDistance = 4;
    controls.maxDistance = 42;
    controls.target.set(0, 0.5, 0);
    controlsRef.current = controls;

    // Studio Environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting rig (PBR warm key + cool hemisphere fill)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.75);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.2);
    keyLight.position.set(12, 18, 10);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 50;
      const d = 16;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f9ff, 0.5);
    fillLight.position.set(-12, 10, -10);
    scene.add(fillLight);

    // Cleanroom Floor Plane
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorTex = createCleanroomFloorTexture();
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.35,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle perimeter boundaries (Clean glass/aluminum wall posts)
    const wallLineMat = new THREE.LineBasicMaterial({ color: 0xcbd5e1 });
    const wallPts = [
      new THREE.Vector3(-18, 0.02, -14),
      new THREE.Vector3(18, 0.02, -14),
      new THREE.Vector3(18, 0.02, 14),
      new THREE.Vector3(-18, 0.02, 14),
      new THREE.Vector3(-18, 0.02, -14),
    ];
    const wallLineGeo = new THREE.BufferGeometry().setFromPoints(wallPts);
    const wallBoundary = new THREE.Line(wallLineGeo, wallLineMat);
    scene.add(wallBoundary);

    // Interactive Raycasting registry
    const interactiveGroups: { id: string; group: THREE.Group }[] = [];

    // --- Build Workstations ---
    // Line 1: SMT
    const smt = createSMTWorkstation('line-01');
    smt.group.position.set(-7, 0, -3.5);
    scene.add(smt.group);
    interactiveGroups.push({ id: 'line-01', group: smt.group });

    // Line 2: Robotic Assembly
    const robot = createRoboticAssemblyStation('line-02');
    robot.group.position.set(-7, 0, 3.5);
    scene.add(robot.group);
    interactiveGroups.push({ id: 'line-02', group: robot.group });

    // Line 3: Optical Laser QA
    const qa = createLaserQAStation('line-03');
    qa.group.position.set(3.5, 0, -3.5);
    scene.add(qa.group);
    interactiveGroups.push({ id: 'line-03', group: qa.group });

    // Line 4: Packaging Dock
    const pack = createPackagingDockStation('line-04');
    pack.group.position.set(3.5, 0, 3.5);
    scene.add(pack.group);
    interactiveGroups.push({ id: 'line-04', group: pack.group });

    // --- Inter-Station Transfer Conveyors ---
    const conveyorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.3,
    });

    // Conveyor 1: Line 1 to Line 2 (vertical bridge)
    const c1Geo = new THREE.BoxGeometry(0.8, 0.2, 5.0);
    const c1 = new THREE.Mesh(c1Geo, conveyorMat);
    c1.position.set(-7, 0.7, 0);
    c1.castShadow = true;
    scene.add(c1);

    // Conveyor 2: Line 2 across to Line 4 (horizontal bridge)
    const c2Geo = new THREE.BoxGeometry(7.0, 0.2, 0.8);
    const c2 = new THREE.Mesh(c2Geo, conveyorMat);
    c2.position.set(-1.75, 0.7, 3.5);
    c2.castShadow = true;
    scene.add(c2);

    // Conveyor 3: Line 3 to Line 4 (vertical bridge)
    const c3Geo = new THREE.BoxGeometry(0.8, 0.2, 5.0);
    const c3 = new THREE.Mesh(c3Geo, conveyorMat);
    c3.position.set(3.5, 0.7, 0);
    c3.castShadow = true;
    scene.add(c3);

    // --- Dynamic Moving Product Units along Conveyors ---
    const productUnits: { mesh: THREE.Mesh; progress: number; path: 'c1' | 'c2' | 'c3' }[] = [];
    const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b'];

    for (let i = 0; i < 9; i++) {
      const color = colors[i % colors.length];
      const pMesh = createProductUnit(color);
      scene.add(pMesh);
      productUnits.push({
        mesh: pMesh,
        progress: (i / 9),
        path: i % 3 === 0 ? 'c1' : i % 3 === 1 ? 'c2' : 'c3',
      });
    }

    // --- Autonomous Guided Vehicles (AGVs) ---
    const agv1 = createAGVVehicle(0xe2e8f0);
    const agv2 = createAGVVehicle(0xf1f5f9);
    scene.add(agv1.group);
    scene.add(agv2.group);

    // Raycaster for user mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      for (const item of interactiveGroups) {
        const hits = raycaster.intersectObjects(item.group.children, true);
        if (hits.length > 0) {
          onSelectLineRef.current(item.id);
          applyCameraPreset(item.id);
          return;
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation loop variables
    let frameId = 0;
    let clock = new THREE.Clock();

    // Reusable math vectors to prevent garbage collection allocation
    const _vec3 = new THREE.Vector3();

    // Software GL pacing handler
    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const speed = simSpeedRef.current;

      // 1. Smooth Camera Transition Damping
      const camTarget = cameraTargetRef.current;
      if (camTarget.transitioning) {
        camera.position.lerp(camTarget.pos, 0.05);
        controls.target.lerp(camTarget.lookAt, 0.05);
        if (
          camera.position.distanceTo(camTarget.pos) < 0.1 &&
          controls.target.distanceTo(camTarget.lookAt) < 0.1
        ) {
          camTarget.transitioning = false;
        }
      }

      controls.update();

      // 2. Animate Machinery (scaled by simulation speed)
      if (speed > 0) {
        const effectiveTime = elapsed * speed;

        // Line 1 SMT: rapid pick and place gantry
        smt.gantryHead.position.x = Math.sin(effectiveTime * 4.5) * 0.9;
        smt.gantryHead.position.z = Math.cos(effectiveTime * 3.2) * 0.5;
        smt.gantryHead.position.y = 1.25 + Math.abs(Math.sin(effectiveTime * 9.0)) * 0.12;

        // Line 2 Robotic: Multi-joint articulation
        robot.robotBase.rotation.y = Math.sin(effectiveTime * 1.5) * 0.7;
        robot.robotForearm.rotation.z = Math.sin(effectiveTime * 2.0) * 0.35;
        robot.robotWrist.rotation.x = Math.cos(effectiveTime * 3.0) * 0.5;

        // Line 3 Laser QA: oscillating beam and fan
        qa.laserScanner.position.x = Math.sin(effectiveTime * 2.5) * 0.6;
        qa.laserBeam.position.x = qa.laserScanner.position.x;
        qa.laserBeam.rotation.z = Math.sin(effectiveTime * 3.0) * 0.15;

        // Line 4 Palletizing: Press stamping
        pack.pressHead.position.y = 1.35 - Math.max(0, Math.sin(effectiveTime * 2.0) * 0.25);

        // 3. Move Product Units along Conveyors
        productUnits.forEach((unit) => {
          unit.progress = (unit.progress + delta * 0.15 * speed) % 1;
          const p = unit.progress;

          if (unit.path === 'c1') {
            // SMT to Robotic (-7, 0.88, -2.5 -> +2.5)
            unit.mesh.position.set(-7, 0.88, -2.5 + p * 5.0);
          } else if (unit.path === 'c2') {
            // Robotic to Pack (-5.2 -> 1.8, 0.88, 3.5)
            unit.mesh.position.set(-5.2 + p * 7.0, 0.88, 3.5);
          } else {
            // QA to Pack (3.5, 0.88, -2.5 -> +2.5)
            unit.mesh.position.set(3.5, 0.88, -2.5 + p * 5.0);
          }
        });

        // 4. Animate AGVs along warehouse guide paths
        const agvTime1 = effectiveTime * 0.4;
        const agvRadiusX = 11;
        const agvRadiusZ = 7.5;
        agv1.group.position.x = Math.cos(agvTime1) * agvRadiusX;
        agv1.group.position.z = Math.sin(agvTime1) * agvRadiusZ;
        agv1.group.rotation.y = -agvTime1 + Math.PI / 2;

        const agvTime2 = agvTime1 + Math.PI;
        agv2.group.position.x = Math.cos(agvTime2) * agvRadiusX;
        agv2.group.position.z = Math.sin(agvTime2) * agvRadiusZ;
        agv2.group.rotation.y = -agvTime2 + Math.PI / 2;
      }

      // 5. Raycasting for hover feedback
      raycaster.setFromCamera(mouse, camera);
      let foundHover: string | null = null;
      for (const item of interactiveGroups) {
        const hits = raycaster.intersectObjects(item.group.children, true);
        if (hits.length > 0) {
          foundHover = item.id;
          break;
        }
      }
      setHoveredLineId(foundHover);
      if (container) {
        container.style.cursor = foundHover ? 'pointer' : 'default';
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [applyCameraPreset]);

  // Selected workstation details
  const activeWorkstation = workstations.find((w) => w.id === (selectedLineId || hoveredLineId));

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 select-none">
      {/* 3D WebGL Canvas Mount (isolated ref container) */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Left Spec Badge & Facility Status */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/95 border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            <h1 className="text-sm font-semibold text-slate-800 tracking-tight">
              Modular Cleanroom Twin • Facility Alpha
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized with Real-Time Master Production Schedule
          </p>
        </div>

        {/* Hover / Selected Line Tooltip Card */}
        {activeWorkstation && (
          <div className="bg-white/95 border border-slate-200/90 rounded-xl p-3 shadow-md max-w-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">
                {activeWorkstation.code}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                OEE: {activeWorkstation.efficiencyOEE}%
              </span>
            </div>
            <div className="text-xs font-medium text-slate-900">{activeWorkstation.name}</div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
              <span>Throughput: {activeWorkstation.capacityPerHour} u/hr</span>
              <span className="text-emerald-600 font-medium capitalize">
                ● {activeWorkstation.status}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (activeWorkstation.completedUnits / (activeWorkstation.targetUnits || 1)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => applyCameraPreset('isometric')}
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Reset to Isometric View"
        >
          <Compass className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Camera</span>
        </button>
      </div>

      {/* Unified Bottom Control Dock (Zero Viewport Occlusion, Collapsible Cinema Mode) */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 flex flex-col items-center ${
          controlsCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
        }`}
        style={{ maxWidth: 'min(960px, 94vw)' }}
      >
        {/* Collapse / Expand Tab */}
        <button
          onClick={() => setControlsCollapsed(!controlsCollapsed)}
          className="bg-white/95 border border-slate-200/90 text-slate-600 hover:text-slate-900 px-3 py-1 rounded-t-lg text-xs font-medium shadow-sm flex items-center gap-1 cursor-pointer transition-colors"
        >
          {controlsCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Dock</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls (Zen Mode)</span>
            </>
          )}
        </button>

        {/* Main Dock Bar */}
        <div className="bg-white/95 border border-slate-200 rounded-2xl shadow-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3 w-full">
          {/* Workstation Camera Focus Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => {
                onSelectLine(null);
                applyCameraPreset('isometric');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewPreset === 'isometric'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                onSelectLine('line-01');
                applyCameraPreset('line-01');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewPreset === 'line-01'
                  ? 'bg-sky-50 text-sky-700 shadow-sm border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-500" />
              <span>Line 1 SMT</span>
            </button>

            <button
              onClick={() => {
                onSelectLine('line-02');
                applyCameraPreset('line-02');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewPreset === 'line-02'
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-500" />
              <span>Line 2 Robot</span>
            </button>

            <button
              onClick={() => {
                onSelectLine('line-03');
                applyCameraPreset('line-03');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewPreset === 'line-03'
                  ? 'bg-purple-50 text-purple-700 shadow-sm border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-purple-500" />
              <span>Line 3 QA</span>
            </button>

            <button
              onClick={() => {
                onSelectLine('line-04');
                applyCameraPreset('line-04');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewPreset === 'line-04'
                  ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-amber-500" />
              <span>Line 4 Pack</span>
            </button>

            <button
              onClick={() => {
                onSelectLine(null);
                applyCameraPreset('topdown');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                viewPreset === 'topdown'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>2D Flow</span>
            </button>
          </div>

          {/* Simulation Rate & Shift Controls */}
          <div className="flex items-center gap-3">
            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setSimSpeed(simSpeed === 0 ? 1 : 0)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  simSpeed === 0
                    ? 'bg-amber-50 text-amber-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={simSpeed === 0 ? 'Resume Simulation' : 'Pause Simulation'}
              >
                {simSpeed === 0 ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {[1, 2, 4].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    simSpeed === spd
                      ? 'bg-white text-slate-900 shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Active Shifts Indicator */}
            <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>{activeShifts} Shifts ({activeShifts * 8}h/day)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
