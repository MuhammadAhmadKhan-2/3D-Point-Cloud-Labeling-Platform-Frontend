import React from "react"
import { motion } from "framer-motion"
import { BarChart2, PieChart, TrendingUp, Download, Filter, RefreshCw, CheckCircle } from "lucide-react"

interface ComparativeAnalysisProps {
  navigateToNextStage?: () => void;
}

// Mock data for comparative analysis
const mockAnalysisData = {
  metrics: [
    { name: "Accuracy", value: 94, change: 2.5, trend: "up" },
    { name: "Error Rate", value: 3, change: -1.2, trend: "down" },
    { name: "Precision", value: 92, change: 1.8, trend: "up" },
    { name: "Recall", value: 89, change: 3.2, trend: "up" },
  ],
  chartData: {
    barChart: [
      { name: "Dataset A", value: 85 },
      { name: "Dataset B", value: 92 },
      { name: "Dataset C", value: 78 },
      { name: "Dataset D", value: 90 },
    ],
    pieChart: [
      { name: "Category 1", value: 45 },
      { name: "Category 2", value: 30 },
      { name: "Category 3", value: 15 },
      { name: "Category 4", value: 10 },
    ],
    lineChart: [
      { month: "Jan", value: 65 },
      { month: "Feb", value: 72 },
      { month: "Mar", value: 68 },
      { month: "Apr", value: 75 },
      { month: "May", value: 82 },
      { month: "Jun", value: 88 },
    ],
  },
}

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ navigateToNextStage }) => {
  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockAnalysisData.metrics.map((metric, index) => (
          <MetricCard 
            key={metric.name}
            metric={metric}
            delay={index * 0.1}
          />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
        >
          <div className="p-3 bg-gray-800 border-b border-gray-600 flex justify-between items-center">
            <div className="flex items-center">
              <BarChart2 className="w-4 h-4 text-blue-400 mr-2" />
              <h3 className="text-sm font-medium text-gray-300">Performance Comparison</h3>
            </div>
            {/* Buttons removed to streamline interface */}
          </div>
          
          <div className="p-4">
            {/* Bar Chart Visualization */}
            <div className="h-64 flex items-end space-x-6 justify-around pt-5 px-2">
              {mockAnalysisData.chartData.barChart.map((item, index) => (
                <div key={item.name} className="flex flex-col items-center">
                  <motion.div 
                    className="w-12 bg-blue-500 rounded-t"
                    initial={{ height: 0 }}
                    animate={{ height: `${item.value * 2}px` }}
                    transition={{ duration: 0.7, delay: 0.3 + index * 0.1 }}
                  ></motion.div>
                  <div className="text-xs text-gray-400 mt-2">{item.name}</div>
                  <div className="text-sm font-medium text-white">{item.value}%</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
        >
          <div className="p-3 bg-gray-800 border-b border-gray-600 flex justify-between items-center">
            <div className="flex items-center">
              <PieChart className="w-4 h-4 text-purple-400 mr-2" />
              <h3 className="text-sm font-medium text-gray-300">Category Distribution</h3>
            </div>
            {/* Buttons removed to streamline interface */}
          </div>
          
          <div className="p-4 flex">
            {/* Pie Chart Visualization */}
            <div className="relative w-40 h-40 mx-auto">
              {mockAnalysisData.chartData.pieChart.map((item, index) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500']
                const startAngle = index > 0 
                  ? mockAnalysisData.chartData.pieChart
                      .slice(0, index)
                      .reduce((sum, curr) => sum + curr.value, 0) / 100 * 360
                  : 0
                const angle = item.value / 100 * 360
                
                return (
                  <motion.div 
                    key={item.name}
                    className={`absolute inset-0 ${colors[index % colors.length]}`}
                    style={{
                      clipPath: `path('M 100 100 L 100 0 A 100 100 0 ${angle > 180 ? 1 : 0} 1 ${100 + 100 * Math.sin(Math.PI * 2 * (startAngle + angle) / 360)} ${100 - 100 * Math.cos(Math.PI * 2 * (startAngle + angle) / 360)} L 100 100')`,
                      transform: `rotate(${startAngle}deg)`,
                      opacity: 0,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  />
                )
              })}
              <div className="absolute inset-[15%] rounded-full bg-gray-800 flex items-center justify-center">
                <div className="text-lg font-bold text-white">100%</div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="ml-4 flex flex-col justify-center space-y-2">
              {mockAnalysisData.chartData.pieChart.map((item, index) => {
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500']
                return (
                  <div key={item.name} className="flex items-center">
                    <div className={`w-3 h-3 rounded-sm ${colors[index % colors.length]} mr-2`}></div>
                    <div className="text-xs text-gray-300">{item.name}</div>
                    <div className="ml-2 text-xs font-medium text-white">{item.value}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Line Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
      >
        <div className="p-3 bg-gray-800 border-b border-gray-600 flex justify-between items-center">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 text-green-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-300">Performance Trend</h3>
          </div>
          {/* Buttons removed to streamline interface */}
        </div>
        
        <div className="p-4">
          {/* Line Chart Visualization */}
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-gray-400">
              <div>100%</div>
              <div>75%</div>
              <div>50%</div>
              <div>25%</div>
              <div>0%</div>
            </div>
            
            {/* Chart area */}
            <div className="absolute left-10 right-0 top-0 bottom-0">
              {/* Horizontal grid lines */}
              <div className="absolute left-0 right-0 top-0 h-px bg-gray-600/30"></div>
              <div className="absolute left-0 right-0 top-1/4 h-px bg-gray-600/30"></div>
              <div className="absolute left-0 right-0 top-2/4 h-px bg-gray-600/30"></div>
              <div className="absolute left-0 right-0 top-3/4 h-px bg-gray-600/30"></div>
              <div className="absolute left-0 right-0 bottom-0 h-px bg-gray-600/30"></div>
              
              {/* Line chart */}
              <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d={`M ${mockAnalysisData.chartData.lineChart.map((point, index) => 
                    `${index * (100 / (mockAnalysisData.chartData.lineChart.length - 1))} ${100 - point.value}`
                  ).join(' L ')}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                
                {/* Data points */}
                {mockAnalysisData.chartData.lineChart.map((point, index) => (
                  <motion.circle
                    key={index}
                    cx={index * (100 / (mockAnalysisData.chartData.lineChart.length - 1))}
                    cy={100 - point.value}
                    r="1.5"
                    fill="#3b82f6"
                    initial={{ r: 0 }}
                    animate={{ r: 1.5 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  />
                ))}
              </svg>
              
              {/* X-axis labels */}
              <div className="absolute left-0 right-0 bottom-0 top-full mt-2 flex justify-between text-xs text-gray-400">
                {mockAnalysisData.chartData.lineChart.map((point) => (
                  <div key={point.month}>{point.month}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Metric Card Component
interface MetricCardProps {
  metric: {
    name: string
    value: number
    change: number
    trend: "up" | "down"
  }
  delay: number
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-gray-700 rounded-lg p-4 border border-gray-600"
    >
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-gray-400">{metric.name}</h4>
        <div className={`flex items-center text-xs font-medium ${metric.trend === "up" 
          ? metric.name === "Error Rate" ? 'text-red-400' : 'text-green-400'
          : metric.name === "Error Rate" ? 'text-green-400' : 'text-red-400'}`}
        >
          {metric.change > 0 ? '+' : ''}{metric.change}%
          <TrendingUp className={`w-3 h-3 ml-1 ${metric.trend === "up" ? '' : 'transform rotate-180'}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mt-1">
        {metric.value}{metric.name === "Error Rate" ? '%' : '%'}
      </div>
      <div className="mt-3">
        <div className="w-full bg-gray-600 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${getMetricColorClass(metric)}`}
            style={{ width: `${metric.name === "Error Rate" ? 100 - metric.value : metric.value}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  )
}

// Helper function to get color class based on metric
const getMetricColorClass = (metric: { name: string, value: number }) => {
  if (metric.name === "Error Rate") {
    if (metric.value <= 3) return 'bg-green-500'
    if (metric.value <= 5) return 'bg-yellow-500'
    if (metric.value <= 10) return 'bg-orange-500'
    return 'bg-red-500'
  } else {
    if (metric.value >= 90) return 'bg-green-500'
    if (metric.value >= 80) return 'bg-green-400'
    if (metric.value >= 70) return 'bg-yellow-500'
    if (metric.value >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }
}

export default ComparativeAnalysis;