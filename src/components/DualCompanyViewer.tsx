"use client"

import type React from "react"
import { useRef, useEffect, useLayoutEffect, useState, useCallback } from "react"
import * as THREE from "three"
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Maximize2, RotateCcw, Download, Eye, Split, Layers, Move, Tag, Trash2 } from "lucide-react"
import { getDualCompanyAssets, getSerialAssets, loadDualCompanyPointClouds, type PointCloudData } from "../utils/dataLoader"
import { getEncodedImageUrl } from "../utils/imageUrlUtils"
import { useAnnotation, AnnotationType } from "../context/AnnotationContext"
import { createBoundingBoxMesh, updateBoundingBoxMesh } from "../utils/annotationUtils"

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
  // New: processing overlay state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState("")
  // Store 6 image URLs (front, back, front-left, front-right, back-left, back-right)
  const [imageUrls, setImageUrls] = useState<{ [view: string]: string }>({})
  const [imageErrors, setImageErrors] = useState<{ [key: string]: string | null }>({})
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({})
  const [loadingMessage, setLoadingMessage] = useState("Loading Data...")
  const [fileSizes, setFileSizes] = useState<{ [key: string]: string }>({})

  // Scene references for different view modes
  const singleSceneRef = useRef<THREE.Scene | null>(null)
  const leftSceneRef = useRef<THREE.Scene | null>(null)
  const rightSceneRef = useRef<THREE.Scene | null>(null)
  const singleRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const leftRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const rightRendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationRef = useRef<number | null>(null)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotationStep, setRotationStep] = useState(0)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [, forceUpdate] = useState(0)
  
  // Annotation state
const [isAnnotating, setIsAnnotating] = useState(false)
const [showAnnotationMenu, setShowAnnotationMenu] = useState(false)
  
  // Get annotation context
  const { 
  annotations,
  addAnnotation, 
  deleteAnnotation,
  selectedAnnotation,
  setSelectedAnnotation,
  activeAnnotationType, 
  setActiveAnnotationType,
  setIsAnnotating: setContextIsAnnotating
} = useAnnotation()
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStartPoint, setDrawStartPoint] = useState<THREE.Vector3 | null>(null)
  const [isDeleteMode, setIsDeleteMode] = useState(false)
  const tempBoxRef = useRef<THREE.Mesh | null>(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())

  // Fullscreen handlers
  const getMainContainer = () => {
    if (viewMode === "split") {
      // For split, use the parent of both left/right
      return mountRef.current?.parentElement || leftMountRef.current?.parentElement || rightMountRef.current?.parentElement
    }
    return mountRef.current
  }

  const handleFullscreen = useCallback(() => {
    const container = getMainContainer()
    if (container && container.requestFullscreen) {
      container.requestFullscreen()
      setIsFullscreen(true)
    } else if (container && (container as any).webkitRequestFullscreen) {
      (container as any).webkitRequestFullscreen()
      setIsFullscreen(true)
    }
  }, [viewMode])

  const handleExitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsFullscreen(false)
    } else if ((document as any).webkitFullscreenElement) {
      (document as any).webkitExitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      const container = getMainContainer()
      if (!document.fullscreenElement && !((document as any).webkitFullscreenElement)) {
        setIsFullscreen(false)
      } else if (
        document.fullscreenElement === container ||
        (document as any).webkitFullscreenElement === container
      ) {
        setIsFullscreen(true)
      }
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    document.addEventListener("webkitfullscreenchange", onFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange)
    }
  }, [viewMode])
  
  // Add event listeners for mouse events
  useEffect(() => {
  if (isAnnotating || isDeleteMode) {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);
  } else {
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('click', handleClick);
  }
  
  return () => {
    window.removeEventListener('mousedown', handleMouseDown);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('click', handleClick);
  };
}, [isAnnotating, isDeleteMode, activeAnnotationType, viewMode, isDrawing, drawStartPoint]);
  
  // Effect to render annotations in the scene
  useEffect(() => {
    // Function to add annotations to a scene
    const addAnnotationsToScene = (scene: THREE.Scene) => {
      // Remove existing annotation meshes first to avoid duplicates
      scene.children.forEach((child) => {
        if (child.userData.isAnnotation) {
          scene.remove(child);
        }
      });

      // Add new meshes for each annotation
      annotations.forEach((ann) => {
        const mesh = createBoundingBoxMesh(ann.position, ann.dimensions, ann.rotation, ann.type);
        mesh.userData.isAnnotation = true;
        mesh.userData.annotationId = ann.id;
        scene.add(mesh);
      });
    };

    // Add to appropriate scenes based on viewMode
    if (viewMode === 'split') {
      if (leftSceneRef.current) addAnnotationsToScene(leftSceneRef.current);
      if (rightSceneRef.current) addAnnotationsToScene(rightSceneRef.current);
    } else {
      if (singleSceneRef.current) addAnnotationsToScene(singleSceneRef.current);
    }

    // Cleanup on unmount
    return () => {
      // Remove annotation meshes on cleanup
      [singleSceneRef.current, leftSceneRef.current, rightSceneRef.current].forEach((scene) => {
        if (scene) {
          scene.children.forEach((child) => {
            if (child.userData.isAnnotation) {
              scene.remove(child);
            }
          });
        }
      });
    };
  }, [annotations, viewMode]);

