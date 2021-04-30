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

// Some of the following code was taken directly from:
// https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet/



// var popup = new L.Popup();
// oms.addListener('click', function(marker) {
//   popup.setContent(marker.desc);
//   popup.setLatLng(marker.getLatLng());
//   map.openPopup(popup);
// });

d3.csv("../static/data/merged_data.csv").then(function(data, err) {
    if (err) throw err;

    // console.log(data);

    // Loop through data file
    
    for(var i=0; i < data.length; i++) {

      var name = data[i].Name;
      var net = data[i].NetWorth;
      var rank = data[i].Rank;
      var lat = data[i].latitude;
      var lng = data[i].longitude;
      

      var marker = WE.marker([lat, lng])
        .bindPopup(`<b>${name}</b><br><b>Rank: ${rank}</b><br><b>Net Worth: ${net}</b>`)
        .addTo(myMap);
       
    }
    
}).catch(function(error) {
  console.log(error);
});

