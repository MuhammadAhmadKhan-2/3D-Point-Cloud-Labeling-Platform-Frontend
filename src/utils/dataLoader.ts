// Enterprise-grade data loading utilities for point cloud and image data

export interface PointCloudData {
  vertices: Float32Array
  colors?: Float32Array
  normals?: Float32Array
  pointCount: number
  company?: string // Add company identifier
}

export interface SerialAssets {
  pointCloudUrl: string
  imageUrl: string
  exists: boolean
  company: string // Add company identifier
}

/**
 * Generate file paths for point cloud and image data (supports both companies)
 */
export const getSerialAssets = (
  stage: "preprocessing" | "refinement",
  serialNumber: string,
  company?: string,
): SerialAssets => {
  // Determine company-specific path
  let companyPath = ""
  let companyName = ""

  if (company === "Metabread Co., Ltd." || stage === "refinement") {
    companyPath = "refinement"
    companyName = "Metabread Co., Ltd."
  } else {
    companyPath = "preprocessing"
    companyName = "Original Source Factory Corporation"
  }

  const basePath = `/data/${companyPath}/${serialNumber}`

  return {
    pointCloudUrl: `${basePath}/pointcloud.ply`,
    imageUrl: `${basePath}/image.jpg`,
    exists: true,
    company: companyName,
  }
}

/**
 * Get assets for both companies for comparison view
 */
export const getDualCompanyAssets = (
  serialNumber: string,
): {
  originalSource: SerialAssets
  kr: SerialAssets
} => {
  return {
    originalSource: getSerialAssets("preprocessing", serialNumber, "Original Source Corporation"),
    kr: getSerialAssets("refinement", serialNumber, "KR"),
  }
}

/**
 * Load PLY point cloud data with company identification
 */
export const loadPointCloudData = async (
  url: string,
  company?: string,
  onProgress?: (progress: number) => void,
): Promise<PointCloudData | null> => {
  try {
    console.log(`Loading point cloud: ${url} (Company: ${company})`)

    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`Point cloud file not found: ${url}`)
      return null
    }

    const contentLength = response.headers.get("content-length")
    const totalSize = contentLength ? Number.parseInt(contentLength) : 0

    if (totalSize > 100 * 1024 * 1024) {
      // 100MB threshold
      console.warn(
        `Large file detected (${(totalSize / 1024 / 1024).toFixed(1)}MB). Consider using a smaller file or streaming.`,
      )

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn("Large file loading timeout - falling back to generated data")
          resolve(null)
        }, 30000)
      })

      const loadPromise = response.text().then((text) => {
        const data = parsePLYData(text)
        return { ...data, company }
      })

      const result = await Promise.race([loadPromise, timeoutPromise])
      return result
    }

    const text = await response.text()
    const data = parsePLYData(text)
    return { ...data, company }
  } catch (error) {
    console.warn(`Failed to load point cloud: ${url}`, error)
    return null
  }
}

/**
 * Load point cloud data from both companies for comparison
 */
export const loadDualCompanyPointClouds = async (
  serialNumber: string,
  onProgress?: (company: string, progress: number) => void,
): Promise<{
  originalSource: PointCloudData | null
  kr: PointCloudData | null
}> => {
  const assets = getDualCompanyAssets(serialNumber)

  const [originalSourceData, krData] = await Promise.all([
    loadPointCloudData(assets.originalSource.pointCloudUrl, "Original Source Corporation", (progress) =>
      onProgress?.("Original Source Corporation", progress),
    ),
    loadPointCloudData(assets.kr.pointCloudUrl, "KR", (progress) => onProgress?.("KR", progress)),
  ])

  return {
    originalSource: originalSourceData,
    kr: krData,
  }
}

