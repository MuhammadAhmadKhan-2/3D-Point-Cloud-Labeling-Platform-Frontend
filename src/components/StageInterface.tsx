"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, Eye, Settings, Database, CheckCircle, Cloud, Cpu, Activity, BarChart3, Play } from "lucide-react"
import type { Stage, SerialData } from "../types"
import { DualCompanyViewer } from "./DualCompanyViewer"
import { serialDataService } from "../services/serialDataService"
import StageSimulation from "./simulations/StageSimulation"

interface StageInterfaceProps {
  stage: Stage
  serialData: SerialData[]
}

export const StageInterface: React.FC<StageInterfaceProps> = ({ stage, serialData }) => {
  const [selectedSerial, setSelectedSerial] = useState<SerialData | null>(null)
  const [currentFrame, setCurrentFrame] = useState(1)
  const [showPointCloud, setShowPointCloud] = useState(true)
  const [selectedFunction, setSelectedFunction] = useState(0)
  const [viewMode, setViewMode] = useState<"single-original" | "single-kr" | "split" | "overlay">("single-original")
  const [availableFrames, setAvailableFrames] = useState<number[]>([])
  const [frameLoading, setFrameLoading] = useState(false)
  const [isStageSimulationOpen, setIsStageSimulationOpen] = useState(false)

  // Generate frame data for UI display
  const frameData = selectedSerial ? serialDataService.generateFrameData(selectedSerial.serialNumber) : []

  // Fetch available frames when a serial is selected
  useEffect(() => {
    if (!selectedSerial) {
      setAvailableFrames([]);
      return;
    }

    const fetchFrames = async () => {
      setFrameLoading(true);
      try {
        // For this implementation, we'll use a fixed number of frames (30)
        // In a real implementation, you would fetch the actual available frames from the backend
        const frames = Array.from({ length: 30 }, (_, i) => i + 1);
        setAvailableFrames(frames);
        // Reset to frame 1 when a new serial is selected
        setCurrentFrame(1);
      } catch (error) {
        console.error('Error fetching frames:', error);
        setAvailableFrames([1]); // Default to at least frame 1
      } finally {
        setFrameLoading(false);
      }
    };

    fetchFrames();
  }, [selectedSerial?.serialNumber]);

  // Determine which company's data to show based on current view mode
  const companyForView = viewMode === "single-kr" ? "Metabread Co., Ltd." : "Original Source Factory Corporation";
  const displayedSerial = selectedSerial
    ? viewMode.includes("single")
      ? serialData.find(
          (s) => s.serialNumber === selectedSerial.serialNumber && s.company === companyForView,
        ) || selectedSerial // fallback to previously selected
      : selectedSerial // split/overlay; keep previously selected (or aggregate view)
    : null

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

  // Function is now properly implemented with the useState hook above

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Enhanced Header with dual company support */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <div className="flex items-center space-x-3 mb-1 mt-10">
                <h1 className="text-2xl font-bold text-blue-400">{stage.name} Stage</h1>
               
              </div>
              <p className="text-gray-300">Original Source Factory Corporation & Metabread Co., Ltd.</p>
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
                className={`bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-8 appearance-none min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-opacity ${!showPointCloud ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                value={selectedSerial?.id || ""}
                onChange={(e) => {
                  if (!showPointCloud) return;
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

            {/* Rest of the existing sidebar content... */}
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
                <h3 className="text-lg font-semibold text-blue-400">Frames ({availableFrames.length})</h3>
                <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                  {frameLoading ? 'Loading...' : 'Frame Selection'}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>Frame {currentFrame}/{availableFrames.length || 30}</span>
                  <span className="text-blue-400 font-medium">
                    {Math.round((currentFrame / (availableFrames.length || 30)) * 100)}%
                  </span>
                </div>
                <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500 relative"
                    style={{ width: `${(currentFrame / (availableFrames.length || 30)) * 100}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setCurrentFrame(Math.max(1, currentFrame - 1))}
                  disabled={currentFrame === 1 || frameLoading}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentFrame(Math.min(availableFrames.length || 30, currentFrame + 1))}
                  disabled={currentFrame === (availableFrames.length || 30) || frameLoading}
                  className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  Next
                </button>
              </div>

              {frameLoading ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-6 gap-1">
                  {availableFrames.map((frameId) => {
                    // Find the corresponding frame data for styling
                    const frameInfo = frameData.find(f => f.id === frameId) || {
                      id: frameId,
                      status: 'pending'
                    };
                    
                    return (
                      <button
                        key={frameId}
                        onClick={() => setCurrentFrame(frameId)}
                        className={`aspect-square text-xs rounded flex items-center justify-center transition-all duration-200 ${
                          currentFrame === frameId
                            ? "bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg scale-110"
                            : frameInfo.status === "labeled"
                              ? "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
                              : frameInfo.status === "reviewing"
                                ? "bg-yellow-600 hover:bg-yellow-700 text-white hover:scale-105"
                                : "bg-gray-600 hover:bg-gray-500 text-gray-300 hover:scale-105"
                        }`}
                      >
                        {frameId}
                      </button>
                    );
                  })}
                </div>
              )}
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
                    {viewMode.toUpperCase().replace("-", " ")}
                  </div>
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mode:</span>
                    <span className="text-purple-400 font-medium">
                      {viewMode === "single-original"
                        ? "Original Source Only"
                        : viewMode === "single-kr"
                          ? "Metabread Co., Ltd. Only"
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
                      <div className="flex justify-between">
                        <span className="text-gray-400">Path:</span>
                        <span className="text-red-300 font-mono">/data/preprocessing/</span>
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
                      <div className="flex justify-between">
                        <span className="text-gray-400">Path:</span>
                        <span className="text-blue-300 font-mono">/data/refinement/</span>
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

              {/* Action Buttons */}
              <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-4 border border-gray-600">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Actions</h4>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors font-medium">
                    ✓ Approve Both Companies
                  </button>
                  <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                    Compare Annotations
                  </button>
                  <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors">
                    Export Comparison Report
                  </button>
                  <button className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors">
                    Flag for Review
                  </button>
                </div>
              </div>
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
      
      {/* Stage Simulation Modal */}
      <StageSimulation isOpen={isStageSimulationOpen} onClose={() => setIsStageSimulationOpen(false)} />
    </div>
  )
}