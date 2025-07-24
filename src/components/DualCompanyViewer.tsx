"use client"

import type React from "react"
import { useRef, useEffect, useLayoutEffect, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Maximize2, RotateCcw, Download, Settings, Eye, Split, Layers } from "lucide-react"
import { getDualCompanyAssets, getSerialAssets, loadDualCompanyPointClouds, type PointCloudData } from "../utils/dataLoader"

interface DualCompanyViewerProps {
  serialNumber: string
  frameId: number
  showPointCloud: boolean
  viewMode: "single-original" | "single-kr" | "split" | "overlay"
  onViewModeChange: (mode: "single-original" | "single-kr" | "split" | "overlay") => void
}

export const DualCompanyViewer: React.FC<DualCompanyViewerProps> = ({
  serialNumber,
  frameId,
  showPointCloud,
  viewMode,
  onViewModeChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const leftMountRef = useRef<HTMLDivElement>(null)
  const rightMountRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState<{ [key: string]: number }>({})
  const [pointCounts, setPointCounts] = useState<{ [key: string]: number }>({})
  // Store 5 image URLs per company (front, back, left, right, top)
  const [imageUrls, setImageUrls] = useState<{ [company: string]: { [view: string]: string } }>({})
  const [imageErrors, setImageErrors] = useState<{ [key: string]: string | null }>({})
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({})
  const [loadingMessage, setLoadingMessage] = useState("Loading Dual Company Data...")
  const [fileSizes, setFileSizes] = useState<{ [key: string]: string }>({})

  // Scene references for different view modes
  const singleSceneRef = useRef<THREE.Scene | null>(null)
  const leftSceneRef = useRef<THREE.Scene | null>(null)
  const rightSceneRef = useRef<THREE.Scene | null>(null)
  const singleRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const leftRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const rightRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mountRef.current && !leftMountRef.current && !rightMountRef.current) return

    setIsLoading(true)
    setImageLoaded({})
    setImageErrors({}) // Reset image error state on serial/view change
    setLoadingProgress({})

    // Get assets for both companies using getSerialAssets
    const originalAssets = getSerialAssets("preprocessing", serialNumber, "Original Source Factory Corporation");
    const krAssets = getSerialAssets("preprocessing", serialNumber, "Metabread Co., Ltd.");
    setImageUrls({
      "Original Source Factory Corporation": originalAssets.images,
      "Metabread Co., Ltd.": krAssets.images,
    });
    console.log('[DualCompanyViewer] imageUrls:', {
      "Original Source Factory Corporation": originalAssets.images,
      "Metabread Co., Ltd.": krAssets.images,
    });

    if (showPointCloud) {
      initializeDualVisualization()
    } else {
      setTimeout(() => setIsLoading(false), 500)
    }

    return () => {
      cleanup()
    }
  }, [serialNumber, frameId, showPointCloud, viewMode])

  // Add refs to track OrbitControls for proper disposal
const singleControlsRef = useRef<any>(null)
const leftControlsRef = useRef<any>(null)
const rightControlsRef = useRef<any>(null)

