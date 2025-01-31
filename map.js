// Initialize the map and set its view to a specific location (e.g., Manila coordinates)
var map = L.map('memory-map', {
    scrollWheelZoom: false, // Disable zooming with mouse scroll
    touchZoom: true, // Allow zooming with touch gestures (pinch zoom)
}).setView([14.5995, 120.9842], 5); // Set initial map position and zoom level


// Load the map tiles from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a custom heart icon
var heartIcon = L.icon({
    iconUrl: 'images/heart.png', // Use your own heart image here
    iconSize: [40, 40], // Size of the heart icon
    iconAnchor: [16, 32], // Point of the icon which will be the marker's position
    popupAnchor: [0, -32] // Position the popup above the icon
});

// Function to add a marker and create a list item
function addMarkerAndListItem(lat, lng, title, description, imageUrl) {
    var marker = L.marker([lat, lng], { icon: heartIcon }).addTo(map); // Add marker
    var popupContent = `<b>${title}</b><br><img src="${imageUrl}" width="200px" alt="${title}"><p>${description}</p>`;
    marker.bindPopup(popupContent); // Bind popup

    // Create a list item for the sidebar
    var listItem = document.createElement('li');
    listItem.innerHTML = `<a href="#" onclick="openPopup(${lat}, ${lng}, event)">${title}</a>`;
    document.getElementById('locations-list').appendChild(listItem);
}

// Function to open the popup for a specific location when clicked from the list
function openPopup(lat, lng, event) {
    event.preventDefault(); // Prevent default anchor click behavior (scrolling to top)

    var marker = map._layers[Object.keys(map._layers).find(function(key) {
        return map._layers[key]._latlng && map._layers[key]._latlng.lat === lat && map._layers[key]._latlng.lng === lng;
    })];

    if (marker) {
        // Open the popup without adjusting the map's view
        marker.openPopup();
    }
}

// Add markers and corresponding list items
addMarkerAndListItem(10.3157, 123.8854, "Cebu City, Cebu", "August 2023", "images/cebucity.jpg");
addMarkerAndListItem(9.6105, 123.4025, "Oslob, Cebu", "August 2023", "images/oslob.jpg");
addMarkerAndListItem(16.4133, 122.2178, "Dingalan, Aurora", "March 2024", "images/aurora.jpg");
addMarkerAndListItem(9.7407, 118.7301, "Puerto Princesa, Palawan", "August 2024", "images/puertoprincesa.jpg");
addMarkerAndListItem(11.1956, 119.4075, "El Nido, Palawan", "August 2024", "images/elnido.jpg");
addMarkerAndListItem(17.0853, 120.9029, "Sagada", "November 2024", "images/sagada.jpg");
addMarkerAndListItem(16.4164, 120.5931, "Baguio City", "November 2024", "images/baguio.jpg");