// Disable OrbitControls during annotation
useEffect(() => {
  const toggleControls = (controlsRef: React.RefObject<OrbitControls | null>, enabled: boolean) => {
    if (controlsRef.current) {
      controlsRef.current.enabled = enabled;
    }
  };

  toggleControls(singleControlsRef, !isAnnotating);
  toggleControls(leftControlsRef, !isAnnotating);
  toggleControls(rightControlsRef, !isAnnotating);
}, [isAnnotating]);

// Change cursor when in annotating mode
useEffect(() => {
  const setCursor = (element: HTMLElement | null, cursor: string) => {
    if (element) {
      element.style.cursor = cursor;
    }
  };

  const cursorStyle = isAnnotating ? 'crosshair' : 'auto';

  // For single view
  setCursor(singleRendererRef.current?.domElement || null, cursorStyle);

  // For split view
  setCursor(leftRendererRef.current?.domElement || null, cursorStyle);
  setCursor(rightRendererRef.current?.domElement || null, cursorStyle);
}, [isAnnotating]);

  // ROTATION HANDLER
  const handleRotate = useCallback(() => {
    setRotationStep((prev) => (prev + 1) % 4)
  }, [])

  // Apply rotation to point clouds after each render
  useEffect(() => {
    // Helper to rotate all point clouds in a scene
    const rotateScene = (scene: THREE.Scene | null, angle: number) => {
      if (!scene) return
      scene.traverse((obj) => {
        if (obj instanceof THREE.Points) {
          obj.rotation.y = angle
        }
      })
    }
    const angle = (rotationStep * Math.PI) / 2 // 0, 90, 180, 270 deg
    if (viewMode === "split") {
      rotateScene(leftSceneRef.current, angle)
      rotateScene(rightSceneRef.current, angle)
    } else if (singleSceneRef.current) {
      rotateScene(singleSceneRef.current, angle)
    }
  }, [rotationStep, viewMode, showPointCloud])

  // DOWNLOAD HANDLER
  const handleDownload = useCallback(async () => {
    setDownloadError(null)
    try {
      // Helper to convert point cloud data to PLY format
      function toPLY(data: PointCloudData, company: string) {
        let header = `ply\nformat ascii 1.0\nelement vertex ${data.pointCount}\nproperty float x\nproperty float y\nproperty float z\n`;
        if (data.colors) header += "property uchar red\nproperty uchar green\nproperty uchar blue\n";
        header += "end_header\n";
        let body = "";
        for (let i = 0; i < data.pointCount; i++) {
          const x = data.vertices[i * 3 + 0];
          const y = data.vertices[i * 3 + 1];
          const z = data.vertices[i * 3 + 2];
          if (data.colors) {
            const r = Math.round(data.colors[i * 3 + 0] * 255);
            const g = Math.round(data.colors[i * 3 + 1] * 255);
            const b = Math.round(data.colors[i * 3 + 2] * 255);
            body += `${x} ${y} ${z} ${r} ${g} ${b}\n`;
          } else {
            body += `${x} ${y} ${z}\n`;
          }
        }
        return header + body;
      }
      // Get the data for the current view
      const dualData = await loadDualCompanyPointClouds(serialNumber)
      if (viewMode === "single-original" && dualData.originalSource) {
        const ply = toPLY(dualData.originalSource, "Original Source Factory Corporation")
        const blob = new Blob([ply], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${serialNumber}_original.ply`
        a.click()
        URL.revokeObjectURL(url)
      } else if (viewMode === "single-kr" && dualData.kr) {
        const ply = toPLY(dualData.kr, "Metabread Co., Ltd.")
        const blob = new Blob([ply], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${serialNumber}_kr.ply`
        a.click()
        URL.revokeObjectURL(url)
      } else if ((viewMode === "split" || viewMode === "overlay") && dualData.originalSource && dualData.kr) {
        // Download both as separate files
        const ply1 = toPLY(dualData.originalSource, "Original Source Factory Corporation")
        const ply2 = toPLY(dualData.kr, "Metabread Co., Ltd.")
        // Download both
        const blob1 = new Blob([ply1], { type: "text/plain" })
        const url1 = URL.createObjectURL(blob1)
        const a1 = document.createElement("a")
        a1.href = url1
        a1.download = `${serialNumber}_original.ply`
        a1.click()
        URL.revokeObjectURL(url1)
        const blob2 = new Blob([ply2], { type: "text/plain" })
        const url2 = URL.createObjectURL(blob2)
        const a2 = document.createElement("a")
        a2.href = url2
        a2.download = `${serialNumber}_kr.ply`
        a2.click()
        URL.revokeObjectURL(url2)
      } else {
        setDownloadError("No point cloud data available for download.")
      }
    } catch (e) {
      setDownloadError("Failed to download point cloud.")
    }
  }, [serialNumber, viewMode])

  useEffect(() => {
    if (!mountRef.current && !leftMountRef.current && !rightMountRef.current) return

    setIsLoading(true)
    setImageLoaded({})
    setImageErrors({}) // Reset image error state on serial/view change
    setLoadingProgress({})

    // Load images for the current frame using the new API endpoint
    const loadImages = async () => {
      try {
        console.log(`[DualCompanyViewer] Loading images for serial ${serialNumber}, frame ${frameId}`);
        
        // Use the new frame-level image loading service
        const { serialDataService } = await import('../services/serialDataService');
        const frameData = await serialDataService.getFrameImages(serialNumber, frameId);
        
        console.log('[DualCompanyViewer] Frame data received:', frameData);
        
        // Use the hasImages property from the API response
        if (frameData.hasImages) {
          setImageUrls(frameData.images);
          console.log('[DualCompanyViewer] Loaded images for frame', frameId, ':', frameData.images);
        } else {
          console.warn('[DualCompanyViewer] No images available for frame', frameId);
          const emptyImages = {
            front: '',
            back: '',
            'front-right': '',
            'front-left': '',
            'back-right': '',
            'back-left': '',
          };
          setImageUrls(emptyImages);
        }
      } catch (error) {
        console.error('[DualCompanyViewer] Error loading images:', error);
        const emptyImages = {
          front: '',
          back: '',
          'front-right': '',
          'front-left': '',
          'back-right': '',
          'back-left': '',
        };
        setImageUrls(emptyImages);
      }
    };

    loadImages();

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
const singleControlsRef = useRef<OrbitControls | null>(null)
const leftControlsRef = useRef<OrbitControls | null>(null)
const rightControlsRef = useRef<OrbitControls | null>(null)
const singleCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
const leftCameraRef = useRef<THREE.PerspectiveCamera | null>(null)
const rightCameraRef = useRef<THREE.PerspectiveCamera | null>(null)

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
    singleCameraRef.current = camera

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
    
    // Add event listeners to ensure the renderer captures mouse events
    renderer.domElement.addEventListener('mousedown', () => {
      console.log('[DualCompanyViewer] Mouse down event on single view');
    });

    // Add lighting
    setupLighting(scene)

    // Load point cloud data based on view mode
    const pointClouds = await loadPointCloudForViewMode()

    if (pointClouds) {
      console.log(`[initializeSingleView] Adding point clouds to scene:`, pointClouds);
      if (Array.isArray(pointClouds)) {
        pointClouds.forEach((pc, index) => {
          console.log(`[initializeSingleView] Adding point cloud ${index}:`, pc);
          scene.add(pc);
        });
      } else {
        console.log(`[initializeSingleView] Adding single point cloud:`, pointClouds);
        scene.add(pointClouds)
      }
    } else {
      console.warn(`[initializeSingleView] No point clouds to add to scene`);
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
    leftCameraRef.current = leftCamera

    const leftRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    leftRenderer.setSize(leftMountRef.current.clientWidth, leftMountRef.current.clientHeight)
    leftRendererRef.current = leftRenderer
    leftMountRef.current.appendChild(leftRenderer.domElement)
    
    // Add event listeners to ensure the renderer captures mouse events
    leftRenderer.domElement.addEventListener('mousedown', () => {
      console.log('[DualCompanyViewer] Mouse down event on left view');
    });

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
    rightCameraRef.current = rightCamera

    const rightRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    rightRenderer.setSize(rightMountRef.current.clientWidth, rightMountRef.current.clientHeight)
    rightRendererRef.current = rightRenderer
    rightMountRef.current.appendChild(rightRenderer.domElement)
    
    // Add event listeners to ensure the renderer captures mouse events
    rightRenderer.domElement.addEventListener('mousedown', () => {
      console.log('[DualCompanyViewer] Mouse down event on right view');
    });

    // Setup lighting for both scenes
    setupLighting(leftScene)
    setupLighting(rightScene)

    // Load point clouds for both companies using frameId
    const dualData = await loadDualCompanyPointClouds(serialNumber, frameId, (company, progress) => {
      setLoadingProgress((prev) => ({ ...prev, [company]: progress }))
    })

    // Add Original Source Factory Corporation data to left scene
    if (dualData.originalSource) {
      const leftPointCloud = await createPointCloudMesh(dualData.originalSource, "Original Source Factory Corporation")
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
      const rightPointCloud = await createPointCloudMesh(dualData.kr, "Metabread Co., Ltd.")
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

  const loadPointCloudForViewMode = async (): Promise<THREE.Points | THREE.Points[] | null> => {
    try {
      setLoadingMessage("Loading point cloud data...")
      
      // Use frameId when loading dual company point clouds
      const dualData = await loadDualCompanyPointClouds(serialNumber, frameId, (company, progress) => {
        setLoadingProgress((prev) => ({ ...prev, [company]: progress }))
      })

      if (viewMode === "single-original") {
        if (dualData.originalSource) {
          setPointCounts({ "Original Source Factory Corporation": dualData.originalSource.pointCount })
          return createPointCloudMesh(dualData.originalSource, "Original Source Factory Corporation")
        }
      } else if (viewMode === "single-kr") {
        if (dualData.kr) {
          setPointCounts({ "Metabread Co., Ltd.": dualData.kr.pointCount })
          return createPointCloudMesh(dualData.kr, "Metabread Co., Ltd.")
        }
      } else if (viewMode === "overlay") {
        const meshes: THREE.Points[] = []
        if (dualData.originalSource) {
          const originalMesh = createPointCloudMesh(dualData.originalSource, "Original Source Factory Corporation")
          meshes.push(originalMesh)
        }
        if (dualData.kr) {
          const krMesh = createPointCloudMesh(dualData.kr, "Metabread Co., Ltd.")
          // Offset KR data slightly for overlay visibility
          krMesh.position.set(0.1, 0, 0.1)
          meshes.push(krMesh)
        }
        setPointCounts({
          "Original Source Factory Corporation": dualData.originalSource?.pointCount || 0,
          "Metabread Co., Ltd.": dualData.kr?.pointCount || 0,
        })
        return meshes
      }

      return null
    } catch (error) {
      console.error("Error loading point cloud data:", error)
      setLoadingMessage("Error loading point cloud data")
      return null
    }
  }

  const createPointCloudMesh = (data: PointCloudData, company: string): THREE.Points => {
    console.log(`[createPointCloudMesh] Creating mesh for ${company} with ${data.pointCount} points`);
    
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(data.vertices, 3))

    if (data.colors) {
      geometry.setAttribute("color", new THREE.BufferAttribute(data.colors, 3))
      console.log(`[createPointCloudMesh] Added colors for ${company}`);
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

    const points = new THREE.Points(geometry, material)
    points.rotation.x = -Math.PI / 2

    console.log(`[createPointCloudMesh] Created mesh for ${company}:`, {
      pointCount: data.pointCount,
      hasColors: !!data.colors,
      baseColor: baseColor.toString(16),
      position: points.position,
      rotation: points.rotation
    });

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
    controls.screenSpacePanning = true // Enable screen space panning for more intuitive panning
    controls.autoRotate = false // Disable auto-rotation
    controls.enableZoom = true
    controls.enablePan = true
    controls.panSpeed = 1.0 // Adjust panning speed
    
    // Force the controls to listen to events immediately
    controls.update();
    
    // Store the controls reference
    singleControlsRef.current = controls;
    
    // Simulate a mouse interaction to ensure the controls are properly initialized
    setTimeout(() => {
      if (renderer && renderer.domElement) {
        // Create and dispatch a mousedown event
        const downEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          buttons: 1
        });
        renderer.domElement.dispatchEvent(downEvent);
        
        // Create and dispatch a mouseup event after a short delay
        setTimeout(() => {
          const upEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0,
            buttons: 0
          });
          renderer.domElement.dispatchEvent(upEvent);
        }, 10);
      }
    }, 100);

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
    leftControls.screenSpacePanning = true // Enable screen space panning for more intuitive panning
    leftControls.autoRotate = false // Disable auto-rotation
    leftControls.enableZoom = true
    leftControls.enablePan = true
    leftControls.panSpeed = 1.0 // Adjust panning speed
    
    // Force the controls to listen to events immediately
    leftControls.update();
    
    // Store the controls reference
    leftControlsRef.current = leftControls;
    
    // Simulate a mouse interaction to ensure the left controls are properly initialized
    setTimeout(() => {
      if (leftRenderer && leftRenderer.domElement) {
        // Create and dispatch a mousedown event
        const downEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          buttons: 1
        });
        leftRenderer.domElement.dispatchEvent(downEvent);
        
        // Create and dispatch a mouseup event after a short delay
        setTimeout(() => {
          const upEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0,
            buttons: 0
          });
          leftRenderer.domElement.dispatchEvent(upEvent);
        }, 10);
      }
    }, 100);

    const rightControls = new OrbitControls(rightCamera, rightRenderer.domElement)
    rightControls.enableDamping = true
    rightControls.dampingFactor = 0.05
    rightControls.screenSpacePanning = true // Enable screen space panning for more intuitive panning
    rightControls.autoRotate = false // Disable auto-rotation
    rightControls.enableZoom = true
    rightControls.enablePan = true
    rightControls.panSpeed = 1.0 // Adjust panning speed
    
    // Force the controls to listen to events immediately
    rightControls.update();
    
    // Store the controls reference
    rightControlsRef.current = rightControls;
    
    // Simulate a mouse interaction to ensure the right controls are properly initialized
    setTimeout(() => {
      if (rightRenderer && rightRenderer.domElement) {
        // Create and dispatch a mousedown event
        const downEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 0,
          buttons: 1
        });
        rightRenderer.domElement.dispatchEvent(downEvent);
        
        // Create and dispatch a mouseup event after a short delay
        setTimeout(() => {
          const upEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            view: window,
            button: 0,
            buttons: 0
          });
          rightRenderer.domElement.dispatchEvent(upEvent);
        }, 10);
      }
    }, 100);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)
      leftControls.update()
      rightControls.update()
      leftRenderer.render(leftScene, leftCamera)
      rightRenderer.render(rightScene, rightCamera)
    }
    animate()
  }

  // Helper to handle view mode change with a processing overlay
  const handleModeButtonClick = (target: "single-original" | "single-kr") => {
    if (viewMode === target) return
    const message = target === "single-kr" ? "Processing point-cloud data. Removing Noise and adding details" : "Reverting to original data…"
    setProcessingMessage(message)
    setIsProcessing(true)
    // Simulate processing delay 3.5 s then switch mode
    setTimeout(() => {
      onViewModeChange(target)
      setIsProcessing(false)
    }, 3500)
  }

  // Handle annotation button click
  const handleAnnotationButtonClick = () => {
    // If we're not in annotation mode, enter it and show the menu
    if (!isAnnotating) {
      setIsAnnotating(true);
      setShowAnnotationMenu(true);
      setContextIsAnnotating(true);
      setIsDeleteMode(false); // Reset delete mode when entering annotation mode
    } 
    // If we're in annotation mode and the menu is shown, hide the menu but stay in annotation mode
    else if (showAnnotationMenu) {
      setShowAnnotationMenu(false);
    }
    // If we're in annotation mode but the menu is hidden, show the menu
    else {
      setShowAnnotationMenu(true);
    }
  }

  // Handle annotation type selection
  const handleAnnotationTypeSelect = (type: AnnotationType) => {
    console.log(`Selected annotation type: ${type}`)
    setActiveAnnotationType(type)
    setShowAnnotationMenu(false)  // Close the menu after selection
    setIsAnnotating(true)        // Enable annotation drawing mode
    setContextIsAnnotating(true) // Update context if needed
  }
  
  // Mouse event handlers for drawing annotations
  const handleMouseDown = (event: MouseEvent) => {
    if (!isAnnotating || !activeAnnotationType) return;
    
    // Get the current renderer and camera based on view mode
    let renderer: THREE.WebGLRenderer | null = null;
    let camera: THREE.Camera | null = null;
    let scene: THREE.Scene | null = null;
    
    if (viewMode === 'split') {
      // Determine which side was clicked
      const leftRect = leftRendererRef.current?.domElement.getBoundingClientRect();
      const rightRect = rightRendererRef.current?.domElement.getBoundingClientRect();
      
      if (leftRect && event.clientX >= leftRect.left && event.clientX <= leftRect.right &&
        event.clientY >= leftRect.top && event.clientY <= leftRect.bottom) {
      renderer = leftRendererRef.current;
      camera = leftCameraRef.current;
      scene = leftSceneRef.current;
    } else if (rightRect && event.clientX >= rightRect.left && event.clientX <= rightRect.right &&
              event.clientY >= rightRect.top && event.clientY <= rightRect.bottom) {
      renderer = rightRendererRef.current;
      camera = rightCameraRef.current;
      scene = rightSceneRef.current;
    }
    } else {
      renderer = singleRendererRef.current;
      camera = singleCameraRef.current;
      scene = singleSceneRef.current;
    }
    
    if (!renderer || !camera || !scene) return;
    
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Create a plane at y=0 to intersect with
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    // Set up raycaster
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    
    // Find intersection with the plane
    const intersection = new THREE.Vector3();
    if (raycasterRef.current.ray.intersectPlane(plane, intersection)) {
      setIsDrawing(true);
      setDrawStartPoint(intersection.clone());
      
      // Create a temporary box
      const dimensions = new THREE.Vector3(0.1, 2.0, 0.1); // Default height of 2 meters
      const rotation = new THREE.Euler(0, 0, 0);
      const tempBox = createBoundingBoxMesh(intersection, dimensions, rotation, activeAnnotationType);
      
      scene.add(tempBox);
      tempBoxRef.current = tempBox;
    }
  };
  
  const handleMouseMove = (event: MouseEvent) => {
    if (!isDrawing || !drawStartPoint || !tempBoxRef.current || !activeAnnotationType) return;
    
    // Get the current renderer and camera based on view mode
    let renderer: THREE.WebGLRenderer | null = null;
    let camera: THREE.Camera | null = null;
    
    if (viewMode === 'split') {
      // Determine which side was clicked initially
      if (tempBoxRef.current.parent === leftSceneRef.current) {
    renderer = leftRendererRef.current;
    camera = leftCameraRef.current;
  } else if (tempBoxRef.current.parent === rightSceneRef.current) {
    renderer = rightRendererRef.current;
    camera = rightCameraRef.current;
  }
    } else {
      renderer = singleRendererRef.current;
      camera = singleCameraRef.current;
    }
    
    if (!renderer || !camera) return;
    
    // Calculate mouse position in normalized device coordinates
    const rect = renderer.domElement.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Create a plane at y=0 to intersect with
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    // Set up raycaster
    raycasterRef.current.setFromCamera(mouseRef.current, camera);
    
    // Find intersection with the plane
    const intersection = new THREE.Vector3();
    if (raycasterRef.current.ray.intersectPlane(plane, intersection)) {
      // Calculate dimensions based on start and current points
      const width = Math.abs(intersection.x - drawStartPoint.x);
      const depth = Math.abs(intersection.z - drawStartPoint.z);
      const height = 2.0; // Fixed height
      
      // Calculate center position
      const centerX = (intersection.x + drawStartPoint.x) / 2;
      const centerZ = (intersection.z + drawStartPoint.z) / 2;
      
      // Update temporary box
      const newPosition = new THREE.Vector3(centerX, height / 2, centerZ);
      const newDimensions = new THREE.Vector3(width, height, depth);
      
      updateBoundingBoxMesh(
        tempBoxRef.current,
        newPosition,
        newDimensions,
        undefined,
        activeAnnotationType
      );
    }
  };
  
  const handleMouseUp = () => {
    if (!isDrawing || !drawStartPoint || !tempBoxRef.current || !activeAnnotationType) return;
    
    // Get final dimensions and position from the temporary box
    const finalPosition = tempBoxRef.current.position.clone();
    const finalDimensions = new THREE.Vector3();
    tempBoxRef.current.geometry.computeBoundingBox();
    
    if (tempBoxRef.current.geometry.boundingBox) {
      const box = tempBoxRef.current.geometry.boundingBox;
      finalDimensions.x = (box.max.x - box.min.x) * tempBoxRef.current.scale.x;
      finalDimensions.y = (box.max.y - box.min.y) * tempBoxRef.current.scale.y;
      finalDimensions.z = (box.max.z - box.min.z) * tempBoxRef.current.scale.z;
    }
    
    // Remove temporary box
    tempBoxRef.current.parent?.remove(tempBoxRef.current);
    tempBoxRef.current = null;
    
    // Add the annotation to the context
    addAnnotation({
      type: activeAnnotationType,
      position: finalPosition,
      dimensions: finalDimensions,
      rotation: new THREE.Euler(0, 0, 0)
    });
    
    // Reset drawing state
    setIsDrawing(false);
    setDrawStartPoint(null);
  };

  const handleClick = (event: MouseEvent) => {
  if (!isAnnotating && !isDeleteMode) return;

  // If we're in drawing mode with an active type, don't handle selection/deletion
  if (activeAnnotationType && !isDeleteMode) return;

  // ... existing code for setting renderer, camera, scene ...

  if (!renderer || !camera || !scene) return;

  // ... existing raycasting code ...

  if (intersects.length > 0) {
    const clickedId = intersects[0].object.userData.annotationId;
    
    if (isDeleteMode) {
      deleteAnnotation(clickedId);
      console.log(`Deleted annotation: ${clickedId}`);
    } else {
      setSelectedAnnotation(clickedId);
      setShowAnnotationMenu(true);
      console.log(`Selected annotation: ${clickedId}`);
    }
  } else if (!isDeleteMode) {
    setSelectedAnnotation(null);
  }
};

  // Handle annotation cancel
  const handleAnnotationCancel = () => {
    setIsAnnotating(false)
    setShowAnnotationMenu(false)
    setSelectedAnnotation(null)
  }

  // Handle annotation delete
