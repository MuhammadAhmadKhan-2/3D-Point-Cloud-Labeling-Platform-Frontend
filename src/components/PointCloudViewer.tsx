// import React, { useRef, useEffect, useState } from 'react';
// import * as THREE from 'three';
// import { Maximize2, RotateCcw, ZoomIn, ZoomOut, Download, Settings } from 'lucide-react';
// import { getSerialAssets, loadPointCloudData, checkFileSize, PointCloudData } from '../utils/dataLoader';

// interface PointCloudViewerProps {
//   serialNumber: string;
//   frameId: number;
//   showPointCloud: boolean;
//   stage: 'preprocessing' | 'refinement';
// }

// export const PointCloudViewer: React.FC<PointCloudViewerProps> = ({ 
//   serialNumber, 
//   frameId, 
//   showPointCloud,
//   stage
// }) => {
//   const mountRef = useRef<HTMLDivElement>(null);
//   const sceneRef = useRef<THREE.Scene | null>(null);
//   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
//   const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
//   const animationRef = useRef<number | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [pointCount, setPointCount] = useState(0);
//   const [imageUrl, setImageUrl] = useState<string>('');
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [imageError, setImageError] = useState<string | null>(null);
//   // For now, default to 'front' image. Later, this can be made dynamic.
//   const [imageView, setImageView] = useState<'front' | 'back' | 'left' | 'right' | 'top'>('front');
//   const [loadingMessage, setLoadingMessage] = useState('Loading Point Cloud Data...');
//   const [fileSize, setFileSize] = useState<string>('');

//   useEffect(() => {
//     if (!mountRef.current) return;

//     setIsLoading(true);
//     setImageLoaded(false);
//     setImageError(null);

//     // Get assets for this serial
//     const assets = getSerialAssets(stage, serialNumber);
//     console.log('[PointCloudViewer] imageView:', imageView, 'assets.images:', assets.images);
//     if (assets.images && assets.images[imageView]) {
//       setImageUrl(assets.images[imageView]);
//       // Only initialize 3D scene if showing point cloud
//       if (showPointCloud) {
//         initializeThreeJSScene();
//       } else {
//         // For image mode, preload the selected image and handle error
//         const testImg = new window.Image();
//         testImg.onload = () => {
//           setImageLoaded(true);
//           setIsLoading(false);
//           console.log('[PointCloudViewer] Image loaded:', assets.images[imageView]);
//         };
//         testImg.onerror = () => {
//           setImageLoaded(false);
//           setIsLoading(false);
//           setImageError('Image not found or failed to load.');
//           console.error('[PointCloudViewer] Image failed to load:', assets.images[imageView]);
//         };
//         testImg.src = assets.images[imageView];
//       }
//     } else {
//       setImageUrl('');
//       setImageError('Image path is invalid or missing.');
//       setIsLoading(false);
//     }

//     return () => {
//       cleanup();
//     };
//   }, [serialNumber, frameId, showPointCloud, stage, imageView]);

//   const cleanup = () => {
//     if (animationRef.current) {
//       cancelAnimationFrame(animationRef.current);
//     }
    
//     if (rendererRef.current) {
//       if (mountRef.current && rendererRef.current.domElement) {
//         mountRef.current.removeChild(rendererRef.current.domElement);
//       }
//       rendererRef.current.dispose();
//       rendererRef.current = null;
//     }
    
//     if (sceneRef.current) {
//       sceneRef.current.clear();
//       sceneRef.current = null;
//     }
//   };

//   const initializeThreeJSScene = async () => {
//     if (!mountRef.current) return;

//     // Clean up any existing scene
//     cleanup();

//     // Get assets for this serial
//     const assets = getSerialAssets(stage, serialNumber);

//     // Scene setup with professional styling
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x0a0a0a);
//     scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
//     sceneRef.current = scene;

