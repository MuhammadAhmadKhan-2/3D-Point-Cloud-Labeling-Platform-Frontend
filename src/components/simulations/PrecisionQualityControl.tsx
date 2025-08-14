import React from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, AlertCircle, BarChart2, Download, Filter } from "lucide-react"

interface PrecisionQualityControlProps {
  navigateToNextStage?: () => void;
}

// Mock data for quality control
const mockQualityData = {
  qualityScore: 96,
  totalFrames: 18,
  passedFrames: 16,
  failedFrames: 2,
  metrics: {
    accuracy: 94,
    completeness: 97,
    consistency: 92
  },
  frames: [
    { id: "F001", status: "pass", score: 98, timestamp: "10:15:22" },
    { id: "F002", status: "pass", score: 97, timestamp: "10:16:45" },
    { id: "F003", status: "pass", score: 95, timestamp: "10:17:30" },
    { id: "F004", status: "fail", score: 68, timestamp: "10:18:12", issues: ["Missing annotations", "Low point density"] },
    { id: "F005", status: "pass", score: 94, timestamp: "10:19:05" },
    { id: "F006", status: "pass", score: 96, timestamp: "10:20:18" },
    { id: "F007", status: "pass", score: 99, timestamp: "10:21:33" },
    { id: "F008", status: "pass", score: 93, timestamp: "10:22:47" },
    { id: "F009", status: "fail", score: 72, timestamp: "10:23:59", issues: ["Calibration error", "Alignment issues"] },
    { id: "F010", status: "pass", score: 91, timestamp: "10:25:14" },
  ]
}

const PrecisionQualityControl: React.FC<PrecisionQualityControlProps> = ({ navigateToNextStage }) => {
  return (
    <div className="space-y-6">
      {/* Quality Score Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-700 rounded-lg p-4 border border-gray-600"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Quality Assessment</h3>
            <p className="text-gray-400 text-sm">Precision quality control results</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-white">{mockQualityData.qualityScore}%</div>
            <div className="text-sm text-gray-400">Quality Score</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getScoreColorClass(mockQualityData.qualityScore)}`}
              style={{ width: `${mockQualityData.qualityScore}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800 rounded p-2">
            <div className="text-lg font-semibold text-white">{mockQualityData.totalFrames}</div>
            <div className="text-xs text-gray-400">Total Frames</div>
          </div>
          <div className="bg-green-900/30 rounded p-2">
            <div className="text-lg font-semibold text-green-400">{mockQualityData.passedFrames}</div>
            <div className="text-xs text-green-500/70">Passed</div>
          </div>
          <div className="bg-red-900/30 rounded p-2">
            <div className="text-lg font-semibold text-red-400">{mockQualityData.failedFrames}</div>
            <div className="text-xs text-red-500/70">Failed</div>
          </div>
        </div>
      </motion.div>
      
      {/* Metrics Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <MetricCard 
          title="Accuracy" 
          value={mockQualityData.metrics.accuracy} 
          icon={<CheckCircle className="w-5 h-5" />} 
          delay={0.1}
        />
        <MetricCard 
          title="Completeness" 
          value={mockQualityData.metrics.completeness} 
          icon={<BarChart2 className="w-5 h-5" />} 
          delay={0.2}
        />
        <MetricCard 
          title="Consistency" 
          value={mockQualityData.metrics.consistency} 
          icon={<AlertCircle className="w-5 h-5" />} 
          delay={0.3}
        />
      </motion.div>
      
      {/* Frames Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
      >
        <div className="p-3 bg-gray-800 border-b border-gray-600 flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-300">Frame Quality Results</h3>
       
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="p-3 text-xs font-medium text-gray-400">Frame ID</th>
                <th className="p-3 text-xs font-medium text-gray-400">Status</th>
                <th className="p-3 text-xs font-medium text-gray-400">Score</th>
                <th className="p-3 text-xs font-medium text-gray-400">Timestamp</th>
                <th className="p-3 text-xs font-medium text-gray-400">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {mockQualityData.frames.map((frame, index) => (
                <motion.tr 
                  key={frame.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={`${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-700'}`}
                >
                  <td className="p-3 text-sm text-gray-300">{frame.id}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${frame.status === 'pass' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {frame.status === 'pass' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Pass
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Fail
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-600 rounded-full h-1.5 mr-2">
                        <div 
                          className={`h-1.5 rounded-full ${getScoreColorClass(frame.score)}`}
                          style={{ width: `${frame.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300">{frame.score}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-400">{frame.timestamp}</td>
                  <td className="p-3 text-sm text-gray-400">
                    {frame.issues ? (
                      <ul className="list-disc list-inside text-xs text-red-400">
                        {frame.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-green-400 text-xs">No issues detected</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-4">
        <button 
          onClick={() => {
            // Here you would typically update state or make an API call
            if (navigateToNextStage) navigateToNextStage();
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors"
        >
          Approve Quality Assessment
        </button>
      </div>
    </div>
  )
}

// Helper function to get color class based on score
const getScoreColorClass = (score: number) => {
  if (score >= 90) return 'bg-green-500'
  if (score >= 80) return 'bg-green-400'
  if (score >= 70) return 'bg-yellow-500'
  if (score >= 60) return 'bg-orange-500'
  return 'bg-red-500'
}

// Metric Card Component
interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  delay: number
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-gray-700 rounded-lg p-4 border border-gray-600"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium text-gray-400">{title}</h4>
          <div className="text-2xl font-bold text-white mt-1">{value}%</div>
        </div>
        <div className={`p-2 rounded-full ${getIconBgColor(value)}`}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <div className="w-full bg-gray-600 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getScoreColorClass(value)}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  )
}

// Helper function to get icon background color
const getIconBgColor = (value: number) => {
  if (value >= 90) return 'bg-green-500/20 text-green-500'
  if (value >= 80) return 'bg-green-400/20 text-green-400'
  if (value >= 70) return 'bg-yellow-500/20 text-yellow-500'
  if (value >= 60) return 'bg-orange-500/20 text-orange-500'
  return 'bg-red-500/20 text-red-500'
}

export default PrecisionQualityControl;