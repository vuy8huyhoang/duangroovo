import cloudinary from "@/lib/cloudinary"; // Import Cloudinary config
import { getServerErrorMsg } from "@/utils/Error";
import { objectResponse } from "@/utils/Response";

export const POST = async (req: Request, res: Response) => {
  try {
    const formData = await req.formData();
    const file = formData.get("img"); // Only need to get the first file

    if (!file || !(file instanceof File)) {
      throw new Error("No file uploaded or file is invalid.");
    }

    // Define allowed MIME types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    // Check if the file type is allowed
    if (!allowedMimeTypes.includes(file.type)) {
      throw new Error("File type not allowed.");
    }

    // Convert file stream to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream({ resource_type: "auto" }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(buffer);
    });

    const url = (result as any)?.url || null;

    return objectResponse({
      message: "Upload image successfully",
      url: url,
    });
  } catch (e) {
    return getServerErrorMsg(e);
  }
};
