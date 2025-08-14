"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertTriangle, BarChart2, Layers, Activity, RefreshCw, Check, X } from "lucide-react"
import { CrossCompanyValidation } from "./simulations/CrossCompanyValidation"
import { AnnotationReview } from "./simulations/AnnotationReview"
import { PrecisionQualityControl } from "./simulations/PrecisionQualityControl"
import { DualSourceVerification } from "./simulations/DualSourceVerification"
import { ComparativeAnalysis } from "./simulations/ComparativeAnalysis"

type SimulationStage = 
  | "cross-company-validation"
  | "3d-annotation-review"
  | "precision-quality-control"
  | "dual-source-verification"
  | "comparative-analysis"
  | null

export const StageSimulation: React.FC = () => {
  const [activeStage, setActiveStage] = useState<SimulationStage>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // Handle stage button click
  const handleStageClick = (stage: SimulationStage) => {
    console.log(`Selected stage: ${stage}`)
    
    // If same stage clicked, do nothing
    if (stage === activeStage) return
    
    // Start loading animation
    setIsLoading(true)
    setLoadingProgress(0)
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          setActiveStage(stage)
          return 100
        }
        return prev + 10
      })
    }, 150) // 1.5 seconds total loading time
    
    return () => clearInterval(interval)
  }
  
  // Render the active stage component
  const renderActiveStage = () => {
    if (!activeStage) return null
    
    switch (activeStage) {
      case "cross-company-validation":
        return <CrossCompanyValidation />
      case "3d-annotation-review":
        return <AnnotationReview />
      case "precision-quality-control":
        return <PrecisionQualityControl />
      case "dual-source-verification":
        return <DualSourceVerification />
      case "comparative-analysis":
        return <ComparativeAnalysis />
      default:
        return null
    }
  }
  
  return (
    <div className="w-full bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Stage Selection Buttons */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-900 border-b border-gray-700">
        <StageButton 
          icon={<RefreshCw className="w-4 h-4 mr-2" />}
          label="Cross-Company Validation"
          isActive={activeStage === "cross-company-validation"}
          onClick={() => handleStageClick("cross-company-validation")}
        />
        <StageButton 
          icon={<Layers className="w-4 h-4 mr-2" />}
          label="3D Annotation Review"
          isActive={activeStage === "3d-annotation-review"}
          onClick={() => handleStageClick("3d-annotation-review")}
        />
        <StageButton 
          icon={<CheckCircle className="w-4 h-4 mr-2" />}
          label="Precision Quality Control"
          isActive={activeStage === "precision-quality-control"}
          onClick={() => handleStageClick("precision-quality-control")}
        />
        <StageButton 
          icon={<Activity className="w-4 h-4 mr-2" />}
          label="Dual Source Verification"
          isActive={activeStage === "dual-source-verification"}
          onClick={() => handleStageClick("dual-source-verification")}
        />
        <StageButton 
          icon={<BarChart2 className="w-4 h-4 mr-2" />}
          label="Comparative Analysis"
          isActive={activeStage === "comparative-analysis"}
          onClick={() => handleStageClick("comparative-analysis")}
        />
      </div>
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
            <motion.div 
              className="bg-blue-600 h-2.5"
              initial={{ width: 0 }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-gray-400 text-sm">Loading stage data...</p>
        </div>
      )}
      
      {/* Stage Content */}
      <AnimatePresence mode="wait">
        {!isLoading && activeStage && (
          <motion.div
            key={activeStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-4"
          >
            {renderActiveStage()}
          </motion.div>
        )}
        
        {!isLoading && !activeStage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a Stage</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Choose one of the stage buttons above to view the simulation interface.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Stage Button Component
interface StageButtonProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

const StageButton: React.FC<StageButtonProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      {icon}
      {label}
    </button>
  )
}