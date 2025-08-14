import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, RefreshCw, ArrowLeftRight, Zap } from "lucide-react"

interface DualSourceVerificationProps {
  navigateToNextStage?: () => void;
}

// Mock data for verification
const mockVerificationData = {
  source1: {
    name: "Primary Data Source",
    frames: 24,
    points: "1.2M",
    timestamp: "2023-10-15 14:30:22"
  },
  source2: {
    name: "Secondary Data Source",
    frames: 24,
    points: "1.18M",
    timestamp: "2023-10-15 14:32:05"
  },
  matchResult: true,
  matchRate: 98.5,
  verificationSteps: [
    { id: 1, name: "Structure Verification", status: "complete", result: "pass" },
    { id: 2, name: "Point Cloud Density Check", status: "complete", result: "pass" },
    { id: 3, name: "Metadata Comparison", status: "complete", result: "pass" },
    { id: 4, name: "Timestamp Validation", status: "complete", result: "pass" },
    { id: 5, name: "Format Consistency", status: "complete", result: "pass" },
  ]
}

const DualSourceVerification: React.FC<DualSourceVerificationProps> = ({ navigateToNextStage }) => {
  const [verifying, setVerifying] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [showResult, setShowResult] = useState(false)
  
  // Simulate verification process
  useEffect(() => {
    if (verifying) {
      const timer = setTimeout(() => {
        if (currentStep < mockVerificationData.verificationSteps.length) {
          setCurrentStep(prev => prev + 1)
        } else {
          setVerifying(false)
          setTimeout(() => setShowResult(true), 500)
        }
      }, 600)
      
      return () => clearTimeout(timer)
    }
  }, [verifying, currentStep])
  
  return (
    <div className="space-y-6">
      {/* Source Comparison Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source 1 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
        >
          <h3 className="text-md font-medium text-white mb-3 flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            {mockVerificationData.source1.name}
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Frames</div>
              <div className="text-lg font-semibold text-white">{mockVerificationData.source1.frames}</div>
            </div>
            <div className="bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Points</div>
              <div className="text-lg font-semibold text-white">{mockVerificationData.source1.points}</div>
            </div>
          </div>
          
          {/* Source 1 Data Visualization */}
          <div className="bg-gray-800 rounded-lg h-40 flex items-center justify-center relative overflow-hidden">
            {/* Grid pattern background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(60,60,60,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(60,60,60,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Data visualization placeholder */}
            <div className="w-3/4 h-3/4 relative">
              <motion.div 
                className="absolute inset-0 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                animate={{ 
                  rotateY: [0, 180],
                  rotateX: [0, 180],
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }}
              />
              
              {/* Data points */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div 
                  key={`point1-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-400">
            Timestamp: {mockVerificationData.source1.timestamp}
          </div>
        </motion.div>
        
        {/* Source 2 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
        >
          <h3 className="text-md font-medium text-white mb-3 flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
            {mockVerificationData.source2.name}
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Frames</div>
              <div className="text-lg font-semibold text-white">{mockVerificationData.source2.frames}</div>
            </div>
            <div className="bg-gray-800 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">Points</div>
              <div className="text-lg font-semibold text-white">{mockVerificationData.source2.points}</div>
            </div>
          </div>
          
          {/* Source 2 Data Visualization */}
          <div className="bg-gray-800 rounded-lg h-40 flex items-center justify-center relative overflow-hidden">
            {/* Grid pattern background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(60,60,60,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(60,60,60,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Data visualization placeholder */}
            <div className="w-3/4 h-3/4 relative">
              <motion.div 
                className="absolute inset-0 bg-purple-500/10 border border-purple-500/30 rounded-lg"
                animate={{ 
                  rotateY: [0, -180],
                  rotateX: [0, -180],
                }}
                transition={{ 
                  duration: 20, 
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }}
              />
              
              {/* Data points */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div 
                  key={`point2-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1 + 0.5,
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-400">
            Timestamp: {mockVerificationData.source2.timestamp}
          </div>
        </motion.div>
      </div>
      
      {/* Verification Process */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
      >
        <div className="p-3 bg-gray-800 border-b border-gray-600 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-300 flex items-center">
            {verifying ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                </motion.div>
                Verification in Progress
              </>
            ) : showResult ? (
              <>
                {mockVerificationData.matchResult ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Both Sources Match
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    Mismatch Found
                  </>
                )}
              </>
            ) : (
              <>Verification Complete</>
            )}
          </h3>
          <div className="flex items-center">
            <ArrowLeftRight className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-xs font-medium text-gray-400">Dual Source Verification</span>
          </div>
        </div>
        
        <div className="p-4">
          {/* Verification Steps */}
          <div className="space-y-3">
            {mockVerificationData.verificationSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-center p-2 rounded ${index < currentStep ? 'bg-gray-800' : 'bg-gray-800/50'}`}
              >
                <div className="mr-3">
                  {index < currentStep ? (
                    step.result === "pass" ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )
                  ) : index === currentStep && verifying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-5 h-5 text-blue-400" />
                    </motion.div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-300">{step.name}</div>
                  {index < currentStep && (
                    <div className={`text-xs ${step.result === "pass" ? 'text-green-400' : 'text-red-400'}`}>
                      {step.result === "pass" ? "Passed" : "Failed"}
                    </div>
                  )}
                </div>
                {index < currentStep && step.result === "pass" && (
                  <div className="text-xs text-gray-400">100%</div>
                )}
              </div>
            ))}
          </div>
          
          {/* Result Summary */}
          {showResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-gray-800 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white">Verification Summary</div>
                <div className="text-xs font-medium text-gray-400">Match Rate: {mockVerificationData.matchRate}%</div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-1.5 mb-3">
                <div 
                  className="h-1.5 rounded-full bg-green-500"
                  style={{ width: `${mockVerificationData.matchRate}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-center p-2 rounded bg-green-900/20 border border-green-900/30">
                <Zap className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-400">
                  Both sources have been successfully verified and match at {mockVerificationData.matchRate}% accuracy
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-4">
        <button 
          onClick={() => {
            if (navigateToNextStage) navigateToNextStage();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors"
        >
          Continue to Next Stage
        </button>
      </div>
    </div>
  )
}

export default DualSourceVerification;