"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type Facility = {
  id: string;
  name: string;
  desc: string;
  labelPos: [number, number, number];
  camTarget: [number, number, number];
  camPos: [number, number, number];
};

const FACILITIES: Facility[] = [
  {
    id: "gate",
    name: "正門",
    desc: "昭和3年(1928年)に創設者・河合常治が開いた金沢中学校を前身とし、同年に現在の泉本町へ移転。校歌に「一望十里加賀平野」と歌われる学び舎の玄関口です(イメージ)。",
    labelPos: [0, 10, 116],
    camTarget: [0, 4, 108],
    camPos: [28, 26, 168],
  },
  {
    id: "honkan",
    name: "本館(新校舎)",
    desc: "近年竣工した明るく開放的な新校舎。各教室にプロジェクターとWi-Fiを完備し、1階に職員室・事務室、上層階に普通教室が並びます(イメージ)。",
    labelPos: [0, 26, 62],
    camTarget: [0, 10, 62],
    camPos: [55, 55, 150],
  },
  {
    id: "special",
    name: "特別教室棟",
    desc: "理科実験室・音楽室・美術室・図書室などの特別教室が入る棟。本館とは2本の渡り廊下でつながっています(イメージ)。",
    labelPos: [0, 21, 24],
    camTarget: [0, 8, 24],
    camPos: [70, 55, 110],
  },
  {
    id: "courtyard",
    name: "中庭",
    desc: "本館と特別教室棟に挟まれた憩いのスペース。昼休みには生徒たちが集まります(イメージ)。",
    labelPos: [0, 8, 43],
    camTarget: [0, 2, 43],
    camPos: [45, 40, 95],
  },
  {
    id: "gym",
    name: "体育館",
    desc: "全校集会や式典のほか、バスケットボール部・バレーボール部などの活動拠点(イメージ)。",
    labelPos: [-118, 26, 55],
    camTarget: [-118, 10, 55],
    camPos: [-55, 45, 130],
  },
  {
    id: "budokan",
    name: "武道場",
    desc: "柔道・剣道の授業や武道系部活動で使用する道場(イメージ)。",
    labelPos: [-118, 15, 0],
    camTarget: [-118, 5, 0],
    camPos: [-60, 40, 60],
  },
  {
    id: "clubhouse",
    name: "部室棟",
    desc: "グラウンドに面して運動部の部室が並びます(イメージ)。",
    labelPos: [-118, 12, -32],
    camTarget: [-118, 4, -32],
    camPos: [-65, 35, 25],
  },
  {
    id: "cafeteria",
    name: "食堂・売店",
    desc: "昼休みに賑わう学生食堂と売店(イメージ)。",
    labelPos: [118, 14, 62],
    camTarget: [118, 5, 62],
    camPos: [70, 40, 125],
  },
  {
    id: "tennis",
    name: "テニスコート",
    desc: "テニス部が活動する2面のコート(イメージ)。",
    labelPos: [118, 8, 12],
    camTarget: [118, 0, 12],
    camPos: [75, 50, 70],
  },
  {
    id: "parking",
    name: "駐輪場",
    desc: "自転車通学の生徒のための屋根付き駐輪場(イメージ)。",
    labelPos: [118, 8, -20],
    camTarget: [118, 2, -20],
    camPos: [80, 30, 25],
  },
  {
    id: "turf",
    name: "人工芝グラウンド",
    desc: "面積約5,000㎡の全天候型人工芝グラウンド。サッカー・フットサルのコートを備え、体育の授業や部活動など多目的に利用されています。",
    labelPos: [-45, 10, -78],
    camTarget: [-45, 0, -78],
    camPos: [-15, 75, 30],
  },
  {
    id: "baseball",
    name: "野球練習場",
    desc: "甲子園常連として知られる野球部の練習エリア。女子ソフトボール部も全国大会の常連です(イメージ)。",
    labelPos: [115, 10, -78],
    camTarget: [115, 0, -78],
    camPos: [55, 70, -5],
  },
];

const DEFAULT_CAM_POS = new THREE.Vector3(170, 155, 245);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, -5);

type MapApi = {
  flyTo: (camPos: THREE.Vector3, target: THREE.Vector3) => void;
  setAutoRotate: (v: boolean) => void;
};

