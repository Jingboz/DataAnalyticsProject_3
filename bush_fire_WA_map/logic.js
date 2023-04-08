// Define the API endpoints
let queryURL = "http://127.0.0.1:5000/api/geo_data";
let url_solar = "http://127.0.0.1:5000/api/solar_city";

function fetchData(page = 1, features = [], maxPages = 500) {
    if (page > maxPages) {
        d3.json(url_solar).then(function (response) {
            createFeatures(features, response);
        });
        return;
    }

    d3.json(`${queryURL}?page=${page}`).then(function (data) {
        if (data.length > 0) {
            features = features.concat(data);
            fetchData(page + 1, features, maxPages);
        } else {
            createFeatures(features);
        }
    });
}

fetchData();

function createFeatures(bushFireData, solarCityData) {
    let bushFireClusters = L.markerClusterGroup();
    let bushFirePolygons = L.layerGroup();

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

    bushFireData.forEach(function (feature) {
        let coordinates = feature.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
        let latlng = L.latLng(coordinates[0][0], coordinates[0][1]);
        let marker = createCircleMarker(feature, latlng);
        let polygon = L.polygon(coordinates, { color: "#FF5C5C" });

        onEachFeature(feature, marker);
        onEachFeature(feature, polygon);

        bushFireClusters.addLayer(marker);
        bushFirePolygons.addLayer(polygon);
    });

    createMap(bushFireClusters, bushFirePolygons, solarCityData);
}

function createMap(bushFires, bushFirePolygons, solarCityData) {
    let osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        maxZoom: 20
    });

    let baseMaps = {
        "OpenStreetMap": osm
    };

    let overlayMaps = {
        "BushFires (Clusters)": bushFires,
        "BushFires (Polygons)": bushFirePolygons
    };

    let myMap = L.map("map", {
        center: [
            -25.2744, 133.7751
        ],
        zoom: 5,
        layers: [osm, bushFires]
    });

    let solarMarkers = L.layerGroup();

    solarCityData.forEach(function (city) {
        let marker = L.marker([city.lat, city.lon]);
        marker.bindPopup(`<h4>${city.name}</h4><p>Solar Power: ${city.solar_power} MW</p>`);
        solarMarkers.addLayer(marker);
    });

    overlayMaps["Solar Cities"] = solarMarkers;

    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
}

// Add the HTML element for the map
document.write('<div id="map" style="width: 100%; height: 100%;"></div>');

