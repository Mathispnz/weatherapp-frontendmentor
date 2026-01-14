// Exemple d'une réponse
// https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m&models=gfs_seamless

// Récupérer la valeur de l'input de search
// Au moment où l'utilisateur clique sur search, afficher la ville correspondante

const input = document.getElementById("searchInput");
const button = document.getElementById("searchBtn");

button.addEventListener("click", () => {
  const value = input.value;
  console.log(value);

  // Fetch du backend de l'API Nominatim pour récupérer les données géoloc via la valeur de l'input
  fetch(`http://localhost:3002/api/search?q=${encodeURIComponent(value)}`)
    .then(res => res.json())
    .then(data => {
      if (!data.length) {
        alert("Aucun résultat trouvé");
        return;
      }

      const { lat, lon, display_name } = data[0];

      // Transformation du display name pour n'afficher que la ville et le pays
      const locationName = display_name.split(",");

      const locationResult = locationName[0].trim() + ", " + locationName[locationName.length - 1].trim();

      document.getElementById("location").textContent = locationResult;

      // Deuxième fetch pour aller récupérer les données de l'API Open Meteo
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,apparent_temperature`;

      return fetch(meteoUrl);
    })
    .then(res => res.json())
    .then(meteoData => {
      updateWeatherUI(meteoData);
    })
    .catch(err => console.error(err));
});

// Formatage de la date iso récupérée de l'API 
function isoToDate(date) {
  const isoTime = date;

  const dateObj = new Date(isoTime);

  const options = {
    weekday: "long",   // Tuesday
    year: "numeric",   // 2025
    month: "short",    // Aug
    day: "numeric"     // 5
  };

  const formatted = dateObj.toLocaleDateString("en-US", options);

  return formatted;
}

// Update HTML des données récupérées 
function updateWeatherUI(data) {
  document.getElementById("time").textContent = isoToDate(data.current.time);

  document.getElementById("temperature").textContent =
    Math.round(data.current.temperature_2m) + "°";

  document.getElementById("temperature-feels").textContent =
    Math.round(data.current.apparent_temperature) + "°";

  document.getElementById("humidity").textContent =
    data.current.relative_humidity_2m + "%";

  document.getElementById("wind").textContent =
    Math.round(data.current.wind_speed_10m) + "km/h";

  document.getElementById("precipitation").textContent =
    data.current.precipitation + "mm";
}