// Rest of the existing functions remain the same...
const parsePLYData = (plyText: string): PointCloudData => {
  const lines = plyText.split("\n")
  let vertexCount = 0
  let headerEnd = 0
  let hasColors = false
  let hasNormals = false

  // Parse header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith("element vertex")) {
      vertexCount = Number.parseInt(line.split(" ")[2])
    } else if (line.includes("property") && (line.includes("red") || line.includes("green") || line.includes("blue"))) {
      hasColors = true
    } else if (line.includes("property") && (line.includes("nx") || line.includes("ny") || line.includes("nz"))) {
      hasNormals = true
    } else if (line === "end_header") {
      headerEnd = i + 1
      break
    }
  }

  // Parse vertex data
  const vertices = new Float32Array(vertexCount * 3)
  const colors = hasColors ? new Float32Array(vertexCount * 3) : undefined
  const normals = hasNormals ? new Float32Array(vertexCount * 3) : undefined

  for (let i = 0; i < vertexCount; i++) {
    const line = lines[headerEnd + i]
    if (!line) continue

    const values = line.trim().split(/\s+/).map(Number)

    // Position (x, y, z)
    vertices[i * 3] = values[0]
    vertices[i * 3 + 1] = values[1]
    vertices[i * 3 + 2] = values[2]

    // Colors (if available)
    if (colors && values.length >= 6) {
      colors[i * 3] = values[3] / 255 // R
      colors[i * 3 + 1] = values[4] / 255 // G
      colors[i * 3 + 2] = values[5] / 255 // B
    }

    // Normals (if available)
    if (normals && values.length >= 9) {
      const normalOffset = hasColors ? 6 : 3
      normals[i * 3] = values[normalOffset]
      normals[i * 3 + 1] = values[normalOffset + 1]
      normals[i * 3 + 2] = values[normalOffset + 2]
    }
  }

  return {
    vertices,
    colors,
    normals,
    pointCount: vertexCount,
  }
}

export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" })
    return response.ok
  } catch {
    return false
  }
}

export const checkFileSize = async (url: string): Promise<{ exists: boolean; size: number; sizeMB: string }> => {
  try {
    const response = await fetch(url, { method: "HEAD" })
    if (!response.ok) {
      return { exists: false, size: 0, sizeMB: "0" }
    }

    const contentLength = response.headers.get("content-length")
    const size = contentLength ? Number.parseInt(contentLength) : 0
    const sizeMB = (size / 1024 / 1024).toFixed(1)

    return { exists: true, size, sizeMB }
  } catch {
    return { exists: false, size: 0, sizeMB: "0" }
  }
}

export const preloadSerialAssets = async (
  stage: "preprocessing" | "refinement",
  serialNumber: string,
  company?: string,
): Promise<void> => {
  const assets = getSerialAssets(stage, serialNumber, company)

  // Preload image
  const img = new Image()
  img.src = assets.imageUrl
}

export const validateDataIntegrity = async (
  stage: "preprocessing" | "refinement",
  serialNumbers: string[],
): Promise<{
  pointCloudFiles: number
  imageFiles: number
  missingFiles: string[]
}> => {
  const missingFiles: string[] = []
  let pointCloudFiles = 0
  let imageFiles = 0

  for (const serialNumber of serialNumbers) {
    const assets = getSerialAssets(stage, serialNumber)

    // Check point cloud file
    try {
      const pcResponse = await fetch(assets.pointCloudUrl, { method: "HEAD" })
      if (pcResponse.ok) {
        pointCloudFiles++
      } else {
        missingFiles.push(assets.pointCloudUrl)
      }
    } catch {
      missingFiles.push(assets.pointCloudUrl)
    }

    // Check image file
    try {
      const imgResponse = await fetch(assets.imageUrl, { method: "HEAD" })
      if (imgResponse.ok) {
        imageFiles++
      } else {
        missingFiles.push(assets.imageUrl)
      }
    } catch {
      missingFiles.push(assets.imageUrl)
    }
  }

  return {
    pointCloudFiles,
    imageFiles,
    missingFiles,
  }
}

export const generateFrameData = (serialNumber: string) => {
  const frames = []
  for (let i = 1; i <= 30; i++) {
    frames.push({
      id: i,
      timestamp: `${serialNumber}-frame-${i.toString().padStart(3, "0")}`,
      status: i <= 20 ? "labeled" : i <= 25 ? "reviewing" : "pending",
    })
  }
  return frames
}
