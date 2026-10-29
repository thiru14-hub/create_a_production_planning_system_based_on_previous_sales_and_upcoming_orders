import * as THREE from 'three';

/**
 * Creates a procedural high-resolution canvas texture for cleanroom floor grid tiles
 */
export function createCleanroomFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Ultra-clean light epoxy base
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle tile grid lines (light slate)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;

    const tileSize = 128;
    for (let x = 0; x <= 1024; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Safety zone walkways (pale amber dashed guide lines)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 16]);
    ctx.strokeRect(64, 64, 896, 896);

    // Subtle station anchor crosshairs
    ctx.fillStyle = '#94a3b8';
    ctx.setLineDash([]);
    for (let x = 256; x <= 768; x += 256) {
      for (let y = 256; y <= 768; y += 256) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a procedural digital monitor texture displaying telemetry metrics
 */
export function createMonitorTexture(title: string, lineCode: string, oee: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Crisp dark-tinted glass background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);

    // Top status bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 44);

    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${lineCode} - ${title}`, 20, 30);

    // Live metrics display
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`OEE: ${oee}`, 24, 110);

    ctx.font = '18px system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('STATUS: SYNCHRONIZED', 24, 150);
    ctx.fillText('CYCLE: 0.14s | BUFFER: 98%', 24, 180);

    // Mini sparkline graph
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(280, 190);
    ctx.lineTo(320, 140);
    ctx.lineTo(360, 160);
    ctx.lineTo(400, 100);
    ctx.lineTo(440, 120);
    ctx.lineTo(480, 80);
    ctx.stroke();

    // Bottom bezel line
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 250, 512, 6);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a soft contact shadow plane beneath machinery
 */
export function createContactShadow(width: number, length: number): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.20)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  const geo = new THREE.PlaneGeometry(width, length);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.01;
  mesh.renderOrder = 1;
  return mesh;
}

// Reusable standard materials with light cleanroom theme
const lightAluminumMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  metalness: 0.6,
  roughness: 0.25,
});

const darkFrameMat = new THREE.MeshStandardMaterial({
  color: 0x334155,
  metalness: 0.8,
  roughness: 0.35,
});

const conveyorBeltMat = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  metalness: 0.1,
  roughness: 0.85,
});

const clearAcrylicMat = new THREE.MeshPhysicalMaterial({
  color: 0xf8fafc,
  transparent: true,
  opacity: 0.45,
  roughness: 0.1,
  metalness: 0.1,
  transmission: 0.6,
  ior: 1.45,
  depthWrite: false,
});

/**
 * Workstation 1: SMT High-Speed Surface Mount & PCB Fabrication
 * Composite 3D procedural group
 */
export function createSMTWorkstation(lineCode: string): {
  group: THREE.Group;
  gantryHead: THREE.Mesh;
  indicatorLight: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = lineCode;

  // 1. Heavy machine base pedestal
  const baseGeo = new THREE.BoxGeometry(3.6, 0.7, 2.2);
  const baseMesh = new THREE.Mesh(baseGeo, lightAluminumMat);
  baseMesh.position.y = 0.35;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 2. Base leveling feet
  const footGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.1, 16);
  const footPositions = [
    [-1.6, 0.05, -0.9],
    [1.6, 0.05, -0.9],
    [-1.6, 0.05, 0.9],
    [1.6, 0.05, 0.9],
  ];
  footPositions.forEach(([x, y, z]) => {
    const foot = new THREE.Mesh(footGeo, darkFrameMat);
    foot.position.set(x, y, z);
    group.add(foot);
  });

  // 3. Central PCB Conveyor deck passing through machine
  const beltGeo = new THREE.BoxGeometry(4.4, 0.15, 0.8);
  const beltMesh = new THREE.Mesh(beltGeo, conveyorBeltMat);
  beltMesh.position.set(0, 0.78, 0);
  beltMesh.castShadow = true;
  group.add(beltMesh);

  // 4. Overhead Gantry Arch & Pick-and-Place Rail
  const archGeo = new THREE.BoxGeometry(2.8, 1.4, 1.8);
  const archMesh = new THREE.Mesh(archGeo, darkFrameMat);
  archMesh.position.set(0, 1.5, 0);
  archMesh.castShadow = true;
  group.add(archMesh);

  // 5. Acrylic inspection dome cover
  const canopyGeo = new THREE.BoxGeometry(2.4, 0.9, 1.6);
  const canopyMesh = new THREE.Mesh(canopyGeo, clearAcrylicMat);
  canopyMesh.position.set(0, 1.45, 0);
  group.add(canopyMesh);

  // 6. Animated pick-and-place gantry head
  const gantryHeadGeo = new THREE.CylinderGeometry(0.12, 0.06, 0.5, 16);
  const gantryHeadMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0x0284c7,
    emissiveIntensity: 0.3,
  });
  const gantryHead = new THREE.Mesh(gantryHeadGeo, gantryHeadMat);
  gantryHead.position.set(0, 1.25, 0);
  group.add(gantryHead);

  // 7. Component Tape & Reel Feeder Banks on front
  const reelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 20);
  const reelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.4 });
  for (let i = -1.2; i <= 1.2; i += 0.5) {
    const reel = new THREE.Mesh(reelGeo, reelMat);
    reel.rotation.x = Math.PI / 2;
    reel.position.set(i, 0.95, 1.05);
    group.add(reel);
  }

  // 8. Control Monitor Pedestal
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
  const pole = new THREE.Mesh(poleGeo, darkFrameMat);
  pole.position.set(1.9, 1.0, 0.9);
  group.add(pole);

  const screenGeo = new THREE.BoxGeometry(0.7, 0.45, 0.06);
  const screenTex = createMonitorTexture('SMT FABRICATION', 'LINE-01', '92.4%');
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(1.9, 1.65, 0.9);
  screenMesh.rotation.y = -Math.PI / 6;
  group.add(screenMesh);

  // 9. Multi-tier Stack Light (Green/Amber/Red)
  const stackPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.8, 12), darkFrameMat);
  stackPole.position.set(-1.6, 2.4, -0.7);
  group.add(stackPole);

  const lightGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16);
  const lightMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.8,
  });
  const indicatorLight = new THREE.Mesh(lightGeo, lightMat);
  indicatorLight.position.set(-1.6, 2.8, -0.7);
  group.add(indicatorLight);

  // Soft contact shadow
  group.add(createContactShadow(4.2, 2.8));

  return { group, gantryHead, indicatorLight };
}

/**
 * Workstation 2: Robotic Precision Micro-Assembly
 * Composite 3D procedural group with multi-joint articulated arm
 */
export function createRoboticAssemblyStation(lineCode: string): {
  group: THREE.Group;
  robotBase: THREE.Group;
  robotForearm: THREE.Group;
  robotWrist: THREE.Group;
  indicatorLight: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = lineCode;

  // 1. Heavy cast steel pedestal table
  const baseGeo = new THREE.BoxGeometry(3.2, 0.7, 2.4);
  const baseMesh = new THREE.Mesh(baseGeo, lightAluminumMat);
  baseMesh.position.y = 0.35;
  baseMesh.castShadow = true;
  group.add(baseMesh);

  // 2. Work cell safety enclosure pillars (Clean aesthetic light slate)
  const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 12);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, roughness: 0.3 });
  const corners = [
    [-1.5, 1.2, -1.1],
    [1.5, 1.2, -1.1],
    [-1.5, 1.2, 1.1],
    [1.5, 1.2, 1.1],
  ];
  corners.forEach(([x, y, z]) => {
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, y, z);
    group.add(pillar);
  });

  // 3. Clear safety polycarbonate perimeter guards
  const guardGeo = new THREE.BoxGeometry(2.9, 1.8, 0.02);
  const guardMesh = new THREE.Mesh(guardGeo, clearAcrylicMat);
  guardMesh.position.set(0, 1.5, -1.1);
  group.add(guardMesh);

  // 4. Robotic Arm Hierarchy:
  // Root Base (Turret rotates around Y)
  const robotBase = new THREE.Group();
  robotBase.position.set(0, 0.7, 0);
  group.add(robotBase);

  const pedestalCylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.45, 0.25, 24),
    darkFrameMat
  );
  pedestalCylinder.position.y = 0.125;
  robotBase.add(pedestalCylinder);

  // Articulated Shoulder Joint
  const shoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.7, roughness: 0.2 })
  );
  shoulder.position.y = 0.35;
  robotBase.add(shoulder);

  // Lower Arm Segment
  const lowerArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 1.1, 0.22),
    lightAluminumMat
  );
  lowerArm.position.set(0, 0.85, 0);
  lowerArm.castShadow = true;
  robotBase.add(lowerArm);

  // Forearm Joint (Elbow rotates around X/Z)
  const robotForearm = new THREE.Group();
  robotForearm.position.set(0, 1.4, 0);
  robotBase.add(robotForearm);

  const elbowJoint = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    darkFrameMat
  );
  robotForearm.add(elbowJoint);

  const upperArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.9, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5, roughness: 0.3 })
  );
  upperArm.position.set(0, 0.45, 0.2);
  upperArm.rotation.x = Math.PI / 4;
  robotForearm.add(upperArm);

  // Wrist & End-Effector Gripper
  const robotWrist = new THREE.Group();
  robotWrist.position.set(0, 0.8, 0.5);
  robotForearm.add(robotWrist);

  const wristPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), darkFrameMat);
  wristPlate.rotation.x = Math.PI / 2;
  robotWrist.add(wristPlate);

  // Two pneumatic gripper fingers
  const fingerGeo = new THREE.BoxGeometry(0.04, 0.25, 0.05);
  const fingerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
  const fingerLeft = new THREE.Mesh(fingerGeo, fingerMat);
  fingerLeft.position.set(-0.06, -0.14, 0.08);
  const fingerRight = new THREE.Mesh(fingerGeo, fingerMat);
  fingerRight.position.set(0.06, -0.14, 0.08);
  robotWrist.add(fingerLeft, fingerRight);

  // 5. Component Pallet Fixtures on workbench
  const fixtureGeo = new THREE.BoxGeometry(0.8, 0.12, 0.6);
  const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.4, roughness: 0.6 });
  const fixture1 = new THREE.Mesh(fixtureGeo, fixtureMat);
  fixture1.position.set(-0.9, 0.76, 0.4);
  const fixture2 = new THREE.Mesh(fixtureGeo, fixtureMat);
  fixture2.position.set(0.9, 0.76, 0.4);
  group.add(fixture1, fixture2);

  // 6. Monitor Screen
  const screenTex = createMonitorTexture('ROBOTIC ASSEMBLY', 'LINE-02', '89.1%');
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.06), screenMat);
  screenMesh.position.set(1.7, 1.6, 0.9);
  screenMesh.rotation.y = -Math.PI / 6;
  group.add(screenMesh);

  // 7. Status Light
  const indicatorLight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.8 })
  );
  indicatorLight.position.set(-1.4, 2.5, -1.0);
  group.add(indicatorLight);

  // Contact shadow
  group.add(createContactShadow(3.8, 3.0));

  return { group, robotBase, robotForearm, robotWrist, indicatorLight };
}

/**
 * Workstation 3: Cleanroom Optical Laser QA & Calibration
 * Composite 3D procedural group with oscillating laser inspection beam
 */
export function createLaserQAStation(lineCode: string): {
  group: THREE.Group;
  laserScanner: THREE.Mesh;
  laserBeam: THREE.Mesh;
  indicatorLight: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = lineCode;

  // 1. Heavy granite surface plate base (dark charcoal granite)
  const graniteGeo = new THREE.BoxGeometry(3.0, 0.5, 2.2);
  const graniteMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.3 });
  const graniteBase = new THREE.Mesh(graniteGeo, graniteMat);
  graniteBase.position.y = 0.55;
  graniteBase.castShadow = true;
  group.add(graniteBase);

  // Pneumatic vibration isolator legs
  const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16);
  const legMat = lightAluminumMat;
  [
    [-1.3, 0.25, -0.9],
    [1.3, 0.25, -0.9],
    [-1.3, 0.25, 0.9],
    [1.3, 0.25, 0.9],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  // 2. Optical test enclosure frame
  const frameGeo = new THREE.BoxGeometry(2.4, 1.5, 1.8);
  const frameMesh = new THREE.Mesh(frameGeo, lightAluminumMat);
  frameMesh.position.set(0, 1.55, 0);
  frameMesh.castShadow = true;
  group.add(frameMesh);

  // 3. Clear optical inspection glass portal
  const glassGeo = new THREE.BoxGeometry(1.8, 1.1, 0.05);
  const glassMesh = new THREE.Mesh(glassGeo, clearAcrylicMat);
  glassMesh.position.set(0, 1.55, 0.9);
  group.add(glassMesh);

  // 4. Overhead Laser Scanning Emitter Head
  const scannerGeo = new THREE.BoxGeometry(0.8, 0.25, 0.5);
  const scannerMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    metalness: 0.6,
    roughness: 0.3,
  });
  const laserScanner = new THREE.Mesh(scannerGeo, scannerMat);
  laserScanner.position.set(0, 2.1, 0);
  group.add(laserScanner);

  // 5. Volumetric Laser Light Sheet / Inspection Beam
  const beamGeo = new THREE.ConeGeometry(0.8, 1.2, 4, 1, true);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xc4b5fd,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const laserBeam = new THREE.Mesh(beamGeo, beamMat);
  laserBeam.position.set(0, 1.45, 0);
  laserBeam.rotation.x = Math.PI;
  group.add(laserBeam);

  // 6. Dual QA Diagnostic Display
  const screenTex = createMonitorTexture('OPTICAL LASER QA', 'LINE-03', '94.6%');
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.06), screenMat);
  screenMesh.position.set(1.6, 1.6, 0.9);
  screenMesh.rotation.y = -Math.PI / 6;
  group.add(screenMesh);

  // 7. Status light
  const indicatorLight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16),
    new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x8b5cf6, emissiveIntensity: 0.8 })
  );
  indicatorLight.position.set(-1.2, 2.4, -0.9);
  group.add(indicatorLight);

  // Contact shadow
  group.add(createContactShadow(3.6, 2.8));

  return { group, laserScanner, laserBeam, indicatorLight };
}

/**
 * Workstation 4: Automated Palletizing & Logistics Crating Dock
 * Composite 3D procedural group
 */
export function createPackagingDockStation(lineCode: string): {
  group: THREE.Group;
  pressHead: THREE.Mesh;
  indicatorLight: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.name = lineCode;

  // 1. Heavy duty industrial roller conveyor bed
  const rollerBedGeo = new THREE.BoxGeometry(3.8, 0.4, 1.6);
  const rollerBed = new THREE.Mesh(rollerBedGeo, conveyorBeltMat);
  rollerBed.position.set(0, 0.6, 0);
  rollerBed.castShadow = true;
  group.add(rollerBed);

  // Individual conveyor rollers
  const rollerGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.5, 12);
  const rollerMat = lightAluminumMat;
  for (let x = -1.6; x <= 1.6; x += 0.35) {
    const roller = new THREE.Mesh(rollerGeo, rollerMat);
    roller.rotation.x = Math.PI / 2;
    roller.position.set(x, 0.82, 0);
    group.add(roller);
  }

  // 2. High-Bay Packaging Portal Arch
  const portalGeo = new THREE.BoxGeometry(1.2, 2.4, 1.8);
  const portalMesh = new THREE.Mesh(portalGeo, darkFrameMat);
  portalMesh.position.set(-0.8, 1.6, 0);
  portalMesh.castShadow = true;
  group.add(portalMesh);

  // Pneumatic sealing press head
  const pressGeo = new THREE.BoxGeometry(0.7, 0.2, 0.7);
  const pressMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 });
  const pressHead = new THREE.Mesh(pressGeo, pressMat);
  pressHead.position.set(-0.8, 1.4, 0);
  group.add(pressHead);

  // 3. Wooden Euro Pallet with stacked cartons on output side
  const palletGroup = new THREE.Group();
  palletGroup.position.set(1.1, 0.85, 0);

  // Wood texture simulation
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9, metalness: 0.05 });
  const palletDeck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.1, 1.1), woodMat);
  palletGroup.add(palletDeck);

  // Stack of 4 corrugated packaging boxes
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.8, metalness: 0.05 });
  const boxGeo = new THREE.BoxGeometry(0.48, 0.4, 0.48);
  const boxCoords = [
    [-0.24, 0.25, -0.24],
    [0.24, 0.25, -0.24],
    [-0.24, 0.25, 0.24],
    [0.24, 0.25, 0.24],
    [0, 0.65, 0], // top pyramid box
  ];
  boxCoords.forEach(([bx, by, bz]) => {
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(bx, by, bz);
    box.castShadow = true;
    palletGroup.add(box);
  });
  group.add(palletGroup);

  // 4. Logistics Terminal Monitor
  const screenTex = createMonitorTexture('PACK & DISPATCH', 'LINE-04', '91.8%');
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.06), screenMat);
  screenMesh.position.set(1.9, 1.6, 0.9);
  screenMesh.rotation.y = -Math.PI / 6;
  group.add(screenMesh);

  // 5. Status Light
  const indicatorLight = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
  );
  indicatorLight.position.set(-1.4, 2.7, -0.8);
  group.add(indicatorLight);

  // Contact shadow
  group.add(createContactShadow(4.4, 2.6));

  return { group, pressHead, indicatorLight };
}

/**
 * Creates an Autonomous Guided Vehicle (AGV) with navigation beacon and payload
 */
export function createAGVVehicle(colorHex: number): {
  group: THREE.Group;
  beaconLight: THREE.Mesh;
} {
  const group = new THREE.Group();

  // Low profile chassis
  const chassisGeo = new THREE.BoxGeometry(1.4, 0.28, 0.9);
  const chassisMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.5,
    roughness: 0.35,
  });
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 0.22;
  chassis.castShadow = true;
  group.add(chassis);

  // 4 Mecanum wheels
  const wheelGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16);
  const wheelMat = darkFrameMat;
  [
    [-0.55, 0.14, -0.45],
    [0.55, 0.14, -0.45],
    [-0.55, 0.14, 0.45],
    [0.55, 0.14, 0.45],
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  // Top LiDAR puck
  const lidar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16),
    darkFrameMat
  );
  lidar.position.set(0.55, 0.4, 0);
  group.add(lidar);

  // Payload cargo box
  const cargoGeo = new THREE.BoxGeometry(0.8, 0.35, 0.6);
  const cargoMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.3,
    roughness: 0.4,
  });
  const cargo = new THREE.Mesh(cargoGeo, cargoMat);
  cargo.position.set(-0.15, 0.52, 0);
  cargo.castShadow = true;
  group.add(cargo);

  // Beacon LED
  const beaconLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
    })
  );
  beaconLight.position.set(0.55, 0.48, 0);
  group.add(beaconLight);

  // Soft contact shadow
  group.add(createContactShadow(1.8, 1.2));

  return { group, beaconLight };
}

/**
 * Creates moving product units on conveyors
 */
export function createProductUnit(colorHex: string): THREE.Mesh {
  const geo = new THREE.BoxGeometry(0.32, 0.18, 0.28);
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.6,
    roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}