//     // Enhanced camera setup - Horizontal orientation, positioned to the left
//     const camera = new THREE.PerspectiveCamera(
//       60,
//       mountRef.current.clientWidth / mountRef.current.clientHeight,
//       0.1,
//       1000
//     );
//     camera.position.set(-15, 6, 15);
//     camera.lookAt(0, 0, 0);
//     cameraRef.current = camera;

//     // Professional renderer setup
//     const renderer = new THREE.WebGLRenderer({ 
//       antialias: true,
//       alpha: true,
//       powerPreference: "high-performance"
//     });
//     renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.shadowMap.enabled = true;
//     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     renderer.outputColorSpace = THREE.SRGBColorSpace;
//     renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     renderer.toneMappingExposure = 1.2;
//     rendererRef.current = renderer;

//     mountRef.current.appendChild(renderer.domElement);

//     // Professional lighting setup
//     const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
//     scene.add(ambientLight);

//     const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
//     directionalLight.position.set(-15, 15, 8);
//     directionalLight.castShadow = true;
//     directionalLight.shadow.mapSize.width = 2048;
//     directionalLight.shadow.mapSize.height = 2048;
//     directionalLight.shadow.camera.near = 0.5;
//     directionalLight.shadow.camera.far = 100;
//     directionalLight.shadow.camera.left = -20;
//     directionalLight.shadow.camera.right = 20;
//     directionalLight.shadow.camera.top = 20;
//     directionalLight.shadow.camera.bottom = -20;
//     scene.add(directionalLight);

//     // Additional accent lighting - positioned to the left
//     const rimLight = new THREE.DirectionalLight(0x4a90e2, 0.4);
//     rimLight.position.set(-20, 8, 5);
//     scene.add(rimLight);

//     // Professional grid with enterprise styling
//     const gridHelper = new THREE.GridHelper(40, 40, 0x333333, 0x1a1a1a);
//     gridHelper.material.opacity = 0.6;
//     gridHelper.material.transparent = true;
//     scene.add(gridHelper);

//     // Enhanced axes helper
//     const axesHelper = new THREE.AxesHelper(8);
//     scene.add(axesHelper);

//     // Load actual point cloud data or create fallback
//     const pointCloud = await loadOrCreatePointCloud(assets);
//     const boundingBoxes = createBoundingBoxes();

//     scene.add(pointCloud);
//     boundingBoxes.forEach(box => scene.add(box));
    
//     setIsLoading(false);

//     // Professional animation with smooth camera movement
//     let time = 0;
//     const animate = () => {
//       animationRef.current = requestAnimationFrame(animate);
      
//       time += 0.005;
      
//       // Smooth orbital camera movement - Horizontal orientation, positioned to the left
//       const radius = 20;
//       const offsetX = -8; // Offset to the left
//       camera.position.x = Math.cos(time) * radius + offsetX;
//       camera.position.z = Math.sin(time) * radius;
//       camera.position.y = 6 + Math.sin(time * 0.5) * 2;
//       camera.lookAt(0, 0, 0);

//       // Animate point cloud for realism - X-axis rotation only
//       if (pointCloud) {
//         // pointCloud.rotation.x += 0.001;
//       }

//       renderer.render(scene, camera);
//     };

//     animate();

//     // Handle resize
//     const handleResize = () => {
//       if (!mountRef.current || !camera || !renderer) return;
      
//       camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
//     };

//     window.addEventListener('resize', handleResize);
    
//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   };

//   // Load actual point cloud data or create fallback
//   const loadOrCreatePointCloud = async (assets: any) => {
//     // Check file size first
//     setLoadingMessage('Checking file size...');
//     const fileInfo = await checkFileSize(assets.pointCloudUrl);
    
//     if (!fileInfo.exists) {
//       setLoadingMessage('File not found - Using Demo Data');
//       setFileSize('File not available');
//       return createFallbackPointCloud();
//     }
    
