import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';

interface ProcessingSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void; // New prop for cancellation
  processName: string;
  duration?: number;
  isRerun?: boolean;
}

interface LogLine {
  text: string;
  type: 'command' | 'output' | 'success' | 'error';
  delay: number;
}

const getProcessingLogs = (processName: string): LogLine[] => {
  switch (processName) {
    case 'Noise Removal':
      return [
        { text: '$ python noise_removal.py --input=point_cloud.ply --method=statistical_outlier', type: 'command', delay: 0 },
        { text: 'Loading point cloud data...', type: 'output', delay: 800 },
        { text: 'Point cloud loaded: 2,456,789 points', type: 'output', delay: 1600 },
        { text: 'Analyzing point distribution...', type: 'output', delay: 2400 },
        { text: 'Applying Statistical Outlier Removal...', type: 'output', delay: 3200 },
        { text: 'Removed 12,345 outlier points (0.5%)', type: 'output', delay: 4000 },
        { text: 'Applying Radius-Based Filtering...', type: 'output', delay: 4800 },
        { text: 'Removed 5,678 additional noise points', type: 'output', delay: 5600 },
        { text: 'Saving filtered point cloud...', type: 'output', delay: 6400 },
        { text: 'Done. Filtered point cloud saved to output/filtered_cloud.ply', type: 'success', delay: 7200 },
      ];
    case 'Surface Smoothing':
      return [
        { text: '$ python surface_smoothing.py --input=filtered_cloud.ply --method=mls', type: 'command', delay: 0 },
        { text: 'Loading filtered point cloud...', type: 'output', delay: 600 },
        { text: 'Estimating normals for each point...', type: 'output', delay: 1200 },
        { text: 'Normal estimation complete', type: 'output', delay: 1800 },
        { text: 'Applying Moving Least Squares algorithm...', type: 'output', delay: 2400 },
        { text: 'Setting search radius to 0.03', type: 'output', delay: 3000 },
        { text: 'Processing points: 25%', type: 'output', delay: 3600 },
        { text: 'Processing points: 50%', type: 'output', delay: 4200 },
        { text: 'Processing points: 75%', type: 'output', delay: 4800 },
        { text: 'Processing points: 100%', type: 'output', delay: 5400 },
        { text: 'Smoothing complete. Saving result...', type: 'output', delay: 6000 },
        { text: 'Done. Smoothed surface saved to output/smoothed_cloud.ply', type: 'success', delay: 6600 },
      ];
    case 'Density Enhancement':
      return [
        { text: '$ python density_enhancement.py --input=smoothed_cloud.ply --model=pointnet_upsampling', type: 'command', delay: 0 },
        { text: 'Loading smoothed point cloud...', type: 'output', delay: 500 },
        { text: 'Initializing AI upsampling model...', type: 'output', delay: 1000 },
        { text: 'Loading PointNet++ weights from models/upsampling_weights.h5', type: 'output', delay: 1500 },
        { text: 'Model loaded successfully', type: 'output', delay: 2000 },
        { text: 'Upsampling with AI model...', type: 'output', delay: 2500 },
        { text: 'Processing batch 1/4', type: 'output', delay: 3000 },
        { text: 'Processing batch 2/4', type: 'output', delay: 3500 },
        { text: 'Processing batch 3/4', type: 'output', delay: 4000 },
        { text: 'Processing batch 4/4', type: 'output', delay: 4500 },
        { text: 'Performing multi-frame aggregation...', type: 'output', delay: 5000 },
        { text: 'Merging upsampled points...', type: 'output', delay: 5500 },
        { text: 'Point count increased from 2.4M to 9.8M', type: 'output', delay: 6000 },
        { text: 'Done. Enhanced point cloud saved to output/enhanced_cloud.ply', type: 'success', delay: 6500 },
      ];
    case 'Surface Reconstruction':
      return [
        { text: '$ python surface_reconstruction.py --input=enhanced_cloud.ply --method=poisson', type: 'command', delay: 0 },
        { text: 'Loading enhanced point cloud...', type: 'output', delay: 600 },
        { text: 'Checking point normals...', type: 'output', delay: 1200 },
        { text: 'Preparing for Poisson reconstruction...', type: 'output', delay: 1800 },
        { text: 'Setting octree depth to 10', type: 'output', delay: 2400 },
        { text: 'Running Poisson reconstruction...', type: 'output', delay: 3000 },
        { text: 'Building octree structure...', type: 'output', delay: 3600 },
        { text: 'Solving Poisson equation...', type: 'output', delay: 4200 },
        { text: 'Extracting iso-surface...', type: 'output', delay: 4800 },
        { text: 'Mesh created with 1,245,678 triangles', type: 'output', delay: 5400 },
        { text: 'Applying Ball Pivoting refinement...', type: 'output', delay: 6000 },
        { text: 'Optimizing mesh topology...', type: 'output', delay: 6600 },
        { text: 'Done. Reconstructed mesh saved to output/reconstructed_mesh.obj', type: 'success', delay: 7200 },
      ];
    case 'Batch Processing':
      return [
        { text: '$ python batch_process.py --source=s3://metabread-pointclouds/ --output=s3://metabread-processed/', type: 'command', delay: 0 },
        { text: 'Connecting to S3 storage...', type: 'output', delay: 500 },
        { text: 'Connection established', type: 'output', delay: 1000 },
        { text: 'Found 24 point cloud files to process', type: 'output', delay: 1500 },
        { text: 'Creating processing queue...', type: 'output', delay: 2000 },
        { text: 'Starting batch processing with 8 worker threads', type: 'output', delay: 2500 },
        { text: 'Processing file 1/24: vehicle_001.ply', type: 'output', delay: 3000 },
        { text: 'Applying noise removal...', type: 'output', delay: 3500 },
        { text: 'Applying surface smoothing...', type: 'output', delay: 4000 },
        { text: 'Applying density enhancement...', type: 'output', delay: 4500 },
        { text: 'Applying surface reconstruction...', type: 'output', delay: 5000 },
        { text: 'File 1/24 complete', type: 'output', delay: 5500 },
        { text: 'Processing file 2/24: vehicle_002.ply', type: 'output', delay: 6000 },
        { text: '...', type: 'output', delay: 6500 },
        { text: 'Processing file 24/24: vehicle_024.ply', type: 'output', delay: 7000 },
        { text: 'Batch processing complete', type: 'output', delay: 7500 },
        { text: 'Uploading results to S3...', type: 'output', delay: 8000 },
        { text: 'Done. All files processed and uploaded to S3', type: 'success', delay: 8500 },
      ];
    default:
      return [
        { text: '$ python process.py', type: 'command', delay: 0 },
        { text: 'Processing...', type: 'output', delay: 1000 },
        { text: 'Done.', type: 'success', delay: 2000 },
      ];
  }
};

