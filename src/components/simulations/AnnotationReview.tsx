import React, { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Box, Tag, Info, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react"

interface AnnotationReviewProps {
  navigateToNextStage?: () => void;
}

// Mock annotation data
const mockAnnotations = [
  { id: 1, type: "Vehicle", confidence: 0.92, position: { x: 25, y: 25 } },
  { id: 2, type: "Pedestrian", confidence: 0.87, position: { x: 50, y: 20 } },
  { id: 3, type: "Traffic Sign", confidence: 0.78, position: { x: 25, y: 55 } },
  { id: 4, type: "Building", confidence: 0.95, position: { x: 50, y: 75 } },
]

const AnnotationReview: React.FC<AnnotationReviewProps> = ({ navigateToNextStage }) => {
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 3D Viewer Placeholder */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
        >
          <div className="p-3 bg-gray-800 border-b border-gray-600 flex justify-between items-center">
            <div className="flex items-center">
                  <Box className="w-4 h-4 text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-gray-300">3D Point Cloud Viewer</span>
                </div>
            <div className="text-xs text-gray-400">Metabread Co., Ltd.</div>
          </div>
          
          {/* 3D Viewer Placeholder */}
          <div className="relative h-[400px] bg-gray-900 flex items-center justify-center">
            {/* Grid lines for 3D effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(60,60,60,0.1)_1px,_transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Placeholder 3D object */}
            <div className="relative w-64 h-64 transform-gpu rotate-x-60 rotate-z-45 perspective-800">
              <div className="absolute inset-0 bg-blue-500/10 border border-blue-500/30 rounded-lg transform-gpu rotate-y-45"></div>
              <div className="absolute inset-0 bg-blue-500/5 border border-blue-500/20 rounded-lg transform-gpu -rotate-y-45 -rotate-x-15"></div>
              <Box className="w-16 h-16 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            {/* Annotation markers */}
            {mockAnnotations.map(annotation => (
              <motion.div 
                key={annotation.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + annotation.id * 0.1 }}
                className={`absolute cursor-pointer
                  ${selectedAnnotation === annotation.id ? 'z-10' : 'z-0'}
                `}
                style={{ 
                  left: `${annotation.position.x}%`, 
                  top: `${annotation.position.y}%`,
                }}
                onClick={() => setSelectedAnnotation(annotation.id)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center
                  ${selectedAnnotation === annotation.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}
                `}>
                  <Tag className="w-3 h-3" />
                </div>
                
                {/* Annotation info popup */}
                {selectedAnnotation === annotation.id && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-full ml-2 top-0 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 p-2 text-xs"
                  >
                    <div className="font-medium text-white mb-1">{annotation.type}</div>
                    <div className="text-gray-400 mb-2">Confidence: {(annotation.confidence * 100).toFixed(0)}%</div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => alert(`Details for ${annotation.type} annotation`)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 text-gray-300 flex items-center justify-center"
                      >
                        <Info className="w-3 h-3 mr-1" />
                        Details
                      </button>
                      <button 
                        onClick={() => alert(`Add comment to ${annotation.type} annotation`)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 text-gray-300 flex items-center justify-center"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Comment
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Annotation Review Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full lg:w-80 bg-gray-700 rounded-lg border border-gray-600 flex flex-col"
        >
          <div className="p-3 bg-gray-800 border-b border-gray-600">
            <h3 className="text-sm font-medium text-gray-300">Annotation Review</h3>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Frame Information</label>
                <div className="bg-gray-800 rounded p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Frame ID:</span>
                    <span className="text-gray-300">F-2023-10-15-001</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Timestamp:</span>
                    <span className="text-gray-300">15:42:33</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annotations:</span>
                    <span className="text-gray-300">{mockAnnotations.length}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Review Feedback</label>
                <textarea 
                  className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm text-gray-300 h-24"
                  placeholder="Add your review comments here..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Quality Assessment</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">Accuracy</div>
                    <div className="text-sm font-medium text-green-400">92%</div>
                  </div>
                  <div className="bg-gray-800 rounded p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">Completeness</div>
                    <div className="text-sm font-medium text-yellow-400">87%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-800 border-t border-gray-600 flex space-x-2">
            <button 
              onClick={() => {
                // Here you would typically update state or make an API call
                if (navigateToNextStage) navigateToNextStage();
              }}
              className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-md py-2 text-sm font-medium transition-colors flex items-center justify-center"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve
            </button>
            <button 
              onClick={() => {
                alert('Annotation rejected. Please provide feedback.');
                // Here you would typically update state or make an API call
              }}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-md py-2 text-sm font-medium transition-colors flex items-center justify-center"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Reject
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnnotationReview;