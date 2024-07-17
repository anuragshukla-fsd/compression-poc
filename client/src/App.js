import React, { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
const SERVER_URL = "http://localhost:8000";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageOptions, setImageOptions] = useState({
    maxSizeMB: 2,
    maxWidthOrHeight: 2000,
    imageType: "jpeg", // Default image type
    thumbnail: 300
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setImageOptions({
      ...imageOptions,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const options = {
        maxSizeMB: imageOptions.maxSizeMB,
        maxWidthOrHeight: imageOptions.maxWidthOrHeight,
        useWebWorker: true,
        fileType: `image/${imageOptions.imageType}`,
      };

      const compressedFile = await imageCompression(file, { ...options });

      if (compressedFile.size > imageOptions.maxSizeMB * 1024 * 1024) {
        alert(`Unable to compress the image below ${imageOptions.maxSizeMB}MB`);
        return;
      }

      const formData = new FormData();
      formData.append("image", compressedFile);
      formData.append("thumbnail", imageOptions.thumbnail)

      const response = await axios.post(
        `${SERVER_URL}/api/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response.data); // Assuming response.data contains image URLs

      // Update state with uploaded images
      setUploadedImages(response.data);
      // Clear the file input
    } catch (error) {
      console.error("Error uploading image", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Choose File:</label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <div>
          <label>Max Size (MB):</label>
          <input
            type="number"
            name="maxSizeMB"
            value={imageOptions.maxSizeMB}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Max Width/Height:</label>
          <input
            type="number"
            name="maxWidthOrHeight"
            value={imageOptions.maxWidthOrHeight}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Thumbnail Size</label>
          <input
            type="number"
            name="thumbnail"
            value={imageOptions.thumbnail}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Image Type:</label>
          <select
            name="imageType"
            value={imageOptions.imageType}
            onChange={handleInputChange}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <button type="submit">Upload</button>
      </form>

      <div className="uploaded-images">
        {Object.entries(uploadedImages).map(([label, url], idx) => (
          <div key={idx}>
            <h3>{label}</h3>
            <img
              key={idx}
              src={`${SERVER_URL}/${url}`}
              alt={`Uploaded ${idx}`}
              style={{ maxWidth: "200px", margin: "10px" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadForm;