export const ProcessingSimulationModal: React.FC<ProcessingSimulationModalProps> = ({
  isOpen,
  onClose,
  onCancel,
  processName,
  duration = 5000,
  isRerun = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<LogLine[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const logsRef = useRef<HTMLDivElement>(null);
  // Memoize allLogs to prevent recreation on every render
  const allLogs = useMemo(() => getProcessingLogs(processName), [processName]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setVisibleLogs([]);
      setIsComplete(false);
      setCurrentLogIndex(0);
      return;
    }

    const startTime = Date.now();
    // Speed up the animation if this is a rerun
    const speedMultiplier = isRerun ? 20 : 1; // Much faster for reruns (20x instead of 3x)
    const adjustedDuration = duration / speedMultiplier;

    // For reruns, we can skip most of the animation and just show the final state
    if (isRerun) {
      // Show only the first and last log entries for reruns
      if (allLogs.length > 0) {
        setVisibleLogs([allLogs[0], allLogs[allLogs.length - 1]]);
      }
      
      // Set progress to almost complete immediately
      setProgress(100);
      setCurrentLogIndex(allLogs.length);
      
      // Mark as complete after a very short delay
      setTimeout(() => {
        setIsComplete(true);
      }, 300);
      
      return;
    }

    // Progress bar animation (only for first run)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / (adjustedDuration / 100));
      });
    }, 100);
    
    // Log animation with proper timing (only for first run)
    let logIndex = 0;
    const logInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Check if we should show the next log
      if (logIndex < allLogs.length) {
        // Adjust the delay based on whether this is a rerun
        const adjustedDelay = allLogs[logIndex].delay / speedMultiplier;
        
        if (elapsed >= adjustedDelay) {
          const newLog = allLogs[logIndex];
          setVisibleLogs((prev) => [...prev, newLog]);
          setCurrentLogIndex(logIndex + 1);
          logIndex++;
          
          // Auto-scroll to bottom
          if (logsRef.current) {
            setTimeout(() => {
              if (logsRef.current) {
                logsRef.current.scrollTop = logsRef.current.scrollHeight;
              }
            }, 50);
          }

          // Check if this is the last log
          if (logIndex === allLogs.length) {
            setTimeout(() => {
              setIsComplete(true);
            }, 1000);
          }
        }
      }

      // Clean up when all logs are shown
      if (logIndex >= allLogs.length) {
        clearInterval(logInterval);
      }
    }, 50); // Check every 50ms for smooth timing

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [isOpen, duration, allLogs, isRerun, processName]); // Added processName since it's used in useMemo

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl border border-gray-700 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center space-x-2">
            {!isComplete && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
            {isComplete && <div className="w-4 h-4 rounded-full bg-green-500"></div>}
            <h3 className="text-lg font-medium text-white">{processName}</h3>
          </div>
          <button
            onClick={onCancel || onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">{isComplete ? 'Complete' : 'Processing...'}</span>
            <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Console output */}
        <div
          ref={logsRef}
          className="p-4 bg-gray-900 font-mono text-sm h-80 overflow-y-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          {visibleLogs.map((log, index) => (
            <div key={index} className="mb-1 animate-fadeIn">
              <span
                className={`${log.type === 'command' ? 'text-green-400' : ''}
                ${log.type === 'output' ? 'text-gray-300' : ''}
                ${log.type === 'success' ? 'text-green-500 font-bold' : ''}
                ${log.type === 'error' ? 'text-red-500' : ''}`}
              >
                {log.text}
              </span>
              {log.type === 'command' && index === visibleLogs.length - 1 && (
                <span className="ml-1 inline-block w-2 h-4 bg-gray-300 animate-pulse"></span>
              )}
            </div>
          ))}
          {/* Typing cursor for the last visible log */}
          {visibleLogs.length > 0 && !isComplete && (
            <span className="inline-block w-2 h-4 bg-gray-300 animate-pulse ml-1"></span>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            disabled={!isComplete}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${isComplete
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white opacity-50 cursor-not-allowed'}`}
          >
            Close
          </button>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};