const handleAnnotationDelete = () => {
  if (selectedAnnotation) {
    // Show confirmation dialog before deleting
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      deleteAnnotation(selectedAnnotation);
      setSelectedAnnotation(null);
    }
  }
}

const handleDeleteModeToggle = () => {
  const newDeleteMode = !isDeleteMode;
  setIsDeleteMode(newDeleteMode);
  if (newDeleteMode) {
    setIsAnnotating(false);
    setActiveAnnotationType(null);
    setShowAnnotationMenu(false);
  }
};

  const renderViewModeControls = () => (
    <div className="absolute top-4 right-4 flex flex-col space-y-2 z-50">
      <div className="flex space-x-2">
        <button
          onClick={() => handleModeButtonClick("single-original") }
          className={`p-3 rounded-lg border transition-colors ${
            viewMode === "single-original"
              ? "bg-red-600 border-red-500 text-white"
              : "bg-black/80 border-gray-700 text-gray-300 hover:bg-black/90"
          }`}
          title="Show Only: Original Source Factory Corporation"
        >
          <span className="font-bold">Go Back</span>
        </button>
        <button
          onClick={() => handleModeButtonClick("single-kr") }
          className={`p-3 rounded-lg border transition-colors ${
            viewMode === "single-kr"
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-black/80 border-gray-700 text-gray-300 hover:bg-black/90"
          }`}
          title="Show Only: Metabread Co., Ltd."
        >
          <span className="font-bold">Advanced Processing</span>
        </button>
      </div>
      {/* Standard controls */}
      <div className="flex space-x-2">
        {!isFullscreen ? (
          <button
            className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors"
            onClick={handleFullscreen}
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-gray-300" />
          </button>
        ) : (
          <button
            className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors"
            onClick={handleExitFullscreen}
            title="Exit Fullscreen"
          >
            <span className="font-bold text-white">⤢</span>
          </button>
        )}
        <button
          className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors"
          onClick={handleRotate}
          title={`Rotate (${rotationStep * 90}°)`}
        >
          <RotateCcw className="w-4 h-4 text-gray-300" />
        </button>
        <button
          className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors"
          onClick={handleDownload}
          title="Download Point Cloud"
        >
          <Download className="w-4 h-4 text-gray-300" />
        </button>
        {/* Add Annotation Button */}
        <button
          className={`p-2 ${isAnnotating ? "bg-green-600 border-green-500" : "bg-black/80 border-gray-700"} hover:bg-black/90 rounded-lg border transition-colors`}
          onClick={handleAnnotationButtonClick}
          title="Toggle Annotation Mode"
        >
          <Tag className="w-4 h-4 text-gray-300" />
        </button>
        {/* Add Delete Mode Button */}
        {/* <button
          className={`p-2 ${isDeleteMode ? "bg-red-600 border-red-500" : "bg-black/80 border-gray-700"} hover:bg-black/90 rounded-lg border transition-colors`}
          onClick={handleDeleteModeToggle}
          title="Toggle Delete Mode"
        >
          <Trash2 className="w-4 h-4 text-gray-300" />
        </button> */}
      </div>
      {/* Annotation Menu */}
      {showAnnotationMenu && (
        <div className="mt-2 bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <div className="text-sm font-medium text-white mb-2">Select Annotation Type</div>
          <div className="space-y-2">
            <button
              onClick={() => handleAnnotationTypeSelect('car' as AnnotationType)}
              className="w-full px-3 py-2 text-left text-sm flex items-center space-x-2 rounded bg-blue-900/50 hover:bg-blue-800/50 transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Car</span>
            </button>
            <button
              onClick={() => handleAnnotationTypeSelect('pedestrian' as AnnotationType)}
              className="w-full px-3 py-2 text-left text-sm flex items-center space-x-2 rounded bg-green-900/50 hover:bg-green-800/50 transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Pedestrian</span>
            </button>
            <button
              onClick={() => handleAnnotationTypeSelect('object' as AnnotationType)}
              className="w-full px-3 py-2 text-left text-sm flex items-center space-x-2 rounded bg-red-900/50 hover:bg-red-800/50 transition-colors"
            >
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Object</span>
            </button>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleAnnotationCancel}
              className="flex-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
            >
              Cancel
            </button>
            {selectedAnnotation && (
              <button
                onClick={handleAnnotationDelete}
                className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-xs transition-colors flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}
      {downloadError && (
        <div className="text-xs text-red-400 mt-2 bg-black/80 px-2 py-1 rounded">{downloadError}</div>
      )}
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

  // Update the useEffect for fullscreen/resize handling to also force a reflow and remove any fullscreen-specific styles when isFullscreen is false.
  useEffect(() => {
    const resize = () => {
      if (isFullscreen) {
        const width = window.innerWidth
        const height = window.innerHeight
        if (viewMode === "split") {
          if (leftRendererRef.current && leftMountRef.current) {
            leftRendererRef.current.setSize(width / 2, height)
          }
          if (rightRendererRef.current && rightMountRef.current) {
            rightRendererRef.current.setSize(width / 2, height)
          }
        } else if (singleRendererRef.current && mountRef.current) {
          singleRendererRef.current.setSize(width, height)
        }
      } else {
        // Restore to container size and force reflow
        setTimeout(function() {
          if (viewMode === "split") {
            if (leftRendererRef.current && leftMountRef.current) {
              leftRendererRef.current.setSize(leftMountRef.current.clientWidth, leftMountRef.current.clientHeight)
            }
            if (rightRendererRef.current && rightMountRef.current) {
              rightRendererRef.current.setSize(rightMountRef.current.clientWidth, rightMountRef.current.clientHeight)
            }
          } else if (singleRendererRef.current && mountRef.current) {
            singleRendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
          }
          // Remove any inline styles that may have been set
          const container = getMainContainer()
          if (container) {
            container.style.width = ''
            container.style.height = ''
            container.style.top = ''
            container.style.left = ''
          }
          // Force a React reflow
          forceUpdate((n) => n + 1)
        }, 50)
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [isFullscreen, viewMode])

  useEffect(() => {
    // Only for single view
    if (
      showPointCloud &&
      viewMode !== 'split' &&
      singleRendererRef.current &&
      singleSceneRef.current &&
      singleCameraRef.current &&
      mountRef.current &&
      animationRef.current == null
    ) {
      startAnimation(singleCameraRef.current, singleRendererRef.current, singleSceneRef.current)
    }
  }, [showPointCloud, viewMode])
  
  // Add an additional effect to ensure controls are properly initialized when switching views
  useEffect(() => {
    // Short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (viewMode !== 'split' && singleControlsRef.current) {
        singleControlsRef.current.update();
        
        // Force the controls to be responsive by simulating a mouse event
        if (singleRendererRef.current && singleRendererRef.current.domElement) {
          const event = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          singleRendererRef.current.domElement.dispatchEvent(event);
          
          // Also dispatch a mouseup event to complete the interaction
          setTimeout(() => {
            const upEvent = new MouseEvent('mouseup', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            singleRendererRef.current?.domElement.dispatchEvent(upEvent);
          }, 10);
        }
      } else if (viewMode === 'split') {
        if (leftControlsRef.current) {
          leftControlsRef.current.update();
          
          // Force the left controls to be responsive
          if (leftRendererRef.current && leftRendererRef.current.domElement) {
            const event = new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            leftRendererRef.current.domElement.dispatchEvent(event);
            
            // Also dispatch a mouseup event to complete the interaction
            setTimeout(() => {
              const upEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              leftRendererRef.current?.domElement.dispatchEvent(upEvent);
            }, 10);
          }
        }
        
        if (rightControlsRef.current) {
          rightControlsRef.current.update();
          
          // Force the right controls to be responsive
          if (rightRendererRef.current && rightRendererRef.current.domElement) {
            const event = new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            rightRendererRef.current.domElement.dispatchEvent(event);
            
            // Also dispatch a mouseup event to complete the interaction
            setTimeout(() => {
              const upEvent = new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              rightRendererRef.current?.domElement.dispatchEvent(upEvent);
            }, 10);
          }
        }
      }
    }, 200); // Increased delay to ensure everything is ready
    
    return () => clearTimeout(timer);
  }, [viewMode, showPointCloud])

  if (!showPointCloud) {
    const views = ["front", "back", "front-right", "front-left", "back-right", "back-left"];
    
    const companiesToRender = 
      viewMode === 'split' 
        ? ["Original Source Factory Corporation", "Metabread Co., Ltd."]
        : viewMode === 'single-original'
        ? ["Original Source Factory Corporation"]
        : ["Metabread Co., Ltd."];

    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          {companiesToRender.map((company) => (
            <div key={company} className="bg-gray-800 rounded-lg p-4 shadow-lg ring-1 ring-gray-700/50 flex flex-col">
              
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 flex-1">
                {views.map((view) => {
                  const errorKey = `${company}-${view}`;
                  const imageUrl = imageUrls[view];
                  return (
                    <div key={view} className="relative pt-[56.25%] bg-gray-900 rounded-lg overflow-hidden group">
                      {imageErrors[errorKey] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                          <div className="text-xs font-semibold">Image not found</div>
                          <div className="text-[10px]">{company} {view}</div>
                        </div>
                      ) : !imageUrl ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
                          <div className="text-xs font-semibold">No image for Frame {frameId}</div>
                          <div className="text-[10px]">{company} {view}</div>
                        </div>
                      ) : (
                        <img
                          key={`${serialNumber}-${frameId}-${company}-${view}`}
                          src={imageUrl}
                          alt={`${company} ${view}`}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                          onLoad={() => {
                            setImageLoaded((prev) => ({ ...prev, [errorKey]: true }));
                            console.log(`[DualCompanyViewer] Image loaded: ${company}-${view}`, imageUrl);
                          }}
                          onError={() => {
                            setImageErrors((prev) => ({ ...prev, [errorKey]: 'Image not found or failed to load.' }));
                            console.error(`[DualCompanyViewer] Image failed to load: ${company}-${view}`);
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
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen bg-gray-900 overflow-hidden'
          : 'relative w-full h-full bg-gray-900 rounded-lg overflow-hidden'
      }
      style={isFullscreen ? { width: '100vw', height: '100vh', top: 0, left: 0 } : {}}
    >
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

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4" />
          <div className="text-lg font-semibold animate-pulse">{processingMessage}</div>
        </div>
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
      {renderInstructionsPanel()}
    </div>
  )
}

// Add instructions panel to inform users about controls
const renderInstructionsPanel = () => (
  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm rounded-lg p-3 text-white text-xs max-w-sm border border-gray-700">
    <div className="space-y-2">
      <div className="text-yellow-400 font-semibold mb-2">Controls:</div>
      <div className="grid grid-cols-2 gap-2 text-gray-300">
        <div>• <span className="text-blue-400">Left-click + drag</span>: Rotate</div>
        <div>• <span className="text-green-400">Right-click + drag</span>: Pan</div>
        <div>• <span className="text-purple-400">Scroll wheel</span>: Zoom</div>
        <div>• <span className="text-orange-400">Middle-click + drag</span>: Pan</div>
      </div>
    </div>
  </div>
)

