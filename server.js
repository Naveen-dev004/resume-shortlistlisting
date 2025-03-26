const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { PdfReader } = require("pdfreader");
const natural = require("natural");

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let storedResumes = []; // Store uploaded resumes

// Function to extract text from PDF
const extractTextFromPDF = (buffer) => {
    return new Promise((resolve, reject) => {
        let text = "";
        new PdfReader().parseBuffer(buffer, (err, item) => {
            if (err) reject(err);
            else if (!item) resolve(text);
            else if (item.text) text += item.text + " ";
        });
    });
};

// API to upload resumes
app.post("/upload", upload.array("resumes"), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No resumes uploaded." });
    }

    try {
        let extractedResumes = [];
        for (let file of req.files) {
            let text = await extractTextFromPDF(file.buffer);
            console.log(`Extracted Text for ${file.originalname}:`, text); // Debugging Log
            extractedResumes.push({ name: file.originalname, text });
        }

        storedResumes = extractedResumes; // Store for later ranking
        res.json({ message: "Resumes uploaded successfully!", uploadedResumes: storedResumes });
    } catch (error) {
        console.error("Error processing resumes:", error);
        res.status(500).json({ error: "Error processing resumes" });
    }
});

// API to rank resumes based on job description
app.post("/rank", (req, res) => {
    const { jobDescription } = req.body;

    if (!jobDescription || storedResumes.length === 0) {
        return res.status(400).json({ message: "No resumes available or job description missing." });
    }

    const tfidf = new natural.TfIdf();
    storedResumes.forEach(resume => tfidf.addDocument(resume.text));

    let rankedResumes = storedResumes.map(resume => {
        let score = 0;
        tfidf.tfidfs(jobDescription, (index, measure) => {
            if (storedResumes[index].name === resume.name) {
                score += measure;
            }
        });
        return { name: resume.name, score: parseFloat(score).toFixed(2) };
    }).sort((a, b) => b.score - a.score);

    res.json({ rankedResumes });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
