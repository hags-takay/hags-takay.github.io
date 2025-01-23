const uploadForm = document.getElementById('uploadForm');
const imageContainer = document.getElementById('imageContainer');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightboxBtn = document.getElementsByClassName('close-lightbox')[0];
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const clearButton = document.getElementById('clearButton');
const deleteLightboxButton = document.getElementById('deleteLightboxButton'); // The delete button in the lightbox

// Track uploaded images (including filenames, URLs, and captions)
let uploadedImages = [];
let currentIndex = -1;

// Load images from local storage when the page loads
window.onload = () => {
    uploadedImages = JSON.parse(localStorage.getItem('uploadedImages')) || [];
    uploadedImages.forEach((image, index) => displayImage(image.url, image.caption, index));
};

// Handle form submission (image upload)
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const captionInput = document.getElementById('captionInput'); // New: Capture caption input
    const files = fileInput.files;

    if (files.length === 0) {
        alert('Please select at least one file.');
        return;
    }

    const caption = captionInput.value.trim(); // Get the entered caption (optional)

    // Disable the form to prevent multiple submissions during the upload process
    uploadForm.querySelector('button').disabled = true;

    // Loop through all selected files
    const uploadPromises = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check if the file has already been uploaded by comparing filenames
        const isDuplicate = uploadedImages.some(image => image.filename === file.name);

        if (isDuplicate) {
            alert('This image has already been uploaded. Skipping...');
            continue; // Skip uploading the duplicate file
        }

        const uploadPromise = new Promise((resolve, reject) => {
            uploadToCloudinary(file, caption, resolve, reject);
        });

        uploadPromises.push(uploadPromise);
    }

    // Wait for all images to be uploaded
    await Promise.all(uploadPromises);

    // Clear the file input and caption field after successful upload
    fileInput.value = '';
    captionInput.value = '';

    // Re-enable the upload button after the uploads are finished
    uploadForm.querySelector('button').disabled = false;
});

// Function to upload the image to Cloudinary
async function uploadToCloudinary(file, caption, resolve, reject) {
    const cloudName = 'dpbk9sbej';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    const formData = new FormData();

    formData.append('file', file);
    formData.append('upload_preset', 'hags_preset');
    formData.append('folder', 'uploads');

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
            const uploadedData = {
                filename: file.name,
                url: data.secure_url,
                caption: caption || '' // Default caption if none is provided
            };
            uploadedImages.push(uploadedData);
            saveImageUrls(uploadedImages);
            displayImage(data.secure_url, caption, uploadedImages.length - 1);
            resolve(); // Resolve the promise after upload completes
        } else {
            console.error('Upload failed:', data); // Log error response
            reject('Upload failed');
        }
    } catch (error) {
        console.error('Error:', error);
        reject(error);
    }
}

function displayImage(imageUrl, caption, index) {
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('image-wrapper');
    imgContainer.style.position = 'relative'; // Keeps position relative to allow absolute positioning

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Uploaded Image';
    img.classList.add('uploaded-image');

    // Random rotation and margins for the image
    const randomRotate = Math.floor(Math.random() * 31) - 15;
    const randomTopMargin = Math.floor(Math.random() * 30) - 15;
    const randomLeftMargin = Math.floor(Math.random() * 30) - 15;

    // Set random rotation and margins to the wrapper (affects both image and caption)
    imgContainer.style.transform = `rotate(${randomRotate}deg)`;
    imgContainer.style.marginTop = `${randomTopMargin}px`;
    imgContainer.style.marginLeft = `${randomLeftMargin}px`;

    // Create a pin element
    const pin = document.createElement('div');
    pin.classList.add('pin');
    pin.style.backgroundImage = "url('images/pin.png')";
    pin.style.position = 'absolute';
    pin.style.top = '10px'; // Pin position from the top of the image
    pin.style.left = '50%'; // Center the pin horizontally
    pin.style.transform = 'translateX(-50%)'; // Center it exactly

    // Create a caption element
    const captionElement = document.createElement('p');
    captionElement.classList.add('image-caption');
    captionElement.textContent = caption || 'No caption provided';

    // Append the pin (first), image, and caption (last) to the container
    imgContainer.appendChild(pin); // Pin first to be on top
    imgContainer.appendChild(img);  // Image next
    imgContainer.appendChild(captionElement); // Caption last

    // Open lightbox on image click
    img.onclick = () => openLightbox(imageUrl, index);

    // Append the image container to the main container
    imageContainer.appendChild(imgContainer);
}


// Function to save the image URLs and captions to localStorage
function saveImageUrls(urls) {
    localStorage.setItem('uploadedImages', JSON.stringify(urls));
}

// Clear button functionality
clearButton.onclick = () => {
    console.log('Clear button clicked'); // Debugging message
    // Clear the displayed images
    imageContainer.innerHTML = '';

    // Clear the uploaded images array and localStorage
    uploadedImages = [];
    localStorage.removeItem('uploadedImages'); // Remove item directly from localStorage
};

// Lightbox functionality: Open lightbox on image click
function openLightbox(imageUrl, index) {
    lightbox.style.display = 'flex'; // Show the lightbox
    lightboxImage.src = imageUrl; // Set the lightbox image source to the clicked image URL

    currentIndex = index; // Store the current index for navigation

    // Show the delete button in lightbox
    deleteLightboxButton.style.display = 'block';
}

// Function to close the lightbox
closeLightboxBtn.onclick = () => {
    lightbox.style.display = 'none'; // Hide the lightbox
    deleteLightboxButton.style.display = 'none'; // Hide the delete button when the lightbox is closed
};

// Allow closing the lightbox by clicking anywhere outside the image
lightbox.onclick = (event) => {
    if (event.target === lightbox) {
        lightbox.style.display = 'none'; // Hide the lightbox when clicking outside the image
        deleteLightboxButton.style.display = 'none'; // Hide the delete button
    }
};

// Function to navigate to the previous image
prevButton.onclick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        lightboxImage.src = uploadedImages[currentIndex].url;
    }
};

// Function to navigate to the next image
nextButton.onclick = () => {
    if (currentIndex < uploadedImages.length - 1) {
        currentIndex++;
        lightboxImage.src = uploadedImages[currentIndex].url;
    }
};

// Function to delete the image in lightbox
deleteLightboxButton.onclick = () => {
    // Remove the image from the DOM
    const imageContainerToRemove = imageContainer.children[currentIndex];
    imageContainer.removeChild(imageContainerToRemove);

    // Remove the image from the uploadedImages array
    uploadedImages.splice(currentIndex, 1);

    // Save the updated array to localStorage
    saveImageUrls(uploadedImages);

    // Close the lightbox after deletion
    lightbox.style.display = 'none';
    deleteLightboxButton.style.display = 'none';
};