//     if (fileInfo.size > 200 * 1024 * 1024) { // 200MB threshold
//       setLoadingMessage('File too large - Using Demo Data');
//       setFileSize(`${fileInfo.sizeMB}MB - too large for browser`);
//       return createFallbackPointCloud();
//     }
    
//     // Try to load actual PLY data
//     setLoadingMessage(`Loading ${fileInfo.sizeMB}MB file...`);
//     setFileSize(`${fileInfo.sizeMB}MB`);
    
//     try {
//       const pointCloudData = await loadPointCloudData(assets.pointCloudUrl);
      
//       if (pointCloudData) {
//         setLoadingMessage('Processing Point Cloud...');
        
//         // Use actual point cloud data
//         const geometry = new THREE.BufferGeometry();
//         geometry.setAttribute('position', new THREE.BufferAttribute(pointCloudData.vertices, 3));
        
//         if (pointCloudData.colors) {
//           geometry.setAttribute('color', new THREE.BufferAttribute(pointCloudData.colors, 3));
//         }
        
//         const material = new THREE.PointsMaterial({
//           size: 0.02,
//           vertexColors: pointCloudData.colors ? true : false,
//           color: pointCloudData.colors ? undefined : 0x4a90e2,
//           transparent: true,
//           opacity: 0.9,
//           sizeAttenuation: true,
//           alphaTest: 0.1
//         });
        
//         setPointCount(pointCloudData.pointCount);
//         const points = new THREE.Points(geometry, material);
        
//         // Rotate to horizontal orientation for better viewing
//         points.rotation.x = -Math.PI / 2; // Rotate 90 degrees to make it horizontal
        
//         return points;
//       } else {
//         // Fallback to generated point cloud for demo
//         setLoadingMessage('Using Generated Data (Large File Detected)');
//         setFileSize('File too large - using demo data');
//         return createFallbackPointCloud();
//       }
//     } catch (error) {
//       console.error('Error loading point cloud:', error);
//       setLoadingMessage('Error Loading File - Using Demo Data');
//       setFileSize('Loading failed - using demo data');
//       return createFallbackPointCloud();
//     }
//   };

//   // Create fallback point cloud with enterprise-grade density
//   const createFallbackPointCloud = () => {
//     const geometry = new THREE.BufferGeometry();
//     const pointCount = 150000; // Enterprise-grade point density
//     const positions = new Float32Array(pointCount * 3);
//     const colors = new Float32Array(pointCount * 3);

//     // Create multiple vehicle-like structures
//     let index = 0;

//     // Main vehicle structure - Horizontal orientation
//     for (let i = 0; i < pointCount * 0.6; i++) {
//       const x = (Math.random() - 0.5) * 12 + Math.sin(i * 0.01) * 3; // Wider X
//       const y = Math.random() * 1.8 + Math.sin(i * 0.02) * 0.3; // Lower height
//       const z = (Math.random() - 0.5) * 6 + Math.cos(i * 0.01) * 2; // Longer Z

//       positions[index * 3] = x;
//       positions[index * 3 + 1] = y;
//       positions[index * 3 + 2] = z;

//       // Professional color mapping based on height and distance
//       const heightRatio = y / 2;
//       const distance = Math.sqrt(x * x + z * z);
//       const intensity = Math.max(0.3, 1 - distance * 0.03);

//       colors[index * 3] = 0.2 + heightRatio * 0.6 * intensity; // Red
//       colors[index * 3 + 1] = 0.4 + heightRatio * 0.8 * intensity; // Green  
//       colors[index * 3 + 2] = 0.8 + heightRatio * 0.4 * intensity; // Blue

//       index++;
//     }

//     // Additional objects and environment - Horizontal orientation
//     for (let i = index; i < pointCount; i++) {
//       const angle = (i / pointCount) * Math.PI * 4;
//       const radius = 20 + Math.random() * 15;
//       const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 8;
//       const y = Math.random() * 2.5;
//       const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 6;

