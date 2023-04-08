// Store our API endpoint as queryURL
var queryURL = "http://127.0.0.1:5000/api/geo_data";

// Perform a GET request to the query URL
function fetchData(page = 1, features = [], maxPages = 20) {
    // Check if the current page exceeds the maxPages limit
    if (page > maxPages) {
        createFeatures(features);
        return;
    }

    d3.json(`${queryURL}?page=${page}`).then(function (data) {
        if (data.length > 0) {
            features = features.concat(data);
            fetchData(page + 1, features, maxPages);
        } else {
            // Once we get all data, send the data.features object to the createFeatures function.
            createFeatures(features);
        }
    });
}

fetchData();

function createFeatures(bushFireData) {
    // Create a new MarkerClusterGroup
    let bushFireClusters = L.markerClusterGroup();

    // Create a new LayerGroup for polygons
    let bushFirePolygons = L.layerGroup();

    // Define the createCircleMarker function
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

    // Define the onEachFeature function
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

    // Process each feature
    bushFireData.forEach(function (feature) {
        let coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        let latlng = L.latLng(coordinates[0][0], coordinates[0][1]);
        let marker = createCircleMarker(feature, latlng);
        let polygon = L.polygon(coordinates, { color: "#FF5C5C" });

        // Bind the onEachFeature function to the marker and polygon
        onEachFeature(feature, marker);
        onEachFeature(feature, polygon);

        bushFireClusters.addLayer(marker);
        bushFirePolygons.addLayer(polygon);
    });

    // Create the map with the bushFireClusters and bushFirePolygons
    createMap(bushFireClusters, bushFirePolygons);
}

// Create map
function createMap(bushFires, bushFirePolygons) {
    // Define OpenStreetMap layer
    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 20
    });

    // Define a baseMaps object to hold our base layer
    let baseMaps = {
        "OpenStreetMap": osm
    };

    // Create overlay object to hold our overlay layers
    let overlayMaps = {
        "BushFires (Clusters)": bushFires,
        "BushFires (Polygons)": bushFirePolygons
    };

    // Create our map, giving it the osm and bushFires layers to display on load
    let myMap = L.map("map", {
        center: [
            -25.2744, 133.7751
        ],
        zoom: 5,
        layers: [osm, bushFires]
    });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
}

