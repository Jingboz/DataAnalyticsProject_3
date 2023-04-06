// Creating the map object
let myMap = L.map("map", {
  center: [40.7, -73.95],
  zoom: 3
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store the API query variables.
let url = "http://127.0.0.1:5000/api/cities";

// Get the data with d3.
d3.json(url).then(function(response) {
  console.log(response);
  // Create a new marker cluster group.
  let markers = L.markerClusterGroup();

  // Loop through the data.
  for (let i = 0; i < response.length; i++) {

    // Set the data location property to a variable.
    let lati = response[i].lat;
    let long = response[i].lon;

    // Check for the location property.
    if (location) {

      // Add a new marker to the cluster group, and bind a popup.
      markers.addLayer(L.marker([lati, long])
        .bindPopup(response[i].descriptor));
    }
  }

  // Add our marker cluster layer to the map.
  myMap.addLayer(markers);

});