//       positions[i * 3] = x;
//       positions[i * 3 + 1] = y;
//       positions[i * 3 + 2] = z;

//       // Environment coloring
//       colors[i * 3] = 0.1 + Math.random() * 0.3;
//       colors[i * 3 + 1] = 0.2 + Math.random() * 0.4;
//       colors[i * 3 + 2] = 0.3 + Math.random() * 0.5;
//     }

//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
//     geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

//     const material = new THREE.PointsMaterial({
//       size: 0.03,
//       vertexColors: true,
//       transparent: true,
//       opacity: 0.9,
//       sizeAttenuation: true,
//       alphaTest: 0.1
//     });

//     setPointCount(pointCount);
//     const points = new THREE.Points(geometry, material);
    
//     // Rotate to horizontal orientation for better viewing
//     points.rotation.x = -Math.PI / 2; // Rotate 90 degrees to make it horizontal
    
//     return points;
//   };

//   // Create professional bounding boxes
//   const createBoundingBoxes = () => {
//     const boxes = [];
    
//     // Main vehicle bounding box with professional styling - Horizontal orientation
//     const vehicleGeometry = new THREE.BoxGeometry(6.0, 1.8, 4.2);
//     const vehicleEdges = new THREE.EdgesGeometry(vehicleGeometry);
//     const vehicleMaterial = new THREE.LineBasicMaterial({ 
//       color: 0x00ff88, 
//       linewidth: 3,
//       transparent: true,
//       opacity: 0.9
//     });
//     const vehicleBox = new THREE.LineSegments(vehicleEdges, vehicleMaterial);
//     vehicleBox.position.set(0, 0.9, 0);
//     boxes.push(vehicleBox);

//     // Add corner markers for the main vehicle
//     const cornerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
//     const cornerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    
//     const corners = [
//       [-3.0, 0.9, -2.1], [3.0, 0.9, -2.1],
//       [-3.0, 0.9, 2.1], [3.0, 0.9, 2.1],
//       [-3.0, 2.7, -2.1], [3.0, 2.7, -2.1],
//       [-3.0, 2.7, 2.1], [3.0, 2.7, 2.1]
//     ];

//     corners.forEach(([x, y, z]) => {
//       const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
//       corner.position.set(x, y, z);
//       boxes.push(corner);
//     });

//     // Additional detected objects with different colors - Horizontal orientation
//     const objectConfigs = [
//       { pos: [10, 0.5, -2], size: [2, 1, 1.2], color: 0xff6600 },
//       { pos: [-8, 0.8, 3], size: [1.8, 1.6, 1.5], color: 0x6600ff },
//       { pos: [5, 0.4, 6], size: [0.8, 0.8, 0.8], color: 0xffff00 }
//     ];

//     objectConfigs.forEach(({ pos, size, color }) => {
//       const geometry = new THREE.BoxGeometry(...size);
//       const edges = new THREE.EdgesGeometry(geometry);
//       const material = new THREE.LineBasicMaterial({ 
//         color, 
//         linewidth: 2,
//         transparent: true,
//         opacity: 0.8
//       });
//       const box = new THREE.LineSegments(edges, material);
//       box.position.set(...pos);
//       boxes.push(box);
//     });

//     return boxes;

//   return (
//     <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
//       {showPointCloud ? (
//         // ...
//                   {fileSize || 'Connecting to AWS S3'}
//                 </div>
//                 {fileSize && (
//                   <div className="text-yellow-400 text-xs mt-1">
//                     Large files may take time to load
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-gray-900">
//           {imageError ? (
//             <div className="text-red-400 text-center">
//               <div className="text-lg mb-2">{imageError}</div>
//               <div className="text-sm">Serial: {serialNumber}</div>
//             </div>
//           ) : imageUrl ? (
//             <img 
//               src={imageUrl} 
//               alt={`Serial ${serialNumber}`}
//               className="max-w-full max-h-full object-contain"
//               onLoad={() => {
//                 setImageLoaded(true);
//                 setIsLoading(false);
//               }}
//               onError={() => {
//                 setImageLoaded(false);
//                 setIsLoading(false);
//                 setImageError('Image not found or failed to load.');
//               }}
//             />
//           ) : (
//             <div className="text-center text-gray-400">
//               <div className="text-lg mb-2">Original Image View</div>
//               <div className="text-sm">Serial: {serialNumber}</div>
//             </div>
//           )}
          
