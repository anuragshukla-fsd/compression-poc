const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const uuid = require("uuid").v4;
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type"],
	})
);
app.use(express.static(uploadDir));

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const storage = multer.memoryStorage();
const upload = multer({
	storage,
	limits: { fileSize: MAX_FILE_SIZE },
});

app.post("/api/upload", upload.single("image"), async (req, res) => {
	try {
		const { buffer, mimetype, size } = req.file;
		if (size > MAX_FILE_SIZE) {
			return res.status(400).send("File size exceeds 2 MB limit");
		}

		const originalFileName = `${uuid()}.webp`;
		const fullFileName = `${uuid()}.webp`;
		const thumbnailFileName = `${uuid()}.webp`;

		const thumbSize = Number(req.body.thumbnail);

		const originalFilePath = path.join(uploadDir, originalFileName);
		const fullFilePath = path.join(uploadDir, fullFileName);
		const thumbnailFilePath = path.join(uploadDir, thumbnailFileName);

		const fullImage = await sharp(buffer)
			.resize(1200, 1200, { fit: "inside" })
			.webp({ quality: 80 })
			.toFile(fullFilePath);

		const thumbnailImage = await sharp(buffer)
			.resize(thumbSize, thumbSize, { fit: "inside" })
			.webp({ quality:80 })
			.sharpen({
					sigma: 1.2,
					y3: 0.8,
			})
			 // .toFormat("webp", { quality: 100, mozjpeg:true, chromaSubsampling:"4:4:4", lossless:true  })
			.toFile(thumbnailFilePath);

		await sharp(buffer).toFile(originalFilePath);

		res.json({
			original: originalFileName,
			full: fullFileName,
			thumbnail: thumbnailFileName,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send("Server error");
	}
});

app.listen(8000, () => {
	console.log("Server started on http://localhost:8000");
});
