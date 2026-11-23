'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import './agentic-factory-3d.css'

/**
 * Interactive three.js portfolio scene.
 *
 * Renders the five portfolio stations and provides camera, playback, and
 * guided-tour controls. Parent components can listen for station selection
 * and start the guided tour through the callbacks below.
 */

export type AgenticFactory3DProps = {
  /** Height of the scene box, e.g. 720 or '100vh'. Default '100vh'. */
  height?: number | string
  className?: string
  language?: 'en' | 'mn'
  /** Clean hero mode: no panels, the machine on the right of a wide frame. */
  embed?: boolean
  /** A station was clicked: 'engine' | 'admin' | 'storefront' | 'cabinet' | 'cashdesk'. */
  onStation?: (id: StationId) => void
  onTourStart?: () => void
  /** The first real frame is drawn. */
  onReady?: () => void
}

export default function AgenticFactory3D({
  height = '100vh',
  className,
  embed = false,
  language = 'en',
  onStation,
  onTourStart,
  onReady,
}: AgenticFactory3DProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const handlers = useRef({ onStation, onTourStart, onReady })
  useEffect(() => {
    handlers.current = { onStation, onTourStart, onReady }
  }, [onStation, onTourStart, onReady])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let dispose: (() => void) | undefined
    let cancelled = false
    // The in-scene screens are painted on canvases: wait for fonts first.
    document.fonts.ready.then(() => {
      if (cancelled) return
      dispose = initMachineScene(root, getComputedStyle(root).fontFamily, {
        embedded: embed,
        language,
        onStation: (id) => handlers.current.onStation?.(id),
        onTourStart: () => handlers.current.onTourStart?.(),
        onReady: () => handlers.current.onReady?.(),
      })
    })
    return () => {
      cancelled = true
      dispose?.()
    }
  }, [embed, language])

  return (
    <div
      ref={rootRef}
      className={['agentic-factory-3d', embed && 'embed', className].filter(Boolean).join(' ')}
      style={{ height }}
    >
      <div
        id="scene"
        role="img"
        aria-label={language === 'mn' ? 'Интерактив 3D портфолио: Танилцуулга, Миний тухай, Ур чадвар, Бүтээлүүд, Холбоо барих. Эргүүлж, томруулан сонирхоорой.' : 'Interactive 3D portfolio: Introduction, About me, Skills, Projects and Contact. Drag to rotate, scroll or pinch to zoom. Hover or tap a station to explore.'}
      />
      <div className="vignette" />
      <header className="topbar debug-ui">
        <div className="identity">
          <div className="mark">
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
              <path
                d="M3 5l7 11 7-11M7 5l3 5 3-5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <strong>{language === 'mn' ? 'Оюугийн портфолио' : "Oyu's Portfolio"}</strong>
            <small>{language === 'mn' ? 'Интерактив портфолио' : 'Interactive portfolio'}</small>
          </div>
        </div>
        <nav className="portfolio-nav" aria-label={language === 'mn' ? 'Портфолионы хэсгүүд' : 'Portfolio sections'}>
          <a href="#home">{language === 'mn' ? 'Танилцуулга' : 'Introduction'}</a>
          <a href="#about">{language === 'mn' ? 'Миний тухай' : 'About me'}</a>
          <a href="#skills">{language === 'mn' ? 'Ур чадвар' : 'Skills'}</a>
          <a href="#work">{language === 'mn' ? 'Бүтээлүүд' : 'Projects'}</a>
          <a href="#contact">{language === 'mn' ? 'Холбоо барих' : 'Contact'}</a>
          <a className="cv-download" href={language === 'mn' ? '/Oyu_Portfolio_Mongolian.pdf' : '/Oyu_Portfolio_English.pdf'} download>{language === 'mn' ? 'Товч намтар татах' : 'Download CV'}</a>
        </nav>
      </header>
      <div className="scene-heading debug-ui">
        <span className="index">5 {language === 'mn' ? 'ХЭСЭГ' : 'STATIONS'} / 1 {language === 'mn' ? 'ПОРТФОЛИО' : 'PORTFOLIO'}</span>
      </div>
      <div id="journey" className="debug-ui">
        <div className="journey-icon">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M3 4h10v9H3zM6 4V2h4v2m-5 4h6" stroke="currentColor" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <strong id="journey-title">{language === 'mn' ? 'Танилцуулга' : 'Introduction'}</strong>
          <small id="journey-detail">{language === 'mn' ? 'Миний тухай товч танилцуулга' : 'A little about me and my portfolio'}</small>
        </div>
        <div className="track">
          <i id="journey-progress" />
        </div>
      </div>
      <div id="labels" />
      <div id="tooltip" role="tooltip">
        <strong />
        <p />
      </div>
      <div className="controls debug-ui">
        <nav className="mode-bar" aria-label={language === 'mn' ? 'Танилцуулгын тохиргоо' : 'Portfolio controls'}>
          <button data-mode="stations" aria-pressed="true">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5l6 3-6 3-6-3 6-3zM2 8l6 3 6-3M2 11.5l6 3 6-3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {language === 'mn' ? 'Хэсгүүд' : 'Sections'}
          </button>
          <button type="button" data-tour-start>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M5 2.5l8 5.5-8 5.5v-11z" stroke="currentColor" strokeLinejoin="round" />
            </svg>
            {language === 'mn' ? 'Танилцуулга үзэх' : 'Start the tour'}
          </button>
        </nav>
        <nav className="camera-row" aria-label={language === 'mn' ? 'Камерын харагдац' : 'Camera'}>
          <button data-camera="overview" aria-pressed="true">
            {language === 'mn' ? 'Ерөнхий' : 'Overview'}
          </button>
          <button data-camera="side" aria-pressed="false">
            {language === 'mn' ? 'Хажуу' : 'Side'}
          </button>
          <button data-camera="top" aria-pressed="false">
            {language === 'mn' ? 'Дээрээс' : 'Top'}
          </button>
          <button data-camera="station" aria-pressed="false">
            {language === 'mn' ? 'Хэсэг' : 'Station'}
          </button>
          <span className="divider" />
          <button id="play" aria-label={language === 'mn' ? 'Хөдөлгөөнийг түр зогсоох' : 'Pause the animation'} aria-pressed="false">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <rect x="2" y="1" width="2.5" height="10" rx=".5" />
              <rect x="7.5" y="1" width="2.5" height="10" rx=".5" />
            </svg>
          </button>
        </nav>
      </div>
      <footer className="footer">
        <span className="hint debug-ui">
          <svg width="13" height="16" viewBox="0 0 13 16" fill="none">
            <rect x="2" y="1" width="9" height="14" rx="4.5" stroke="currentColor" />
            <path d="M6.5 4v3" stroke="currentColor" strokeLinecap="round" />
          </svg>
          {language === 'mn' ? 'Эргүүлж, томруулж, сонирхоорой.' : 'Rotate. Zoom. Explore.'}
        </span>
      </footer>
      <div id="loading">
        <i />
        <span>{language === 'mn' ? 'Портфолиог ачаалж байна' : 'Assembling your machine'}</span>
      </div>
      <div id="error" role="alert">
        <strong>{language === 'mn' ? '3D дүрслэлийг эхлүүлж чадсангүй' : 'Could not start the 3D scene'}</strong>
        <p>{language === 'mn' ? 'Хөтөч дээр WebGL асаалттай эсэхийг шалгана уу.' : 'Check that WebGL is turned on in your browser.'}</p>
        <button onClick={() => location.reload()}>{language === 'mn' ? 'Дахин оролдох' : 'Try again'}</button>
      </div>
    </div>
  )
}

// Three.js scene types and browser-facing controls.

export type MachineMode = 'assembled' | 'cutaway' | 'stations' | 'order'
export type MachineCamera = 'overview' | 'side' | 'top' | 'station' | 'flight'
export type StationId = 'engine' | 'admin' | 'storefront' | 'cabinet' | 'cashdesk'

export type MachineApi = {
  setMode: (name: string) => boolean
  focusStation: (id: string) => boolean
  travelToStation: (id: string) => boolean
  setCamera: (name: string) => boolean
  play: () => boolean
  pause: () => boolean
}

declare global {
  interface Window {
    __machine?: MachineApi
    __machineDebug?: { getState: () => Record<string, unknown> }
  }
}

export type MachineSceneOptions = {
  /** Clean hero: panels hidden, wheel and touch scroll the page. */
  embedded: boolean
  language: 'en' | 'mn'
  onStation?: (id: StationId) => void
  onTourStart?: () => void
  onReady?: () => void
}

