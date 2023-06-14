/**
 * geocoding addresses search engine outside the map
 */
const mapa_lat = document.getElementById('mapa_lat');
const mapa_lng = document.getElementById('mapa_lng');
const mapa_dir = document.getElementById('mapa_dir');
window.addEventListener("DOMContentLoaded", function () {
  // Autocomplete
  new Autocomplete("search", {
    delay: 1000,
    selectFirst: true,
    howManyCharacters: 2,

    onSearch: function ({ currentValue }) {
      const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=10&countrycodes=PE&q=${encodeURI(
        currentValue
      )}`;
      return new Promise((resolve) => {
        fetch(api)
          .then((response) => response.json())
          .then((data) => {
            resolve(data.features);
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
    // nominatim
    onResults: ({ currentValue, matches, template }) => {
      const regex = new RegExp(currentValue, "i");
      // checking if we have results if we don't
      // take data from the noResults method
      return matches === 0
        ? template
        : matches
            .map((element) => {
              return `
              <li class="loupe" role="option">
                ${element.properties.display_name.replace(
                  regex,
                  (str) => `<b>${str}</b>`
                )}
              </li> `;
            })
            .join("");
    },

    onSubmit: ({ object }) => {
      const { display_name } = object.properties;
      const cord = object.geometry.coordinates;
      // custom id for marker
    
      // borrar
      map.eachLayer(function (layer) {
        if (layer.options && layer.options.pane === "markerPane") {
          if (layer.options.id !== customId) {
            map.removeLayer(layer);
          }
        }
      });
      add_marker_custom(cord,display_name)
    },
  });

  var idmarker = 1;
  function add_marker_custom(cord,display_name){
    const marker = L.marker([cord[1], cord[0]], {
      title: display_name,
      id: idmarker,
      draggable: true,
      autoPan: true
    });
    marker.addTo(map).bindPopup(`
      ${display_name}
      <br>
      ${[cord[1], cord[0]]}
    `);
    map.setView([cord[1], cord[0]], 13);
 
    mapa_lat.value = cord[1];
    mapa_lng.value = cord[0];
    mapa_dir.value = display_name;

    marker.on('dragend', function (e) {
      console.log(e.target);
      const nameAnt = e.target.options.title;
      const coords = e.target.getLatLng();
     
      // this.bindPopup(changedPos.toString()).openPopup();
      marker.openPopup();

      geocodeService.reverse().latlng([coords.lat, coords.lng]).run(function (error, result) {
        if (error) {
          const container = "Dirección no encontrada";
        }
        const container = `${result.address.Match_addr}<br>${coords.lat} ${coords.lng}`;
        marker.addTo(map).bindPopup(container).openPopup();
        mapa_lat.value = coords.lat;
        mapa_lng.value = coords.lng;
        mapa_dir.value = result.address.Match_addr;
      });

      });
    idmarker++;
  }

  // MAP
  const config = {
    minZoom: 6,
    maxZoom: 18,
  };
  // magnification with which the map will start
  const zoom = 3;
  // co-ordinates
  const lat = -12.0666072;
  const lng = -77.0148090674595;

  // calling map
  const map = L.map("map", config).setView([lat, lng], zoom);
  var geocodeService = L.esri.Geocoding.geocodeService();

  // Used to load and display tile layers on the map
  // Most tile servers require attribution, which you can set under `Layer`
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & Dev.AECC',
  }).addTo(map);

});