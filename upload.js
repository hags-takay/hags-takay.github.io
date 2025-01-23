const uploadForm = document.getElementById('uploadForm');
const imageContainer = document.getElementById('imageContainer');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const closeLightboxBtn = document.getElementsByClassName('close-lightbox')[0];
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const clearButton = document.getElementById('clearButton');
const deleteLightboxButton = document.getElementById('deleteLightboxButton'); // Delete button in the lightbox

// Imgur settings
const clientId = '6b16609b62fa8dd'; // Replace with your Imgur Client ID

// Hardcoded access token
const accessToken = 'a8c4c53e7ed3f43cbc491a276a1e23b11f61214f'; // Your hardcoded access token here

// Track uploaded images
let uploadedImages = [];
let currentIndex = -1;

// Fetch and display images from Imgur when the page loads
window.onload = async () => {
    await fetchAndDisplayImages();
};

// Handle form submission (image upload)
uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const captionInput = document.getElementById('captionInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert('Please select at least one file.');
        return;
    }

    const caption = captionInput.value.trim();

    // Disable the form during upload
    uploadForm.querySelector('button').disabled = true;

    // Upload each image to Imgur
    const uploadPromises = Array.from(files).map((file) => uploadToImgur(file, caption));
    await Promise.all(uploadPromises);

    // Clear inputs
    fileInput.value = '';
    captionInput.value = '';

    uploadForm.querySelector('button').disabled = false;

    // Refresh gallery
    await fetchAndDisplayImages();
});

// Upload an image to Imgur
async function uploadToImgur(file, caption) {
    const url = 'https://api.imgur.com/3/image';
    const formData = new FormData();
    formData.append('image', file);
    if (caption) {
        formData.append('title', caption);
    }

    if (!accessToken) {
        alert('Please authenticate first!');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,  // Use the hardcoded access token
            },
            body: formData,
        });

        const data = await response.json();

        // Log the response to debug
        console.log('Upload Response:', data);

        if (!data.data || !data.data.link) {
            throw new Error('Failed to upload image to Imgur');
        }

        // Store the image link and caption in the uploadedImages array
        uploadedImages.push({
            id: data.data.id, 
            url: data.data.link,
            caption: caption || ''
        });
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading image. Please try again.');
    }
}

// Fetch images from Imgur and display them
async function fetchAndDisplayImages() {
    if (!accessToken) {
        alert('Please authenticate first!');
        return;
    }

    const url = 'https://api.imgur.com/3/account/me/images';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,  // Use the hardcoded access token
            },
        });

        const data = await response.json();

        // Log the fetched data for debugging
        console.log('Fetched Images:', data);

        if (!data.data || data.data.length === 0) {
            throw new Error('No images found on Imgur');
        }

        uploadedImages = data.data.map((image) => ({
            url: image.link,
            caption: image.title || '',
            id: image.id, // Make sure to include image id
        }));

        imageContainer.innerHTML = ''; // Clear existing images
        uploadedImages.forEach((image, index) => displayImage(image.url, image.caption, index));
    } catch (error) {
        console.error('Error fetching images:', error);
        alert('Error fetching images. Please try again later.');
    }
}

// Display an image in the gallery
function displayImage(imageUrl, caption, index) {
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('image-wrapper');
    imgContainer.style.position = 'relative';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Uploaded Image';
    img.classList.add('uploaded-image');

    // Random rotation and margins for the image
    const randomRotate = Math.floor(Math.random() * 31) - 15;
    const randomTopMargin = Math.floor(Math.random() * 30) - 15;
    const randomLeftMargin = Math.floor(Math.random() * 30) - 15;

    imgContainer.style.transform = `rotate(${randomRotate}deg)`;
    imgContainer.style.marginTop = `${randomTopMargin}px`;
    imgContainer.style.marginLeft = `${randomLeftMargin}px`;

    const pin = document.createElement('div');
    pin.classList.add('pin');
    pin.style.backgroundImage = "url('images/pin.png')";
    pin.style.position = 'absolute';
    pin.style.top = '10px';
    pin.style.left = '50%';
    pin.style.transform = 'translateX(-50%)';

    const captionElement = document.createElement('p');
    captionElement.classList.add('image-caption');
    captionElement.textContent = caption || '';

    imgContainer.appendChild(pin);
    imgContainer.appendChild(img);
    imgContainer.appendChild(captionElement);

    img.onclick = () => openLightbox(imageUrl, index);

    imageContainer.appendChild(imgContainer);
}

// Lightbox functionality
function openLightbox(imageUrl, index) {
    lightbox.style.display = 'flex';
    lightboxImage.src = imageUrl;
    currentIndex = index;
    deleteLightboxButton.style.display = 'block';
}

closeLightboxBtn.onclick = () => {
    lightbox.style.display = 'none';
    deleteLightboxButton.style.display = 'none';
};

lightbox.onclick = (event) => {
    if (event.target === lightbox) {
        lightbox.style.display = 'none';
        deleteLightboxButton.style.display = 'none';
    }
};

prevButton.onclick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        lightboxImage.src = uploadedImages[currentIndex].url;
    }
};

nextButton.onclick = () => {
    if (currentIndex < uploadedImages.length - 1) {
        currentIndex++;
        lightboxImage.src = uploadedImages[currentIndex].url;
    }
};

// Function to delete the image in lightbox
// Function to delete the image in lightbox
deleteLightboxButton.onclick = async () => {
    const imageId = uploadedImages[currentIndex].id;  // Get the image ID

    try {
        console.log(`Attempting to delete image with ID: ${imageId}`);  // Debug log
        const response = await fetch(`https://api.imgur.com/3/image/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,  // Use the hardcoded access token
            },
        });

        const data = await response.json();
        console.log('Delete response:', data);  // Log response for debugging

        if (data.success) {
            alert('Image deleted successfully!');
            uploadedImages.splice(currentIndex, 1);  // Remove the image from the array
            imageContainer.innerHTML = '';  // Clear the gallery
            uploadedImages.forEach((image, index) => displayImage(image.url, image.caption, index));
            
            // Close the lightbox after deletion
            lightbox.style.display = 'none';
            deleteLightboxButton.style.display = 'none';
        } else {
            alert('Failed to delete image!');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting image. Please try again.');
    }
};