function canvasTexture(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function drawTurf(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (let x = 0; x < w; x += 64) {
    ctx.fillStyle = (x / 64) % 2 === 0 ? "#4a8c46" : "#539b4e";
    ctx.fillRect(x, 0, 64, h);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 5;
  const mx = 70;
  const my = 50;
  ctx.strokeRect(mx, my, w - mx * 2, h - my * 2);
  ctx.beginPath();
  ctx.moveTo(w / 2, my);
  ctx.lineTo(w / 2, h - my);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
  // penalty areas
  const paW = 110;
  const paH = 220;
  ctx.strokeRect(mx, (h - paH) / 2, paW, paH);
  ctx.strokeRect(w - mx - paW, (h - paH) / 2, paW, paH);
}

function drawTennis(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#3f6b4f";
  ctx.fillRect(0, 0, w, h);
  const drawCourt = (cx: number) => {
    const cw = 170;
    const ch = 380;
    const x = cx - cw / 2;
    const y = (h - ch) / 2;
    ctx.fillStyle = "#4f8a63";
    ctx.fillRect(x - 20, y - 30, cw + 40, ch + 60);
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, cw, ch);
    // singles lines
    ctx.beginPath();
    ctx.moveTo(x + 24, y);
    ctx.lineTo(x + 24, y + ch);
    ctx.moveTo(x + cw - 24, y);
    ctx.lineTo(x + cw - 24, y + ch);
    // net line
    ctx.moveTo(x - 10, y + ch / 2);
    ctx.lineTo(x + cw + 10, y + ch / 2);
    // service lines
    ctx.moveTo(x + 24, y + ch / 2 - 90);
    ctx.lineTo(x + cw - 24, y + ch / 2 - 90);
    ctx.moveTo(x + 24, y + ch / 2 + 90);
    ctx.lineTo(x + cw - 24, y + ch / 2 + 90);
    ctx.moveTo(cx, y + ch / 2 - 90);
    ctx.lineTo(cx, y + ch / 2 + 90);
    ctx.stroke();
  };
  drawCourt(w * 0.27);
  drawCourt(w * 0.73);
}

function drawBaseball(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#55814f";
  ctx.fillRect(0, 0, w, h);
  const hx = 80;
  const hy = h - 80;
  // dirt fan from home plate toward north-east
  ctx.fillStyle = "#b98a5a";
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.arc(hx, hy, 330, -Math.PI / 2, 0);
  ctx.closePath();
  ctx.fill();
  // grass infield
  ctx.fillStyle = "#5d8f55";
  ctx.beginPath();
  ctx.moveTo(hx + 40, hy - 40);
  ctx.lineTo(hx + 200, hy - 40);
  ctx.lineTo(hx + 200, hy - 200);
  ctx.lineTo(hx + 40, hy - 200);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 5;
  // foul lines
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + 340, hy);
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx, hy - 340);
  ctx.stroke();
  // base path diamond
  ctx.strokeRect(hx + 20, hy - 240, 220, 220);
  const base = (x: number, y: number) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - 9, y - 9, 18, 18);
  };
  base(hx + 240, hy - 20); // 1st
  base(hx + 240, hy - 240); // 2nd
  base(hx + 20, hy - 240); // 3rd
  base(hx + 20, hy - 20); // home
  // pitcher circle
  ctx.fillStyle = "#c69a68";
  ctx.beginPath();
  ctx.arc(hx + 130, hy - 130, 26, 0, Math.PI * 2);
  ctx.fill();
}

