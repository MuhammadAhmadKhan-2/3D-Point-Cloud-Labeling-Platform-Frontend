"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { LogOut, User, CuboidIcon as Cube, Play, ArrowRight, Database, Cloud, Activity, BarChart3 } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { StageInterface } from "../../components/StageInterface"
import { serialDataService } from "../../services/serialDataService"

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showStageInterface, setShowStageInterface] = useState(false)
  const [serialData, setSerialData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch serial data from backend on component mount
  useEffect(() => {
    const fetchSerialData = async () => {
      try {
        setLoading(true)
        const backendSerials = await serialDataService.fetchSerials()
        
        // Transform backend data to match the expected format for both companies
        const transformedData = backendSerials.flatMap(serial => [
          {
            id: serial._id,
            serialNumber: serial.serialNumber,
            workingDuration: "Processing Stage",
            totalFrames: 30,
            status: "Completed",
            startDate: new Date(serial.createdAt).toISOString().split('T')[0],
            endDate: new Date(serial.updatedAt).toISOString().split('T')[0],
            invoiceNumber: `INV-${serial.serialNumber}`,
            deliveryAmount: 880,
            company: "Original Source Factory Corporation",
          },
          {
            id: `${serial._id}-kr`,
            serialNumber: serial.serialNumber,
            workingDuration: "Refinement Stage",
            totalFrames: 30,
            status: "Completed",
            startDate: new Date(serial.createdAt).toISOString().split('T')[0],
            endDate: new Date(serial.updatedAt).toISOString().split('T')[0],
            invoiceNumber: `KR-${serial.serialNumber}`,
            deliveryAmount: 1000,
            company: "Metabread Co., Ltd.",
          }
        ])
        
        setSerialData(transformedData)
      } catch (error) {
        console.error('Failed to fetch serial data:', error)
        setSerialData([]) // Fallback to empty array
      } finally {
        setLoading(false)
      }
    }

    fetchSerialData()
  }, [])

  // Mock stage for dual company visualization
  const mockStage = {
    id: "preprocessing" as const,
    name: "Dual Company Processing",
    companyName: "Original Source Factory Corporation & Metabread Co., Ltd.",
    functionalities: [
      "Raw Labeling (Original Source Factory Corporation)",
      "Coarse Annotation (Original Source Factory Corporation)",
      "3D Annotation (Metabread Co., Ltd.)",
      "Precision Annotation (Metabread Co., Ltd.)",
      "Quality Assurance & Control (Metabread Co., Ltd.)",
    ],
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
      navigate("/login")
    }
  }

  if (showStageInterface) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowStageInterface(false)}
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-colors flex items-center space-x-2"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Dashboard</span>
        </button>
        <StageInterface stage={mockStage} serialData={serialData} />
      </div>
    )
  }

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
  //       <div className="text-white text-xl">Loading serial data...</div>
  //     </div>
  //   )
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated blurred background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/30 via-transparent to-teal-600/30"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="backdrop-blur-xl bg-gray-800/80 border border-blue-500/20 rounded-2xl shadow-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <User className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide">Client Dashboard</h1>
                  <p className="text-blue-300">Welcome, {user?.name || "User"} - Dual Company Access</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Enhanced 3D Point Cloud Visualization Section */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-blue-500/30 rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
            {/* Animated background accent */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-teal-600/10 animate-pulse"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-teal-500/20 rounded-2xl border border-blue-400/30">
                    <Cube className="w-10 h-10 text-blue-400 animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Dual Company 3D Point Cloud Visualization</h2>
                    <p className="text-blue-300 text-lg">
                      Advanced AI-powered annotation platform with dual company processing pipeline
                    </p>
                  </div>
                </div>

                {/* Enhanced status indicators */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-300 text-sm">AWS Connected</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-300 text-sm">Dual Company Sync</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-lg">
                    <Database className="w-3 h-3 text-purple-400" />
                    <span className="text-purple-300 text-sm">2 Companies Active</span>
                  </div>
                </div>
              </div>

              {/* Enhanced feature highlights with dual company info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/70 transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <Cloud className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Original Source Factory Corporation</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Preprocessing stage with raw labeling and coarse annotation
                  </p>
                  <div className="text-xs text-blue-400">Path: /data/preprocessing/</div>
                </div>

                <div className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/70 transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <Database className="w-6 h-6 text-teal-400" />
                    <h3 className="text-lg font-semibold text-white">Metabread Co., Ltd.</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Refinement stage with 3D annotation and quality assurance
                  </p>
                  <div className="text-xs text-teal-400">Path: /data/refinement/</div>
                </div>

                <div className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/70 transition-all">
                  <div className="flex items-center space-x-3 mb-3">
                    <BarChart3 className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-white">Dual Comparison</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">Side-by-side visualization and overlay comparison modes</p>
                  <div className="text-xs text-yellow-400">Split & Overlay Views</div>
                </div>
              </div>

              {/* Call to action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>Version 2.25</span>
                      <span>•</span>
                      <span>AWS US-East-1</span>
                      <span>•</span>
                      <span>Dual Company License</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowStageInterface(true)}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Play className="w-6 h-6 group-hover:animate-pulse" />
                  <span className="text-lg">Launch Dual Company Viewer</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Dashboard Sections with dual company stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="backdrop-blur-sm bg-gray-800/60 border border-blue-500/20 p-6 rounded-2xl hover:bg-gray-800/80 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Projects</h3>
              </div>
              <p className="text-gray-300 mb-4">Manage dual company point cloud projects</p>
              <div className="text-sm text-gray-400">
                <div className="flex justify-between mb-2">
                  <span>Active Projects:</span>
                  <span className="text-green-400 font-medium">8</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Original Source Factory Corporation:</span>
                  <span className="text-red-400 font-medium">4</span>
                </div>
                <div className="flex justify-between">
                  <span>Metabread Co., Ltd.:</span>
                  <span className="text-blue-400 font-medium">4</span>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-gray-800/60 border border-blue-500/20 p-6 rounded-2xl hover:bg-gray-800/80 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <Cloud className="w-6 h-6 text-teal-400" />
                <h3 className="text-lg font-semibold text-white">Storage</h3>
              </div>
              <p className="text-gray-300 mb-4">Dual company data storage</p>
              <div className="text-sm text-gray-400">
                <div className="flex justify-between mb-2">
                  <span>Total Used:</span>
                  <span className="text-yellow-400 font-medium">4.2TB</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Preprocessing:</span>
                  <span className="text-red-400 font-medium">2.1TB</span>
                </div>
                <div className="flex justify-between">
                  <span>Refinement:</span>
                  <span className="text-blue-400 font-medium">2.1TB</span>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm bg-gray-800/60 border border-blue-500/20 p-6 rounded-2xl hover:bg-gray-800/80 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Analytics</h3>
              </div>
              <p className="text-gray-300 mb-4">Dual company performance metrics</p>
              <div className="text-sm text-gray-400">
                <div className="flex justify-between mb-2">
                  <span>Avg Accuracy:</span>
                  <span className="text-green-400 font-medium">98.2%</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Processing Speed:</span>
                  <span className="text-blue-400 font-medium">2.3x faster</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Score:</span>
                  <span className="text-green-400 font-medium">9.7/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
