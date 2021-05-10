// Initial load page start--------------------------------------------------------------------------------------------------
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
    
    // Globe start
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
        
        console.log(data);
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
    // Globe end    
    // Dropdown 
            // Append names to dropdown
            selector.append("option")
                .text(name)
                .property("value", name);
    // Dropdown end    
        }
        
    // Chart start   
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

        var nwPlot = document.getElementById('plotly');
        Plotly.newPlot(nwPlot, barData, layout);

        nwPlot.on('plotly_afterplot', function () {
            Plotly.d3.selectAll(".yaxislayer-above").selectAll('text')
                .on("click", function (d) {
                    loadGlobeDropdown(d.text);
                    loadGraphDropdown(d.text);
                    loadChartDropdown(d.text);
                });
        });
    // Chart end
    // Table start
        // Create the table
        var tbody = d3.select("tbody");
        data.forEach(function(data) {
            var row = tbody.append("tr");
        
            // Collect the key and value for each object
            Object.entries(data).forEach(function([key, value]) {
                // console.log(key, value);
        
                // Use d3 to append one cell per ufo data value
                var cell = row.append("td");
        
                // Append a cell to the row for each value in ufo data object
                cell.text(value);
            });
        });
    // Table end    
    

    }).catch(function (error) {
        console.log(error);
    });
}
initialDashboard();
// Initial load page end -------------------------------------------------------------------------


// Event change (dropdown) start-------------------------------------------------------------------------
function dropdownChanged(newName) {

    loadGlobeDropdown(newName);
    loadGraphDropdown(newName);
    loadChartDropdown(newName);
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

    // console.log(newName);
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

        var nwPlot = document.getElementById('plotly');
        Plotly.newPlot(nwPlot, barData, layout);

        nwPlot.on('plotly_afterplot', function () {
            Plotly.d3.selectAll(".yaxislayer-above").selectAll('text')
                .on("click", function (d) {
                    loadGlobeDropdown(d.text);
                    loadGraphDropdown(d.text);
                });
        });
    });
}

function loadChartDropdown(newName) {

    document.getElementById("tbody").innerHTML = '';

    d3.json("/data").then(data => {
        var nameFiltered = data.filter(obj => obj.Name === newName);

        // console.log(nameFiltered);
        var tbody = d3.select("tbody");
        nameFiltered.forEach(function(nameFiltered) {
            var row = tbody.append("tr");

            // Collect the key and value for each object
            Object.entries(nameFiltered).forEach(function([key, value]) {
                // console.log(key, value);

                // Use d3 to append one cell per ufo data value
                var cell = row.append("td");

                // Append a cell to the row for each value in ufo data object
                cell.text(value);
            });

        });
        
    });
    
}
// Event change (dropdown) end ----------------------------------------------------------------------------

// Event change (table) start ------------------------------------------------------------------------------
function tableChanged(tableName) {

    loadGlobeTable(tableName);
    loadGraphTable(tableName);
    loadChartTable(tableName);
}

function loadGlobeTable(tableName) {

    // Clear content of "earth_div"
    document.getElementById("earth_div").innerHTML = '';

    d3.json("/data").then(data => {

        var resultArray = data.filter(s => s.Name == tableName);
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
            .bindPopup(`<b>${tableName}</b><br>Country: <b>${country}</b><br>Rank: <b>${rank}</b><br>Net Worth: <b>$${netWorth} Billion</b><br>Source: <b>${source}</b>`)
            .addTo(myMap)
            .openPopup(myMap);

    });
}

function loadGraphTable(tableName) {

    // console.log(newName);
    // Select a country & name
    var selectedCountry = "";
    var selectedName = tableName;
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

        var nwPlot = document.getElementById('plotly');
        Plotly.newPlot(nwPlot, barData, layout);

        nwPlot.on('plotly_afterplot', function () {
            Plotly.d3.selectAll(".yaxislayer-above").selectAll('text')
                .on("click", function (d) {
                    loadGlobeDropdown(d.text);
                    loadGraphDropdown(d.text);
                });
        });
    });
}

