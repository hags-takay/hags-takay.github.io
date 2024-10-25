const uploadForm = document.getElementById('uploadForm');
const imageContainer = document.getElementById('imageContainer');

// Load images from local storage when the page loads
window.onload = () => {
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages')) || [];
    uploadedImages.forEach(url => displayImage(url));
};

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file.');
        return;
    }

    const cloudName = 'pbk9sbej'; // Your Cloudinary cloud name
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`; // Cloudinary upload endpoint
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', 'hags_preset'); // Your upload preset name
    formData.append('folder', 'uploads'); // This sets the folder in Cloudinary

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
            alert('Image uploaded successfully: ' + data.secure_url);
            displayImage(data.secure_url); // Call the function to display the image
            saveImageUrl(data.secure_url); // Save the URL to local storage
        } else {
            alert('Upload failed: ' + JSON.stringify(data)); // Log the entire data object
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during upload: ' + error.message);
    }
});

// Function to display the uploaded image
function displayImage(imageUrl) {
    const img = document.createElement('img'); // Create an image element
    img.src = imageUrl; // Set the source to the uploaded image URL
    img.alt = 'Uploaded Image'; // Add alt text
    imageContainer.appendChild(img); // Append the image to the container
}

// Function to save the image URL to local storage
function saveImageUrl(url) {
    const uploadedImages = JSON.parse(localStorage.getItem('uploadedImages')) || [];
    uploadedImages.push(url);
    localStorage.setItem('uploadedImages', JSON.stringify(uploadedImages));
}
