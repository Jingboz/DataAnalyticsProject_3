// Listen for the DOMContentLoaded event 
document.addEventListener('DOMContentLoaded', () => {
    // Get all the elements with class 'content-box'
    const contentBoxes = document.querySelectorAll('.content-box');
    // Create an IntersectionObserver 
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            // If the content box is visible, add the 'visible' class
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });
    // Observe each content box for intersection changes
    contentBoxes.forEach((contentBox) => {
        observer.observe(contentBox);
    });
});

// Define the API endpoints
let queryURL = "http://127.0.0.1:5000/api/geo_data";
let url_solar = "http://127.0.0.1:5000/api/solar_city";

// Fetch data from the API
function fetchData(page = 1, features = [], maxPages = 800) {
    // If the page number exceeds maxPages, fetch solar city data and create features
    if (page > maxPages) {
        d3.json(url_solar).then(function (response) {
            createFeatures(features, response);
        });
        return;
    }

    // Fetch data from the geo_data API endpoint
    d3.json(`${queryURL}?page=${page}`).then(function (data) {
 
        // If there's data, concatenate it with existing features and fetch the next page
        if (data.length > 0) {
            features = features.concat(data);
            fetchData(page + 1, features, maxPages);
        } else {
            createFeatures(features);
        }
    });
}

// Fetch initial data
fetchData();

// Create features for bushfire and solar city data
function createFeatures(bushFireData, solarCityData) {
    let bushFireClusters = L.markerClusterGroup();
    let bushFirePolygons = L.layerGroup();

    // Function to create a circle marker for bushfire data    
    function createCircleMarker(feature, latlng) {
        let options = {
            radius: 8,
            fillColor: "#FF5C5C",
            color: "#FF5C5C",
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.35
        }
        return L.circleMarker(latlng, options);
    }

    // Function to handle events on each feature
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: function (e) {
                let popupContent = `<h4>${feature.properties.designation}</h4>
                                    <p>Designation Date: ${feature.properties.designationdate}</p>
                                    <p>LGA: ${feature.properties.lga}</p>`;
                layer.bindPopup(popupContent).openPopup();
            },
            mouseout: function (e) {
                layer.closePopup();
            }
        });
    }

    // Create circle markers and polygons for bushfire data
    bushFireData.forEach(function (feature) {
        let coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        let latlng = L.latLng(coordinates[0][0], coordinates[0][1]);
        let marker = createCircleMarker(feature, latlng);
        let polygon = L.polygon(coordinates, { color: "#FF5C5C" });

        // Bind popup and events to each feature
        onEachFeature(feature, marker);
        onEachFeature(feature, polygon);

        // Add each feature to the corresponding layer
        bushFireClusters.addLayer(marker);
        bushFirePolygons.addLayer(polygon);
    });

    // Create the map
    createMap(bushFireClusters, bushFirePolygons, solarCityData);
}

// Create the map
function createMap(bushFires, bushFirePolygons, solarCityData) {
    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 20
    });

    // Define a baseMaps object to hold our base layers
    let baseMaps = {
        "OpenStreetMap": osm
    };

    // Create overlay object to hold our overlay layer
    let overlayMaps = {
        "BushFires (Clusters)": bushFires,
        "BushFires (Polygons)": bushFirePolygons
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("bushFireMap", {
        center: [
            -25.2744, 133.7751
        ],
        zoom: 5,
        layers: [osm, bushFires]
    });
    
    // Create a layer group for solar city data
    let solarMarkers = L.layerGroup();

    // Create markers for solar city data
    solarCityData.forEach(function (city) {
        let marker = L.marker([city.lat, city.lon]);
        marker.bindPopup(`<h4>${city.name}</h4><p>Solar Power: ${city.solar_power} MW</p>`);
        solarMarkers.addLayer(marker);
    });

    // Add solar city data to the overlayMaps object
    overlayMaps["Solar Cities"] = solarMarkers;

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
}




