document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "http://65.0.183.171:3000/api";

  /**
   * Helper function to make API requests
   * @param {string} url - API endpoint URL
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {FormData|null} body - Request body (if applicable)
   * @returns {Promise<Response>}
   */
  async function makeRequest(url, method = "GET", body = null) {
    try {
      const response = await fetch(url, { method, body });
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${await response.text()}`);
      }
      return response;
    } catch (error) {
      console.error("API Request Error:", error);
      alert("An error occurred: " + error.message);
      throw error;
    }
  }

  // File Upload Handling
  document.getElementById("uploadForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fileField = document.querySelector('input[type="file"]');
    if (!fileField || !fileField.files.length) {
      return alert("Please select a file to upload.");
    }

    const file = fileField.files[0];
    if (!file.name.endsWith(".pfs")) {
      return alert("Please upload a valid .pfs file.");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await makeRequest(`${API_BASE_URL}/upload`, "POST", formData);
      alert(await response.text());
    } catch (error) {
      console.error("Upload failed:", error);
    }
  });

  // File Download Handling
  document.getElementById("downloadForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();
  
    const filename = document.querySelector('input[name="filename"]').value.trim();
    if (!filename) {
      return alert("Please enter a valid filename.");
    }
  
    try {
      const response = await makeRequest(`${API_BASE_URL}/download/${filename}`);
      
      // Check if the response is a valid file
      const contentType = response.headers.get("Content-Type");
      if (!contentType || contentType === "text/html") {
        throw new Error("Invalid file response");
      }
  
      // Convert response into a downloadable file
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed: " + error.message);
    }
  });
});
