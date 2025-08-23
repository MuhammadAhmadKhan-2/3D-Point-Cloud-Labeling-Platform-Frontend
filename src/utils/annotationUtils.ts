
import * as THREE from 'three';
import { AnnotationBox, AnnotationType, ANNOTATION_COLORS } from '../context/AnnotationContext';

// Create a 3D bounding box mesh
export const createBoundingBoxMesh = (
  position: THREE.Vector3,
  dimensions: THREE.Vector3,
  rotation: THREE.Euler,
  type: AnnotationType
): THREE.Mesh => {
  // Create box geometry
  const geometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
  
  // Create edges geometry for the wireframe
  const edges = new THREE.EdgesGeometry(geometry);
  
  // Get color based on annotation type
  const color = ANNOTATION_COLORS[type];
  
  // Create line material with the appropriate color
  const material = new THREE.LineBasicMaterial({ 
    color: color, 
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });
  
  // Create the wireframe mesh
  const wireframe = new THREE.LineSegments(edges, material);
  
  // Create a transparent material for the box
  const boxMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.03,  // Decreased to 0.05 for near-transparent fill
    side: THREE.DoubleSide
  });
  
  // Create the box mesh
  const mesh = new THREE.Mesh(geometry, boxMaterial);
  
  // Add the wireframe as a child of the mesh
  mesh.add(wireframe);
  
  // Set position and rotation
  mesh.position.copy(position);
  mesh.rotation.copy(rotation);
  
  return mesh;
};

// Update an existing bounding box mesh
export const updateBoundingBoxMesh = (
  mesh: THREE.Mesh,
  position?: THREE.Vector3,
  dimensions?: THREE.Vector3,
  rotation?: THREE.Euler,
  type?: AnnotationType
): void => {
  // Update position if provided
  if (position) {
    mesh.position.copy(position);
  }
  
  // Update rotation if provided
  if (rotation) {
    mesh.rotation.copy(rotation);
  }
  
  // Update dimensions and color if provided
  if (dimensions || type) {
    const color = type ? ANNOTATION_COLORS[type] : (mesh.material as THREE.MeshBasicMaterial).color;
    
    // If dimensions changed, create new geometry
    if (dimensions) {
      // Remove old wireframe
      const oldWireframe = mesh.children[0];
      mesh.remove(oldWireframe);
      
      // Dispose old geometries
      (mesh.geometry as THREE.BufferGeometry).dispose();
      (oldWireframe.geometry as THREE.BufferGeometry).dispose();
      
      // Create new geometry with new dimensions
      const newGeometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z);
      mesh.geometry = newGeometry;
      
      // Create new edges geometry
      const edges = new THREE.EdgesGeometry(newGeometry);
      
      // Create new wireframe with existing or new color
      const wireMaterial = new THREE.LineBasicMaterial({ 
        color: color, 
        linewidth: 2,
        transparent: true,
        opacity: 0.8
      });
      const wireframe = new THREE.LineSegments(edges, wireMaterial);
      mesh.add(wireframe);
    }
    
    // Update colors if type changed
    if (type) {
      // Update box material color
      (mesh.material as THREE.MeshBasicMaterial).color = color;
      
      // Update wireframe color
      const wireframe = mesh.children[0] as THREE.LineSegments;
      (wireframe.material as THREE.LineBasicMaterial).color = color;
    }
  }
};

// Helper function to check if a point is inside a bounding box
export const isPointInBox = (point: THREE.Vector3, box: AnnotationBox): boolean => {
  // Create a box3 from the annotation box
  const boxMin = new THREE.Vector3(
    box.position.x - box.dimensions.x / 2,
    box.position.y - box.dimensions.y / 2,
    box.position.z - box.dimensions.z / 2
  );
  
  const boxMax = new THREE.Vector3(
    box.position.x + box.dimensions.x / 2,
    box.position.y + box.dimensions.y / 2,
    box.position.z + box.dimensions.z / 2
  );
  
  const box3 = new THREE.Box3(boxMin, boxMax);
  
  // Check if the point is inside the box
  return box3.containsPoint(point);
};