function initMachineScene(
  root: HTMLElement,
  fontFamily: string,
  options: MachineSceneOptions,
): () => void {
  const cleanups: Array<() => void> = []
  const isMn = options.language === 'mn'

  // Keep scene sizing and DOM events scoped to this component instance.
  // The component sizes the scene to its own box; the template filled the window.
  const frameWidth = () => root.clientWidth
  const frameHeight = () => root.clientHeight
  // Every listener goes through here, so dispose() can take it off again.
  const listen = (target: EventTarget, type: string, handler: (event: never) => void) => {
    const fn = handler as unknown as EventListener
    target.addEventListener(type, fn)
    cleanups.push(() => target.removeEventListener(type, fn))
  }
  function $<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = root.querySelector<T>(`#${id}`)
    if (!el) throw new Error(`Scene markup is missing #${id}`)
    return el
  }
  function showError(message?: string) {
    $('loading').classList.add('done')
    $('error').style.display = 'block'
    if (message) $('error').querySelector('p')!.textContent = message
  }
  const dispose = () => {
    for (const fn of cleanups.reverse()) fn()
    cleanups.length = 0
  }

  try {
    // Set up the renderer, camera, environment, and scene materials.
    const TAU = Math.PI * 2
    const embedded = options.embedded
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const palette = { amber: 0xec4899, white: 0xf4f1ea, dark: 0x171b21, steel: 0x59616b }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(33, frameWidth() / frameHeight(), 0.1, 150)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
    } catch (e) {
      showError(
        'WebGL is not available. Turn on hardware acceleration in your browser settings and reload the page.'
      )
      throw e
    }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(devicePixelRatio, frameWidth() < 900 ? 1.5 : 1.75))
    renderer.setSize(frameWidth(), frameHeight())
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.12
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.localClippingEnabled = true
    $('scene').appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.065
    controls.enablePan = false
    controls.minDistance = 7
    controls.maxDistance = 55
    controls.minPolarAngle = 0.09
    controls.maxPolarAngle = Math.PI * 0.475
    controls.rotateSpeed = 0.48
    controls.zoomSpeed = 0.7
    // Embedded in a landing page: the wheel and the finger scroll the page, not the scene.
    if (embedded) {
      controls.enableZoom = false
      if (matchMedia('(pointer:coarse)').matches) controls.enableRotate = false
    }
    const pmrem = new THREE.PMREMGenerator(renderer),
      room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04)
    scene.environment = env.texture
    scene.environmentIntensity = 0.62
    room.dispose()
    pmrem.dispose()
    scene.add(new THREE.HemisphereLight(0xdbe5f4, 0x29211a, 2))
    const key = new THREE.DirectionalLight(0xfff1d8, 4.2)
    key.position.set(-4, 12, 7)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    Object.assign(key.shadow.camera, {
      left: -10,
      right: 10,
      top: 9,
      bottom: -9,
      near: 0.5,
      far: 35,
    })
    key.shadow.normalBias = 0.035
    key.shadow.bias = -0.0002
    key.shadow.radius = 4
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xc4d4ed, 3.1)
    rim.position.set(3, 7, -8)
    scene.add(rim)
    const warm = new THREE.PointLight(0xff8bc2, 28, 20, 2)
    warm.position.set(-4, 5, 3)
    scene.add(warm)
    const front = new THREE.DirectionalLight(0xffffff, 1)
    front.position.set(5, 3, 10)
    scene.add(front)

    const mat = (
      color: number,
      metalness = 0.1,
      roughness = 0.4,
      extra: THREE.MeshStandardMaterialParameters = {}
    ) => new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })
    const M = {
      body: mat(0x30363f, 0.75, 0.29),
      base: mat(0x292f37, 0.85, 0.32),
      edge: mat(0x707986, 0.85, 0.24),
      chrome: mat(0xc3cad0, 0.92, 0.18),
      dark: mat(0x12171d, 0.45, 0.38),
      rubber: mat(0x0b1015, 0.1, 0.6),
      amber: mat(palette.amber, 0.52, 0.28),
      ivory: mat(0xe0ded4, 0.48, 0.26),
      copper: mat(0xb85c83, 0.85, 0.3),
      black: mat(0x050909, 0, 0.6),
      light: mat(0xec4899, 0.2, 0.25, { emissive: 0xec4899, emissiveIntensity: 1.5 }),
      whiteLight: mat(0xfff3d7, 0.1, 0.3, { emissive: 0xfff0d0, emissiveIntensity: 1.8 }),
      green: mat(0xc6d9a1, 0.1, 0.3, { emissive: 0x91b364, emissiveIntensity: 0.7 }),
      glass: mat(0x81949e, 0.45, 0.16, { transparent: true, opacity: 0.19, depthWrite: false }),
      paper: mat(0xf4f1ea, 0, 0.85),
    }
    type Vec3 = [number, number, number]
    type Material = THREE.Material
    const geometries = new Map<string, THREE.BufferGeometry>()
    function boxGeo(w: number, h: number, d: number, r = 0.04) {
      const k = `b${w},${h},${d},${r}`
      if (!geometries.has(k))
        geometries.set(
          k,
          r
            ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 3, h / 3, d / 3))
            : new THREE.BoxGeometry(w, h, d)
        )
      return geometries.get(k)!
    }
    function box(
      parent: THREE.Object3D,
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: Material = M.body,
      r = 0.04
    ) {
      const o = new THREE.Mesh(boxGeo(w, h, d, r), m)
      o.position.set(x, y, z)
      o.castShadow = true
      o.receiveShadow = true
      parent.add(o)
      return o
    }
    function cyl(
      parent: THREE.Object3D,
      r: number,
      h: number,
      x: number,
      y: number,
      z: number,
      m: Material = M.chrome,
      r2: number = r,
      segments = 24
    ) {
      const k = `c${r},${r2},${h},${segments}`
      if (!geometries.has(k)) geometries.set(k, new THREE.CylinderGeometry(r, r2, h, segments))
      const o = new THREE.Mesh(geometries.get(k)!, m)
      o.position.set(x, y, z)
      o.castShadow = true
      o.receiveShadow = true
      parent.add(o)
      return o
    }
    function ball(
      parent: THREE.Object3D,
      r: number,
      x: number,
      y: number,
      z: number,
      m: Material = M.chrome
    ) {
      const k = `s${r}`
      if (!geometries.has(k)) geometries.set(k, new THREE.SphereGeometry(r, 12, 8))
      const o = new THREE.Mesh(geometries.get(k)!, m)
      o.position.set(x, y, z)
      parent.add(o)
      return o
    }
    function tube(parent: THREE.Object3D, pts: Vec3[], r: number, m: Material = M.chrome) {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
      const o = new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(12, pts.length * 7), r, 8, false),
        m
      )
      o.castShadow = true
      parent.add(o)
      return o
    }
    function screw(parent: THREE.Object3D, x: number, y: number, z: number) {
      cyl(parent, 0.055, 0.026, x, y, z, M.chrome, undefined, 12)
      box(parent, 0.068, 0.005, 0.009, x, y + 0.014, z, M.dark, 0)
    }
    type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void
    function canvasTexture(w: number, h: number, draw: Draw) {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      const ctx = c.getContext('2d')!
      draw(ctx, w, h)
      const t = new THREE.CanvasTexture(c)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
      return { texture: t, canvas: c, ctx }
    }
    function print(
      ctx: CanvasRenderingContext2D,
      txt: string,
      x: number,
      y: number,
      size = 20,
      color = '#f4f1ea',
      weight = 500
    ) {
      ctx.fillStyle = color
      ctx.font = `${weight} ${size}px ${fontFamily}`
      ctx.fillText(txt, x, y)
    }
    function screenMaterial(texture: THREE.Texture) {
      return new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    }
    type Painted = THREE.Texture | { texture: THREE.Texture }
    function screen(
      parent: THREE.Object3D,
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      tex: Painted
    ) {
      const map = 'texture' in tex ? tex.texture : tex
      const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMaterial(map))

      o.position.set(x, y, z)
      parent.add(o)
      return o
    }
    const machine = new THREE.Group()
    scene.add(machine)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(70, 70),
      new THREE.ShadowMaterial({ opacity: 0.23 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.43
    floor.receiveShadow = true
    scene.add(floor)
    const shadow = canvasTexture(128, 128, (c, w, h) => {
      const g = c.createRadialGradient(64, 64, 12, 64, 64, 64)
      g.addColorStop(0, 'rgba(0,0,0,.8)')
      g.addColorStop(0.55, 'rgba(0,0,0,.45)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = g
      c.fillRect(0, 0, w, h)
    })
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 13),
      new THREE.MeshBasicMaterial({
        map: shadow.texture,
        transparent: true,
        depthWrite: false,
        opacity: 0.65,
      })
    )
    contact.rotation.x = -Math.PI / 2
    contact.position.y = -0.415
    scene.add(contact)
    // A chamfered, layered platform with engraved nomenclature and captive screws.
    box(machine, 12.8, 0.38, 8.25, 0, -0.09, 0, M.base, 0.17)
    box(machine, 12.6, 0.055, 8.08, 0, 0.13, 0, M.edge, 0.11)
    box(machine, 12.49, 0.09, 7.96, 0, 0.19, 0, M.body, 0.1)
    box(machine, 12.55, 0.027, 8.02, 0, -0.19, 0, M.dark, 0.06)
    box(machine, 11.9, 0.026, 0.032, 0, -0.17, 4.115, M.light, 0.01)
    for (const x of [-5.6, 5.6])
      for (const z of [-3.35, 3.35]) {
        cyl(machine, 0.39, 0.25, x, -0.31, z, M.rubber)
        cyl(machine, 0.29, 0.09, x, -0.4, z, M.dark)
        screw(machine, x, 0.253, z)
      }
    for (const x of [-6.02, 6.02]) for (const z of [-3.73, 3.73]) screw(machine, x, 0.255, z)
    const engraving = canvasTexture(1536, 176, (c, w, h) => {
      c.fillStyle = '#252b32'
      c.fillRect(0, 0, w, h)
      c.strokeStyle = '#4d545c'
      c.lineWidth = 2
      c.strokeRect(2, 2, w - 4, h - 4)
      print(c, isMn ? 'ОЮУ' : 'OYU', 45, 79, 40, '#d9d8cd', 650)
      print(c, isMn ? 'ДУГААР 001' : 'No. 001', 1360, 130, 23, '#b85c83')
    })
    const plate = screen(machine, 7.35, 0.84, -0.4, 0.25, 3.51, engraving)
    plate.rotation.x = -Math.PI / 2
    for (let i = 0; i < 16; i++)
      box(machine, 0.015, 0.009, 0.11 + (i % 4) * 0.035, -5.6 + i * 0.09, 0.249, 3.5, M.edge, 0)
    // Faint drafting marks stay local to the machine, leaving the headline area empty.
    const drafting = new THREE.Group()
    scene.add(drafting)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x69717a,
      transparent: true,
      opacity: 0.12,
    })
    const draftingPoints = []
    for (const r of [7.5, 8.1])
      for (let i = 0; i < 120; i++)
        for (const j of [i, i + 1]) {
          const a = (j / 120) * TAU
          draftingPoints.push(new THREE.Vector3(Math.cos(a) * r, -0.4, Math.sin(a) * r * 0.72))
        }
    for (let i = 0; i < 52; i++) {
      const a = (i / 52) * TAU,
        r = 8.1
      draftingPoints.push(
        new THREE.Vector3(Math.cos(a) * r, -0.395, Math.sin(a) * r * 0.72),
        new THREE.Vector3(
          Math.cos(a) * (r + (i % 4 === 0 ? 0.16 : 0.07)),
          -0.395,
          Math.sin(a) * (r + (i % 4 === 0 ? 0.16 : 0.07)) * 0.72
        )
      )
    }
    drafting.add(
      new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(draftingPoints), lineMat)
    )

    // Build the platform and the five portfolio stations.
    type StationDef = {
      id: StationId
      name: string
      step: number
      output: string
      pos: Vec3
      desc: string
    }
    type Station = StationDef & {
      group: THREE.Group
      base: THREE.Vector3
      glowMat: THREE.MeshStandardMaterial
      label: HTMLDivElement
      index: number
      anchor: THREE.Vector3
    }

    const definitions: StationDef[] = [
      {
        id: 'engine',
        name: isMn ? 'Танилцуулга' : 'Introduction',
        step: 1,
        output: isMn ? 'профайл' : 'profile',
        pos: [-4.15, 0.29, -0.65],
        desc: isMn ? 'Балбаатар Оюугийн товч танилцуулга.' : 'Introduction to Balbaatar Oyu and her portfolio.'
      },
      {
        id: 'admin',
        name: isMn ? 'Миний тухай' : 'About me',
        step: 2,
        output: isMn ? 'миний тухай' : 'about me',
        pos: [-1.65, 0.29, -2.03],
        desc: isMn ? 'Оюутны танилцуулга, амжилт, тэтгэлгийн мэдээлэл.' : 'Personal profile, achievements and scholarship information.'
      },
      {
        id: 'storefront',
        name: isMn ? 'Ур чадвар' : 'Skills',
        step: 3,
        output: isMn ? 'чадвар' : 'skills',
        pos: [1.5, 0.29, -2.08],
        desc: isMn ? 'C, SQL, Java, Office and VS Code.' : 'C, SQL, Java, office tools, VS Code.'
      },
      {
        id: 'cabinet',
        name: isMn ? 'Төслүүд' : 'Projects',
        step: 4,
        output: isMn ? 'вэб төслүүд' : 'web projects',
        pos: [4.03, 0.29, 0.12],
        desc: isMn ? 'Цахим дэлгүүр, МСМТ-ийн сайт, Star catcher.' : 'Furniture e-commerce, the UFE ISMD website and Star catcher.'
      },
      {
        id: 'cashdesk',
        name: isMn ? 'Холбоо барих' : 'Contact',
        step: 5,
        output: isMn ? 'холбоо барих' : 'contact',
        pos: [0.93, 0.29, 1.85],
        desc: isMn ? 'И-мэйл, утас болон GitHub хаяг.' : 'Email, phone and GitHub contact details.'
      },
    ]
    const stations: Station[] = [],
      cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10),
      shellMaterials: THREE.Material[] = []
    function shell<T extends THREE.Material>(m: T): T {
      const s = m.clone() as T
      s.clippingPlanes = [cutPlane]
      s.clipShadows = true
      s.side = THREE.DoubleSide
      shellMaterials.push(s)
      return s
    }
    const S = {
      body: shell(M.body),
      ivory: shell(M.ivory),
      amber: shell(M.amber),
      edge: shell(M.edge),
    }
    const gears: Array<{ g: THREE.Group; vertical: boolean }> = []
    function gear(
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      r = 0.3,
      vertical = false
    ) {
      const g = new THREE.Group()
      g.position.set(x, y, z)
      if (vertical) g.rotation.x = Math.PI / 2
      parent.add(g)
      cyl(g, r, 0.09, 0, 0, 0, M.copper)
      cyl(g, r * 0.66, 0.105, 0, 0, 0, M.dark)
      cyl(g, r * 0.22, 0.14, 0, 0, 0, M.chrome)
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU,
          b = box(g, r * 0.26, 0.085, r * 0.2, Math.cos(a) * r, 0, Math.sin(a) * r, M.copper, 0.008)
        b.rotation.y = -a
      }
      g.userData.moving = true
      gears.push({ g, vertical })
      return g
    }
    definitions.forEach((d, i) => {
      const group = new THREE.Group()
      group.position.fromArray(d.pos)
      machine.add(group)
      const glowMat = M.light.clone()
      glowMat.emissiveIntensity = 0.5
      box(group, 2.05, 0.12, 1.78, 0, 0.03, 0, M.dark, 0.1)
      box(group, 1.97, 0.03, 1.7, 0, 0.12, 0, glowMat, 0.09)
      box(group, 2.03, 0.17, 1.75, 0, 0.215, 0, M.body, 0.1)
      for (const x of [-0.85, 0.85]) for (const z of [-0.7, 0.7]) screw(group, x, 0.311, z)
      // Each base is now only a shared display plinth; the five silhouettes below are unique.
      const plaque = canvasTexture(512, 116, (c, w, h) => {
        c.fillStyle = '#151a20'
        c.fillRect(0, 0, w, h)
        print(c, String(i + 1).padStart(2, '0'), 24, 76, 42, '#ec4899', 550)
        print(c, d.name.toUpperCase(), 111, 73, 35, '#d7d9d7', 550)
      })
      screen(group, 1.54, 0.345, 0, 0.27, 0.891, plaque)
      const label = document.createElement('div')
      label.className = 'station-label'
      label.innerHTML = `<div class="stem"></div><div class="label-card"><div class="label-title"><span>${String(i + 1).padStart(2, '0')}</span>${d.name}</div><div class="label-meta">${isMn ? 'Алхам' : 'Step'} ${d.step} / ${d.output}</div></div>`
      $('labels').appendChild(label)
      cleanups.push(() => label.remove())

      stations.push({
        ...d,
        group,
        base: new THREE.Vector3(...d.pos),
        glowMat,
        label,
        index: i,
        anchor: new THREE.Vector3(0, 2.5, 0),
      })
    })
    const engine = stations[0].group
    // INTRODUCTION: a portrait monolith with an orbiting identity halo.
    cyl(engine, 0.72, 0.12, 0, 0.43, 0, M.dark, 0.78, 40)
    cyl(engine, 0.62, 0.09, 0, 0.53, 0, M.amber, 0.68, 40)
    box(engine, 1.15, 0.08, 0.72, 0, 0.62, -0.03, M.body, 0.06)
    const printhead = new THREE.Group()
    engine.add(printhead)
    printhead.position.set(0, 1.55, -0.08)
    printhead.userData.moving = true
    box(printhead, 1.25, 1.52, 0.13, 0, 0.38, -0.05, M.body, 0.075)
    box(printhead, 1.13, 1.39, 0.04, 0, 0.38, 0.04, M.dark, 0.04)
    const introCard = canvasTexture(512, 620, (c, w, h) => {
      c.fillStyle = '#10161c'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, 14, h)
      c.fillStyle = '#28313a'
      c.beginPath()
      c.arc(256, 190, 119, 0, TAU)
      c.fill()
      c.strokeStyle = '#ec4899'
      c.lineWidth = 8
      c.beginPath()
      c.arc(256, 190, 110, 0, TAU)
      c.stroke()
      c.fillStyle = '#e0ded4'
      c.beginPath()
      c.arc(256, 158, 43, 0, TAU)
      c.fill()
      c.beginPath()
      c.ellipse(256, 258, 82, 57, 0, Math.PI, TAU)
      c.fill()
      print(c, isMn ? 'САЙН УУ, БИ' : 'HELLO, I AM', 154, 378, 20, '#9ca5a7', 500)
      print(c, isMn ? 'ОЮУ' : 'OYU', 153, 432, 48, '#f4f1ea', 700)
      print(c, isMn ? 'МЭДЭЭЛЛИЙН СИСТЕМ' : 'INFORMATION SYSTEMS', 154, 468, 15, '#f472b6', 600)
      c.fillStyle = '#30363f'
      c.fillRect(154, 505, 204, 3)
      c.fillStyle = '#ec4899'
      c.fillRect(154, 505, 132, 3)
      print(c, isMn ? 'ПОРТФОЛИО / 2026' : 'PORTFOLIO / 2026', 154, 548, 14, '#8a9496')
    })
    screen(printhead, 1.02, 1.24, 0, 0.38, 0.068, introCard)
    const reels: THREE.Group[] = []
    for (let i = 0; i < 2; i++) {
      const halo = new THREE.Group()
      halo.position.set(0, 1.16, 0.02)
      halo.userData.moving = true
      printhead.add(halo)
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(i === 0 ? 0.72 : 0.82, i === 0 ? 0.025 : 0.014, 8, 56),
        i === 0 ? M.amber : M.chrome
      )
      ring.scale.y = 0.72
      ring.rotation.z = i === 0 ? 0.25 : -0.28
      halo.add(ring)
      reels.push(halo)
    }
    const videoTexture = canvasTexture(384, 640, () => {})
    function drawVideo(t: number) {
      const c = videoTexture.ctx,
        w = 384,
        h = 640
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#f472b6'
      c.beginPath()
      c.arc(330, 205, 210, 0, TAU)
      c.fill()
      c.strokeStyle = '#171b20'
      c.lineWidth = 13
      for (let i = 0; i < 3; i++) {
        c.beginPath()
        c.ellipse(194, 270, 90 - i * 21, 111, Math.sin(t * 0.25) * 0.3 + 0.4, 0, TAU)
        c.stroke()
      }
      print(c, isMn ? 'ПОРТФОЛИО' : 'PORTFOLIO', 28, 57, 24, '#242320', 650)
      print(c, isMn ? 'OYU / ПОРТФОЛИО' : 'BY OYU.', 24, 103, 42, '#242320', 700)
      c.fillStyle = '#171b20'
      c.beginPath()
      c.roundRect(25, 465, 334, 123, 12)
      c.fill()
      const texts = isMn
        ? ['Хийж туршиж сурах.', 'Вэб ба систем.', 'Ур чадвараа хөгжүүлнэ.', 'Үргэлж бүтээнэ.']
        : ['Learning by doing.', 'Web and systems.', 'Curiosity to skills.', 'Always building.']
      const n = Math.floor(t * 0.7) % 4
      print(c, texts[n], 45, 505, 25, '#f4f1ea', 550)
      print(c, texts[(n + 1) % 4], 45, 547, 25, '#f4f1ea', 550)
      c.fillStyle = '#fff7d4'
      c.fillRect(27, 615, Math.max(10, ((t * 0.13) % 1) * 330), 5)
      videoTexture.texture.needsUpdate = true
    }
    drawVideo(0)
    const outputVideo = new THREE.Group()
    outputVideo.userData.moving = true
    engine.add(outputVideo)
    box(outputVideo, 0.62, 0.82, 0.08, 0.72, 1.13, 0.28, M.ivory, 0.04)
    screen(outputVideo, 0.55, 0.75, 0.72, 1.13, 0.326, videoTexture)
    tube(engine, [[-0.5, 0.78, -0.08], [-0.62, 1.02, -0.08], [-0.5, 1.2, -0.08]], 0.022, M.chrome)

    const admin = stations[1].group
    // ABOUT: an open journal replaces the old machine console.
    box(admin, 1.72, 0.17, 1.2, 0, 0.4, 0, M.dark, 0.08)
    box(admin, 1.66, 0.11, 1.12, 0, 0.52, 0, M.copper, 0.055)
    const consoleTop = new THREE.Group()
    consoleTop.position.set(0, 0.59, -0.02)
    admin.add(consoleTop)
    const leftPage = box(consoleTop, 0.79, 0.07, 0.98, -0.405, 0.03, 0, M.ivory, 0.025)
    const rightPage = box(consoleTop, 0.79, 0.07, 0.98, 0.405, 0.03, 0, M.ivory, 0.025)
    leftPage.rotation.z = -0.035
    rightPage.rotation.z = 0.035
    box(consoleTop, 0.065, 0.13, 1.02, 0, 0, 0, M.amber, 0.018)
    const queue = canvasTexture(640, 340, () => {})
    function drawQueue(t: number) {
      const c = queue.ctx
      c.fillStyle = '#f1efe7'
      c.fillRect(0, 0, 640, 340)
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, 10, 340)
      c.fillStyle = '#d6d4ca'
      c.fillRect(319, 26, 2, 288)
      print(c, isMn ? 'МИНИЙ ТУХАЙ' : 'ABOUT ME', 28, 45, 20, '#20282d', 650)
      print(c, isMn ? 'МИНИЙ ЗАМНАЛ' : 'MY STORY', 342, 45, 20, '#20282d', 650)
      print(c, isMn ? 'МЭДЭЭЛЛИЙН СИСТЕМ' : 'INFORMATION SYSTEMS', 28, 79, 13, '#ad5a82', 600)
      print(c, isMn ? '3-Р ДАМЖААНЫ ОЮУТАН' : '3RD YEAR STUDENT', 342, 79, 13, '#ad5a82', 600)
      for (let i = 0; i < 5; i++) {
        c.fillStyle = '#aeb2ae'
        c.fillRect(28, 112 + i * 22, 240 - (i % 3) * 31, 5)
        c.fillStyle = '#ec4899'
        c.beginPath()
        c.arc(346, 111 + i * 40, 5, 0, TAU)
        c.fill()
        print(c, (isMn ? ['Сониуч суралцагч', 'Вэб ба систем', 'Зорилготой бүтээх', 'Туршиж сайжруулах', 'Үргэлж суралцах'] : ['Curious learner', 'Web and systems', 'Build with purpose', 'Test and improve', 'Always learning'])[i], 361, 116 + i * 40, 12, '#626b69', 500)
      }
      c.fillStyle = '#30363f'
      c.fillRect(28, 270, 244, 32)
      print(c, isMn ? 'ТУХАЙ / OYU' : 'ABOUT / OYU', 43, 292, 13, '#f4f1ea', 600)
      c.fillStyle = '#ec4899'
      c.fillRect(342, 302, Math.max(16, ((t * 0.12) % 1) * 242), 4)
      queue.texture.needsUpdate = true
    }
    drawQueue(0)
    const qs = screen(consoleTop, 1.49, 0.82, 0, 0.071, 0.015, queue)
    qs.rotation.x = -Math.PI / 2
    const toggles: THREE.Mesh[] = []
    cyl(admin, 0.055, 0.09, 0.74, 0.63, -0.45, M.chrome)
    box(admin, 0.06, 0.34, 0.025, 0.74, 0.78, -0.45, M.amber, 0.012)

    const storefront = stations[2].group
    // SKILLS: four different-height capability pillars replace the large monitor.
    box(storefront, 1.82, 0.15, 1.2, 0, 0.39, 0, M.dark, 0.07)
    box(storefront, 1.62, 0.07, 1.04, 0, 0.49, 0, M.body, 0.035)
    const skillItems = [
      { name: 'C / SQL', height: 0.82, material: M.amber, tag: 'SQL' },
      { name: 'JAVA', height: 1.05, material: M.ivory, tag: 'JAVA' },
      { name: 'EXCEL', height: 1.25, material: M.body, tag: 'DATA' },
    ]
    skillItems.forEach((item, i) => {
      const x = -0.66 + i * 0.44
      const skillGroup = new THREE.Group()
      skillGroup.position.set(x, 0.51, -0.02)
      storefront.add(skillGroup)
      box(skillGroup, 0.36, 0.09, 0.56, 0, 0.05, 0, M.dark, 0.025)
      box(skillGroup, 0.25, item.height, 0.33, 0, 0.09 + item.height / 2, 0, item.material, 0.035)
      box(skillGroup, 0.29, 0.07, 0.37, 0, 0.09 + item.height, 0, M.chrome, 0.025)
      const nodeTex = canvasTexture(240, 190, (c, w, h) => {
        c.fillStyle = '#11171d'
        c.fillRect(0, 0, w, h)
        c.fillStyle = '#ec4899'
        c.fillRect(0, 0, 7, h)
        print(c, item.tag, 20, 52, 26, '#f472b6', 650)
        print(c, item.name, 20, 94, 18, '#f4f1ea', 600)
        c.fillStyle = '#44515a'
        c.fillRect(20, 124, 190, 5)
        c.fillStyle = '#ec4899'
        c.fillRect(20, 124, 118 + i * 14, 5)
        print(c, isMn ? 'СУРАЛЦ / БҮТЭЭ' : 'LEARN / BUILD', 20, 160, 13, '#929c9f')
      })
      screen(skillGroup, 0.205, 0.16, 0, 0.35 + item.height * 0.44, 0.169, nodeTex)
      ball(skillGroup, 0.043, 0, 0.16 + item.height, 0, M.light)
    })
    tube(storefront, [[-0.67, 1.05, -0.31], [-0.22, 1.42, -0.31], [0.22, 1.62, -0.31], [0.67, 1.35, -0.31]], 0.018, M.chrome)
    const webTexture = canvasTexture(512, 150, (c, w, h) => {
      c.fillStyle = '#11171d'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, 9, h)
      print(c, isMn ? 'УР ЧАДВАР / ХЭРЭГСЭЛ' : 'SKILLS / TOOLKIT', 25, 51, 22, '#f4f1ea', 650)
      print(c, isMn ? 'ВЭБ     СҮЛЖЭЭ     ЧАНАР' : 'WEB     NETWORKS     QUALITY', 25, 100, 16, '#9ca5a7', 500)
    })
    box(storefront, 1.62, 0.48, 0.08, 0, 0.83, 0.53, M.dark, 0.035)
    screen(storefront, 1.48, 0.38, 0, 0.83, 0.576, webTexture)
    const flyPost = new THREE.Group()
    flyPost.userData.moving = true
    flyPost.position.set(0.72, 1.45, 0.35)
    storefront.add(flyPost)
    box(flyPost, 0.42, 0.62, 0.07, 0, 0, 0, M.ivory, 0.035)
    const postTex = canvasTexture(220, 290, (c, w, h) => {
      c.fillStyle = '#f4f1ea'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#ec4899'
      c.fillRect(15, 16, 190, 168)
      c.fillStyle = '#272e30'
      c.fillRect(40, 52, 140, 24)
      c.fillRect(40, 91, 107, 24)
      c.fillRect(40, 130, 158, 24)
      print(c, isMn ? 'УР ЧАДВАР' : 'SKILLS', 17, 225, 23, '#283030', 600)
      c.fillStyle = '#b0b5b0'
      c.fillRect(17, 244, 153, 6)
      c.fillRect(17, 258, 104, 5)
    })
    screen(flyPost, 0.36, 0.54, 0, 0, 0.041, postTex)

    const cabinet = stations[3].group
    // PROJECTS: a display rack of three individual portfolio cards replaces the cabinet.
    box(cabinet, 1.82, 0.15, 1.18, 0, 0.39, 0, M.dark, 0.07)
    box(cabinet, 1.64, 0.07, 1.03, 0, 0.49, 0, M.body, 0.035)
    box(cabinet, 1.4, 0.06, 0.06, 0, 0.7, -0.42, M.chrome, 0.015)
    const projectLabels = isMn ? ['Тавилгын онлайн дэлгүүр', 'СЭЗИС МСМТ', 'Од баригч'] : ['e-commerce', 'UFE ISMD', 'Star catcher']
    const projectTypes = isMn ? ['ТАВИЛГА / ВЭБ', 'ТЭНХИМ / ВЭБ', 'ТОГЛООМ / TYPESCRIPT'] : ['FURNITURE / WEB', 'DEPARTMENT / WEB', 'GAME / TYPESCRIPT']
    projectLabels.forEach((name, i) => {
      const panel = new THREE.Group()
      panel.position.set(-0.61 + i * 0.61, 0.55, -0.18)
      panel.rotation.y = (1 - i) * 0.16
      cabinet.add(panel)
      box(panel, 0.55, 0.91, 0.095, 0, 0.48, 0, M.dark, 0.03)
      box(panel, 0.49, 0.83, 0.035, 0, 0.48, 0.066, M.ivory, 0.018)
      const cardTex = canvasTexture(280, 420, (c, w, h) => {
        c.fillStyle = '#11171d'
        c.fillRect(0, 0, w, h)
        c.fillStyle = ['#ec4899', '#c4c7b5', '#91a19b'][i]
        c.fillRect(0, 0, w, 14)
        print(c, isMn ? 'ОЮУ / ТӨСЛҮҮД' : 'OYU / WORKS', 18, 46, 15, '#a6afae', 500)
        print(c, String(i + 1).padStart(2, '0'), 18, 102, 42, '#f472b6', 600)
        print(c, name, 18, 169, 22, '#f4f1ea', 650)
        print(c, projectTypes[i], 18, 205, 13, '#a6afae', 500)
        c.fillStyle = '#202a30'
        c.fillRect(18, 243, 244, 110)
        c.fillStyle = ['#ec4899', '#b9c2ad', '#d9d6c8'][i]
        c.fillRect(36, 263, 7, 70)
        c.fillStyle = '#73817f'
        for (let j = 0; j < 3; j++) c.fillRect(59, 265 + j * 22, 155 - j * 25, 5)
        print(c, isMn ? 'ТӨСЛИЙГ ҮЗЭХ' : 'OPEN PROJECT', 18, 389, 13, '#f472b6', 600)
      })
      screen(panel, 0.45, 0.75, 0, 0.48, 0.087, cardTex)
      box(panel, 0.075, 0.62, 0.075, 0, 0.04, -0.02, M.chrome, 0.02)
      box(panel, 0.39, 0.07, 0.55, 0, -0.15, -0.02, i === 0 ? M.amber : M.copper, 0.025)
    })
    const orderTex = canvasTexture(480, 180, (c, w, h) => {
      c.fillStyle = '#121a20'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, 7, h)
      print(c, isMn ? 'БҮТЭЭЛҮҮД' : 'PROJECT ARCHIVE', 24, 59, 25, '#f4f1ea', 600)
      print(c, isMn ? '3 БҮТЭЭЛ / ТАВИЛГА / МСМТ / ТОГЛООМ' : '3 WEB PROJECTS / SHOP / ISMD / GAME', 24, 104, 15, '#9ca5a7')
      print(c, isMn ? 'ХИЧЭЭЛЭЭС ПРАКТИКТ' : 'COURSEWORK TO PRACTICE', 24, 148, 13, '#f472b6', 500)
    })
    box(cabinet, 1.48, 0.38, 0.07, 0, 0.78, 0.55, M.dark, 0.025)
    screen(cabinet, 1.38, 0.3, 0, 0.78, 0.592, orderTex)
    const incoming = new THREE.Group()
    incoming.userData.moving = true
    cabinet.add(incoming)
    box(incoming, 0.62, 0.36, 0.05, 0, 0, 0, M.light, 0.03)
    const nameTex = canvasTexture(432, 204, (c, w, h) => {
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, w, h)
      print(c, isMn ? 'БҮТЭЭЛ' : 'SELECTED PROJECT', 28, 70, 24, '#2a2e26', 600)
      print(c, isMn ? 'ТӨСЛИЙН ДЭЛГЭРЭНГҮЙ' : 'OPEN A CASE STUDY', 28, 126, 19, '#5b4c22', 500)
      c.fillRect(28, 153, 165, 3)
    })
    screen(incoming, 0.57, 0.27, 0, 0, 0.031, nameTex)
    const cashdesk = stations[4].group
    // CONTACT: a mailbox-style communication kiosk replaces the checkout counter.
    box(cashdesk, 1.62, 0.16, 1.18, 0, 0.4, 0, M.dark, 0.07)
    box(cashdesk, 1.42, 0.12, 1.02, 0, 0.52, 0, M.body, 0.045)
    box(cashdesk, 1.18, 1.23, 0.78, 0, 1.16, -0.1, S.body, 0.12)
    box(cashdesk, 1.28, 0.16, 0.91, 0, 1.84, -0.1, S.amber, 0.055)
    box(cashdesk, 1.04, 0.58, 0.06, 0, 1.48, 0.305, M.dark, 0.035)
    const cashTex = canvasTexture(512, 176, () => {})
    function drawCash() {
      const c = cashTex.ctx
      c.fillStyle = '#12231e'
      c.fillRect(0, 0, 512, 176)
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, 8, 176)
      print(c, isMn ? 'ХОЛБОГДЪЁ' : "LET'S CONNECT", 24, 48, 23, '#f472b6', 550)
      print(c, isMn ? 'ЗУРВАС ИЛГЭЭХ' : 'SEND A MESSAGE', 24, 111, 47, '#ecedc7', 600)
      print(c, isMn ? 'ХОЛБОО / OYU' : 'CONTACT / OYU', 26, 150, 15, '#9cae91', 500)
    }
    drawCash()
    screen(cashdesk, 0.94, 0.48, 0, 1.48, 0.339, cashTex)
    // A dimensional envelope icon makes this station read as communication, not payment.
    box(cashdesk, 0.78, 0.42, 0.07, 0, 0.9, 0.345, M.ivory, 0.025)
    tube(cashdesk, [[-0.37, 1.08, 0.39], [0, 0.82, 0.39], [0.37, 1.08, 0.39]], 0.022, M.copper)
    tube(cashdesk, [[-0.37, 0.73, 0.39], [0, 0.99, 0.39], [0.37, 0.73, 0.39]], 0.018, M.edge)
    box(cashdesk, 0.72, 0.055, 0.04, 0, 0.62, 0.4, M.dark, 0.012)
    const receipt = new THREE.Group()
    receipt.position.set(0.62, 1.25, -0.22)
    receipt.userData.moving = true
    cashdesk.add(receipt)
    box(receipt, 0.52, 0.82, 0.055, 0, 0, 0, M.ivory, 0.025)
    const receiptTex = canvasTexture(280, 440, (c, w, h) => {
      c.fillStyle = '#f4f1ea'
      c.fillRect(0, 0, w, h)
      c.fillStyle = '#ec4899'
      c.fillRect(0, 0, w, 12)
      print(c, isMn ? 'ХОЛБОО БАРИХ' : 'SAY HELLO', 22, 55, 23, '#333d36', 650)
      print(c, isMn ? 'ОЮУ' : 'OYU', 22, 108, 34, '#333d36', 650)
      print(c, isMn ? 'Мэдээллийн систем' : 'Information systems', 22, 144, 15, '#687067')
      c.strokeStyle = '#8a9189'
      c.setLineDash([5, 6])
      c.beginPath()
      c.moveTo(22, 174)
      c.lineTo(258, 174)
      c.stroke()
      print(c, isMn ? 'ИМЭЙЛ / ОЛОН НИЙТИЙН СҮЛЖЭЭ' : 'EMAIL / SOCIAL', 22, 224, 18, '#333d36', 600)
      print(c, isMn ? 'САНАЛД НЭЭЛТТЭЙ' : 'OPEN TO IDEAS', 22, 266, 18, '#333d36', 500)
      c.fillStyle = '#333d36'
      for (let i = 0; i < 30; i++) c.fillRect(22 + i * 7, 298, 2 + (i % 3), 75)
      print(c, isMn ? 'ОЮУ / 2026' : 'OYU / 2026', 73, 414, 15, '#59635b')
    })
    const rp = screen(receipt, 0.45, 0.72, 0, 0, 0.031, receiptTex)
    rp.material.side = THREE.DoubleSide
    receipt.rotation.x = -0.08
    const coin = new THREE.Group()
    coin.userData.moving = true
    cashdesk.add(coin)
    const coinDisc = cyl(coin, 0.22, 0.065, 0, 0, 0, M.amber, undefined, 32)
    coinDisc.rotation.x = Math.PI / 2
    const coinRing = new THREE.Mesh(new THREE.TorusGeometry(0.174, 0.014, 6, 32), M.light)
    coinRing.position.z = 0.037
    coin.add(coinRing)
    const rubleTex = canvasTexture(128, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h)
      c.textAlign = 'center'
      print(c, '@', 64, 95, 91, '#80561c', 650)
    })
    const ruble = screen(coin, 0.28, 0.28, 0, 0, 0.04, rubleTex)
    ruble.material.transparent = true
    // Build the conveyor, track rails, and moving display pieces.
    const path = new THREE.CatmullRomCurve3(
      [
        [-3.95, 0.84, 0.65],
        [-3.1, 0.84, -0.12],
        [-1.45, 0.84, -0.79],
        [1.32, 0.84, -0.8],
        [3.3, 0.84, 0.19],
        [3.43, 0.84, 1.21],
        [1.35, 0.84, 2.7],
        [-1.4, 0.84, 2.52],
        [-3.54, 0.84, 1.65],
      ].map((p) => new THREE.Vector3(...p)),
      true,
      'catmullrom',
      0.25
    )
    const belt = new THREE.Group()
    machine.add(belt)
    const frameMesh = new THREE.Mesh(new THREE.TubeGeometry(path, 150, 0.35, 8, true), M.dark)
    frameMesh.scale.y = 0.3
    frameMesh.position.y = 0.51
    belt.add(frameMesh)
    const beltCount = 148,
      beltSlats = new THREE.InstancedMesh(boxGeo(0.135, 0.065, 0.63, 0.012), M.body, beltCount)
    beltSlats.receiveShadow = true
    beltSlats.castShadow = false
    belt.add(beltSlats)
    beltSlats.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const dummy = new THREE.Object3D(),
      pVec = new THREE.Vector3(),
      tVec = new THREE.Vector3()
    function updateBelt(t: number) {
      for (let i = 0; i < beltCount; i++) {
        const u = (i / beltCount + t * 0.012) % 1
        path.getPointAt(u, pVec)
        path.getTangentAt(u, tVec)
        dummy.position.copy(pVec)
        dummy.rotation.set(0, -Math.atan2(tVec.z, tVec.x), 0)
        dummy.updateMatrix()
        beltSlats.setMatrixAt(i, dummy.matrix)
      }
      beltSlats.instanceMatrix.needsUpdate = true
    }
    updateBelt(0)
    for (const side of [-1, 1]) {
      const pts = []
      for (let i = 0; i <= 160; i++) {
        path.getPointAt(i / 160, pVec)
        path.getTangentAt(i / 160, tVec)
        pts.push(
          pVec.clone().add(new THREE.Vector3(-tVec.z * 0.36 * side, 0.09, tVec.x * 0.36 * side))
        )
      }
      const railPath = new THREE.CatmullRomCurve3(pts)
      belt.add(new THREE.Mesh(new THREE.TubeGeometry(railPath, 160, 0.028, 6, false), M.chrome))
    }
    for (let i = 0; i < 16; i++) {
      const p = path.getPointAt(i / 16)
      cyl(belt, 0.045, 0.43, p.x, 0.53, p.z, M.chrome)
    }
    // Copper pneumatic lines link the station footings independently from the conveyor.
    const pipes = new THREE.Group()
    machine.add(pipes)
    const connectors = []
    for (let i = 0; i < 4; i++) {
      const a = stations[i].base,
        b = stations[i + 1].base
      const points = [
        a.clone().add(new THREE.Vector3(0.4, 0.12, 0)),
        a
          .clone()
          .lerp(b, 0.35)
          .add(new THREE.Vector3(0, 0.1, -0.6)),
        a
          .clone()
          .lerp(b, 0.65)
          .add(new THREE.Vector3(0, 0.1, -0.6)),
        b.clone().add(new THREE.Vector3(-0.4, 0.12, 0)),
      ]
      const curve = new THREE.CatmullRomCurve3(points)
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.054, 8, false), M.copper)
      pipes.add(mesh)
      connectors.push({ mesh, a: i, b: i + 1 })
    }
    const scriptTex = canvasTexture(256, 352, (c, w, h) => {
      c.fillStyle = '#eeeae0'
      c.fillRect(0, 0, w, h)
      print(c, isMn ? 'МИНИЙ ТУХАЙ' : 'ABOUT ME', 24, 47, 22, '#3b403a', 650)
      print(c, isMn ? 'Мэдээллийн систем' : 'Information systems', 24, 85, 15, '#8b8d80')
      for (let i = 0; i < 9; i++) {
        c.fillStyle = i === 4 ? '#b85c83' : '#aeb2a5'
        c.fillRect(24, 111 + i * 21, 190 - (i % 3) * 24, 6)
      }
      print(c, isMn ? 'ТУХАЙ / 02' : 'ABOUT / 02', 24, 327, 17, '#786124', 600)
    })
    const orderCardTex = canvasTexture(256, 352, (c, w, h) => {
      c.fillStyle = '#b85c83'
      c.fillRect(0, 0, w, h)
      print(c, isMn ? 'ТАНИЛЦУУЛГА' : 'HELLO', 21, 48, 24, '#30362d', 650)
      print(c, isMn ? 'ОЮУ' : 'OYU', 21, 79, 24, '#30362d', 650)
      c.strokeStyle = '#716431'
      c.lineWidth = 2
      c.strokeRect(23, 112, 210, 139)
      print(c, isMn ? 'Оюу' : 'Oyu', 42, 190, 37, '#30362d', 550)
      print(c, isMn ? 'ТАНИЛЦУУЛГА / 01' : 'INTRO / 01', 23, 320, 17, '#635728')
    })
    const packetTextures = [orderCardTex, scriptTex, videoTexture, orderTex, receiptTex]
    const packets: Array<{
      group: THREE.Group
      faces: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[]
      halo: THREE.Mesh
      stage: number
      phase: number
    }> = []
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group()
      g.userData.moving = true
      machine.add(g)
      box(g, 0.47, 0.71, 0.04, 0, 0, 0, M.ivory, 0.022)
      const faces = packetTextures.map((tex) => {
        const s = screen(g, 0.43, 0.665, 0, 0, 0.024, tex)
        s.material.side = THREE.DoubleSide
        s.visible = false
        return s
      })
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.4, 0.414, 40),
        new THREE.MeshBasicMaterial({
          color: 0xec4899,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      )
      halo.rotation.x = -Math.PI / 2
      halo.position.y = -0.37
      g.add(halo)
      halo.visible = false
      packets.push({ group: g, faces, halo, stage: -1, phase: 0 })
    }
    let adminU = 0.2,
      storeU = 0.37,
      cashU = 0.72
    // Find ports by arc length, so the travelling order arrives at the actual station.
    function nearestPort(x: number, z: number) {
      let best = 0,
        dist = Infinity
      for (let i = 0; i < 300; i++) {
        const p = path.getPointAt(i / 300),
          d = (p.x - x) ** 2 + (p.z - z) ** 2
        if (d < dist) {
          dist = d
          best = i / 300
        }
      }
      return best
    }
    adminU = nearestPort(-1.65, -0.7)
    storeU = nearestPort(1.5, -0.7)
    cashU = nearestPort(0.93, 2.65)

    // Merge static geometry per parent/material. Moving assemblies remain separate.
    function compact(group: THREE.Object3D) {
      for (const child of [...group.children]) if ((child as THREE.Group).isGroup) compact(child)
      const buckets = new Map<string, THREE.Mesh<THREE.BufferGeometry, THREE.Material>[]>()
      for (const object of group.children) {
        const child = object as THREE.Mesh<THREE.BufferGeometry, THREE.Material> & {
          isInstancedMesh?: boolean
        }
        if (
          !child.isMesh ||
          child.isInstancedMesh ||
          child.userData.moving ||
          Array.isArray(child.material)
        )
          continue
        const key = child.material.uuid
        if (!buckets.has(key)) buckets.set(key, [])
        buckets.get(key)!.push(child)
      }
      for (const list of buckets.values()) {
        if (list.length < 2) continue
        const geos = list.map((m) => {
          m.updateMatrix()
          const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()
          return g.applyMatrix4(m.matrix)
        })
        const merged = mergeGeometries(geos, false)
        for (const geo of geos) geo.dispose()
        if (!merged) continue
        const mesh = new THREE.Mesh(merged, list[0].material)
        mesh.castShadow = list.some((x) => x.castShadow)
        mesh.receiveShadow = list.some((x) => x.receiveShadow)
        for (const m of list) group.remove(m)
        group.add(mesh)
      }
    }
    // These references are animated individually and must not be merged into their parent.
    ;[incoming, receipt, coin, outputVideo, flyPost, printhead, ...reels].forEach(
      (g) => (g.userData.moving = true)
    )
    compact(machine)
    stations.forEach((s) =>
      s.group.traverse((o) => {
        o.userData.station = s.id
      })
    )
    const pickables = stations.map((s) => s.group)

    let mode: MachineMode = 'stations',
      cameraMode: MachineCamera = 'overview',
      playing = !reduceMotion,
      simTime = 0,
      spread = 0,
      selected: string = 'engine',
      hovered: string | null = null

    let width = frameWidth(),
      height = frameHeight(),
      mobile = width <= 900,
      lastInteraction = performance.now(),
      dragging = false,
      wasDragged = false,
      downX = 0,
      downY = 0
    let cameraAnimating = true,
      tourTravel: { start: number; end: number; elapsed: number; duration: number } | null = null,
      tourPacketProgress: number | null = null,
      flightTime = 0,
      lastDraw = -1,
      visible = true,
      contextLost = false
    const desiredPosition = new THREE.Vector3(),
      desiredTarget = new THREE.Vector3(0, 1, 0)
    const viewDirection = new THREE.Vector3(10.5, 10.8, 17).normalize()
    let baseDistance = 25,
      sized = false,
      readySent = false
    // Set up camera targets and wait for a measurable scene box before rendering.
    // A zero-size embed (such as a collapsed panel) used to send the camera to infinity: aspect 0
    // put NaN into the uniforms and left the scene black for good. Wait for a real size; the first real
    // size places the camera at once, without a fly-in.
    function layoutCamera() {
      if (!frameWidth() || !frameHeight()) return
      const first = !sized
      sized = true
      width = frameWidth()
      height = frameHeight()
      mobile = width <= 900
      renderer.setSize(width, height)
      camera.aspect = width / height
      // Embedded in a wide landing hero, a shifted frustum centers the object in the right 58%
      // (the host page's headline goes on the left), without moving the orbit target. The full
      // page and narrow frames keep the machine in the middle.
      camera.setViewOffset(
        width,
        height,
        mobile || !embedded ? 0 : -width * 0.21,
        mobile || embedded ? 0 : height * 0.025,
        width,
        height
      )
      const aspect = width / height
      const availableWidth = mobile ? 0.91 : Math.min(0.55, aspect > 2 ? 0.54 : 0.57)
      const horizontalFit =
        17.3 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect * availableWidth)
      const verticalFit =
        11.5 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (embedded ? 0.85 : 0.62))
      baseDistance =
        (Math.max(horizontalFit, verticalFit) * (mobile ? 0.97 : 1)) /
        (embedded ? (mobile ? 1.15 : 1.45) : 1)
      controls.maxDistance = Math.max(55, baseDistance * 1.6)
      camera.updateProjectionMatrix()
      setCameraGoal()
      cameraAnimating = true
      if (first) {
        camera.position.copy(desiredPosition)
        controls.target.copy(desiredTarget)
        controls.update()
        cameraAnimating = false
      }
    }
    function setCameraGoal() {
      const expand = mode === 'stations' ? 1.2 : 1
      if (cameraMode === 'station') {
        const s = stations.find((s) => s.id === selected)!
        desiredTarget.copy(s.group.position).add(new THREE.Vector3(0, 1.25, 0))
        desiredPosition.copy(desiredTarget).addScaledVector(viewDirection, mobile ? 9 : 12)
      } else {
        desiredTarget.set(0, 1, 0)
        const distance = baseDistance * expand
        if (cameraMode === 'side')
          desiredPosition.set(13, 5, 20).normalize().multiplyScalar(distance).add(desiredTarget)
        else if (cameraMode === 'top') desiredPosition.set(0.01, distance, 0.8).add(desiredTarget)
        else desiredPosition.copy(viewDirection).multiplyScalar(distance).add(desiredTarget)
      }
    }
    function closestConveyorProgress(position: THREE.Vector3) {
      let closestProgress = 0
      let closestDistance = Infinity
      const sampleCount = 500
      const sample = new THREE.Vector3()

      for (let index = 0; index < sampleCount; index += 1) {
        const progress = index / sampleCount
        path.getPointAt(progress, sample)
        const dx = sample.x - position.x
        const dz = sample.z - position.z
        const distance = dx * dx + dz * dz

        if (distance < closestDistance) {
          closestDistance = distance
          closestProgress = progress
        }
      }

      return closestProgress
    }
    function syncButtons() {
      root
        .querySelectorAll<HTMLElement>('[data-mode]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)))
      root
        .querySelectorAll<HTMLElement>('[data-camera]')
        .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.camera === cameraMode)))
      $('journey').classList.toggle('visible', mode === 'order')
    }
    const modeAliases: Record<string, MachineMode> = {
      Assembled: 'assembled',
      Cutaway: 'cutaway',
      Stations: 'stations',
      'Portfolio tour': 'order',
      assembled: 'assembled',
      cutaway: 'cutaway',
      stations: 'stations',
      order: 'order',
    }
    const cameraAliases: Record<string, MachineCamera> = {
      Overview: 'overview',
      Side: 'side',
      Top: 'top',
      Station: 'station',
      Flight: 'flight',
      overview: 'overview',
      side: 'side',
      top: 'top',
      station: 'station',
      flight: 'flight',
    }
    function setMode(name: string) {
      if (!Object.hasOwn(modeAliases, name)) return false
      const next = modeAliases[name]
      mode = next
      lastInteraction = performance.now()
      if (mode === 'order') {
        simTime = 0
        lastDraw = -1
        play()
        cameraMode = 'overview'
      } else if (cameraMode === 'station') cameraMode = 'overview'
      setCameraGoal()
      cameraAnimating = true
      syncButtons()
      return true
    }
    function focusStation(id: string) {
      const s = stations.find((s) => s.id === id)
      if (!s) return false
      tourTravel = null
      selected = id
      if (mode === 'order') mode = 'assembled'
      cameraMode = 'station'
      lastInteraction = performance.now()
      setCameraGoal()
      cameraAnimating = true
      syncButtons()
      return true
    }
    function travelToStation(id: string) {
      const destination = stations.find((station) => station.id === id)
      const current = stations.find((station) => station.id === selected)
      if (!destination || !current) return false

      const start = closestConveyorProgress(current.group.position)
      let end = closestConveyorProgress(destination.group.position)
      if (end <= start) end += 1

      selected = id
      mode = 'stations'
      cameraMode = 'station'
      tourPacketProgress = null
      playing = true
      syncPlayback()
      lastInteraction = performance.now()
      tourTravel = { start, end, elapsed: 0, duration: 2.2 }

      path.getPointAt(start, desiredTarget)
      desiredTarget.y += 1.25
      desiredPosition.copy(desiredTarget).addScaledVector(viewDirection, mobile ? 9 : 12)
      cameraAnimating = true
      syncButtons()
      return true
    }
    function setCamera(name: string) {
      if (!Object.hasOwn(cameraAliases, name)) return false
      tourTravel = null
      const next = cameraAliases[name]
      cameraMode = next
      if (mode === 'order') mode = 'assembled'
      lastInteraction = performance.now()
      flightTime = 0
      setCameraGoal()
      cameraAnimating = true
      syncButtons()
      return true
    }
    function syncPlayback() {
      const b = $('play')
      b.setAttribute('aria-label', isMn ? (playing ? 'Хөдөлгөөнийг түр зогсоох' : 'Хөдөлгөөнийг үргэлжлүүлэх') : (playing ? 'Pause the animation' : 'Resume the animation'))
      b.setAttribute('aria-pressed', String(!playing))
      b.innerHTML = playing
        ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2" y="1" width="2.5" height="10" rx=".5"/><rect x="7.5" y="1" width="2.5" height="10" rx=".5"/></svg>'
        : '<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3 1l8 5-8 5z"/></svg>'
    }
    function play() {
      playing = true
      syncPlayback()
      return true
    }
    function pause() {
      playing = false
      syncPlayback()
      return true
    }
    const api: MachineApi = { setMode, focusStation, travelToStation, setCamera, play, pause }
    window.__machine = api
    cleanups.push(() => {
      if (window.__machine === api) delete window.__machine
    })
    root
      .querySelectorAll<HTMLElement>('[data-mode]')
      .forEach((button) => listen(button, 'click', () => setMode(button.dataset.mode ?? '')))
    root
      .querySelectorAll<HTMLElement>('[data-tour-start]')
      .forEach((button) => listen(button, 'click', () => options.onTourStart?.()))
    root
      .querySelectorAll<HTMLElement>('[data-camera]')
      .forEach((button) => listen(button, 'click', () => setCamera(button.dataset.camera ?? '')))
    listen($('play'), 'click', () => (playing ? pause() : play()))
    syncPlayback()
    layoutCamera()
    camera.position.copy(desiredPosition)
    controls.target.copy(desiredTarget)
    controls.update()
    cameraAnimating = false
    listen(window, 'resize', layoutCamera)
    const resizeObserver = new ResizeObserver(() => layoutCamera())
    resizeObserver.observe(root)
    cleanups.push(() => resizeObserver.disconnect())
    controls.addEventListener('start', () => {
      dragging = true
      cameraAnimating = false
      lastInteraction = performance.now()
    })
    controls.addEventListener('end', () => {
      dragging = false
      lastInteraction = performance.now()
    })
    controls.addEventListener('change', () => {
      if (dragging) lastInteraction = performance.now()
    })
    const raycaster = new THREE.Raycaster(),
      pointer = new THREE.Vector2(),
      tooltip = $('tooltip')
    function hitStation(x: number, y: number) {
      pointer.set((x / width) * 2 - 1, (-y / height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(pickables, true)
      return hits.length ? stations.find((s) => s.id === hits[0].object.userData.station) : null
    }
    listen(renderer.domElement, 'pointermove', (e: PointerEvent) => {
      if (Math.hypot((e.clientX - root.getBoundingClientRect().left) - downX, (e.clientY - root.getBoundingClientRect().top) - downY) > 5) wasDragged = true
      if (dragging) return
      const s = hitStation((e.clientX - root.getBoundingClientRect().left), (e.clientY - root.getBoundingClientRect().top))
      hovered = s ? s.id : null
      renderer.domElement.style.cursor = s ? 'pointer' : 'grab'
      tooltip.classList.toggle('visible', !!s)
      if (s) {
        tooltip.querySelector('strong')!.innerHTML =
          `<span>${String(s.index + 1).padStart(2, '0')}</span>${s.name}`
        tooltip.querySelector('p')!.textContent = s.desc
        tooltip.style.left = Math.min(width - 255, Math.max(10, (e.clientX - root.getBoundingClientRect().left) + 16)) + 'px'
        tooltip.style.top = Math.max(10, Math.min(height - 95, (e.clientY - root.getBoundingClientRect().top) - 65)) + 'px'
      }
    })
    listen(renderer.domElement, 'pointerleave', () => {
      hovered = null
      tooltip.classList.remove('visible')
    })
    listen(renderer.domElement, 'pointerdown', (e: PointerEvent) => {
      downX = (e.clientX - root.getBoundingClientRect().left)
      downY = (e.clientY - root.getBoundingClientRect().top)
      wasDragged = false
      tooltip.classList.remove('visible')
    })
    listen(renderer.domElement, 'pointerup', (e: PointerEvent) => {
      if (wasDragged) return
      const s = hitStation((e.clientX - root.getBoundingClientRect().left), (e.clientY - root.getBoundingClientRect().top))
      if (!s) return
      focusStation(s.id)
      options.onStation?.(s.id as StationId)
    })
    listen(document, 'visibilitychange', () => {
      visible = !document.hidden
      lastFrame = performance.now()
    })
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting && !document.hidden
        lastFrame = performance.now()
      },
      { threshold: 0.01 }
    )
    observer.observe(renderer.domElement)
    cleanups.push(() => observer.disconnect())
    listen(renderer.domElement, 'webglcontextlost', (e: Event) => {
      e.preventDefault()
      contextLost = true
      showError(
        'The graphics context was interrupted. The scene comes back on its own once WebGL is available again.'
      )
    })
    listen(renderer.domElement, 'webglcontextrestored', () => {
      contextLost = false
      $('error').style.display = 'none'
      lastFrame = performance.now()
    })

    const scratch = new THREE.Vector3(),
      anchor = new THREE.Vector3()
    const journeySteps = [
      ['Introduction', 'A little about me and my portfolio'],
      ['About me', 'Information systems student / curious builder'],
      ['Skills', 'Web / networking / analysis / quality'],
      ['Projects', 'Selected coursework and practical work'],
      ['Contact', 'Ideas and collaboration'],
    ]
    let prevJourney = -1,
      lastFrame = performance.now(),
      frameCount = 0,
      measureTime = 0,
      pixelRatio = renderer.getPixelRatio()
    let rafId = 0
    function animate(now: number) {
      rafId = requestAnimationFrame(animate)
      const dt = Math.max(0, Math.min((now - lastFrame) / 1000, 0.045))
      lastFrame = now
      if (!visible || contextLost) return
      if (playing) {
        simTime += dt
        flightTime += dt
      }
      const t = simTime,
        beat = (t / 4) % 1,
        tact = (t * TAU) / 4,
        smooth = 1 - Math.exp(-dt * 5)
      spread = THREE.MathUtils.lerp(spread, mode === 'stations' ? 1 : 0, smooth)
      cutPlane.constant = THREE.MathUtils.lerp(
        cutPlane.constant,
        mode === 'cutaway' ? 0.99 : 10,
        smooth
      )
      stations.forEach((s, i) => {
        s.group.position.copy(s.base)
        s.group.position.x *= 1 + spread * 0.29
        s.group.position.z *= 1 + spread * 0.37
        s.group.position.y += spread * (i % 2 ? 0.32 : 0.55)
        const pulse = Math.pow(Math.max(0, Math.sin(tact - i * 0.9)), 7)
        s.glowMat.emissiveIntensity = THREE.MathUtils.lerp(
          s.glowMat.emissiveIntensity,
          hovered === s.id || (cameraMode === 'station' && selected === s.id)
            ? 3.5
            : 0.55 + pulse * 0.65,
          smooth
        )
      })
      belt.scale.set(1 + spread * 0.12, 1, 1 + spread * 0.15)
      pipes.scale.set(1 + spread * 0.25, 1, 1 + spread * 0.3)
      gears.forEach(({ g, vertical }, i) => {
        if (vertical) g.rotation.z = t * (i % 2 ? -1 : 1) * 1.1
        else g.rotation.y = t * (i % 2 ? -1 : 1) * 1.1
      })
      reels.forEach((r, i) => (r.rotation.z = -t * (i ? 0.65 : 0.85)))
      printhead.position.x = Math.sin(tact) * 0.42
      printhead.position.y = 1.55 + Math.sin(tact * 2) * 0.055
      outputVideo.position.y = beat * 0.25
      flyPost.position.y = 1.45 + Math.sin(tact) * 0.04
      const orderPhase = (t / 24) % 1,
        cashBeat = mode === 'order' ? THREE.MathUtils.clamp((orderPhase - 0.88) / 0.12, 0, 1) : beat
      receipt.visible = coin.visible = mode !== 'order' || orderPhase > 0.88
      receipt.scale.y = 0.2 + Math.min(1, cashBeat * 1.5) * 0.8
      coin.position.set(1.04, 2.7 - Math.min(1, cashBeat * 1.7) ** 2 * 2.17, 0.55)
      coin.rotation.y = t * 3.5
      coin.scale.setScalar(cashBeat > 0.9 ? 1 - (cashBeat - 0.9) * 8 : 1)
      const incomingBeat = mode === 'order' ? Math.min(1, orderPhase / 0.15) : beat
      incoming.visible = mode !== 'order' || orderPhase < 0.15
      incoming.position.set(
        Math.sin(incomingBeat * Math.PI) * 0.24,
        2.9 - incomingBeat * 1.9,
        1.1 - incomingBeat * 0.55
      )
      incoming.rotation.z = Math.sin(incomingBeat * Math.PI) * -0.14
      incoming.scale.setScalar(Math.min(1, incomingBeat * 8 + 0.15, (1 - incomingBeat) * 7 + 0.1))
      toggles.forEach((o, i) => (o.rotation.x = Math.sin(tact + i) > 0 ? -0.4 : 0.4))
      if (t - lastDraw > 1 / 18 || lastDraw < 0) {
        drawVideo(t)
        drawQueue(t)
        queue.texture.needsUpdate = true
        updateBelt(t)
        lastDraw = t
      }
      packets.forEach((packet, i) => {
        const phase = (t / 24 + i / 6) % 1
        packet.phase = phase
        let stage
        if (phase < 0.15) {
          stage = 0
          const f = phase / 0.15
          packet.group.position.copy(stations[3].group.position).add(new THREE.Vector3(0, 1.6, 0.6))
          scratch.copy(stations[0].group.position).add(new THREE.Vector3(0, 1.3, 0.65))
          packet.group.position.lerp(scratch, f)
          packet.group.position.y += Math.sin(f * Math.PI) * 2
          packet.group.rotation.set(0, Math.sin(f * Math.PI) * 0.28, Math.sin(f * Math.PI) * -0.1)
        } else {
          const u = ((phase - 0.15) / 0.85) * cashU
          path.getPointAt(u, packet.group.position)
          packet.group.position.x *= 1 + spread * 0.12
          packet.group.position.z *= 1 + spread * 0.15
          packet.group.position.y += 0.43
          packet.group.rotation.set(0, 0.18, 0)
          stage = u < adminU * 0.7 ? 1 : u < storeU * 0.96 ? 2 : u < cashU * 0.83 ? 3 : 4
        }
        if (i === 0) {
          if (tourTravel) {
            const progress = Math.min(tourTravel.elapsed / tourTravel.duration, 1)
            const easedProgress = progress * progress * (3 - 2 * progress)
            tourPacketProgress = (tourTravel.start + (tourTravel.end - tourTravel.start) * easedProgress) % 1
          }
          if (tourPacketProgress !== null) {
            path.getPointAt(tourPacketProgress, packet.group.position)
            packet.group.position.x *= 1 + spread * 0.12
            packet.group.position.z *= 1 + spread * 0.15
            packet.group.position.y += 0.43
            packet.group.rotation.set(0, 0.18, 0)
            stage = tourPacketProgress < adminU * 0.7 ? 1 : tourPacketProgress < storeU * 0.96 ? 2 : tourPacketProgress < cashU * 0.83 ? 3 : 4
          }
        }
        if (packet.stage !== stage) {
          packet.faces.forEach((f, j) => (f.visible = j === stage))
          packet.stage = stage
        }
        packet.group.visible = mode !== 'order' || i === 0
        packet.halo.visible = mode === 'order' && i === 0
        packet.group.scale.setScalar(mode === 'order' ? 1.35 : 1)
        if (phase > 0.94) packet.group.scale.multiplyScalar(Math.max(0.05, (1 - phase) / 0.06))
      })
      if (mode === 'order') {
        const packet = packets[0],
          step = packet.stage
        if (step !== prevJourney) {
          $('journey-title').textContent = journeySteps[step][0]
          $('journey-detail').textContent = journeySteps[step][1]
          prevJourney = step
        }
        $('journey-progress').style.width = packet.phase * 100 + '%'
        if (!dragging && playing) {
          desiredTarget.copy(packet.group.position)
          desiredPosition.copy(desiredTarget).addScaledVector(viewDirection, mobile ? 10 : 15)
          cameraAnimating = true
        }
      } else if (cameraMode === 'flight' && playing && !dragging) {
        const a = flightTime * 0.12,
          d = baseDistance * (mode === 'stations' ? 1.2 : 1)
        desiredTarget.set(0, 1, 0)
        desiredPosition
          .set(
            Math.sin(a + 0.55) * d * 0.83,
            d * (0.5 + Math.sin(a * 0.7) * 0.09),
            Math.cos(a + 0.55) * d * 0.83
          )
          .add(desiredTarget)
        cameraAnimating = true
      } else if (tourTravel && cameraMode === 'station' && !dragging) {
        tourTravel.elapsed += dt
        const progress = Math.min(tourTravel.elapsed / tourTravel.duration, 1)
        const easedProgress = progress * progress * (3 - 2 * progress)
        const routeProgress = (tourTravel.start + (tourTravel.end - tourTravel.start) * easedProgress) % 1
        tourPacketProgress = routeProgress

        path.getPointAt(routeProgress, desiredTarget)
        desiredTarget.y += 1.25
        desiredPosition.copy(desiredTarget).addScaledVector(viewDirection, mobile ? 9 : 12)
        cameraAnimating = true

        if (progress === 1) {
          tourTravel = null
          setCameraGoal()
          pause()
        }
      } else if (cameraMode === 'station' && cameraAnimating) setCameraGoal()
      if (cameraAnimating && !dragging) {
        const speed = 1 - Math.exp(-dt * (mode === 'order' ? 2.2 : 3))
        camera.position.lerp(desiredPosition, speed)
        controls.target.lerp(desiredTarget, speed)
        if (
          cameraMode !== 'flight' &&
          mode !== 'order' &&
          camera.position.distanceTo(desiredPosition) < 0.015 &&
          controls.target.distanceTo(desiredTarget) < 0.015
        )
          cameraAnimating = false
      }
      controls.autoRotate =
        playing &&
        !reduceMotion &&
        !dragging &&
        !cameraAnimating &&
        mode !== 'order' &&
        cameraMode === 'overview' &&
        now - lastInteraction > 6500
      controls.autoRotateSpeed = 0.24
      controls.update(dt)
      // Project station callouts after the camera update, clamping them inside the iframe.
      stations.forEach((s, i) => {
        const show = mode === 'stations'
        s.label.classList.toggle('visible', show)
        if (!show) return
        anchor.copy(s.group.position).add(s.anchor).project(camera)
        const offsets = mobile
          ? [
              [-30, 25],
              [-27, -50],
              [15, -65],
              [16, -1],
              [-5, 52],
            ]
          : [
              [-48, -14],
              [-8, -64],
              [30, -12],
              [30, 20],
              [-12, 40],
            ]
        let x = (anchor.x * 0.5 + 0.5) * width - 40 + offsets[i][0],
          y = (-anchor.y * 0.5 + 0.5) * height - 52 + offsets[i][1]
        // Embedded in a wide hero the callouts stay out of the headline side (the left 42.5%).
        x = THREE.MathUtils.clamp(
          x,
          mobile || !embedded ? 9 : width * 0.425,
          width - (mobile ? 123 : 165)
        )
        y = THREE.MathUtils.clamp(y, 130, height - 200)
        s.label.style.transform = `translate(${x}px,${y}px)`
      })
      renderer.render(scene, camera)
      // The first real frame is ready: the host page can fade the scene in or drop its poster.
      if (!readySent && sized) {
        readySent = true
        options.onReady?.()
      }
      // Reduce only raster resolution on sustained slow devices; geometry and timing stay identical.
      if (playing) {
        frameCount++
        measureTime += dt
        if (measureTime > 4) {
          if (frameCount / measureTime < 43 && pixelRatio > 1) {
            pixelRatio = Math.max(1, pixelRatio - 0.25)
            renderer.setPixelRatio(pixelRatio)
          }
          frameCount = 0
          measureTime = 0
        }
      }
    }
    rafId = requestAnimationFrame(animate)
    cleanups.push(() => {
      cancelAnimationFrame(rafId)
      controls.dispose()
      // Free every GPU resource the scene created, then the context itself.
      const textures = new Set<THREE.Texture>()
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (mesh.geometry) mesh.geometry.dispose()
        const list = mesh.material
          ? Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material]
          : []
        for (const material of list) {
          for (const value of Object.values(material))
            if (value instanceof THREE.Texture) textures.add(value)
          material.dispose()
        }
      })
      geometries.forEach((g) => g.dispose())
      textures.forEach((t) => t.dispose())
      env.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    })
    renderer.compile(scene, camera)

    $('loading').classList.add('done')
    $('error').style.display = 'none'
    // Public scene API, playback controls, and cleanup.
    Object.defineProperty(window, '__machineDebug', {
      value: {
        getState: () => ({
          mode,
          camera: cameraMode,
          playing,
          time: simTime,
          spread,
          cutHeight: cutPlane.constant,
          width,
          height,
          embedded,
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          pixelRatio: renderer.getPixelRatio(),
          stations: stations.map((s) => {
            const p = s.group.position
              .clone()
              .add(new THREE.Vector3(0, 1, 0))
              .project(camera)
            return { id: s.id, x: (p.x * 0.5 + 0.5) * width, y: (-0.5 * p.y + 0.5) * height }
          }),
        }),
      },
      configurable: true,
    })
    cleanups.push(() => {
      delete window.__machineDebug
    })
  } catch (error) {
    console.error('Machine: failed to start', error)
    const detail = error instanceof Error ? error.message : String(error)
    showError(detail ? `The 3D scene failed to start: ${detail}` : undefined)
  }
  return dispose
}

