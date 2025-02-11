document.addEventListener("DOMContentLoaded", function () {
  // Handling file upload
  document
    .getElementById("uploadForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const fileField = document.querySelector('input[type="file"]');
      const file = fileField.files[0];

      // Validate file extension
      if (file && file.name.endsWith(".pfs")) {
        const formData = new FormData();
        formData.append("file", file);

        fetch("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.text())
          .then((result) => {
            alert(result);
          })
          .catch((error) => {
            console.error("Error uploading file:", error);
          });
      } else {
        alert("Please upload a valid .pfs file.");
      }
    });

  // Handling download form submission
  document
    .getElementById("downloadForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      // Get the filename from the form input
      const filename = document.querySelector('input[name="filename"]').value;
      // Validate filename
      if (filename) {
        fetch(`http://localhost:3000/api/download/${filename}`)
            .then((response) => {
                if (response.ok) {
                // Create a link element to trigger the download
                const link = document.createElement("a");
                link.href = response.url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                } else {
                alert("File not found.");
                }
            })
            .catch((error) => {
                console.error("Error downloading file:", error);
            });
      } else {
        alert("Please enter a valid filename.");
      }
    });
});
