import React, { useState } from "react";
import axios from "axios";
import Compressor from "compressorjs";

const UploadFormCompressor = () => {
	const [file, setFile] = useState(null);
	const [uploadedImages, setUploadedImages] = useState([]);
	const [imageOptions, setImageOptions] = useState({
		quality: 0.8,
		maxWidth: 2000,
		maxHeight: 2000,
		convertSize: 2000000, // Convert to JPEG if larger than 2MB
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

		new Compressor(file, {
			quality: imageOptions.quality,
			maxWidth: imageOptions.maxWidth,
			maxHeight: imageOptions.maxHeight,
			convertSize: imageOptions.convertSize,
			success(result) {
				// Check if the compressed file is within the size limit
				if (result.size > imageOptions.convertSize) {
					alert(
						`Unable to compress the image below ${imageOptions.convertSize / 1024 / 1024}MB`
					);
					return;
				}

				const formData = new FormData();
				formData.append("image", result);

				axios
					.post("http://localhost:8000/api/upload", formData, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
					})
					.then((response) => {
						// Assuming response.data contains image URLs
						setUploadedImages(response.data);
						setFile(null); // Clear the file input
					})
					.catch((error) => {
						console.error("Error uploading image", error);
					});
			},
			error(err) {
				console.error("Error compressing image", err);
			},
		});
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Choose File:</label>
					<input type="file" onChange={handleFileChange} />
				</div>
				<div>
					<label>Quality (0 to 1):</label>
					<input
						type="number"
						name="quality"
						step="0.1"
						min="0"
						max="1"
						value={imageOptions.quality}
						onChange={handleInputChange}
					/>
				</div>
				<div>
					<label>Max Width:</label>
					<input
						type="number"
						name="maxWidth"
						value={imageOptions.maxWidth}
						onChange={handleInputChange}
					/>
				</div>
				<div>
					<label>Max Height:</label>
					<input
						type="number"
						name="maxHeight"
						value={imageOptions.maxHeight}
						onChange={handleInputChange}
					/>
				</div>
				<button type="submit">Upload</button>
			</form>

			<div className="uploaded-images">
				{Object.entries(uploadedImages).map(([label, url], idx) => (
					<div key={idx}>
						<h3>{label}</h3>
						<img
							key={idx}
							src={`http://localhost:8000/${url}`}
							alt={`Uploaded ${idx}`}
							style={{ maxWidth: "200px", margin: "10px" }}
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default UploadFormCompressor
