console.log("LISTING:", listing);

console.log("GEOMETRY:", listing?.geometry);

console.log("COORDINATES:", listing?.geometry?.coordinates);

mapboxgl.accessToken = mapToken;

// =========================
// DEFAULT COORDINATES
// =========================

// Indore
// [longitude, latitude]

const defaultCoordinates = [75.8577, 22.7196];

// =========================
// GET COORDINATES
// =========================

// Use listing coordinates if they exist
// Otherwise use default coordinates

const coordinates =
  listing?.geometry?.coordinates?.length === 2
    ? listing.geometry.coordinates
    : defaultCoordinates;

console.log("Coordinates used by map:", coordinates);

// =========================
// CREATE MAP
// =========================

const map = new mapboxgl.Map({
  container: "map",

  style: "mapbox://styles/mapbox/streets-v12",

  center: coordinates,

  zoom: 9,
});

// =========================
// CREATE MARKER
// =========================

const marker = new mapboxgl.Marker({
  color: "red",
})

  .setLngLat(coordinates)

  .setPopup(
    new mapboxgl.Popup({
      offset: 25,
    }).setHTML(
      `<h4>
              ${listing?.title || "Location"}
           </h4>

           <p>
              Exact Location will be provided after booking
           </p>`,
    ),
  )

  .addTo(map);
