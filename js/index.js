var map;
var locations = [];
var metadata = [];

function initialiseMap() {
    const SPREADSHEET_ID = '1Ewe5k4VchJFi1kWqNk--4yOvPbjJmzysE5gPnOFGWO8'
    const SPREADSHEET_KEY = 'AIzaSyBxy4juu30u8ac7Cd5bsx2dhQeapOVs_i4'

    const latlng = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/latlng!A1:Z1000?key=${SPREADSHEET_KEY}`
    const properties = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/properties!A1:Z1000?key=${SPREADSHEET_KEY}`
    // Load data from an example Google spreadsheet that contains latitude and longitude columns using Google Sheets API v4 that returns JSON.
    // Replace the ID of your Google spreadsheet and you API key in the URL:
    // https://sheets.googleapis.com/v4/spreadsheets/ID_OF_YOUR_GOOGLE_SPREADSHEET/values/Sheet1!A2:Q?key=YOUR_API_KEY
    // Also make sure your API key is authorised to access Google Sheets API - you can enable that through your Google Developer console.
    // Finally, in the URL, fix the sheet name and the range that you are accessing from your spreadsheet. 'Sheet1' is the default name for the first sheet.
    $.getJSON(latlng, function (latlng) {
        $.getJSON(properties, function (properties) {
            // data.values contains the array of rows from the spreadsheet. Each row is also an array of cell values.
            // Modify the code below to suit the structure of your spreadsheet.
            // console.log(data.values)

            let allData = []

            let res = latlng.values
            let prop = properties.values


            let simply = (data) => {
                let arr = []
                for (let i = 1; i < data.length; i++) {
                    let object = {}
                    for (let j = 0; j < data[i].length; j++) {
                        let a = data[0][j]
                        object[a] = data[i][j]
                    }
                    arr.push(object)
                }
                return arr
            }

            let data1 = simply(res)
            let data2 = simply(prop)
            let results = data2.reduce(function (results, org) {
                (results[org.match_id] = results[org.match_id] || []).push(org);
                return results;
            }, {})

            locations.push(data1)
            metadata.push(data2)

            let mapOptions = {
                zoom: 10,
                center: new google.maps.LatLng(0, 0)
            };

            let map = new google.maps.Map(document.getElementById('map'), mapOptions);
            setLocations(map, locations);

            
        });
    });
}


function setLocations(map, locations) {
    locations = locations[0]
    var bounds = new google.maps.LatLngBounds();
    // Create nice, customised pop-up boxes, to appear when the marker is clicked on
    var infowindow = new google.maps.InfoWindow({
        content: "Content String"
    });
    for (var i = 0; i < locations.length; i++) {
        var new_marker = createMarker(map, locations[i], infowindow);
        bounds.extend(new_marker.position);

    }
    map.fitBounds(bounds);
    
}

function createMarker(map, location, infowindow) {

    // Modify the code below to suit the structure of your spreadsheet (stored in variable 'location')
    var position = {
        lat: parseFloat(location.Latitude),
        lng: parseFloat(location.Longitude)
    };

    var marker = new google.maps.Marker({
        position: position,
        map: map,
        title: location.title,
    });

    google.maps.event.addListener(marker, 'click', function () {

        let id = location.id

        let filMetaData = metadata[0].filter((a) => {
            return a.match_id === id.toString()
        })

        let arr, body, tab, tr, td, tn, row, col;

        arr = filMetaData.map(p => {
            return Object.values(p)
        })
       
       
        body = document.getElementsByTagName('body')[0];
        tab = document.createElement('table');
        let thead = Object.keys(filMetaData[0])

        let head = []
        for(let i = 1; i < thead.length; i++) {
            head.push(`<td class="head">${thead[i]}</td>`)
        }
        tab.innerHTML = head.join("")

        for (row = 0; row < arr.length; row++) {
            tr = document.createElement('tr');
            for (col = 1; col < arr[row].length; col++) {
                td = document.createElement('td');
                tn = document.createTextNode(arr[row][col]);

                td.appendChild(tn);
                tr.appendChild(td);
            }
            
            tab.appendChild(tr);
        }
        body.appendChild(tab);

        infowindow.setContent(tab);
        infowindow.open(map, marker);
    });
    return marker;
}