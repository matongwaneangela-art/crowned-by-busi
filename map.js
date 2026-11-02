/* =========================================================
   Crowned by Busi - map.js  (Contact page)
   Interactive map built with Leaflet + OpenStreetMap tiles.
   - marker + popup for the shop
   - "How far am I?" uses the browser's geolocation (only when the
     visitor presses the button) and works out the distance.
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  var mapEl = document.getElementById('map');
  var statusEl = document.getElementById('map-status');
  var locateBtn = document.getElementById('locate-btn');
  if (!mapEl) return;

  /* Shop location (approximate position of Randburg Square). Edit if needed. */
  var SHOP = { lat: -26.0936, lng: 28.0064 };

  if (typeof L === 'undefined') {
    /* Leaflet failed to load (offline / blocked): degrade gracefully */
    mapEl.textContent = 'The map could not be loaded. Find us at Shop 12, Randburg Square, Randburg.';
    mapEl.classList.add('map-fallback');
    if (locateBtn) locateBtn.hidden = true;
    return;
  }

  var map = L.map(mapEl, { scrollWheelZoom: false }).setView([SHOP.lat, SHOP.lng], 15);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  /* Popup built from DOM nodes (not an HTML string) */
  var popup = document.createElement('div');
  var title = document.createElement('strong');
  title.textContent = 'Crowned by Busi';
  var addr = document.createElement('div');
  addr.textContent = 'Shop 12, Randburg Square, Randburg';
  popup.appendChild(title);
  popup.appendChild(addr);

  L.marker([SHOP.lat, SHOP.lng], { title: 'Crowned by Busi' })
    .addTo(map)
    .bindPopup(popup)
    .openPopup();

  /* The page scrolls normally; the wheel only zooms once the map is clicked */
  map.once('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('click', function () { map.scrollWheelZoom.enable(); });

  /* ---------- distance from visitor to shop ---------- */
  function haversineKm(lat1, lng1, lat2, lng2) {
    var R = 6371;
    var toRad = function (d) { return d * Math.PI / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  var youMarker = null;
  if (locateBtn) {
    locateBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        statusEl.textContent = 'Your browser does not support location. Use the directions link instead.';
        return;
      }
      statusEl.textContent = 'Finding your location…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var km = haversineKm(pos.coords.latitude, pos.coords.longitude, SHOP.lat, SHOP.lng);
        statusEl.textContent = km < 1
          ? 'You are less than 1 km from the shop. Come on in!'
          : 'You are about ' + km.toFixed(1) + ' km from the shop (in a straight line).';
        if (youMarker) map.removeLayer(youMarker);
        youMarker = L.circleMarker([pos.coords.latitude, pos.coords.longitude],
          { radius: 8, color: '#5C2A72', fillColor: '#E75480', fillOpacity: 0.9 })
          .addTo(map).bindTooltip('You are here');
        map.fitBounds([[pos.coords.latitude, pos.coords.longitude], [SHOP.lat, SHOP.lng]], { padding: [40, 40] });
      }, function (err) {
        statusEl.textContent = err.code === 1
          ? 'Location permission was denied. You can still use the directions link.'
          : 'Sorry, we could not find your location. Please try the directions link.';
      }, { timeout: 10000, maximumAge: 60000 });
    });
  }
});