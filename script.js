document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const rankBtn = document.getElementById("rankBtn");
    const jobDescInput = document.getElementById("jobDescription");
    const rankedResumesContainer = document.getElementById("rankedResumes");

    let storedResumes = [];

    fileInput.addEventListener("change", async () => {
        const files = fileInput.files;
        storedResumes = [];

        for (let file of files) {
            if (file.type === "application/pdf") {
                const text = await extractTextFromPDF(file);
                storedResumes.push({ name: file.name, text });
            }
        }

        alert("Resumes processed successfully!");
    });

    rankBtn.addEventListener("click", () => {
        if (!storedResumes.length) {
            alert("Please upload resumes first.");
            return;
        }

        const jobDescription = jobDescInput.value.trim();
        if (!jobDescription) {
            alert("Please enter a job description.");
            return;
        }

        const rankedResumes = rankResumes(storedResumes, jobDescription);
        displayRankedResumes(rankedResumes);
    });

    function extractTextFromPDF(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async function () {
                const pdf = await pdfjsLib.getDocument(new Uint8Array(reader.result)).promise;
                let text = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(" ") + " ";
                }

                resolve(text);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function rankResumes(resumes, jobDescription) {
        return resumes.map(resume => {
            let score = jobDescription.split(" ").reduce((acc, word) => {
                return acc + (resume.text.includes(word) ? 1 : 0);
            }, 0);

            return { name: resume.name, score };
        }).sort((a, b) => b.score - a.score);
    }

    function displayRankedResumes(rankedResumes) {
        rankedResumesContainer.innerHTML = "";
        rankedResumes.forEach((resume, index) => {
            rankedResumesContainer.innerHTML += `<p>${index + 1}. ${resume.name} - Score: ${resume.score}</p>`;
        });
    }
});