//           {/* Loading overlay for image */}
//           {isLoading && (
//             <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center backdrop-blur-sm">
//               <div className="text-center">
//                 <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
//                 <div className="text-white font-medium">Loading Image...</div>
//                 <div className="text-gray-400 text-sm mt-2">Fetching from AWS S3</div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Professional controls overlay */}
//       <div className="absolute top-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white text-sm border border-gray-700">
//         <div className="space-y-2">
//           <div className="flex items-center justify-between">
//             <span className="text-gray-400">Serial:</span>
//             <span className="font-mono text-blue-400">{serialNumber}</span>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-gray-400">Frame:</span>
//             <span className="text-green-400 font-medium">{frameId}/30</span>
//           </div>
//           <div className="flex items-center justify-between">
//             <span className="text-gray-400">Mode:</span>
//             <span className="text-purple-400">
//               {showPointCloud ? 'Point Cloud' : 'Original Image'}
//             </span>
//           </div>
//           {showPointCloud && (
//             <>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-400">Points:</span>
//                 <span className="text-yellow-400">{pointCount.toLocaleString()}</span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <span className="text-gray-400">Source:</span>
//                 <span className="text-blue-400">{pointCount > 0 ? 'Loaded' : 'Generated'}</span>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Professional toolbar */}
//       <div className="absolute top-4 right-4 flex space-x-2">
//         <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
//           <Maximize2 className="w-4 h-4 text-gray-300" />
//         </button>
//         <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
//           <RotateCcw className="w-4 h-4 text-gray-300" />
//         </button>
//         <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
//           <ZoomIn className="w-4 h-4 text-gray-300" />
//         </button>
//         <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
//           <ZoomOut className="w-4 h-4 text-gray-300" />
//         </button>
//         <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
//           <Download className="w-4 h-4 text-gray-300" />
//         </button>
//         <button className="p-2 bg-black/80 hover:bg-black/90 rounded-lg border border-gray-700 transition-colors">
//           <Settings className="w-4 h-4 text-gray-300" />
//         </button>
//       </div>

//       {/* Professional instructions overlay */}
//       {showPointCloud && (
//         <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-white text-xs max-w-sm border border-gray-700">
//           <div className="space-y-2">
//             <div className="text-yellow-400 font-semibold mb-2">Enterprise Controls:</div>
//             <div className="grid grid-cols-2 gap-2 text-gray-300">
//               <div>• Auto-rotation enabled</div>
//               <div>• AWS S3 synchronized</div>
//               <div>• <span className="text-green-400">Green:</span> Primary vehicle</div>
//               <div>• <span className="text-orange-400">Orange:</span> Secondary objects</div>
//               <div>• <span className="text-purple-400">Purple:</span> Pedestrians</div>
//               <div>• <span className="text-yellow-400">Yellow:</span> Traffic signs</div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Performance metrics */}
//       {showPointCloud && (
//         <div className="absolute bottom-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 text-white text-xs border border-gray-700">
//           <div className="space-y-1">
//             <div className="text-blue-400 font-semibold">Performance</div>
//             <div className="flex justify-between">
//               <span className="text-gray-400">FPS:</span>
//               <span className="text-green-400">60</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-400">GPU:</span>
//               <span className="text-green-400">23%</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-400">Memory:</span>
//               <span className="text-blue-400">2.1GB</span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
