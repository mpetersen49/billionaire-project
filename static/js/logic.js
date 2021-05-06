// Initial load page --------------------------------------------------------------------------------------------------
function initialDashboard() {
    // Code taken directly from: https://tobiasahlin.com/moving-letters/#2
    // This code will animate h3 text in the header image

    // Wrap every letter in a span
    var textWrapper = document.querySelector('.ml2');
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

    anime.timeline({ loop: true })
        .add({
            targets: '.ml2 .letter',
            scale: [4, 1],
            opacity: [0, 1],
            translateZ: 0,
            easing: "easeOutExpo",
            duration: 950,
            delay: (el, i) => 70 * i
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
        zoom: 2
    });

    // Add tile layer to the globe
    var globe = WE.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-streets-v11",
        accessToken: API_KEY

    }).addTo(myMap);


    var selector = d3.select("#selDataset");
    d3.json("/data").then(function (data, err) {
        if (err) throw err;

        // console.log(data);
        var countryFrequency = {};

        // Loop through data file
        for (var i = 0; i < data.length; i++) {

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
            Object.values(countryFrequency).forEach(value => number = (value));

            var marker = WE.marker([lat, lng])
                .bindPopup(`<b>${country}</b><br>Number of Billionaires:<br><b> ${number}</b>`)
                .addTo(myMap);




            // Append names to dropdown
            selector.append("option")
                .text(name)
                .property("value", name);
        }
        // Select a country & name
        var selectedCountry = "";
        var selectedName = document.getElementById('selDataset').value;

        // filter based on selected country only if filter has been applied
        if (selectedCountry === "") {
            var plotData = data;
        }
        else {
            var plotData = data.filter(obj => {
                return obj.Country === selectedCountry
            });

        }

        // sort billionaires by networth descending
        plotData.sort(function (a, b) {
            return b.NetWorth - a.NetWorth;
        });
        // console.log(plotData);

        // empty lists for plot and default color list
        var plotNetWorths = [];
        var plotNames = [];
        var plotColors = ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'];
        var plotText = [];

        // loop through all rows of data
        for (var i = 0; i < plotData.length; i++) {
            // looking for the billionaire that was selected via filter
            if (plotData[i].Name === selectedName) {
                // add 20 billionaires to list. doing it in differently depending on if it is a top 20 or bottom 20 billionaire
                if (i > 19 && i < (plotData.length - 19)) {
                    plotColors = ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue']
                    var j = i - 10;

                    for (j; j < i; j++) {

                        var netWorth = plotData[j].NetWorth;
                        plotNetWorths.push(netWorth);
                        var name = plotData[j].Name;
                        plotNames.push(name);
                        var text = plotData[j].Source;
                        plotText.push(text);
                    }

                    var k = i;
                    var last = i + 10;

                    for (k; k < last; k++) {

                        var netWorth = plotData[k].NetWorth;
                        plotNetWorths.push(netWorth)
                        var name = plotData[k].Name;
                        plotNames.push(name)
                        var text = plotData[k].Source;
                        plotText.push(text);
                    }
                }

                else if (i < 20) {

                    for (var j = 0; j < 20; j++) {
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
                    for (var k = (plotData.length - 20); k < plotData.length; k++) {
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
            y: plotNames,
            x: plotNetWorths,
            text: plotText,
            marker: {
                color: plotColors
            },
            orientation: 'h',
            transforms: [{
                type: 'sort',
                target: 'y',
                order: 'descending'
            }]
        }];

        var layout = {

            title: "World Billionaire's Net Worth",
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: 'rgba(255, 255, 255, 255)'
            },
            xaxis: {
                title: {
                    text: '$ Billions'
                }
            },
            autosize: false,
            width: 900,
            height: 500,
            margin: {
                l: 250,
                r: 50,
                b: 100,
                t: 100,
                pad: 2
            }
        }
        // create the hbar chart
        Plotly.newPlot('plotly', barData, layout);

        // Where table code goes  
        // Inserte code here

    }).catch(function (error) {
        console.log(error);
    });
}
initialDashboard();


// Initial load page end -------------------------------------------------------------------------


// Event change (dropdown) -------------------------------------------------------------------------
function dropdownChanged(newName) {

    loadGlobeDropdown(newName);
    loadGraphDropdown(newName);
    // loadChartDropdown(newName);
}


function loadGlobeDropdown(newName) {

    // Clear content of "earth_div"
    document.getElementById("earth_div").innerHTML = '';

    d3.json("/data").then(data => {

        var resultArray = data.filter(s => s.Name == newName);
        var country = resultArray[0].Country;
        var netWorth = resultArray[0].NetWorth;
        var rank = resultArray[0].Rank;
        var source = resultArray[0].Source;
        var lat = resultArray[0].latitude;
        var lng = resultArray[0].longitude;
        // var newName = resultArray[0].Name;

        // Add the map variable for our globe
        var myMap = WE.map("earth_div", {
            center: [lat, lng],
            zoom: 2
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

        // Add marker
        WE.marker([lat, lng])
            .bindPopup(`<b>${newName}</b><br>Country: <b>${country}</b><br>Rank: <b>${rank}</b><br>Net Worth: <b>$${netWorth} Billion</b><br>Source: <b>${source}</b>`)
            .addTo(myMap)
            .openPopup(myMap);

    });
}

function loadGraphDropdown(newName) {

    console.log(newName);
    // Select a country & name
    var selectedCountry = "";
    var selectedName = newName;
    d3.json("/data").then(data => {

        // filter based on selected country only if filter has been applied
        if (selectedCountry === "") {
            var plotData = data;
        }
        else {
            var plotData = data.filter(obj => {
                return obj.Country === selectedCountry
            });

        }

        // sort billionaires by networth descending
        plotData.sort(function (a, b) {
            return b.NetWorth - a.NetWorth;
        });
        // console.log(plotData);

        // empty lists for plot and default color list
        var plotNetWorths = [];
        var plotNames = [];
        var plotColors = ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'];
        var plotText = [];

        // loop through all rows of data
        for (var i = 0; i < plotData.length; i++) {
            // looking for the billionaire that was selected via filter
            if (plotData[i].Name === selectedName) {
                // add 20 billionaires to list. doing it in differently depending on if it is a top 20 or bottom 20 billionaire
                if (i > 19 && i < (plotData.length - 19)) {
                    plotColors = ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'red', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue']
                    var j = i - 10;

                    for (j; j < i; j++) {

                        var netWorth = plotData[j].NetWorth;
                        plotNetWorths.push(netWorth);
                        var name = plotData[j].Name;
                        plotNames.push(name);
                        var text = plotData[j].Source;
                        plotText.push(text);
                    }

                    var k = i;
                    var last = i + 10;

                    for (k; k < last; k++) {

                        var netWorth = plotData[k].NetWorth;
                        plotNetWorths.push(netWorth)
                        var name = plotData[k].Name;
                        plotNames.push(name)
                        var text = plotData[k].Source;
                        plotText.push(text);
                    }
                }

                else if (i < 20) {

                    for (var j = 0; j < 20; j++) {
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
                    for (var k = (plotData.length - 20); k < plotData.length; k++) {
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
            y: plotNames,
            x: plotNetWorths,
            text: plotText,
            marker: {
                color: plotColors
            },
            orientation: 'h',
            transforms: [{
                type: 'sort',
                target: 'y',
                order: 'descending'
            }]
        }];

        var layout = {

            title: "World Billionaire's Net Worth",
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: 'rgba(255, 255, 255, 255)'
            },
            xaxis: {
                title: {
                    text: '$ Billions'
                }
            },
            autosize: false,
            width: 900,
            height: 500,
            margin: {
                l: 250,
                r: 50,
                b: 100,
                t: 100,
                pad: 2
            }
        }
        // create the hbar chart
        Plotly.newPlot('plotly', barData, layout);
    });
}

function loadChartDropdown(newName) {



}
// Event change (dropdown) end ----------------------------------------------------------------------------





// Event change (globe) start -----------------------------------------------------------------------------
// code goes here
// Event change (globe) end -------------------------------------------------------------------------------



// Event change (graph) start ------------------------------------------------------------------------------
// code goes here
// Event change (graph) end --------------------------------------------------------------------------------



// Event change (table) start ------------------------------------------------------------------------------
// code goes here
// Event change (table) end --------------------------------------------------------------------------------