export default function KanazawaMap3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<MapApi | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [listOpen, setListOpen] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfe6f3);
    scene.fog = new THREE.Fog(0xcfe6f3, 450, 900);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.5,
      1200
    );
    camera.position.copy(DEFAULT_CAM_POS);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(DEFAULT_TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 25;
    controls.maxDistance = 520;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.autoRotateSpeed = 0.8;

    // ---------- lights ----------
    scene.add(new THREE.HemisphereLight(0xbfd9ea, 0x8f9779, 0.75));
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.2);
    sun.position.set(140, 200, 90);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -240;
    sun.shadow.camera.right = 240;
    sun.shadow.camera.top = 200;
    sun.shadow.camera.bottom = -200;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 620;
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    // ---------- helpers ----------
    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const pickables: THREE.Object3D[] = [];

    const mat = (color: number | string, opts: THREE.MeshLambertMaterialParameters = {}) => {
      const m = new THREE.MeshLambertMaterial({ color, ...opts });
      disposables.push(m);
      return m;
    };

    const box = (
      w: number,
      h: number,
      d: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      pickId?: string
    ) => {
      const g = new THREE.BoxGeometry(w, h, d);
      disposables.push(g);
      const mesh = new THREE.Mesh(g, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (pickId) {
        mesh.userData.facilityId = pickId;
        pickables.push(mesh);
      }
      scene.add(mesh);
      return mesh;
    };

    const groundPlane = (
      w: number,
      d: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      pickId?: string
    ) => {
      const g = new THREE.PlaneGeometry(w, d);
      disposables.push(g);
      const mesh = new THREE.Mesh(g, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      if (pickId) {
        mesh.userData.facilityId = pickId;
        pickables.push(mesh);
      }
      scene.add(mesh);
      return mesh;
    };

    const glassMat = new THREE.MeshPhongMaterial({ color: 0x6f9ec4, shininess: 90 });
    disposables.push(glassMat);

    const addBuilding = (opts: {
      id: string;
      x: number;
      z: number;
      w: number;
      d: number;
      floors: number;
      color: number | string;
      roofColor?: number | string;
      rooftop?: boolean;
    }) => {
      const floorH = 3.7;
      const h = opts.floors * floorH;
      const wallMat = mat(opts.color);
      box(opts.w, h, opts.d, wallMat, opts.x, h / 2, opts.z, opts.id);
      for (let f = 0; f < opts.floors; f++) {
        const band = box(
          opts.w + 0.16,
          1.5,
          opts.d + 0.16,
          glassMat,
          opts.x,
          f * floorH + 2.3,
          opts.z,
          opts.id
        );
        band.castShadow = false;
      }
      box(
        opts.w + 0.7,
        0.4,
        opts.d + 0.7,
        mat(opts.roofColor ?? 0xbcc3cb),
        opts.x,
        h + 0.2,
        opts.z,
        opts.id
      );
      if (opts.rooftop) {
        box(5, 1.4, 3.5, mat(0xaab3bd), opts.x + opts.w * 0.3, h + 1.1, opts.z, opts.id);
        box(3, 1.1, 2.5, mat(0xaab3bd), opts.x - opts.w * 0.32, h + 0.95, opts.z, opts.id);
      }
    };

    const makeLabel = (text: string, x: number, y: number, z: number) => {
      const pad = 26;
      const fontPx = 46;
      const measure = document.createElement("canvas").getContext("2d")!;
      measure.font = `600 ${fontPx}px 'Hiragino Sans', 'Noto Sans JP', sans-serif`;
      const tw = measure.measureText(text).width;
      const cw = Math.ceil(tw + pad * 2);
      const ch = 78;
      const tex = canvasTexture(cw, ch, (ctx) => {
        ctx.fillStyle = "rgba(255,255,255,0.93)";
        ctx.strokeStyle = "rgba(60,60,70,0.35)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(2, 2, cw - 4, ch - 4, 16);
        ctx.fill();
        ctx.stroke();
        ctx.font = `600 ${fontPx}px 'Hiragino Sans', 'Noto Sans JP', sans-serif`;
        ctx.fillStyle = "#7a1f2b";
        ctx.textBaseline = "middle";
        ctx.fillText(text, pad, ch / 2 + 2);
      });
      disposables.push(tex);
      const sm = new THREE.SpriteMaterial({ map: tex, depthTest: false });
      disposables.push(sm);
      const sprite = new THREE.Sprite(sm);
      sprite.renderOrder = 999;
      const sh = 4.6;
      sprite.scale.set((sh * cw) / ch, sh, 1);
      sprite.position.set(x, y, z);
      scene.add(sprite);
    };

    // ---------- terrain ----------
    groundPlane(460, 340, mat(0xaab89a), 0, -0.05, 0);
    // campus paving
    groundPlane(340, 250, mat(0xd8d5cc), 0, 0, 0);
    // street along the south side
    groundPlane(460, 14, mat(0x6b6f73), 0, 0.01, 133);
    for (let x = -220; x < 220; x += 14) {
      groundPlane(6, 0.6, mat(0xf2f2ea), x + 3, 0.02, 133);
    }

    // approach path and rotary
    groundPlane(14, 34, mat(0xe9e4d8), 0, 0.03, 100);
    {
      const g = new THREE.CircleGeometry(9, 40);
      disposables.push(g);
      const rot = new THREE.Mesh(g, mat(0xe9e4d8));
      rot.rotation.x = -Math.PI / 2;
      rot.position.set(0, 0.035, 92);
      rot.receiveShadow = true;
      scene.add(rot);
      const g2 = new THREE.CircleGeometry(3.4, 32);
      disposables.push(g2);
      const green = new THREE.Mesh(g2, mat(0x5f8f55));
      green.rotation.x = -Math.PI / 2;
      green.position.set(0, 0.05, 92);
      scene.add(green);
    }

    // ---------- gate & fence ----------
    const pillarMat = mat(0x9c9488);
    box(2.4, 4.6, 2.4, pillarMat, -8, 2.3, 116, "gate");
    box(2.4, 4.6, 2.4, pillarMat, 8, 2.3, 116, "gate");
    box(0.4, 2.6, 1.6, mat(0xf5f2ea), -8, 2.6, 114.6, "gate"); // name plate
    // school name over the gate
    makeLabel("金沢高等学校", 0, 8.5, 116);

    const fenceMat = mat(0x8a9099);
    const hedgeMat = mat(0x4c7a45);
    // south fence (with gate gap)
    box(150, 1.8, 0.4, fenceMat, -86, 0.9, 122);
    box(150, 1.8, 0.4, fenceMat, 86, 0.9, 122);
    box(148, 1.2, 1.2, hedgeMat, -86, 0.6, 120.6);
    box(148, 1.2, 1.2, hedgeMat, 86, 0.6, 120.6);
    // north / west / east fences
    box(340, 1.8, 0.4, fenceMat, 0, 0.9, -122);
    box(0.4, 1.8, 244, fenceMat, -170, 0.9, 0);
    box(0.4, 1.8, 244, fenceMat, 170, 0.9, 0);

    // ---------- buildings ----------
    addBuilding({ id: "honkan", x: 0, z: 62, w: 104, d: 18, floors: 5, color: 0xf5f2ea, rooftop: true });
    // entrance canopy
    box(16, 0.5, 6, mat(0xb8c2cc), 0, 4.1, 74, "honkan");
    box(13, 3.6, 0.8, glassMat, 0, 1.8, 71.4, "honkan");

    addBuilding({ id: "special", x: 0, z: 24, w: 84, d: 16, floors: 4, color: 0xefe9dc, rooftop: true });
    // connecting corridors
    addBuilding({ id: "special", x: -30, z: 43, w: 6, d: 20, floors: 2, color: 0xe6e0d4 });
    addBuilding({ id: "special", x: 30, z: 43, w: 6, d: 20, floors: 2, color: 0xe6e0d4 });

    // courtyard
    groundPlane(44, 16, mat(0x6f9a5e), 0, 0.03, 43, "courtyard");

    // gymnasium: walls + vaulted roof
    box(46, 9, 60, mat(0xe3e0d8), -118, 4.5, 55, "gym");
    {
      const bandG = new THREE.BoxGeometry(46.2, 1.4, 60.2);
      disposables.push(bandG);
      const band = new THREE.Mesh(bandG, glassMat);
      band.position.set(-118, 6.6, 55);
      band.userData.facilityId = "gym";
      pickables.push(band);
      scene.add(band);
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 23, 0, Math.PI, false);
      shape.closePath();
      const roofG = new THREE.ExtrudeGeometry(shape, { depth: 60, bevelEnabled: false });
      roofG.translate(0, 0, -30);
      disposables.push(roofG);
      const roof = new THREE.Mesh(roofG, mat(0x9fb3c8));
      roof.position.set(-118, 9, 55);
      roof.castShadow = true;
      roof.receiveShadow = true;
      roof.userData.facilityId = "gym";
      pickables.push(roof);
      scene.add(roof);
    }
    box(8, 3.2, 0.8, glassMat, -118, 1.6, 85.4, "gym"); // gym entrance

    // budokan (martial arts hall) with dark pitched-style roof
    box(36, 7, 24, mat(0xece6d8), -118, 3.5, 0, "budokan");
    box(38, 0.9, 26, mat(0x4a4f57), -118, 7.45, 0, "budokan");
    box(38, 0.8, 14, mat(0x4a4f57), -118, 8.2, 0, "budokan");

    addBuilding({ id: "clubhouse", x: -118, z: -32, w: 40, d: 10, floors: 2, color: 0xdcd6c8 });
    addBuilding({ id: "cafeteria", x: 118, z: 62, w: 28, d: 18, floors: 2, color: 0xf0ebdf });

    // tennis courts
    {
      const tex = canvasTexture(512, 512, drawTennis);
      disposables.push(tex);
      groundPlane(36, 34, mat(0xffffff, { map: tex }), 118, 0.03, 12, "tennis");
    }

    // bicycle parking: posts + roof slab
    {
      const postG = new THREE.CylinderGeometry(0.18, 0.18, 2.6, 8);
      disposables.push(postG);
      const postMat = mat(0x7d848c);
      for (const px of [-16, 0, 16]) {
        for (const pz of [-4, 4]) {
          const p = new THREE.Mesh(postG, postMat);
          p.position.set(118 + px, 1.3, -20 + pz);
          p.castShadow = true;
          scene.add(p);
        }
      }
      box(38, 0.35, 11, mat(0x98a2ad), 118, 2.75, -20, "parking");
      groundPlane(38, 11, mat(0xc4c1b8), 118, 0.02, -20, "parking");
    }

    // artificial turf ground
    {
      const tex = canvasTexture(1024, 512, drawTurf);
      disposables.push(tex);
      groundPlane(150, 80, mat(0xffffff, { map: tex }), -45, 0.04, -78, "turf");
    }

    // baseball practice field
    {
      const tex = canvasTexture(512, 512, drawBaseball);
      disposables.push(tex);
      groundPlane(90, 80, mat(0xffffff, { map: tex }), 115, 0.04, -78, "baseball");
      // backstop behind home plate (south-west corner of the field)
      const net = mat(0x2f4f3a, { transparent: true, opacity: 0.85 });
      const wall = box(18, 8, 0.5, net, 80, 4, -46, "baseball");
      wall.rotation.y = -Math.PI / 4;
      wall.castShadow = false;
    }

    // flag pole
    {
      const g = new THREE.CylinderGeometry(0.14, 0.18, 13, 8);
      disposables.push(g);
      const pole = new THREE.Mesh(g, mat(0xe8e8e8));
      pole.position.set(14, 6.5, 92);
      pole.castShadow = true;
      scene.add(pole);
      box(2.6, 1.6, 0.1, mat(0x7a1f2b), 15.4, 11.6, 92);
    }

    // ---------- trees ----------
    {
      const trunkG = new THREE.CylinderGeometry(0.35, 0.5, 3, 7);
      const leafG = new THREE.SphereGeometry(2.4, 10, 8);
      disposables.push(trunkG, leafG);
      const trunkM = mat(0x7a5a3a);
      const leafM = mat(0x4c7a45);
      const leafM2 = mat(0x5c8a50);
      const addTree = (x: number, z: number, s = 1) => {
        const t = new THREE.Mesh(trunkG, trunkM);
        t.position.set(x, 1.5 * s, z);
        t.scale.setScalar(s);
        t.castShadow = true;
        scene.add(t);
        const l1 = new THREE.Mesh(leafG, leafM);
        l1.position.set(x, 4.2 * s, z);
        l1.scale.setScalar(s);
        l1.castShadow = true;
        scene.add(l1);
        const l2 = new THREE.Mesh(leafG, leafM2);
        l2.position.set(x + 1.2 * s, 3.4 * s, z + 0.7 * s);
        l2.scale.setScalar(0.7 * s);
        l2.castShadow = true;
        scene.add(l2);
      };
      for (let z = -100; z <= 100; z += 26) addTree(-163, z, 1 + ((z % 3) + 1) * 0.08);
      for (let z = 40; z <= 110; z += 24) addTree(163, z, 1.05);
      for (const x of [-60, -35, 35, 60]) addTree(x, 114, 0.95);
      for (const x of [-16, -6, 6, 16]) addTree(x, 43, 0.65); // courtyard
      for (let x = 30; x <= 150; x += 30) addTree(x, -118, 1.1);
    }

    // ---------- labels ----------
    for (const f of FACILITIES) {
      if (f.id === "gate") continue; // gate already has the school name plate
      makeLabel(f.name, ...f.labelPos);
    }

    // ---------- interaction ----------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      const id = hits[0]?.object.userData.facilityId as string | undefined;
      setSelectedId(id ?? null);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // camera fly-to animation
    const fly = {
      active: false,
      camPos: new THREE.Vector3(),
      target: new THREE.Vector3(),
    };
    apiRef.current = {
      flyTo: (camPos, target) => {
        fly.active = true;
        fly.camPos.copy(camPos);
        fly.target.copy(target);
      },
      setAutoRotate: (v) => {
        controls.autoRotate = v;
      },
    };
    const onControlStart = () => {
      fly.active = false;
    };
    controls.addEventListener("start", onControlStart);

    // ---------- resize & loop ----------
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (fly.active) {
        camera.position.lerp(fly.camPos, 0.08);
        controls.target.lerp(fly.target, 0.08);
        if (
          camera.position.distanceTo(fly.camPos) < 0.4 &&
          controls.target.distanceTo(fly.target) < 0.4
        ) {
          fly.active = false;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.removeEventListener("start", onControlStart);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      for (const d of disposables) d.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
      apiRef.current = null;
    };
  }, []);

  useEffect(() => {
    apiRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  const selected = FACILITIES.find((f) => f.id === selectedId) ?? null;

  const focusFacility = (f: Facility) => {
    setSelectedId(f.id);
    apiRef.current?.flyTo(
      new THREE.Vector3(...f.camPos),
      new THREE.Vector3(...f.camTarget)
    );
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-sky-100">
      <div ref={containerRef} className="absolute inset-0" />

      {/* header */}
      <div className="pointer-events-none absolute left-4 top-4 max-w-[min(22rem,calc(100%-2rem))]">
        <div className="pointer-events-auto rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur">
          <h1 className="text-lg font-bold text-[#7a1f2b]">
            金沢高等学校 3Dキャンパスマップ
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            石川県金沢市泉本町3-111(私立)
            <br />
            ※実際の配置・形状を簡略化したイメージ再現です。建物や地面をクリックすると施設の説明が表示されます。
          </p>
        </div>
      </div>

      {/* facility list */}
      <div className="absolute right-4 top-4 flex max-h-[60dvh] w-44 flex-col">
        <button
          onClick={() => setListOpen((v) => !v)}
          className="rounded-xl bg-[#7a1f2b] px-3 py-2 text-sm font-semibold text-white shadow-lg"
        >
          施設一覧 {listOpen ? "▲" : "▼"}
        </button>
        {listOpen && (
          <div className="mt-2 flex flex-col gap-1 overflow-y-auto rounded-xl bg-white/90 p-2 shadow-lg backdrop-blur">
            {FACILITIES.map((f) => (
              <button
                key={f.id}
                onClick={() => focusFacility(f)}
                className={`rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                  selectedId === f.id
                    ? "bg-[#7a1f2b] text-white"
                    : "text-gray-700 hover:bg-rose-50"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* controls */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="rounded-xl bg-white/85 px-3 py-2 text-[11px] leading-relaxed text-gray-600 shadow backdrop-blur">
          ドラッグ: 回転 / ホイール: ズーム / 右ドラッグ: 移動
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              apiRef.current?.flyTo(DEFAULT_CAM_POS.clone(), DEFAULT_TARGET.clone())
            }
            className="rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-gray-700 shadow hover:bg-white"
          >
            視点リセット
          </button>
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className={`rounded-xl px-3 py-2 text-sm font-medium shadow ${
              autoRotate
                ? "bg-[#7a1f2b] text-white"
                : "bg-white/90 text-gray-700 hover:bg-white"
            }`}
          >
            自動回転 {autoRotate ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* facility info */}
      {selected && (
        <div className="absolute bottom-4 left-1/2 w-[min(30rem,calc(100%-2rem))] -translate-x-1/2">
          <div className="rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-bold text-[#7a1f2b]">{selected.name}</h2>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="閉じる"
                className="rounded-full px-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-700">{selected.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
