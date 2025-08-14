import React from "react"
import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, ArrowRight } from "lucide-react"

interface CrossCompanyValidationProps {
  navigateToNextStage?: () => void;
}

// Mock data for the comparison
const mockData = {
  matchRate: 87,
  totalItems: 24,
  matchedItems: 21,
  mismatchedItems: 3,
  companies: {
    original: "Original Source Factory Corporation",
    metabread: "Metabread Co., Ltd."
  },
  items: [
    { id: 1, name: "Frame 001", match: true },
    { id: 2, name: "Frame 002", match: true },
    { id: 3, name: "Frame 003", match: false },
    { id: 4, name: "Frame 004", match: true },
    { id: 5, name: "Frame 005", match: true },
    { id: 6, name: "Frame 006", match: true },
    { id: 7, name: "Frame 007", match: true },
    { id: 8, name: "Frame 008", match: false },
    { id: 9, name: "Frame 009", match: true },
    { id: 10, name: "Frame 010", match: true },
    { id: 11, name: "Frame 011", match: true },
    { id: 12, name: "Frame 012", match: true },
  ]
}

export const CrossCompanyValidation: React.FC<CrossCompanyValidationProps> = ({ navigateToNextStage }) => {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Validation Complete</h3>
            <p className="text-gray-400 text-sm">Cross-company data validation results</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-white">{mockData.matchRate}%</div>
            <div className="text-sm text-gray-400">Match Rate</div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-lg font-semibold text-white">{mockData.totalItems}</div>
            <div className="text-xs text-gray-400">Total Items</div>
          </div>
          <div className="bg-green-900/30 rounded p-2">
            <div className="text-lg font-semibold text-green-400">{mockData.matchedItems}</div>
            <div className="text-xs text-green-500/70">Matched</div>
          </div>
          <div className="bg-red-900/30 rounded p-2">
            <div className="text-lg font-semibold text-red-400">{mockData.mismatchedItems}</div>
            <div className="text-xs text-red-500/70">Mismatched</div>
          </div>
        </div>
      </motion.div>
      
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Source */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
        >
          <h3 className="text-md font-medium text-white mb-3">{mockData.companies.original}</h3>
          
          <div className="grid grid-cols-2 gap-2">
            {mockData.items.map(item => (
              <div 
                key={`original-${item.id}`}
                className={`relative p-3 rounded border ${item.match ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  {item.match ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="mt-1 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Metabread */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
        >
          <h3 className="text-md font-medium text-white mb-3">{mockData.companies.metabread}</h3>
          
          <div className="grid grid-cols-2 gap-2">
            {mockData.items.map(item => (
              <div 
                key={`metabread-${item.id}`}
                className={`relative p-3 rounded border ${item.match ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{item.name}</span>
                  {item.match ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="mt-1 h-12 bg-gray-800 rounded flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-4">

        <button 
          onClick={() => {
            // This would typically navigate to the next stage
         
            if (navigateToNextStage) navigateToNextStage();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors flex items-center"
        >
          Continue to Next Stage
          <ArrowRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default CrossCompanyValidation;