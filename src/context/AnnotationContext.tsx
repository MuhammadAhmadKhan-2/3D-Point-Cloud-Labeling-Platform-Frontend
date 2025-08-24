import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as THREE from 'three';

// Define annotation types
export type AnnotationType = 'car' | 'pedestrian' | 'object';

// Define annotation colors
export const ANNOTATION_COLORS = {
  car: new THREE.Color(0x0066ff), // Blue
  pedestrian: new THREE.Color(0x00cc44), // Green
  object: new THREE.Color(0xff3333), // Red
};

// Define annotation box interface
export interface AnnotationBox {
  id: string;
  type: AnnotationType;
  position: THREE.Vector3;
  dimensions: THREE.Vector3;
  rotation: THREE.Euler;
  color: THREE.Color;
  mesh?: THREE.Mesh; // Reference to the Three.js mesh object
  frameId: number; // Frame where this annotation was created
  trackId?: string; // Unique identifier for tracking across frames
  isTracked?: boolean; // Whether this annotation is tracked from previous frame
}

// Define annotation context interface
interface AnnotationContextType {
  annotations: AnnotationBox[];
  selectedAnnotation: string | null;
  activeAnnotationType: AnnotationType | null;
  isAnnotating: boolean;
  currentFrameId: number;
  addAnnotation: (annotation: Omit<AnnotationBox, 'id' | 'color'>) => void;
  updateAnnotation: (id: string, updates: Partial<AnnotationBox>) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  setActiveAnnotationType: (type: AnnotationType | null) => void;
  setIsAnnotating: (isAnnotating: boolean) => void;
  setCurrentFrameId: (frameId: number) => void;
  getAnnotationsForFrame: (frameId: number) => AnnotationBox[];
  trackAnnotationsToFrame: (targetFrameId: number) => void;
}

// Create the context
const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

// Create provider component
export const AnnotationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [annotations, setAnnotations] = useState<AnnotationBox[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [activeAnnotationType, setActiveAnnotationType] = useState<AnnotationType | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [currentFrameId, setCurrentFrameId] = useState<number>(1);

  // Add a new annotation
  const addAnnotation = (annotation: Omit<AnnotationBox, 'id' | 'color'>) => {
    const id = `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const color = ANNOTATION_COLORS[annotation.type];
    
    // Generate trackId for new annotations (not tracked from previous frames)
    const trackId = annotation.trackId || `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setAnnotations(prev => [...prev, { ...annotation, id, color, trackId }]);
  };

  // Update an existing annotation
  const updateAnnotation = (id: string, updates: Partial<AnnotationBox>) => {
    setAnnotations(prev => 
      prev.map(ann => ann.id === id ? { ...ann, ...updates } : ann)
    );
  };

  // Delete an annotation
  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (selectedAnnotation === id) {
      setSelectedAnnotation(null);
    }
  };

  // Select an annotation
  const selectAnnotation = (id: string | null) => {
    setSelectedAnnotation(id);
  };

  // Get annotations for a specific frame
  const getAnnotationsForFrame = (frameId: number): AnnotationBox[] => {
    return annotations.filter(ann => ann.frameId === frameId);
  };

  // Track annotations from current frame to target frame
  const trackAnnotationsToFrame = (targetFrameId: number) => {
    const currentFrameAnnotations = getAnnotationsForFrame(currentFrameId);
    const targetFrameAnnotations = getAnnotationsForFrame(targetFrameId);
    
    // Find annotations that don't exist in target frame but exist in current frame
    const annotationsToTrack = currentFrameAnnotations.filter(currentAnn => {
      return !targetFrameAnnotations.some(targetAnn => targetAnn.trackId === currentAnn.trackId);
    });

    // Create tracked annotations for target frame
    const trackedAnnotations = annotationsToTrack.map(ann => ({
      ...ann,
      id: `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      frameId: targetFrameId,
      isTracked: true,
      // Keep the same position, dimensions, rotation for now (can be enhanced with prediction)
      position: ann.position.clone(),
      dimensions: ann.dimensions.clone(),
      rotation: ann.rotation.clone(),
      mesh: undefined // Reset mesh reference for new frame
    }));

    if (trackedAnnotations.length > 0) {
      setAnnotations(prev => [...prev, ...trackedAnnotations]);
      console.log(`Tracked ${trackedAnnotations.length} annotations to frame ${targetFrameId}`);
    }
  };

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
        selectedAnnotation,
        activeAnnotationType,
        isAnnotating,
        currentFrameId,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        selectAnnotation,
        setActiveAnnotationType,
        setIsAnnotating,
        setCurrentFrameId,
        getAnnotationsForFrame,
        trackAnnotationsToFrame,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};

// Create a hook for using the annotation context
export const useAnnotation = () => {
  const context = useContext(AnnotationContext);
  if (context === undefined) {
    throw new Error('useAnnotation must be used within an AnnotationProvider');
  }
  return context;
};