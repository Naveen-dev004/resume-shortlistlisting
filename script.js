document.addEventListener("DOMContentLoaded", () => {
    const uploadBtn = document.getElementById("uploadBtn");
    const rankBtn = document.getElementById("rankBtn");
    const fileInput = document.getElementById("fileInput");
    const jobDescInput = document.getElementById("jobDescription");
    const rankedResumesContainer = document.getElementById("rankedResumes");

    let uploadedResumes = [];
    const SERVER_URL = "http://localhost:4000";  

    uploadBtn.addEventListener("click", async () => {
        console.log("Upload button clicked");

        const files = fileInput.files;
        if (files.length === 0) {
            alert("Please select resumes to upload.");
            return;
        }

        const formData = new FormData();
        for (let file of files) {
            formData.append("resumes", file);
        }

        try {
            console.log("Uploading resumes...");
            const response = await fetch(`${SERVER_URL}/upload`, { method: "POST", body: formData });

            if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);

            const data = await response.json();
            console.log("Upload response:", data);

            uploadedResumes = data.uploadedResumes || [];
            alert("Resumes uploaded successfully!");
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading resumes. Ensure the server is running.");
        }
    });

    rankBtn.addEventListener("click", async () => {
        console.log("Rank button clicked");

        if (!uploadedResumes.length) {
            alert("Please upload resumes first.");
            return;
        }

        const jobDescription = jobDescInput.value.trim();
        if (!jobDescription) {
            alert("Please enter a job description.");
            return;
        }

        try {
            console.log("Sending ranking request...");
            const response = await fetch(`${SERVER_URL}/rank`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobDescription }),
            });

            if (!response.ok) throw new Error(`Ranking failed: ${response.statusText}`);

            const data = await response.json();
            console.log("Ranked Resumes:", data.rankedResumes);

            displayRankedResumes(data.rankedResumes);
        } catch (error) {
            console.error("Error ranking resumes:", error);
            alert("Error ranking resumes. Check console for details.");
        }
    });

    function displayRankedResumes(rankedResumes) {
        rankedResumesContainer.innerHTML = "";

        if (!Array.isArray(rankedResumes) || rankedResumes.length === 0) {
            rankedResumesContainer.innerHTML = "<p>No resumes ranked.</p>";
            return;
        }

        rankedResumes.forEach((resume, index) => {
            const resumeItem = document.createElement("div");
            resumeItem.className = "resume-item";
            resumeItem.innerHTML = `<strong>${index + 1}. ${resume.name}</strong> - Score: <strong>${parseFloat(resume.score).toFixed(2)}</strong>`;
            rankedResumesContainer.appendChild(resumeItem);
        });
    }
});
