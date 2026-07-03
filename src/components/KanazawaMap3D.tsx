"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type Facility = {
  id: string;
  name: string;
  desc: string;
  labelPos?: [number, number, number];
  camTarget: [number, number, number];
  camPos: [number, number, number];
};

// 施設の構成・竣工年などは学校公式サイト等で確認できる情報に基づく。
// 配置・寸法は公開されている情報からの近似で、実測ではない。
const FACILITIES: Facility[] = [
  {
    id: "gate",
    name: "正門",
    desc: "昭和3年(1928年)に創設者・河合常治が開いた金沢中学校を前身とし、同年に現在の泉本町へ移転。校歌に「一望十里加賀平野」と歌われる学び舎の玄関口です。",
    labelPos: [150, 10, 40],
    camTarget: [142, 4, 40],
    camPos: [205, 28, 95],
  },
  {
    id: "classroom",
    name: "教室棟(新校舎)",
    desc: "令和4年(2022年)11月竣工の新校舎。開放的で明るい教室にプロジェクターとWi-Fiを完備し、ICTを活用した授業に対応しています。バリアフリーにも対応。",
    labelPos: [115, 20, 15],
    camTarget: [115, 8, 15],
    camPos: [195, 45, 90],
  },
  {
    id: "special",
    name: "特別教室棟",
    desc: "令和元年(2019年)完成。理科実験室や芸術系教室などの特別教室が入り、教室棟(新校舎)とともにバリアフリーに対応した学びの空間を形成しています。",
    labelPos: [70, 20, -25],
    camTarget: [70, 8, -25],
    camPos: [130, 50, 55],
  },
  {
    id: "courtyard",
    name: "中庭",
    desc: "教室棟と特別教室棟に面した憩いのスペース。昼休みには生徒たちが集まります(イメージ)。",
    labelPos: [70, 8, 2],
    camTarget: [70, 2, 2],
    camPos: [115, 38, 60],
  },
  {
    id: "gym1",
    name: "第一体育館",
    desc: "1階はウエイトトレーニング場。2階にはステージのほか、バスケットボールコート・バレーボールコートがあり、式典や集会にも使われます。",
    labelPos: [70, 22, -70],
    camTarget: [70, 8, -70],
    camPos: [135, 45, -5],
  },
  {
    id: "senshinkan",
    name: "洗心館(第2体育館)",
    desc: "2階にバスケットボール・バドミントン・バレーボールコートを備え、1階の屋内運動場には人工芝が敷設されています。天候を問わず体育の授業や部活動に活用されています。",
    labelPos: [0, 22, -70],
    camTarget: [0, 8, -70],
    camPos: [65, 48, -5],
  },
  {
    id: "turf",
    name: "人工芝グラウンド",
    desc: "2023年11月竣工。約5,000㎡のグラウンド全面に温度抑制・帯電抑制仕様の60mmロングパイル人工芝(カラーゴムチップ充填)を敷設。サッカー・フットサルのコートを備え、体育の授業や部活動など多目的に利用されています。",
    labelPos: [-78, 10, 20],
    camTarget: [-78, 0, 20],
    camPos: [-15, 70, 100],
  },
  {
    id: "tennis",
    name: "テニスコート",
    desc: "テニス部が活動するコート(イメージ)。",
    labelPos: [25, 8, 68],
    camTarget: [25, 0, 68],
    camPos: [75, 45, 125],
  },
  {
    id: "clubhouse",
    name: "部室棟",
    desc: "グラウンドに面して運動部の部室が並びます(イメージ)。",
    labelPos: [-18, 10, -25],
    camTarget: [-18, 3, -25],
    camPos: [40, 35, 35],
  },
  {
    id: "parking",
    name: "駐輪場",
    desc: "自転車通学の生徒のための屋根付き駐輪場(イメージ)。",
    labelPos: [112, 8, 80],
    camTarget: [112, 2, 80],
    camPos: [160, 30, 125],
  },
  {
    id: "kawakita",
    name: "川北グラウンド(校外)",
    desc: "野球部の専用球場「駒谷記念球場」(通称・川北グラウンド)は能美郡川北町にある校外施設で、2025年3月には外野の人工芝化改修が竣工しました。甲子園常連の野球部がここで練習しています。※校外のためこのマップには含まれていません。",
    camTarget: [0, 0, -5],
    camPos: [170, 155, 245],
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

export default function KanazawaMap3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const compassRef = useRef<HTMLDivElement>(null);
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
        box(5, 1.4, 3.5, mat(0xaab3bd), opts.x, h + 1.1, opts.z + opts.d * 0.2, opts.id);
        box(3, 1.1, 2.5, mat(0xaab3bd), opts.x, h + 0.95, opts.z - opts.d * 0.25, opts.id);
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

    // ==========================================================
    // 敷地: 東側に前面道路と正門、東寄りに校舎群、
    // 北側に体育館2棟、西側に人工芝グラウンド。
    // ==========================================================

    // ---------- terrain ----------
    groundPlane(480, 340, mat(0xaab89a), 0, -0.05, 0);
    // campus paving (x: -140..150, z: -105..105)
    groundPlane(290, 210, mat(0xd8d5cc), 5, 0, 0);
    // 前面道路(東側・南北方向)
    groundPlane(14, 340, mat(0x6b6f73), 165, 0.01, 0);
    for (let z = -160; z < 160; z += 14) {
      groundPlane(0.6, 6, mat(0xf2f2ea), 165, 0.02, z + 3);
    }
    // 南側の道路
    groundPlane(480, 12, mat(0x6b6f73), 0, 0.01, 118);

    // 正門からのアプローチとロータリー
    groundPlane(26, 12, mat(0xe9e4d8), 137, 0.03, 40);
    {
      const g = new THREE.CircleGeometry(8, 40);
      disposables.push(g);
      const rot = new THREE.Mesh(g, mat(0xe9e4d8));
      rot.rotation.x = -Math.PI / 2;
      rot.position.set(133, 0.035, 40);
      rot.receiveShadow = true;
      scene.add(rot);
      const g2 = new THREE.CircleGeometry(3, 32);
      disposables.push(g2);
      const green = new THREE.Mesh(g2, mat(0x5f8f55));
      green.rotation.x = -Math.PI / 2;
      green.position.set(133, 0.05, 40);
      scene.add(green);
    }

    // ---------- gate & fence ----------
    const pillarMat = mat(0x9c9488);
    box(2.4, 4.6, 2.4, pillarMat, 150, 2.3, 33, "gate");
    box(2.4, 4.6, 2.4, pillarMat, 150, 2.3, 47, "gate");
    box(1.6, 2.6, 0.4, mat(0xf5f2ea), 151.4, 2.6, 34, "gate"); // name plate
    makeLabel("金沢高等学校", 150, 8.5, 40);

    const fenceMat = mat(0x8a9099);
    const hedgeMat = mat(0x4c7a45);
    // 東側フェンス(正門の開口部あり)
    box(0.4, 1.8, 82, fenceMat, 150, 0.9, -64);
    box(0.4, 1.8, 52, fenceMat, 150, 0.9, 79);
    // 北・南・西
    box(290, 1.8, 0.4, fenceMat, 5, 0.9, -105);
    box(290, 1.8, 0.4, fenceMat, 5, 0.9, 105);
    box(0.4, 1.8, 210, fenceMat, -140, 0.9, 0);
    box(288, 1.2, 1.2, hedgeMat, 5, 0.6, 103.5);
    box(1.2, 1.2, 206, hedgeMat, -138.5, 0.6, 0);

    // ---------- buildings ----------
    // 教室棟(新校舎・2022): 東側で南北方向に伸びる
    addBuilding({ id: "classroom", x: 115, z: 15, w: 18, d: 94, floors: 4, color: 0xf5f2ea, rooftop: true });
    // 昇降口の庇
    box(6, 0.5, 14, mat(0xb8c2cc), 103, 4.1, 40, "classroom");
    box(0.8, 3.6, 12, glassMat, 105.6, 1.8, 40, "classroom");

    // 特別教室棟(2019): 教室棟の北端から西へ伸びてL字を形成
    addBuilding({ id: "special", x: 70, z: -25, w: 72, d: 16, floors: 4, color: 0xefe9dc, rooftop: true });

    // 中庭
    groundPlane(58, 22, mat(0x6f9a5e), 70, 0.03, 2, "courtyard");

    // 第一体育館: かまぼこ屋根
    box(42, 9, 30, mat(0xe3e0d8), 70, 4.5, -70, "gym1");
    {
      const bandG = new THREE.BoxGeometry(42.2, 1.4, 30.2);
      disposables.push(bandG);
      const band = new THREE.Mesh(bandG, glassMat);
      band.position.set(70, 6.6, -70);
      band.userData.facilityId = "gym1";
      pickables.push(band);
      scene.add(band);
      const shape = new THREE.Shape();
      shape.absarc(0, 0, 15, 0, Math.PI, false);
      shape.closePath();
      const roofG = new THREE.ExtrudeGeometry(shape, { depth: 42, bevelEnabled: false });
      roofG.rotateY(Math.PI / 2);
      roofG.translate(-21, 0, 0);
      disposables.push(roofG);
      const roof = new THREE.Mesh(roofG, mat(0x9fb3c8));
      roof.position.set(70, 9, -70);
      roof.castShadow = true;
      roof.receiveShadow = true;
      roof.userData.facilityId = "gym1";
      pickables.push(roof);
      scene.add(roof);
    }
    box(8, 3.2, 0.8, glassMat, 70, 1.6, -54.6, "gym1");

    // 洗心館(第2体育館): 2階建ての大型アリーナ棟
    box(56, 15, 36, mat(0xece8dd), 0, 7.5, -70, "senshinkan");
    {
      const bandG = new THREE.BoxGeometry(56.2, 1.6, 36.2);
      disposables.push(bandG);
      for (const y of [3.2, 11.5]) {
        const band = new THREE.Mesh(bandG, glassMat);
        band.position.set(0, y, -70);
        band.userData.facilityId = "senshinkan";
        pickables.push(band);
        scene.add(band);
      }
    }
    box(57.5, 0.6, 37.5, mat(0x8d99a6), 0, 15.3, -70, "senshinkan");
    box(10, 3.4, 0.8, glassMat, 0, 1.7, -51.6, "senshinkan");

    // 部室棟(グラウンド東縁・南北方向)
    addBuilding({ id: "clubhouse", x: -18, z: -25, w: 10, d: 44, floors: 2, color: 0xdcd6c8 });

    // テニスコート(南側)
    {
      const tex = canvasTexture(512, 512, drawTennis);
      disposables.push(tex);
      groundPlane(36, 32, mat(0xffffff, { map: tex }), 25, 0.03, 68, "tennis");
    }

    // 駐輪場(正門の南、教室棟の南端付近)
    {
      const postG = new THREE.CylinderGeometry(0.18, 0.18, 2.6, 8);
      disposables.push(postG);
      const postMat = mat(0x7d848c);
      for (const px of [-13, 0, 13]) {
        for (const pz of [-3.5, 3.5]) {
          const p = new THREE.Mesh(postG, postMat);
          p.position.set(112 + px, 1.3, 80 + pz);
          p.castShadow = true;
          scene.add(p);
        }
      }
      box(32, 0.35, 10, mat(0x98a2ad), 112, 2.75, 80, "parking");
      groundPlane(32, 10, mat(0xc4c1b8), 112, 0.02, 80, "parking");
    }

    // 人工芝グラウンド(西側 約100m×60m ≒ 5,000㎡強)
    {
      const tex = canvasTexture(1024, 512, drawTurf);
      disposables.push(tex);
      groundPlane(102, 62, mat(0xffffff, { map: tex }), -80, 0.04, 20, "turf");
      // 防球ネットの支柱
      const poleG = new THREE.CylinderGeometry(0.2, 0.25, 12, 8);
      disposables.push(poleG);
      const poleMat = mat(0x5e6670);
      for (let x = -131; x <= -29; x += 25.5) {
        for (const z of [-11, 51]) {
          const p = new THREE.Mesh(poleG, poleMat);
          p.position.set(x, 6, z);
          p.castShadow = true;
          scene.add(p);
        }
      }
      const netMat = mat(0x3a4a3f, { transparent: true, opacity: 0.28 });
      box(102, 10, 0.15, netMat, -80, 6, -11).castShadow = false;
      box(102, 10, 0.15, netMat, -80, 6, 51).castShadow = false;
    }

    // 旗ポール
    {
      const g = new THREE.CylinderGeometry(0.14, 0.18, 13, 8);
      disposables.push(g);
      const pole = new THREE.Mesh(g, mat(0xe8e8e8));
      pole.position.set(133, 6.5, 30);
      pole.castShadow = true;
      scene.add(pole);
      box(2.6, 1.6, 0.1, mat(0x7a1f2b), 133, 11.6, 28.6);
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
      for (let x = -125; x <= 135; x += 28) addTree(x, 99, 1 + ((x % 3) + 1) * 0.07);
      for (let z = -95; z <= -20; z += 24) addTree(-134, z, 1.05);
      for (let z = 60; z <= 95; z += 17) addTree(144, z, 0.9);
      for (const x of [50, 62, 78, 90]) addTree(x, 2, 0.6); // courtyard
      for (const z of [55, 68, 81]) addTree(93, z, 0.85);
    }

    // ---------- labels ----------
    for (const f of FACILITIES) {
      if (!f.labelPos || f.id === "gate") continue;
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
      // 北(-z)を指すコンパス
      if (compassRef.current) {
        const az = Math.atan2(
          camera.position.x - controls.target.x,
          camera.position.z - controls.target.z
        );
        compassRef.current.style.transform = `rotate(${az * (180 / Math.PI)}deg)`;
      }
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
            施設の構成・竣工年は公式情報等に基づきます。配置・形状はそれを基にした近似再現で、実測の縮尺ではありません。建物や地面をクリックすると説明が表示されます。
          </p>
        </div>
      </div>

      {/* facility list */}
      <div className="absolute right-4 top-4 flex max-h-[62dvh] w-52 flex-col">
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

      {/* compass */}
      <div className="absolute bottom-24 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur">
        <div ref={compassRef} className="flex flex-col items-center leading-none">
          <span className="text-base font-bold text-[#c0392b]">▲</span>
          <span className="text-[10px] font-bold text-gray-600">N</span>
        </div>
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