function loadChartTable(tableName) {

    document.getElementById("tbody").innerHTML = '';

    d3.json("/data").then(data => {
        var nameFiltered = data.filter(obj => obj.Name === tableName);

        // console.log(nameFiltered);
        var tbody = d3.select("tbody");
        nameFiltered.forEach(function(nameFiltered) {
            var row = tbody.append("tr");

            // Collect the key and value for each object
            Object.entries(nameFiltered).forEach(function([key, value]) {
                // console.log(key, value);

                // Use d3 to append one cell per ufo data value
                var cell = row.append("td");

                // Append a cell to the row for each value in ufo data object
                cell.text(value);
            });

        });
        
    });
    
}
// --------------------------------------------------------------------
function rankChanged(tableRank) {

    loadGlobeRank(tableRank);
    loadGraphRank(tableRank);
    loadChartRank(tableRank);
}
// ----------------------------------------------------------------------
function loadGlobeRank(tableRank) {
    
    var integer = parseInt(tableRank, 10);
    

    // Clear content of "earth_div"
    document.getElementById("earth_div").innerHTML = '';
    
    d3.json("/data").then(data => {
        let result = data.map(a => a.Rank);

        // Find closest rank in data
        // Found on: https://stackoverflow.com/questions/8584902/get-the-closest-number-out-of-an-array
        var closest = result.reduce(function(prev, curr) {
            return (Math.abs(curr - integer) < Math.abs(prev - integer) ? curr : prev);
        });
        console.log(closest);
        
        var resultArray = data.filter(s => s.Rank == closest);
        var country = resultArray[0].Country;
        var netWorth = resultArray[0].NetWorth;
        var rank = resultArray[0].Rank;
        var source = resultArray[0].Source;
        var lat = resultArray[0].latitude;
        var lng = resultArray[0].longitude;
        var name = resultArray[0].Name;
        console.log(result);
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
            .bindPopup(`<b>${name}</b><br>Country: <b>${country}</b><br>Rank: <b>${rank}</b><br>Net Worth: <b>$${netWorth} Billion</b><br>Source: <b>${source}</b>`)
            .addTo(myMap)
            .openPopup(myMap);

    });
    
}

function loadGraphRank(tableRank) {
    var integer = parseInt(tableRank, 10);
    // console.log(newName);
    // Select a country & name
    var selectedCountry = "";
    
    // var selectedName = tableName;  // <----------------
    
    d3.json("/data").then(data => {
        let result = data.map(a => a.Rank);

        // Find closest rank in data
        // Found on: https://stackoverflow.com/questions/8584902/get-the-closest-number-out-of-an-array
        var closest = result.reduce(function(prev, curr) {
            return (Math.abs(curr - integer) < Math.abs(prev - integer) ? curr : prev);
        });
        
        var resultArray2 = data.filter(s => s.Rank == closest);
        var name2 = resultArray2[0].Name;
        var selectedName = name2;


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

        var nwPlot = document.getElementById('plotly');
        Plotly.newPlot(nwPlot, barData, layout);

        nwPlot.on('plotly_afterplot', function () {
            Plotly.d3.selectAll(".yaxislayer-above").selectAll('text')
                .on("click", function (d) {
                    loadGlobeDropdown(d.text);
                    loadGraphDropdown(d.text);
                });
        });
    });
    
}

function loadChartRank(tableRank) {
    var integer = parseInt(tableRank, 10);
    document.getElementById("tbody").innerHTML = '';

    d3.json("/data").then(data => {

        let result = data.map(a => a.Rank);

        // Find closest rank in data
        // Found on: https://stackoverflow.com/questions/8584902/get-the-closest-number-out-of-an-array
        var closest = result.reduce(function(prev, curr) {
            return (Math.abs(curr - integer) < Math.abs(prev - integer) ? curr : prev);
        });
        console.log(closest);

        var nameFiltered = data.filter(obj => obj.Rank === closest);

        // console.log(nameFiltered);
        var tbody = d3.select("tbody");
        nameFiltered.forEach(function(nameFiltered) {
            var row = tbody.append("tr");

            // Collect the key and value for each object
            Object.entries(nameFiltered).forEach(function([key, value]) {
                // console.log(key, value);

                // Use d3 to append one cell per ufo data value
                var cell = row.append("td");

                // Append a cell to the row for each value in ufo data object
                cell.text(value);
            });

        });
        
    });
    
}
// -------------------------------------------------------------------------
function countryChanged(tableCountry) {


    loadGlobeCountry(tableCountry);
    // loadGraphCountry(tableCountry);
    loadChartCountry(tableCountry);
}

function loadGraphCountry(tableCountry) {
    // Code goes here
}

function loadGlobeCountry(tableCountry) {

    // Clear content of "earth_div"
    document.getElementById("earth_div").innerHTML = '';

    var countryFrequency = {};
    d3.json("/data").then(data => {

        var resultArray = data.filter(s => s.Country == tableCountry);
        var lat = resultArray[0].latitude;
        var lng = resultArray[0].longitude;
        
        var size = Object.keys(resultArray).length;
        console.log(size);
   
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
        .bindPopup(`<b>${tableCountry}</b><br>Number of Billionaires:<br><b> ${size}</b>`)
            .addTo(myMap)
            .openPopup(myMap);

    });
}

function loadChartCountry(tableCountry) {
    
    document.getElementById("tbody").innerHTML = '';

    d3.json("/data").then(data => {
        var nameFiltered = data.filter(obj => obj.Country === tableCountry);

        // console.log(nameFiltered);
        var tbody = d3.select("tbody");
        nameFiltered.forEach(function(nameFiltered) {
            var row = tbody.append("tr");

            // Collect the key and value for each object
            Object.entries(nameFiltered).forEach(function([key, value]) {
                // console.log(key, value);

                // Use d3 to append one cell per ufo data value
                var cell = row.append("td");

                // Append a cell to the row for each value in ufo data object
                cell.text(value);
            });

        });
        
    });
    
}

// Event change (table) end --------------------------------------------------------------------------------

// Event change (globe) start -----------------------------------------------------------------------------
// code goes here
// Event change (globe) end -------------------------------------------------------------------------------