# Point Cloud Data Integration Guide

This guide explains how to add your .PLY point cloud files and images to the 3D Point Cloud Labeling Demo Application.

## Directory Structure

Create the following directory structure in the `public` folder:

```
public/
├── data/
│   ├── preprocessing/
│   │   ├── 73-301-11/
│   │   │   ├── pointcloud.ply
│   │   │   └── image.jpg
│   │   ├── 73-301-12/
│   │   │   ├── pointcloud.ply
│   │   │   └── image.jpg
│   │   └── 73-301-13/
│   │       ├── pointcloud.ply
│   │       └── image.jpg
│   └── refinement/
│       ├── 6-305-121/
│       │   ├── pointcloud.ply
│       │   └── image.jpg
│       ├── 6-305-122/
│       │   ├── pointcloud.ply
│       │   └── image.jpg
│       └── 6-305-125/
│           ├── pointcloud.ply
│           └── image.jpg
```

## File Naming Conventions

### Point Cloud Files (.PLY)
- **Filename**: `pointcloud.ply` (one per serial number)
- **Format**: Standard PLY format (ASCII or binary)
- **Content**: Complete point cloud data for the serial number

### Image Files
- **Filename**: `image.jpg` or `image.png` (one per serial number)
- **Format**: JPG, PNG, or WebP
- **Content**: Representative image for the serial number

## Serial Numbers by Stage

### Preprocessing Stage (Original Source Factory Corporation)
- `73-301-11` - Completed (needs: pointcloud.ply + image.jpg)
- `73-301-12` - Completed (needs: pointcloud.ply + image.jpg)
- `73-301-13` - In Progress (needs: pointcloud.ply + image.jpg)

### Refinement Stage (Metabread Co., Ltd.)
- `6-305-121` - Completed (needs: pointcloud.ply + image.jpg)
- `6-305-122` - Completed (needs: pointcloud.ply + image.jpg)
- `6-305-125` - Under Review (needs: pointcloud.ply + image.jpg)

## Adding Your Data

1. **Create the directory structure** as shown above in the `public/data/` folder

2. **Add your .PLY files**:
   - Place one `pointcloud.ply` file in each serial number directory
   - Each file should contain the complete point cloud data for that serial

3. **Add your images**:
   - Place one `image.jpg` file in each serial number directory
   - Each image should be representative of the point cloud data
   - Supported formats: JPG, PNG, WebP

4. **File size considerations**:
   - .PLY files can be large - the application will handle loading automatically
   - Images should be optimized for web (recommended max 2MB per image)
   - Consider using compressed formats for better performance

## How the Application Uses Your Data

### Point Cloud Loading
The application will automatically:
- Load the `pointcloud.ply` file when a serial number is selected
- Parse point cloud data and render it in Three.js
- Apply professional lighting and materials
- Generate bounding boxes and annotations
- Display the same point cloud for all 30 frames of that serial

### Image Display
When toggling to "Original Image" mode:
- The `image.jpg` file will be displayed
- The same image is shown for all frames of that serial
- Images serve as reference for annotation validation

### Frame Navigation
- All 30 frames for a serial will use the same point cloud and image
- Frame navigation simulates different views/annotations of the same data
- Different annotation states (labeled/reviewing/pending) are simulated

## Example File Structure

```
public/data/preprocessing/73-301-11/
├── pointcloud.ply    (your actual PLY data)
└── image.jpg         (your actual image)

public/data/preprocessing/73-301-12/
├── pointcloud.ply
└── image.jpg

public/data/preprocessing/73-301-13/
├── pointcloud.ply
└── image.jpg

public/data/refinement/6-305-121/
├── pointcloud.ply
└── image.jpg

public/data/refinement/6-305-122/
├── pointcloud.ply
└── image.jpg

public/data/refinement/6-305-125/
├── pointcloud.ply
└── image.jpg
```

## Testing Your Integration

1. Start the development server: `npm run dev`
2. Navigate to the appropriate stage (Preprocessing or Refinement)
3. Select a serial number from the dropdown
4. Verify your point cloud loads correctly in the 3D viewer
5. Toggle between Point Cloud and Original Image views
6. Navigate through frames 1-30 (all will show the same data)

## Troubleshooting

### Common Issues:
- **Point cloud not loading**: Check file path and PLY format
- **Image not displaying**: Verify image format and file size
- **Performance issues**: Optimize PLY file size or reduce point density

### File Format Requirements:
- .PLY files must be in standard PLY format (ASCII or binary)
- Images must be web-compatible formats (JPG, PNG, WebP)
- Ensure proper file permissions for web access

## Enterprise Features

The application includes enterprise-grade features:
- AWS S3 integration simulation
- Real-time processing indicators
- Professional annotation tools
- Quality assurance workflows
- Performance monitoring

Your data will be presented within this professional interface, creating the impression of a fully-integrated enterprise point cloud processing system with sophisticated frame-by-frame analysis capabilities.