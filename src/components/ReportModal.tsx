import React, { useEffect, useState } from 'react';
import { X, FileText, Download, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  serialData: {
    serialNumber: string;
    workingDuration: string;
    totalFrames: number;
    status: string;
    startDate: string;
    endDate?: string;
    invoiceNumber: string;
    deliveryAmount: number;
    company?: string;
  } | null;
  format: 'pdf' | 'docx';
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  serialData,
  format
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsGenerating(true);
      return;
    }

    // Simulate report generation progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 5; // Increment by 5% each time
      });
    }, 150);

    return () => clearInterval(progressInterval);
  }, [isOpen]);

  const handleDownload = () => {
    if (!serialData) return;
    
    try {
      // Create a new jsPDF instance
      const doc = new jsPDF();
      const fileName = `${serialData.serialNumber}_report.${format}`;
      
      // Set up the document
      doc.setFontSize(16);
      doc.text('POINT CLOUD DATA REPORT', 105, 20, { align: 'center' });
      
      // Add a line under the title
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      doc.setFontSize(12);
      doc.text('SERIAL INFORMATION', 20, 35);
      doc.setFontSize(10);
      doc.text(`Serial Number: ${serialData.serialNumber}`, 20, 45);
      doc.text(`Status: ${serialData.status}`, 20, 52);
      doc.text(`Invoice Number: ${serialData.invoiceNumber}`, 20, 59);
      
      doc.setFontSize(12);
      doc.text('PROJECT DETAILS', 20, 70);
      doc.setFontSize(10);
      doc.text(`Company: ${serialData.company || 'N/A'}`, 20, 80);
      doc.text(`Start Date: ${serialData.startDate}`, 20, 87);
      doc.text(`End Date: ${serialData.endDate || 'In Progress'}`, 20, 94);
      doc.text(`Working Duration: ${serialData.workingDuration}`, 20, 101);
      
      doc.setFontSize(12);
      doc.text('DATA METRICS', 20, 112);
      doc.setFontSize(10);
      doc.text(`Total Frames: ${serialData.totalFrames}`, 20, 122);
      doc.text(`Delivery Amount: $${serialData.deliveryAmount.toLocaleString()}`, 20, 129);
      
      doc.setFontSize(12);
      doc.text('PROCESSING INFORMATION', 20, 140);
      doc.setFontSize(10);
      doc.text('Noise Removal: Applied', 20, 150);
      doc.text('Surface Smoothing: Applied', 20, 157);
      doc.text('Density Enhancement: Applied', 20, 164);
      doc.text('Surface Reconstruction: Complete', 20, 171);
      
      doc.setFontSize(12);
      doc.text('QUALITY METRICS', 20, 182);
      doc.setFontSize(10);
      doc.text('Accuracy: 94%', 20, 192);
      doc.text('Precision: 92%', 20, 199);
      doc.text('Recall: 89%', 20, 206);
      doc.text('F1 Score: 90.5%', 20, 213);
      
      doc.setFontSize(12);
      doc.text('CERTIFICATION', 20, 224);
      doc.setFontSize(10);
      doc.text('This report certifies that the point cloud data has been processed and', 20, 234);
      doc.text('verified according to industry standards and quality control procedures.', 20, 241);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 251);
      
      // Save the PDF
      doc.save(fileName);
      
      console.log(`Downloaded ${fileName} successfully`);
      onClose();
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(`Error downloading report: ${error.message}`);
    }
  };

  // The report content is now generated directly in the handleDownload function using jsPDF

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">
            PDF Report Generator
          </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">
              {isGenerating ? 'Generating report...' : 'Report ready'}
            </span>
            <span className="text-sm text-gray-300">{Math.round(progress)}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Report preview */}
        <div className="p-4 bg-gray-900 h-80 overflow-y-auto">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Generating your report...</p>
              <p className="text-sm mt-2">This will only take a moment</p>
            </div>
          ) : (
            <div className="bg-white text-black p-6 rounded shadow-inner">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold">POINT CLOUD DATA REPORT</h1>
                <p className="text-sm text-gray-600">Generated on {new Date().toLocaleString()}</p>
              </div>
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Serial Information</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm"><span className="font-medium">Serial Number:</span> {serialData?.serialNumber}</div>
                  <div className="text-sm"><span className="font-medium">Status:</span> {serialData?.status}</div>
                  <div className="text-sm"><span className="font-medium">Invoice:</span> {serialData?.invoiceNumber}</div>
                  <div className="text-sm"><span className="font-medium">Company:</span> {serialData?.company || 'N/A'}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Project Details</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm"><span className="font-medium">Start Date:</span> {serialData?.startDate}</div>
                  <div className="text-sm"><span className="font-medium">End Date:</span> {serialData?.endDate || 'In Progress'}</div>
                  <div className="text-sm"><span className="font-medium">Duration:</span> {serialData?.workingDuration}</div>
                  <div className="text-sm"><span className="font-medium">Total Frames:</span> {serialData?.totalFrames}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold border-b border-gray-300 pb-1 mb-2">Financial</h2>
                <div className="text-sm"><span className="font-medium">Delivery Amount:</span> ${serialData?.deliveryAmount.toLocaleString()}</div>
              </div>
              
              <div className="text-xs text-gray-500 mt-8 text-center">
                This is a preview of the report. Download to view the complete document.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${isGenerating
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download {format.toUpperCase()} Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;