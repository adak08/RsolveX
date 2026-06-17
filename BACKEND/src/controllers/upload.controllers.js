import cloudinary from "../config/cloudinary.js";


const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const handleImageUpload = async (req, res) => {
    console.log("Controller called, files:", req.files?.length);
    
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No files uploaded" 
            });
        }

        // Validate each file
        for (const file of req.files) {
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid file type: ${file.mimetype}. Only images are allowed.`
                });
            }

            if (file.size > MAX_FILE_SIZE) {
                return res.status(413).json({
                    success: false,
                    message: `File too large: ${file.originalname}. Max 5MB per image.`
                });
            }
        }

        // Upload from buffer instead of file path
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "complaints",
                        resource_type: "auto",
                        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
        });

        const results = await Promise.all(uploadPromises);
        const urls = results.map((r) => r.secure_url);

        console.log("Upload successful, URLs:", urls);
        res.json({ success: true, urls });
    } 
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Upload failed: " + err.message 
        });
    }
}

