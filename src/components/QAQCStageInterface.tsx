"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, Eye, Settings, Database, CheckCircle, Cloud, Cpu, Activity, BarChart3, Filter, Zap, TrendingUp, Layers, Play, Download, FolderOpen, Upload } from "lucide-react"
import { ProcessingSimulationModal } from "./ProcessingSimulationModal"
import type { Stage, SerialData } from "../types"
import { DualCompanyViewer } from "./DualCompanyViewer"
import { serialDataService } from "../services/serialDataService"
import StageSimulation from "./simulations/StageSimulation"

interface StageInterfaceProps {
  stage: Stage
  serialData: SerialData[]
}

export const QAQCStageInterface: React.FC<StageInterfaceProps> = ({ stage, serialData }) => {
  const [selectedSerial, setSelectedSerial] = useState<SerialData | null>(null)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [showPointCloud, setShowPointCloud] = useState(true)
  const [selectedFunction, setSelectedFunction] = useState(0)
  const [viewMode, setViewMode] = useState<"single-original" | "single-kr" | "split" | "overlay">("single-original")
  
  // Post-processing feature states
  const [isNoiseRemovalActive, setIsNoiseRemovalActive] = useState(false)
  const [isSurfaceSmoothingActive, setIsSurfaceSmoothingActive] = useState(false)
  const [isDensityEnhancementActive, setIsDensityEnhancementActive] = useState(false)
  const [isSurfaceReconstructionActive, setIsSurfaceReconstructionActive] = useState(false)
  const [isBatchProcessingActive, setIsBatchProcessingActive] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [activeProcessing, setActiveProcessing] = useState<string | null>(null)
  
  // Simulation modal states
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false)
  const [simulationProcessName, setSimulationProcessName] = useState('')
  const [simulationDuration, setSimulationDuration] = useState(5000)
  const [isStageSimulationOpen, setIsStageSimulationOpen] = useState(false)

  const frameData = selectedSerial ? serialDataService.generateFrameData(selectedSerial.serialNumber) : []

  // Determine which company's data to show based on current view mode
  const companyForView = viewMode === "single-kr" ? "Metabread Co., Ltd." : "Original Source Factory Corporation";
  const displayedSerial = selectedSerial
    ? viewMode.includes("single")
      ? serialData.find(
          (s) => s.serialNumber === selectedSerial.serialNumber && s.company === companyForView,
        ) || selectedSerial
      : selectedSerial
    : null

  // Helper functions for fake processing effects
  const simulateProcessing = (processName: string, duration: number = 3000) => {
    setActiveProcessing(processName)
    setProcessingProgress(0)
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setActiveProcessing(null)
            setProcessingProgress(0)
          }, 1000)
          return 100
        }
        return prev + (100 / (duration / 100))
      })
    }, 100)
  }

  const handleNoiseRemoval = () => {
    setIsNoiseRemovalActive(!isNoiseRemovalActive)
    if (!isNoiseRemovalActive) {
      simulateProcessing('Noise Removal')
      setSimulationProcessName('Noise Removal')
      setSimulationDuration(5000)
      setIsSimulationModalOpen(true)
    }
  }

  const handleSurfaceSmoothing = () => {
    setIsSurfaceSmoothingActive(!isSurfaceSmoothingActive)
    if (!isSurfaceSmoothingActive) {
      simulateProcessing('Surface Smoothing')
      setSimulationProcessName('Surface Smoothing')
      setSimulationDuration(6000)
      setIsSimulationModalOpen(true)
    }
  }

  const handleDensityEnhancement = () => {
    setIsDensityEnhancementActive(!isDensityEnhancementActive)
    if (!isDensityEnhancementActive) {
      simulateProcessing('Density Enhancement')
      setSimulationProcessName('Density Enhancement')
      setSimulationDuration(7000)
      setIsSimulationModalOpen(true)
    }
  }

  const handleSurfaceReconstruction = () => {
    setIsSurfaceReconstructionActive(!isSurfaceReconstructionActive)
    if (!isSurfaceReconstructionActive) {
      simulateProcessing('Surface Reconstruction', 5000)
      setSimulationProcessName('Surface Reconstruction')
      setSimulationDuration(9000)
      setIsSimulationModalOpen(true)
    }
  }

  const handleExport = (format: 'ply' | 'obj' | 'glb') => {
    if (!selectedSerial) {
      alert('Please select a serial number first')
      return
    }

    // Simulate processing before export
    simulateProcessing(`Exporting ${format.toUpperCase()} File`)
    setSimulationProcessName(`Exporting ${format.toUpperCase()} File`)
    setSimulationDuration(3000)
    setIsSimulationModalOpen(true)
    
    // In a real implementation, this would call an API endpoint to generate and upload the file to S3
    setTimeout(() => {
      const fileName = `${selectedSerial.serialNumber}_frame${currentFrame}.${format}`
      const bucketPath = `s3://metabread-point-cloud-data/${selectedSerial.serialNumber}/exports/`
      
      // Show success message
      const successMessage = `File ${fileName} successfully added to S3 bucket at ${bucketPath}`
      console.log(successMessage)
      
      // Display a confirmation message to the user
      alert(`Successfully exported ${format.toUpperCase()} file to S3 bucket!\n\nFile: ${fileName}\nLocation: ${bucketPath}`)
    }, 3500) // Wait for the simulation to complete before showing confirmation
  }

  const handleBatchProcessing = () => {
    setIsBatchProcessingActive(!isBatchProcessingActive)
    if (!isBatchProcessingActive) {
      simulateProcessing('Batch Processing', 8000)
      setSimulationProcessName('Batch Processing')
      setSimulationDuration(10000)
      setIsSimulationModalOpen(true)
    }
  }

  // Group serial data by serial number to show both companies
  const groupedSerials = serialData.reduce(
    (acc, serial) => {
      const baseSerial = serial.serialNumber
      if (!acc[baseSerial]) {
        acc[baseSerial] = []
      }
      acc[baseSerial].push(serial)
      return acc
    },
    {} as Record<string, SerialData[]>,
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Enhanced Header with dual company support */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <div className="flex items-center space-x-3 mb-1 mt-10">
                <h1 className="text-2xl font-bold  text-green-400">Dual QA/QC Stage</h1>
              </div>
            </div>

            {/* AWS Status Indicators */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <Cloud className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300">AWS Connected</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-lg">
                <Cpu className="w-4 h-4 text-green-400" />
                <span className="text-green-300">Dual Processing</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-purple-300">Real-time sync</span>
              </div>
            </div>
          </div>

          {/* Serial Selection and Controls */}
          <div className="flex items-center space-x-3 mx-4">
            <div className="relative">
              <select
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                value={selectedSerial?.id || ""}
                onChange={(e) => {
                  const serial = serialData.find((s) => s.id === e.target.value)
                  setSelectedSerial(serial || null)
                  setCurrentFrame(1)
                }}
              >
                <option value="">Select Serial Number</option>
                {Object.entries(groupedSerials)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([serialNumber, serials]) => (
                    <option key={serialNumber} value={serials[0].id}>
                      {serialNumber}
                    </option>
                  ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowPointCloud(!showPointCloud)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                showPointCloud
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{showPointCloud ? "Point Cloud" : "Original Images"}</span>
            </button>

            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
              <BarChart3 className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">Dual Company Mode</span>
            </div>
          </div>
        </div>
        
        {/* Processing Simulation Modal */}
        <ProcessingSimulationModal
          isOpen={isSimulationModalOpen}
          onClose={() => setIsSimulationModalOpen(false)}
          processName={simulationProcessName}
          duration={simulationDuration}
        />
      </div>
      {/* Main content remains unchanged for now */}
      {displayedSerial ? (
        <div className="flex h-[calc(100vh-120px)]">
          {/* Enhanced Left Sidebar with dual company info */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
            {/* Serial Info with company details */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-400">Serial Information</h3>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Serial:</span>
                  <span className="font-mono text-blue-300">{displayedSerial.serialNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Company:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedSerial.company === "Metabread Co., Ltd."
                        ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                        : "bg-red-600/30 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {displayedSerial.company}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-right text-gray-200">{displayedSerial.workingDuration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedSerial.status === "Completed"
                        ? "bg-green-600/30 text-green-400 border border-green-500/30"
                        : selectedSerial.status === "In Progress"
                          ? "bg-blue-600/30 text-blue-400 border border-blue-500/30"
                          : selectedSerial.status === "Under Review"
                            ? "bg-yellow-600/30 text-yellow-400 border border-yellow-500/30"
                            : "bg-gray-600/30 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    {displayedSerial.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Invoice:</span>
                  <span className="font-mono text-gray-200">{displayedSerial.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-green-400 font-semibold">
                    ${displayedSerial.deliveryAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

           

            {/* Post-Processing Features Panel */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-green-400">Post-Processing Pipeline</h3>
                <div className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded border border-green-500/30">
                  QA/QC ENHANCED
                </div>
              </div>
              
              {/* Active Processing Indicator */}
              {activeProcessing && (
                <div className="mb-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-400 font-medium text-sm">{activeProcessing}</span>
                    <span className="text-blue-300 text-xs">{Math.round(processingProgress)}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* 1. Noise Removal */}
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-white">Noise Removal</span>
                    </div>
                    <button
                      onClick={handleNoiseRemoval}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isNoiseRemovalActive
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                      }`}
                    >
                      {isNoiseRemovalActive ? "Active" : "Enable"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Statistical Outlier Removal & Radius-Based Filtering</p>
                  {isNoiseRemovalActive && (
                    <div className="text-xs text-green-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Filtering isolated points...</span>
                    </div>
                  )}
                </div>

                {/* 2. Surface Smoothing */}
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">Surface Smoothing</span>
                    </div>
                    <button
                      onClick={handleSurfaceSmoothing}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isSurfaceSmoothingActive
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                      }`}
                    >
                      {isSurfaceSmoothingActive ? "Active" : "Enable"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Moving Least Squares & Normal Estimation</p>
                  {isSurfaceSmoothingActive && (
                    <div className="text-xs text-yellow-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span>Smoothing surfaces...</span>
                    </div>
                  )}
                </div>

                {/* 3. Density Enhancement */}
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">Density Enhancement</span>
                    </div>
                    <button
                      onClick={handleDensityEnhancement}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isDensityEnhancementActive
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                      }`}
                    >
                      {isDensityEnhancementActive ? "Active" : "Enable"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">AI-based Upsampling & Multi-frame Aggregation</p>
                  {isDensityEnhancementActive && (
                    <div className="text-xs text-purple-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span>Enhancing point density...</span>
                    </div>
                  )}
                </div>

                {/* 4. Surface Reconstruction */}
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-white">Surface Reconstruction</span>
                    </div>
                    <button
                      onClick={handleSurfaceReconstruction}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isSurfaceReconstructionActive
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                      }`}
                    >
                      {isSurfaceReconstructionActive ? "Active" : "Enable"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Poisson Reconstruction & Ball Pivoting</p>
                  {isSurfaceReconstructionActive && (
                    <div className="text-xs text-blue-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Reconstructing meshes...</span>
                    </div>
                  )}
                </div>

                {/* 5. Batch Processing */}
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-white">Batch Processing</span>
                    </div>
                    <button
                      onClick={handleBatchProcessing}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        isBatchProcessingActive
                          ? "bg-green-600 text-white"
                          : "bg-gray-600 hover:bg-gray-500 text-gray-300"
                      }`}
                    >
                      {isBatchProcessingActive ? "Running" : "Start"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">Automated Pipeline with S3/NAS Storage</p>
                  {isBatchProcessingActive && (
                    <div className="text-xs text-orange-400 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                      <span>Processing batch files...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Export Options */}
              <div className="mt-4 p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Export Options</h4>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleExport('ply')}
                    className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>.PLY</span>
                  </button>
                  <button 
                    onClick={() => handleExport('obj')}
                    className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>.OBJ</span>
                  </button>
                  <button 
                    onClick={() => handleExport('glb')}
                    className="flex-1 px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>.GLB</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Original Processing Functions - Simplified */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Stage Functions</h3>
              <div className="space-y-2">
           
                
                {/* Advanced Stage Simulation Button */}
                <button
                  onClick={() => setIsStageSimulationOpen(true)}
                  className="w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 text-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <span>Advanced Stage Simulation</span>
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Frame Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-blue-400">Frames ({frameData.length})</h3>
                <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">Dual Company Sync</div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Frame {currentFrame}/30</span>
                  <span className="text-blue-400 font-medium">{Math.round((currentFrame / 30) * 100)}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500 relative"
                    style={{ width: `${(currentFrame / 30) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setCurrentFrame(Math.max(1, currentFrame - 1))}
                  disabled={currentFrame === 1}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentFrame(Math.min(30, currentFrame + 1))}
                  disabled={currentFrame === 30}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  Next
                </button>
              </div>

              <div className="grid grid-cols-6 gap-1">
                {frameData.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setCurrentFrame(frame.id)}
                    className={`aspect-square text-xs rounded flex items-center justify-center transition-all duration-200 ${
                      currentFrame === frame.id
                        ? "bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg scale-110"
                        : frame.status === "labeled"
                          ? "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
                          : frame.status === "reviewing"
                            ? "bg-yellow-600 hover:bg-yellow-700 text-white hover:scale-105"
                            : "bg-gray-600 hover:bg-gray-500 text-gray-300 hover:scale-105"
                    }`}
                  >
                    {frame.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Processing Status */}
            <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">System Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU Usage:</span>
                  <span className="text-green-400">23%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Memory:</span>
                  <span className="text-blue-400">4.2GB / 16GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-green-400">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Companies:</span>
                  <span className="text-purple-400">2 Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content with Dual Company Viewer */}
          <div className="flex-1 p-4 w-[50%]">
            <div className="h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <DualCompanyViewer
                serialNumber={displayedSerial.serialNumber}
                frameId={currentFrame}
                showPointCloud={showPointCloud}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Enhanced Right Sidebar with dual company metadata */}
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-400">Dual Company Analysis</h3>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            <div className="space-y-4">
              {/* View Mode Status */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
                  <span>Current View Mode</span>
                  <div className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded border border-purple-500/30">
                    {viewMode === "single-original" || viewMode === "single-kr" ? "SINGLE" : viewMode.toUpperCase().replace("-", " ")}
                  </div>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="text-purple-400 font-medium">
                      {viewMode === "single-original"
                        ? "Preprocessed Only"
                        : viewMode === "single-kr"
                          ? "Refined Only"
                          : viewMode === "split"
                            ? "Side by Side"
                            : "Overlay Comparison"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Companies:</span>
                    <span className="text-blue-400 font-medium">{viewMode.includes("single") ? "1" : "2"}</span>
                  </div>
                </div>
              </div>

              {/* Company Comparison Data */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Company Comparison</h4>
                <div className="space-y-3">
                  <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-red-400 font-medium text-sm">Original Source Factory Corporation</span>
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stage:</span>
                        <span className="text-red-300">Preprocessing</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-400 font-medium text-sm">Metabread Co., Ltd.</span>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stage:</span>
                        <span className="text-blue-300">Refinement</span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Object Analysis */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center space-x-2">
                  <span>Object Analysis</span>
                  <div className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded border border-green-500/30">
                    DUAL TRACKED
                  </div>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-green-400 font-medium">Vehicle</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Original Confidence:</span>
                    <span className="text-red-400 font-medium">92.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Metabread Co., Ltd. Confidence:</span>
                    <span className="text-blue-400 font-medium">97.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Improvement:</span>
                    <span className="text-green-400 font-medium">+5.7%</span>
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Quality Metrics</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Annotation Accuracy:</span>
                    <span className="text-green-400">98.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Time:</span>
                    <span className="text-blue-400">2.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data Consistency:</span>
                    <span className="text-green-400">99.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cross-validation:</span>
                    <span className="text-green-400">Passed</span>
                  </div>
                </div>
              </div>

              {/* Post-Processing Effects Status */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600 mb-4">
                <h4 className="text-sm font-semibold text-green-300 mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Processing Effects
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Point Density:</span>
                    <span className={`font-medium ${
                      isDensityEnhancementActive ? "text-green-400" : "text-gray-400"
                    }`}>
                      {isDensityEnhancementActive ? "+150% Enhanced" : "Original"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Noise Level:</span>
                    <span className={`font-medium ${
                      isNoiseRemovalActive ? "text-green-400" : "text-yellow-400"
                    }`}>
                      {isNoiseRemovalActive ? "Filtered" : "Present"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Surface Quality:</span>
                    <span className={`font-medium ${
                      isSurfaceSmoothingActive ? "text-green-400" : "text-gray-400"
                    }`}>
                      {isSurfaceSmoothingActive ? "Smoothed" : "Raw"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mesh Status:</span>
                    <span className={`font-medium ${
                      isSurfaceReconstructionActive ? "text-blue-400" : "text-gray-400"
                    }`}>
                      {isSurfaceReconstructionActive ? "Generated" : "Point Cloud"}
                    </span>
                  </div>
                </div>
                
                {/* Visual Effect Indicator */}
                {(isNoiseRemovalActive || isSurfaceSmoothingActive || isDensityEnhancementActive || isSurfaceReconstructionActive) && (
                  <div className="mt-3 p-2 bg-green-600/20 border border-green-500/30 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">Enhanced Visualization Active</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Pipeline Status */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600 mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Pipeline Status</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Processes:</span>
                    <span className="text-blue-400 font-medium">
                      {[isNoiseRemovalActive, isSurfaceSmoothingActive, isDensityEnhancementActive, isSurfaceReconstructionActive, isBatchProcessingActive].filter(Boolean).length}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Time:</span>
                    <span className="text-green-400 font-medium">2.3s avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quality Score:</span>
                    <span className="text-green-400 font-medium">
                      {isNoiseRemovalActive && isSurfaceSmoothingActive ? "A+" : 
                       isNoiseRemovalActive || isSurfaceSmoothingActive ? "B+" : "B"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Output Format:</span>
                    <span className="text-purple-400 font-medium">
                      {isSurfaceReconstructionActive ? "Mesh" : "Point Cloud"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      handleNoiseRemoval()
                      handleSurfaceSmoothing()
                      handleDensityEnhancement()
                    }}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run Full Pipeline</span>
                  </button>
                  <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors">
                    Generate Report
                  </button>
                  <button className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors">
                    Reset Pipeline
                  </button>
                </div>
              </div>
              
              <StageSimulation isOpen={isStageSimulationOpen} onClose={() => setIsStageSimulationOpen(false)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-600">
              <Database className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-400 mb-3">Select a Serial Number</h2>
            <p className="text-gray-500 mb-6">Choose a serial number to view dual company visualization</p>
            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-4">
                <span>Original Source Factory Corporation & Metabread Co., Ltd.</span>
                <span>•</span>
                <span>Dual Company Mode</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
