// Creating the map object
let myMap = L.map("map", {
  center: [-25,115],
  zoom: 5
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store the API query variables.
let url_solar = "http://127.0.0.1:5000/api/cities";
// let url_area = "http://127.0.0.1:5000/api/forest_area";
// let url_species = "http://127.0.0.1:5000/api/tree_species";

// d3.json(url_area).then(function(response) {
//   piePlot(response);
// });

// Get the data with d3.
d3.json(url_solar).then(function(response) {

  //init all plots
  init(response[0]);

  // Create a new marker array.
  let markers = [];

  // Loop through the data.
  for (let i = 0; i < response.length; i++) {

    // Set the data location property to a variable.
    let lati = response[i].lat;
    let long = response[i].lon;

    // Check for the location property.
    if (location) {

      // Add a new marker to the cluster group, and bind a popup.
      markers.push(L.marker([lati, long]).bindPopup(`<h3>${response[i].city}</h3>
      <p>Longitude: ${response[i].lon}, Latitude: ${response[i].lat}</p>`).addTo(myMap));
    }
  }

// Event listener
  markers.forEach(function(marker, index) {
    marker.on('click', function() {
        // document.getElementById('message').textContent = 'Marker ' + index + ' clicked!';
        barPlot(response[index],false);
        gaugePlot(response[index],false)
    });
  });

});


function init(data){
  // init bar plot
  barPlot(data,true);
  gaugePlot(data,true);
};


// Plot bar chart
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
}


// function piePlot(inputArray){

//   let pureData = inputArray.filter((item => item.state != "Australia_Total"));
  
//   var data = [{
//     values: pureData.map(item => item.area),
//     labels: pureData.map(item => item.state),
//     domain: {column: 0},
//     name: 'Forest Area',
//     hoverinfo: 'label+percent+name',
//     hole: .4,
//     type: 'pie'
//   },{
//     values: [27, 11, 25, 8, 1, 3, 25],
//     labels: ['US', 'China', 'European Union', 'Russian Federation', 'Brazil', 'India', 'Rest of World' ],
//     text: 'CO2',
//     textposition: 'inside',
//     domain: {column: 1},
//     name: 'CO2 Emissions',
//     hoverinfo: 'label+percent+name',
//     hole: .4,
//     type: 'pie'
//   }];
  
//   var layout = {
//     title: 'Global Emissions 1990-2011',
//     annotations: [
//       {
//         font: {
//           size: 20
//         },
//         showarrow: false,
//         text: 'Forest',
//         x: 0.17,
//         y: 0.5
//       },
//       {
//         font: {
//           size: 20
//         },
//         showarrow: false,
//         text: 'CO2',
//         x: 0.82,
//         y: 0.5
//       }
//     ],
//     height: 400,
//     width: 600,
//     showlegend: false,
//     grid: {rows: 1, columns: 2}
//   };
  
//   Plotly.newPlot('mypie', data, layout);
// }