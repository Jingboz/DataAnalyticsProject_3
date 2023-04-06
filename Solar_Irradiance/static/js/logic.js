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

// Get the data with d3.
d3.json(url_solar).then(function(response) {
  console.log(response[0].irradiance.hourly[0].clear_sky.dni);

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
      markers.push(L.marker([lati, long]).bindPopup(response[i].descriptor).addTo(myMap));
    }
  }


  markers.forEach(function(marker, index) {
    marker.on('click', function() {
        document.getElementById('message').textContent = 'Marker ' + index + ' clicked!';
        barPlot(response[index].irradiance.hourly,false)
    });
  });
  

});


function init(data){
  // init bar plot
  barPlot(data.irradiance.hourly,true);

};



// Plot bar chart
function barPlot(inputArray, isInit){
  // Slice the first 10 objects for plotting
  let hours = [];
  let irr = [];

  for (var index in inputArray){
    hours.push(inputArray[index].hour);
    console.log(inputArray);
    irr.push(inputArray[index].clear_sky.dni);
    
  }
  let data = [{
    x: hours,
    y: irr,
    type: "bar",
    // hovertemplate: otu_labelsTen
    // text:otu_labelsTen
  }];

  let layout = {
    // title: "Top 10 OTU",
    height: 380,
    width: 800
  };

  if (isInit){
    Plotly.newPlot("bar", data, layout);
  }
  else{
    console.log(data);
    Plotly.restyle("bar", 'y',  [irr]);
    Plotly.restyle("bar", 'x',  [hours]);
  }
};
