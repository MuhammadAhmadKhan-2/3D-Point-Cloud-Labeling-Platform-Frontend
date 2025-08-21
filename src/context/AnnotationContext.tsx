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
}

// Define annotation context interface
interface AnnotationContextType {
  annotations: AnnotationBox[];
  selectedAnnotation: string | null;
  activeAnnotationType: AnnotationType | null;
  isAnnotating: boolean;
  addAnnotation: (annotation: Omit<AnnotationBox, 'id' | 'color'>) => void;
  updateAnnotation: (id: string, updates: Partial<AnnotationBox>) => void;
  deleteAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  setActiveAnnotationType: (type: AnnotationType | null) => void;
  setIsAnnotating: (isAnnotating: boolean) => void;
}

// Create the context
const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

// Create provider component
export const AnnotationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [annotations, setAnnotations] = useState<AnnotationBox[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [activeAnnotationType, setActiveAnnotationType] = useState<AnnotationType | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);

  // Add a new annotation
  const addAnnotation = (annotation: Omit<AnnotationBox, 'id' | 'color'>) => {
    const id = `annotation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const color = ANNOTATION_COLORS[annotation.type];
    
    setAnnotations(prev => [...prev, { ...annotation, id, color }]);
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

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
        selectedAnnotation,
        activeAnnotationType,
        isAnnotating,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        selectAnnotation,
        setActiveAnnotationType,
        setIsAnnotating,
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