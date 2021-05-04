


// console.log("app.js loaded");

// Code taken directly from: https://tobiasahlin.com/moving-letters/#2
// This code will animate h3 text in the header image

// Wrap every letter in a span
var textWrapper = document.querySelector('.ml2');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime.timeline({loop: true})
  .add({
    targets: '.ml2 .letter',
    scale: [4,1],
    opacity: [0,1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 950,
    delay: (el, i) => 70*i
  }).add({
    targets: '.ml2',
    opacity: 1,
    duration: 60000,
    easing: "easeOutExpo",
    delay: 1000
  });
// End of header text animation 

// Add the map variable for our globe
var myMap = WE.map("earth_div", {
  center: [40.7, -73.95],
  zoom: 0
});



// Add tile layer to the globe
WE.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-streets-v11",
  accessToken: API_KEY
}).addTo(myMap);


var selector = d3.select("#selDataset");
d3.json("/data").then(function(data, err) {
    if (err) throw err;

    // console.log(data);
    var countryFrequency= {};

    // Loop through data file
    for(var i=0; i < data.length; i++) {

      var country = data[i].Country;
      var name = data[i].Name;
      var lat = data[i].latitude;
      var lng = data[i].longitude;

      // Count the number of billionaires in each country
      if (country in countryFrequency) {
        countryFrequency[country] += 1;
      }
      else {
        countryFrequency[country] = 1;
      }

      // Assign the count to number
      Object.values(countryFrequency).forEach(value=> number=(value));

      // Create markers on globe
      var marker = WE.marker([lat, lng])
        .bindPopup(`<b>${country}</b><br>Number of Billionaires:<br><b> ${number}</b>`)
        .addTo(myMap);

      // Append names to dropdown
      selector.append("option")
        .text(name)
        .property("value", name);

      // Select a country & name
      var selectedCountry = "";
      var selectedName = "Alan Rydge";

      // filter based on selected country
      if (selectedCountry === "") {
        var plotData = data;
              }  
      else {
        var plotData = data.filter(obj => {
          return obj.Country === selectedCountry
          });
  
      }

    }
    // need to add a rank function to rank by network rank

    // sort by value
    plotData.sort(function (a, b) {
      return b.NetWorth - a.NetWorth;
    });

    console.log(plotData);
    var plotNetWorths = [];
    var plotNames = [];
    var plotColors = ['blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','blue'];
    var plotText = [];

    // use one for loop going up and one going down to get 20 billionaires
    for(var i=0; i < plotData.length; i++) {

      if (plotData[i].Name === selectedName) {

        if (i > 19 && i < (plotData.length - 19)) {
          plotColors = ['blue','blue','blue','blue','blue','blue','blue','blue','blue','blue','red','blue','blue','blue','blue','blue','blue','blue','blue','blue']
          var j = i - 10;
          
          for(j; j < i; j++) {

            var netWorth = plotData[j].NetWorth;
            plotNetWorths.push(netWorth);
            var name = plotData[j].Name;
            plotNames.push(name);
            var text = plotData[j].Source;
            plotText.push(text);
          }
          
          var k = i;
          var last = i + 10;
          
          for(k; k < last; k++) {

            var netWorth = plotData[k].NetWorth;
            plotNetWorths.push(netWorth)
            var name = plotData[k].Name;
            plotNames.push(name)
            var text = plotData[k].Source;
            plotText.push(text);
          }
        }

        else if (i < 20) {
          
          for(var j=0; j < 20; j++) {
            plotColors[i] = 'red'
            var netWorth = plotData[j].NetWorth;
            plotNetWorths.push(netWorth)
            var name = plotData[j].Name;
            plotNames.push(name)
            var text = plotData[j].Source;
            plotText.push(text);
            
          }
        }

        else if (i > (plotData.length - 20)) {
          for(var k=(plotData.length - 20); k < plotData.length; k++) {
            plotColors[i - plotData.length + 20] = 'red'
            var netWorth = plotData[k].NetWorth;
            plotNetWorths.push(netWorth)
            var name = plotData[k].Name;
            plotNames.push(name)
            var text = plotData[k].Source;
            plotText.push(text);
            
          }
        }
      }
      
    }

    // Create trace for hbar plot
    var barData = [{
      type: 'bar',
      x: plotNames,
      y: plotNetWorths,
      text: plotText,
      marker: {
        color: plotColors
      }
    }];

    var layout = {
      title: "World Billionaire's Net Worth",
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: 'rgba(255, 255, 255, 255)'
      },
      yaxis: {
        title: {
          text: '$ Billion'
        }
      }
  }

    // create the hbar chart
    Plotly.newPlot('plotly', barData, layout);
    
    
}).catch(function(error) {
  console.log(error);
});

