import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import CrossCompanyValidation from './CrossCompanyValidation';
import AnnotationReview from './AnnotationReview';
import PrecisionQualityControl from './PrecisionQualityControl';
import DualSourceVerification from './DualSourceVerification';
import ComparativeAnalysis from './ComparativeAnalysis';

type Stage = 
  | 'cross-company-validation'
  | '3d-annotation-review'
  | 'precision-quality-control'
  | 'dual-source-verification'
  | 'comparative-analysis'
  | null;

interface StageSimulationProps {
  isOpen: boolean;
  onClose: () => void;
}

const StageSimulation: React.FC<StageSimulationProps> = ({ isOpen, onClose }) => {
  const [activeStage, setActiveStage] = useState<Stage>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Function to navigate to the next stage
  const navigateToNextStage = () => {
    const stages: Stage[] = [
      'cross-company-validation',
      '3d-annotation-review',
      'precision-quality-control',
      'dual-source-verification',
      'comparative-analysis'
    ];
    
    const currentIndex = activeStage ? stages.indexOf(activeStage) : -1;
    if (currentIndex < stages.length - 1) {
      handleStageClick(stages[currentIndex + 1]);
    } else {
      // If we're at the last stage, show a completion message
      alert('All stages completed successfully!');
    }
  };

  // Handle stage button click
  const handleStageClick = (stage: Stage) => {
    console.log(`Selected stage: ${stage}`);
    
    // Reset if clicking the same stage
    if (activeStage === stage) {
      setActiveStage(null);
      return;
    }
    
    setIsLoading(true);
    setLoadingProgress(0);
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          setActiveStage(stage);
          return 100;
        }
        return prev + 10;
      });
    }, 150); // Complete in ~1.5 seconds
    
    return () => clearInterval(interval);
  };

  // Stage button component for consistent styling
  const StageButton: React.FC<{
    stage: Stage;
    label: string;
    isActive: boolean;
  }> = ({ stage, label, isActive }) => (
    <button
      onClick={() => handleStageClick(stage)}
      className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      {label}
    </button>
  );

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200">Advanced Stage Simulation</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Stage Selection Buttons */}
            <div className="flex flex-wrap gap-2">
              <StageButton 
                stage="cross-company-validation" 
                label="Cross-Company Validation" 
                isActive={activeStage === 'cross-company-validation'} 
              />
              <StageButton 
                stage="3d-annotation-review" 
                label="3D Annotation Review" 
                isActive={activeStage === '3d-annotation-review'} 
              />
              <StageButton 
                stage="precision-quality-control" 
                label="Precision Quality Control" 
                isActive={activeStage === 'precision-quality-control'} 
              />
              <StageButton 
                stage="dual-source-verification" 
                label="Dual Source Verification" 
                isActive={activeStage === 'dual-source-verification'} 
              />
              <StageButton 
                stage="comparative-analysis" 
                label="Comparative Analysis" 
                isActive={activeStage === 'comparative-analysis'} 
              />
            </div>

            {/* Loading Animation */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 relative">
                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                    <div 
                      className="absolute inset-0 border-4 border-blue-500 rounded-full" 
                      style={{
                        clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - loadingProgress}%)`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-blue-400">
                      {loadingProgress}%
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 font-medium">
                    {activeStage === 'cross-company-validation' && 'Validating cross-company data...'}
                    {activeStage === '3d-annotation-review' && 'Loading 3D annotations...'}
                    {activeStage === 'precision-quality-control' && 'Analyzing quality metrics...'}
                    {activeStage === 'dual-source-verification' && 'Comparing data sources...'}
                    {activeStage === 'comparative-analysis' && 'Generating analysis charts...'}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stage Content */}
            <AnimatePresence mode="wait">
              {!isLoading && activeStage && (
                <motion.div
                  key={activeStage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 overflow-hidden"
                >
                  {activeStage === 'cross-company-validation' && (
                    <CrossCompanyValidation navigateToNextStage={navigateToNextStage} />
                  )}
                  {activeStage === '3d-annotation-review' && (
                    <AnnotationReview navigateToNextStage={navigateToNextStage} />
                  )}
                  {activeStage === 'precision-quality-control' && (
                    <PrecisionQualityControl navigateToNextStage={navigateToNextStage} />
                  )}
                  {activeStage === 'dual-source-verification' && (
                    <DualSourceVerification navigateToNextStage={navigateToNextStage} />
                  )}
                  {activeStage === 'comparative-analysis' && (
                    <ComparativeAnalysis navigateToNextStage={navigateToNextStage} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StageSimulation;