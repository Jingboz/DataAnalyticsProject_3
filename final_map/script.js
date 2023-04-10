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
let url_area = "http://127.0.0.1:5000/api/australia_forest_data";
let url_species = "http://127.0.0.1:5000/api/tree_species";

// Plot introducation plots
d3.json(url_area).then(function(response) {
    piePlot(response);
});
  
d3.json(url_species).then(function(response) {
    stackedBar(response);
});

// Fetch initial data
fetchData();
  

function fetchData(page = 1, features = [], maxPages = 10) {
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

function stackedBar(inputArray){
    let pureData = inputArray.filter(item => item.type != "Total forest").slice(1,9);
    
    var data = [];
    
    for (let treeType in pureData){
        let stateList = Object.keys(pureData[treeType]).filter(item => item != "AU").slice(0,8);
        let dataList = Object.values(pureData[treeType]).filter(item => item != "AU").slice(0,8);
        var trace = {
            x: stateList,
            y: dataList,
            name: pureData[treeType].type,
            type: 'bar'
          };
          data.push(trace);
    }
      var layout = {title: 'Australian Tree Types 2022',barmode: 'stack'};
      
      Plotly.newPlot('myStack', data, layout);
}

function piePlot(inputArray){

    let pureData = inputArray.filter((item => item.state != "Australia_Total"));
    
    var data = [{
      values: pureData.map(item => item.area),
      labels: pureData.map(item => item.state),
      domain: {column: 0},
      name: 'Forest Area',
      hoverinfo: 'label+percent+name',
      hole: .5,
      type: 'pie'
    }];
    
    var layout = {
      title: 'Australian Forest Area 2022',
      annotations: [
        {
          font: {
            size: 20
          },
          showarrow: false,
          text: 'Forest Area',
        },
      ],
      height: 450,
      width: 600,
      showlegend: false,
    };
    
    Plotly.newPlot('mypie', data, layout);
}

function barPlot(inputArray, isInit){

    let irr_hourly = inputArray.irradiance.hourly;
    let hours = [];
    let irr = [];
  
    for (var index in irr_hourly){
      hours.push(irr_hourly[index].hour);
      irr.push(irr_hourly[index].clear_sky.dni);
    }
    let data = [{
      x: hours,
      y: irr,
      type: "bar",
      // hovertemplate: irr,
      // text:irr
    }];
  
    let layout = {
      title: `Hourly Solar Irradiance - ${inputArray.city}`,
      height: 380,
      width: 600,
      yaxis: {
        title: 'Direct Normal Irradiation (DNI)'}
    };
  
    if (isInit){
      Plotly.newPlot("bar", data, layout);
    }
    else{
      Plotly.restyle("bar", 'y',  [irr]);
      Plotly.restyle("bar", 'x',  [hours])
      Plotly.relayout("bar", {title: `Hourly Solar Irradiance - ${inputArray.city}`});
    }
};
  
  
function gaugePlot(inputArray, isInit){
    let irr_hourly = inputArray.irradiance.hourly;
  
    let dataDesc = irr_hourly.sort((f,s) => s.clear_sky.dni-f.clear_sky.dni);
    let solar_v = dataDesc[0].clear_sky.dni
    let value_stored = (solar_v - 890) / 0.45;
   console.log(value_stored)
    // Trig to calc meter point
    var degrees = 180 - value_stored,
         radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
         pathX = String(x),
         space = ' ',
         pathY = String(y),
         pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
  
    if (isInit){
      const gauge_labels = [ 'CRITICAL','HIGH', 'MEDIUM','LOW','VERY LOW'];
      const color_code = ['#fa2525','#f5a32f','#f5f22f','#b3f52f','#59f52f',"white"];
    
      var trace1 = { type: 'scatter',
          x: [0], y:[0],
          marker: {size: 20, color:'850000'},
          showlegend: false,
          name: 'Indicator',
          text: solar_v,
          hoverinfo: 'text+name'
        };
      var trace2 = { values: [100 / 5, 100 / 5, 100 / 5, 100 / 5, 100 / 5, 100],
          rotation: 90,
          text: gauge_labels,
          textinfo: 'text',
          textposition:'inside',
          marker: {colors: color_code},
          labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
          hoverinfo: 'label',
          hole: .4,
          type: 'pie',
          showlegend: false
        };
  
      var data = [trace1,trace2];
  
      var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
              color: '850000'
            }
          }],
        title: '<b>Bushfile Alert</b>',
        height: 500,
        width: 500,
        xaxis: {zeroline:false, showticklabels:false,
                   showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                   showgrid: false, range: [-1, 1]}
        };
      Plotly.newPlot(gauge, data, layout);
    }
  
    else{
      gauge.data[0].text = solar_v;
      gauge.layout.shapes[0].path = path;
  
      Plotly.redraw(gauge);
    }
};
  
function init(data){
    // init bar plot
    barPlot(data,true);
    gaugePlot(data,true);
};