const cleanup = () => {
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current)
  }

  // Dispose OrbitControls explicitly
  if (singleControlsRef.current) {
    singleControlsRef.current.dispose()
    singleControlsRef.current = null
  }
  if (leftControlsRef.current) {
    leftControlsRef.current.dispose()
    leftControlsRef.current = null
  }
  if (rightControlsRef.current) {
    rightControlsRef.current.dispose()
    rightControlsRef.current = null
  }

  // Explicitly clear all mount containers to prevent leftover renderers/controls
  if (mountRef.current) {
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
  }
  if (leftMountRef.current) {
    while (leftMountRef.current.firstChild) {
      leftMountRef.current.removeChild(leftMountRef.current.firstChild);
    }
  }
  if (rightMountRef.current) {
    while (rightMountRef.current.firstChild) {
      rightMountRef.current.removeChild(rightMountRef.current.firstChild);
    }
  }
  ;[singleRendererRef, leftRendererRef, rightRendererRef].forEach((rendererRef, index) => {
    if (rendererRef.current) {
      const mountElement = index === 0 ? mountRef.current : index === 1 ? leftMountRef.current : rightMountRef.current
      if (mountElement && rendererRef.current.domElement) {
        // Already removed above, but just in case
        try { mountElement.removeChild(rendererRef.current.domElement) } catch { }
      }
      rendererRef.current.dispose()
      rendererRef.current = null
    }
  })
  ;[singleSceneRef, leftSceneRef, rightSceneRef].forEach((sceneRef) => {
    if (sceneRef.current) {
      sceneRef.current.clear()
      sceneRef.current = null
    }
  })
}


  const initializeDualVisualization = async () => {
    console.log('[DualCompanyViewer] initializeDualVisualization - viewMode:', viewMode)
    cleanup()
    
    // Add a small delay to ensure cleanup is complete before initializing new view
    await new Promise(resolve => setTimeout(resolve, 50))

    if (viewMode === "split") {
      console.log('[DualCompanyViewer] Initializing split view')
      await initializeSplitView()
    } else {
      console.log('[DualCompanyViewer] Initializing single view')
      await initializeSingleView()
    }
  }

  const initializeSingleView = async () => {
    if (!mountRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0a)
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200)
    singleSceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(-15, 6, 15)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    singleRendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Add lighting
    setupLighting(scene)

    // Load point cloud data based on view mode
    const pointClouds = await loadPointCloudForViewMode()

    if (pointClouds) {
      if (Array.isArray(pointClouds)) {
        pointClouds.forEach((pc) => scene.add(pc))
      } else {
        scene.add(pointClouds)
      }
    }

    // Add grid and axes
    const gridHelper = new THREE.GridHelper(40, 40, 0x333333, 0x1a1a1a)
    gridHelper.material.opacity = 0.6
    gridHelper.material.transparent = true
    scene.add(gridHelper)

    const axesHelper = new THREE.AxesHelper(8)
    scene.add(axesHelper)

    setIsLoading(false)
    startAnimation(camera, renderer, scene)
  }

  const initializeSplitView = async () => {
    console.log('[DualCompanyViewer] initializeSplitView - leftMountRef:', leftMountRef.current, 'rightMountRef:', rightMountRef.current)
    
    // Wait for DOM elements and their dimensions to be ready
    let retries = 0;
    while (retries < 20) {
      if (
        leftMountRef.current &&
        rightMountRef.current &&
        leftMountRef.current.clientWidth > 0 &&
        rightMountRef.current.clientWidth > 0 &&
        leftMountRef.current.clientHeight > 0 &&
        rightMountRef.current.clientHeight > 0
      ) {
        break;
      }
      console.log(`[DualCompanyViewer] Waiting for split view mount refs/dimensions, retry ${retries + 1}`)
      await new Promise((resolve) => setTimeout(resolve, 100))
      retries++
    }

    if (
      !leftMountRef.current ||
      !rightMountRef.current ||
      leftMountRef.current.clientWidth === 0 ||
      rightMountRef.current.clientWidth === 0
    ) {
      console.error('[DualCompanyViewer] Split view mount refs/dimensions not ready after retries');
      setIsLoading(false); // prevent infinite loading overlay
      return
    }

    // Initialize left scene (Original Source Factory Corporation)
    const leftScene = new THREE.Scene()
    leftScene.background = new THREE.Color(0x0a0a0a)
    leftSceneRef.current = leftScene

    const leftCamera = new THREE.PerspectiveCamera(
      60,
      leftMountRef.current.clientWidth / leftMountRef.current.clientHeight,
      0.1,
      1000,
    )
    leftCamera.position.set(-15, 6, 15)
    leftCamera.lookAt(0, 0, 0)

    const leftRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    leftRenderer.setSize(leftMountRef.current.clientWidth, leftMountRef.current.clientHeight)
    leftRendererRef.current = leftRenderer
    leftMountRef.current.appendChild(leftRenderer.domElement)

    // Initialize right scene (Metabread Co., Ltd.)
    const rightScene = new THREE.Scene()
    rightScene.background = new THREE.Color(0x0a0a0a)
    rightSceneRef.current = rightScene

    const rightCamera = new THREE.PerspectiveCamera(
      60,
      rightMountRef.current.clientWidth / rightMountRef.current.clientHeight,
      0.1,
      1000,
    )
    rightCamera.position.set(-15, 6, 15)
    rightCamera.lookAt(0, 0, 0)

    const rightRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    rightRenderer.setSize(rightMountRef.current.clientWidth, rightMountRef.current.clientHeight)
    rightRendererRef.current = rightRenderer
    rightMountRef.current.appendChild(rightRenderer.domElement)

    // Setup lighting for both scenes
    setupLighting(leftScene)
    setupLighting(rightScene)

    // Load point clouds for both companies
    const dualData = await loadDualCompanyPointClouds(serialNumber, (company, progress) => {
      setLoadingProgress((prev) => ({ ...prev, [company]: progress }))
    })

    // Add Original Source Factory Corporation data to left scene
    if (dualData.originalSource) {
      const leftPointCloud = await createPointCloudFromData(dualData.originalSource, "Original Source Factory Corporation")
      if (leftPointCloud) {
        leftPointCloud.position.x = -5; // shift left cloud to left side
        leftScene.add(leftPointCloud);
      }
    } else {
      const fallbackLeft = createFallbackPointCloud("Original Source Factory Corporation")
      fallbackLeft.position.x = -5;
      leftScene.add(fallbackLeft)
    }

    // Add Metabread Co., Ltd. data to right scene
    if (dualData.kr) {
      const rightPointCloud = await createPointCloudFromData(dualData.kr, "Metabread Co., Ltd.")
      if (rightPointCloud) {
        rightPointCloud.position.x = 5; // shift right cloud to right side
        rightScene.add(rightPointCloud);
      }
    } else {
      const fallbackRight = createFallbackPointCloud("Metabread Co., Ltd.")
      fallbackRight.position.x = 5;
      rightScene.add(fallbackRight)
    }
    // Add grids to both scenes
    ;[leftScene, rightScene].forEach((scene) => {
      const gridHelper = new THREE.GridHelper(40, 40, 0x333333, 0x1a1a1a)
      gridHelper.material.opacity = 0.6
      gridHelper.material.transparent = true
      scene.add(gridHelper)

      const axesHelper = new THREE.AxesHelper(8)
      scene.add(axesHelper)
    })

    setIsLoading(false)
    startSplitAnimation(leftCamera, leftRenderer, leftScene, rightCamera, rightRenderer, rightScene)
  }

  const loadPointCloudForViewMode = async () => {
    const assets = getDualCompanyAssets(serialNumber)

    switch (viewMode) {
      case "single-original":
        setLoadingMessage("Loading Original Source Factory Corporation Data...")
        const originalData = await loadDualCompanyPointClouds(serialNumber)
        if (originalData.originalSource) {
          return await createPointCloudFromData(originalData.originalSource, "Original Source Factory Corporation")
        }
        return createFallbackPointCloud("Original Source Factory Corporation")

      case "single-kr":
        setLoadingMessage("Loading Metabread Co., Ltd. Data...")
        const krData = await loadDualCompanyPointClouds(serialNumber)
        if (krData.kr) {
          return await createPointCloudFromData(krData.kr, "Metabread Co., Ltd.")
        }
        return createFallbackPointCloud("Metabread Co., Ltd.")

      case "overlay":
        setLoadingMessage("Loading Both Companies Data for Overlay...")
        const bothData = await loadDualCompanyPointClouds(serialNumber)
        const pointClouds = []

        if (bothData.originalSource) {
          const originalPC = await createPointCloudFromData(bothData.originalSource, "Original Source Factory Corporation")
          if (originalPC) {
            originalPC.position.x = -5 // Offset for clarity
            pointClouds.push(originalPC)
          }
        }

        if (bothData.kr) {
          const krPC = await createPointCloudFromData(bothData.kr, "Metabread Co., Ltd.")
          if (krPC) {
            krPC.position.x = 5 // Offset for clarity
            pointClouds.push(krPC)
          }
        }

        return pointClouds.length > 0 ? pointClouds : [createFallbackPointCloud("Combined")]

      default:
        return createFallbackPointCloud("Default")
    }
  }

  const createPointCloudFromData = async (data: PointCloudData, company: string) => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(data.vertices, 3))

    if (data.colors) {
      geometry.setAttribute("color", new THREE.BufferAttribute(data.colors, 3))
    }

    // Company-specific coloring
    const baseColor = company === "Metabread Co., Ltd." ? 0x4a90e2 : 0xe24a4a

    const material = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: data.colors ? true : false,
      color: data.colors ? undefined : baseColor,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      alphaTest: 0.1,
    })

    setPointCounts((prev) => ({ ...prev, [company]: data.pointCount }))
    const points = new THREE.Points(geometry, material)
    points.rotation.x = -Math.PI / 2

    return points
  }

  const createFallbackPointCloud = (company: string) => {
    const geometry = new THREE.BufferGeometry()
    const pointCount = 150000
    const positions = new Float32Array(pointCount * 3)
    const colors = new Float32Array(pointCount * 3)

    // Company-specific color scheme
    const isKR = company === "Metabread Co., Ltd."
    const baseColorR = isKR ? 0.2 : 0.8
    const baseColorG = isKR ? 0.4 : 0.2
    const baseColorB = isKR ? 0.8 : 0.2

    for (let i = 0; i < pointCount; i++) {
      const x = (Math.random() - 0.5) * 12 + Math.sin(i * 0.01) * 3
      const y = Math.random() * 1.8 + Math.sin(i * 0.02) * 0.3
      const z = (Math.random() - 0.5) * 6 + Math.cos(i * 0.01) * 2

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const heightRatio = y / 2
      const distance = Math.sqrt(x * x + z * z)
      const intensity = Math.max(0.3, 1 - distance * 0.03)

      colors[i * 3] = baseColorR + heightRatio * 0.6 * intensity
      colors[i * 3 + 1] = baseColorG + heightRatio * 0.8 * intensity
      colors[i * 3 + 2] = baseColorB + heightRatio * 0.4 * intensity
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
      alphaTest: 0.1,
    })

    setPointCounts((prev) => ({ ...prev, [company]: pointCount }))
    const points = new THREE.Points(geometry, material)
    points.rotation.x = -Math.PI / 2

    return points
  }

  const setupLighting = (scene: THREE.Scene) => {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(-15, 15, 8)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.4)
    rimLight.position.set(-20, 8, 5)
    scene.add(rimLight)
  }

  const startAnimation = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, scene: THREE.Scene) => {
    // Dispose any previous controls
    if (singleControlsRef.current) {
      singleControlsRef.current.dispose();
      singleControlsRef.current = null;
    }
    // Add OrbitControls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = false
    controls.autoRotate = false // Disable auto-rotation
    controls.enableZoom = true
    controls.enablePan = true
    singleControlsRef.current = controls;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()
  }

  const startSplitAnimation = (
    leftCamera: THREE.PerspectiveCamera,
    leftRenderer: THREE.WebGLRenderer,
    leftScene: THREE.Scene,
    rightCamera: THREE.PerspectiveCamera,
    rightRenderer: THREE.WebGLRenderer,
    rightScene: THREE.Scene,
  ) => {
    // Dispose any previous controls
    if (leftControlsRef.current) {
      leftControlsRef.current.dispose();
      leftControlsRef.current = null;
    }
    if (rightControlsRef.current) {
      rightControlsRef.current.dispose();
      rightControlsRef.current = null;
    }
    // Add OrbitControls for both viewers
    const leftControls = new OrbitControls(leftCamera, leftRenderer.domElement)
    leftControls.enableDamping = true
    leftControls.dampingFactor = 0.05
    leftControls.screenSpacePanning = false
    leftControls.autoRotate = false // Disable auto-rotation
    leftControls.enableZoom = true
    leftControls.enablePan = true
    leftControlsRef.current = leftControls;

    const rightControls = new OrbitControls(rightCamera, rightRenderer.domElement)
    rightControls.enableDamping = true
    rightControls.dampingFactor = 0.05
    rightControls.screenSpacePanning = false
    rightControls.autoRotate = false // Disable auto-rotation
    rightControls.enableZoom = true
    rightControls.enablePan = true
    rightControlsRef.current = rightControls;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      leftControls.update()
      rightControls.update()
      leftRenderer.render(leftScene, leftCamera)
      rightRenderer.render(rightScene, rightCamera)
    }
    animate()
  }

  const renderViewModeControls = () => (
    <div className="absolute top-4 right-4 flex flex-col space-y-2">
      <div className="flex space-x-2">
        <button
          onClick={() => onViewModeChange("single-original")}
          className={`p-2 rounded-lg border transition-colors ${
            viewMode === "single-original"
              ? "bg-red-600 border-red-500 text-white"
              : "bg-black/80 border-gray-700 text-gray-300 hover:bg-black/90"
          }`}
          title="Show Only: Original Source Factory Corporation"
        >
          <span className="font-bold">Original</span>
        </button>
        <button
          onClick={() => onViewModeChange("single-kr")}
          className={`p-2 rounded-lg border transition-colors ${
            viewMode === "single-kr"
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-black/80 border-gray-700 text-gray-300 hover:bg-black/90"
          }`}
          title="Show Only: Metabread Co., Ltd."
        >
          <span className="font-bold">Metabread</span>
        </button>

      </div>

      {/* Standard controls */}
      <div className="flex space-x-2">
        <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
          <Maximize2 className="w-4 h-4 text-gray-300" />
        </button>
        <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
          <RotateCcw className="w-4 h-4 text-gray-300" />
        </button>
        <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
          <Download className="w-4 h-4 text-gray-300" />
        </button>
      </div>
    </div>
  )

  const renderInfoPanel = () => (
    <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white text-sm border border-gray-700">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Serial:</span>
          <span className="font-mono text-blue-400">{serialNumber}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Frame:</span>
          <span className="text-green-400 font-medium">{frameId}/30</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">View Mode:</span>
          <span className="text-purple-400">
            {viewMode === "single-original"
              ? "Original Source Factory Corporation"
              : viewMode === "single-kr"
                ? "Metabread Co., Ltd."
                : viewMode === "split"
                  ? "Split View"
                  : "Overlay"}
          </span>
        </div>
        {showPointCloud && (
          <>
            {Object.entries(pointCounts).map(([company, count]) => (
              <div key={company} className="flex items-center justify-between">
                <span className="text-gray-400">{company === "Metabread Co., Ltd." ? "Metabread Co., Ltd. Points" : "Original Points"}:</span>
                <span className="text-yellow-400">{count.toLocaleString()}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )

  if (!showPointCloud) {
    const views = ["front", "back", "front-right", "front-left", "back-right", "back-left"];
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          {(
              viewMode === "single-original"
                ? Object.entries(imageUrls).filter(([c]) => c === "Original Source Factory Corporation")
                : viewMode === "single-kr"
                  ? Object.entries(imageUrls).filter(([c]) => c === "Metabread Co., Ltd.")
                  : Object.entries(imageUrls)
            ).map(([company, urls]) => (
            <div key={company} className="bg-gray-800 rounded-lg p-4 shadow-lg ring-1 ring-gray-700/50 flex flex-col">
              <h3 className="text-center text-base font-semibold text-white mb-4 border-b border-gray-700 pb-2">{company}</h3>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 flex-1">
                {views.map((view) => {
                  const errorKey = `${company}-${view}`;
                  return (
                    <div key={view} className="relative pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden group">
                      {imageErrors[errorKey] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                          <div className="text-xs font-semibold">Image not found</div>
                          <div className="text-[10px]">{company} {view}</div>
                        </div>
                      ) : (
                        <img
                          key={`${serialNumber}-${frameId}-${company}-${view}`}
                          src={urls[view] || "/placeholder.svg"}
                          alt={`${company} ${view}`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onLoad={() => {
                            setImageLoaded((prev) => ({ ...prev, [errorKey]: true }));
                            console.log(`[DualCompanyViewer] Image loaded:`, urls[view], errorKey);
                          }}
                          onError={() => {
                            setImageErrors((prev) => ({ ...prev, [errorKey]: 'Image not found or failed to load.' }));
                            console.error(`[DualCompanyViewer] Image failed to load:`, urls[view], errorKey);
                          }}
                        />
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                        {view}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
           );
  }

  console.log('[DualCompanyViewer] Rendering with viewMode:', viewMode)
  
  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Only render the correct containers for each mode to avoid overlap and leftover canvases */}
      {viewMode === "split" ? (
        <div className="flex w-full h-full">
          <div className="w-1/2 relative border-r border-gray-700">
            <div ref={leftMountRef} className="w-full h-full" />
            <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded text-white text-sm">
              Original Source Factory Corporation
            </div>
          </div>
          <div className="w-1/2 relative">
            <div ref={rightMountRef} className="w-full h-full" />
            <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 rounded text-white text-sm">Metabread Co., Ltd.</div>
          </div>
        </div>
      ) : (
        <div ref={mountRef} className="w-full h-full" />
      )}
      {/* End conditional view containers */}

      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white font-medium">{loadingMessage}</div>
            {Object.entries(loadingProgress).map(([company, progress]) => (
              <div key={company} className="text-gray-400 text-sm mt-1">
                {company}: {progress}%
              </div>
            ))}
          </div>
        </div>
      )}

      {renderViewModeControls()}
      {renderInfoPanel()}
    </div>
  )
}

