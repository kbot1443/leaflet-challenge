// Initialize the Leaflet map
var map = L.map('map').setView([0, 0], 2);

// Add a tile layer to the map (you can choose different tile providers)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Function to determine the color based on earthquake depth
function getColor(depth) {
  return depth > 90 ? '#d73027' :
         depth > 70 ? '#fc8d59' :
         depth > 50 ? '#fee08b' :
         depth > 30 ? '#d9ef8b' :
         depth > 10 ? '#91cf60' :
                      '#1a9850';
}

// Function to determine the size of the marker based on earthquake magnitude
function getRadius(magnitude) {
  return magnitude * 4;
}

// Fetch earthquake data from the provided URL
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Access the features array from the GeoJSON data
    var features = data.features;
    var depths = [];

    // Loop through features and add markers 
    features.forEach(feature => {
      var coordinates = feature.geometry.coordinates;
      var latitude = coordinates[1];
      var longitude = coordinates[0];
      var depth = coordinates[2];

      depths.push(depth);

      var magnitude = feature.properties.mag;
      var place = feature.properties.place;
      var popupContent = `<strong>${place}</strong><br>Magnitude: ${magnitude}<br>Depth: ${depth}`;

      // Create a circle marker for each earthquake
      L.circleMarker([latitude, longitude], {
        radius: getRadius(magnitude),
        color: getColor(depth),
        fillColor: getColor(depth),
        fillOpacity: 0.7
      })
      .bindPopup(popupContent) 
      .addTo(map);
    });

    // Create the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
      var div = L.DomUtil.create("div", "info legend");
      var labels = [];
      var limits = [-10, 10, 30, 50, 70, 90]; 
      var colors = limits.map(limit => getColor(limit + 1));

      // title of legend
      var legendInfo = '<h1>Earthquake Depth</h1>';

      div.innerHTML = legendInfo;

      // Generate the legend labels with colored square markers and line breaks
      limits.forEach((limit, index) => {
        labels.push('<span style="background-color: ' + colors[index] + '; display: inline-block; width: 12px; height: 12px;"></span>' +
          '<span class="label-text">' + (limits[index] + (limits[index + 1] ? '&ndash;' + 
          limits[index + 1] : '+')) + '</span><br>');
      });




      div.innerHTML += '<ul>' + labels.join('') + '</ul>';
      return div;
    };

    // Adding the legend to the map
    legend.addTo(map);
  });
