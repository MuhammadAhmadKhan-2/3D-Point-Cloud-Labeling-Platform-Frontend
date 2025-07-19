export interface SerialData {
  id: string
  serialNumber: string
  workingDuration: string
  totalFrames: number
  status: "Completed" | "In Progress" | "Under Review" | "Pending"
  startDate: string
  endDate?: string
  invoiceNumber: string
  deliveryAmount: number
  company?: string // Add company field
}

export interface Stage {
  id: "preprocessing" | "refinement"
  name: string
  companyName: string
  functionalities: string[]
}

export interface FrameData {
  id: number
  timestamp: string
  status: "labeled" | "pending" | "reviewing"
  annotations?: any[]
}

// Add new interface for dual company visualization
export interface DualCompanyData {
  originalSource: SerialData[]
  kr: SerialData[]
}
