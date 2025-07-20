"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { Maximize2, RotateCcw, Download, Settings, Eye, Split, Layers } from "lucide-react"
import { getDualCompanyAssets, loadDualCompanyPointClouds, type PointCloudData } from "../utils/dataLoader"

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
    setLoadingProgress({})

    // Get assets for both companies
    const assets = getDualCompanyAssets(serialNumber)
    // Helper to generate 5 image urls given base image url (assumes naming convention)
    const generateImageSet = (baseUrl: string) => {
      const baseWithoutExt = baseUrl.replace(/\.[^/.]+$/, "")
      return {
        front: `${baseWithoutExt}-front.jpg`,
        back: `${baseWithoutExt}-back.jpg`,
        left: `${baseWithoutExt}-left.jpg`,
        right: `${baseWithoutExt}-right.jpg`,
        top: `${baseWithoutExt}-top.jpg`,
      }
    }

    setImageUrls({
      "Original Source Factory Corporation": generateImageSet(assets.originalSource.imageUrl),
      "Metabread Co., Ltd.": generateImageSet(assets.kr.imageUrl),
    })

    if (showPointCloud) {
      initializeDualVisualization()
    } else {
      setTimeout(() => setIsLoading(false), 500)
    }

    return () => {
      cleanup()
    }
  }, [serialNumber, frameId, showPointCloud, viewMode])

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    ;[singleRendererRef, leftRendererRef, rightRendererRef].forEach((rendererRef, index) => {
      if (rendererRef.current) {
        const mountElement = index === 0 ? mountRef.current : index === 1 ? leftMountRef.current : rightMountRef.current
        if (mountElement && rendererRef.current.domElement) {
          mountElement.removeChild(rendererRef.current.domElement)
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
    cleanup()

    if (viewMode === "split") {
      await initializeSplitView()
    } else {
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
    if (!leftMountRef.current || !rightMountRef.current) return

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
      if (leftPointCloud) leftScene.add(leftPointCloud)
    } else {
      const fallbackLeft = createFallbackPointCloud("Original Source Factory Corporation")
      leftScene.add(fallbackLeft)
    }

    // Add Metabread Co., Ltd. data to right scene
    if (dualData.kr) {
      const rightPointCloud = await createPointCloudFromData(dualData.kr, "Metabread Co., Ltd.")
      if (rightPointCloud) rightScene.add(rightPointCloud)
    } else {
      const fallbackRight = createFallbackPointCloud("Metabread Co., Ltd.")
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
    let time = 0
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      time += 0.005

      const radius = 20
      const offsetX = -8
      camera.position.x = Math.cos(time) * radius + offsetX
      camera.position.z = Math.sin(time) * radius
      camera.position.y = 6 + Math.sin(time * 0.5) * 2
      camera.lookAt(0, 0, 0)

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
    let time = 0
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      time += 0.005

      const radius = 20
      const offsetX = -8

      // Synchronize camera movements
      ;[leftCamera, rightCamera].forEach((camera) => {
        camera.position.x = Math.cos(time) * radius + offsetX
        camera.position.z = Math.sin(time) * radius
        camera.position.y = 6 + Math.sin(time * 0.5) * 2
        camera.lookAt(0, 0, 0)
      })

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
          title="Original Source Factory Corporation Only"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("single-kr")}
          className={`p-2 rounded-lg border transition-colors ${
            viewMode === "single-kr"
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-black/80 border-gray-700 text-gray-300 hover:bg-black/90"
          }`}
          title="Metabread Co., Ltd. Only"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("split")}
          className={`p-2 rounded-lg border transition-colors ${
            viewMode === "split"
              ? "bg-green-600 border-green-500 text-white"
              : "bg-black/80 border-gray-700 text-gray-300 hover:bg-black/90"
          }`}
          title="Split View"
        >
          <Split className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("overlay")}
          className={`p-2 rounded-lg border transition-colors ${
            viewMode === "overlay"
              ? "bg-purple-600 border-purple-500 text-white"
              : "bg-black/80 border-gray-700 text-gray-300 hover:bg-black/90"
          }`}
          title="Overlay View"
        >
          <Layers className="w-4 h-4" />
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
    const views = ["front", "back", "left", "right", "top"];
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full h-full p-4">
          {Object.entries(imageUrls).map(([company, urls]) => (
            <div key={company} className="bg-gray-800 rounded-lg p-4 shadow-lg ring-1 ring-gray-700/50 flex flex-col">
              <h3 className="text-center text-base font-semibold text-white mb-4 border-b border-gray-700 pb-2">{company}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
                {views.map((view) => (
                  <div key={view} className="relative pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden group">
                    <img
                      src={urls[view] || "/placeholder.svg"}
                      alt={`${company} ${view}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      onLoad={() => setImageLoaded((prev) => ({ ...prev, [`${company}-${view}`]: true }))}
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=";
                      }}
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                      {view}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
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
