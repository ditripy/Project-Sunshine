var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var markers = [];

var userIcon = L.icon({
    iconUrl: 'images/snow.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var customIcon1 = L.icon({
    iconUrl: 'images/sun.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

var customIcon2 = L.icon({
    iconUrl: 'images/cone.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

navigator.geolocation.watchPosition(success, error);

let marker, circle, zoomed;

function success(place) {
    const lat = place.coords.latitude;
    const lng = place.coords.longitude;
    const accuracy = place.coords.accuracy;

    if (marker) {
        map.removeLayer(marker);
        map.removeLayer(circle);
    }

    marker = L.marker([lat, lng]).addTo(map);
    circle = L.circle([lat, lng], { radius: accuracy / 100 }).addTo(map);

    if (!zoomed) {
        map.setView([lat, lng], 15);
        zoomed = true;
    }

    map.setView([lat, lng]);
    updateMarkers();
}

function error(err) {
    if (err.code === 1) {
        alert("Please allow geolocation access");
    } else {
        alert("Cannot get current location");
    }
    updateMarkers();
}

var geocoder = L.Control.geocoder({
    geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);

document.getElementById('addressForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var address = document.getElementById('addressInput').value;

    geocoder.on('markgeocode', function (e) {
        var latlng = e.geocode.center;
        var marker = L.marker(latlng, { icon: userIcon }).addTo(map)
            .bindPopup(e.geocode.name)
            .openPopup();
        reverseGeocodeAndStore(marker);
        markers.push(marker);
        attachMarkerClickEvent(marker);
    });

    geocoder.options.geocoder.geocode(address, function (results) {
        if (results && results.length > 0) {
            var latlng = results[0].center;
            var marker = L.marker(latlng, { icon: userIcon }).addTo(map)
                .bindPopup(results[0].name)
                .openPopup();
            reverseGeocodeAndStore(marker);
            markers.push(marker);
            attachMarkerClickEvent(marker);
        } else {
            alert('Address not found');
        }
    });
});

document.getElementById('currentLocationBtn').addEventListener('click', function (event) {
    event.preventDefault();
    navigator.geolocation.getCurrentPosition(function (position) {
        var latlng = [position.coords.latitude, position.coords.longitude];
        var marker = L.marker(latlng, { icon: userIcon }).addTo(map)
            .bindPopup('Your Current Location')
            .openPopup();
        reverseGeocodeAndStore(marker);
        markers.push(marker);
        attachMarkerClickEvent(marker);
    }, function (error) {
        console.error('Error getting current location:', error);
        alert('Error getting current location.');
    });
});

function attachMarkerClickEvent(marker) {
    marker.on('click', function (e) {
        var selectedMarker = document.querySelector('.selected-marker');
        if (selectedMarker) {
            selectedMarker.classList.remove('selected-marker');
            selectedMarker.setIcon(userIcon);
        }
        this.setIcon(customIcon1);
        this.classList.add('selected-marker');
    });
    updateMarkers();
}

markers.forEach(function (marker) {
    attachMarkerClickEvent(marker);
});


function reverseGeocodeAndStore(marker) {
    var latlng = marker.getLatLng();
    var geocodeService = L.Control.Geocoder.nominatim();

    
    geocodeService.reverse(latlng, map.options.crs.scale(map.getZoom()), function (results) {
        if (results.length > 0) {
            var address = results[0].name; 
            marker.address = address; 
            console.log("Marker address:", address);
        } else {
            console.log("No address found for marker");
        }
    });
}

function updateAddressList() {
    var addressesDiv = document.getElementById('addresses');
    addressesDiv.innerHTML = ''; 

    
    markers.forEach(function(marker) {
        var address = marker.address;
        if (address) {
            addressesDiv.innerHTML += '<p>' + address + '</p>';
        }
    });
}

function updateMarkers() {

    updateAddressList();
}

document.addEventListener('DOMContentLoaded', function() {
    updateMarkers();
});