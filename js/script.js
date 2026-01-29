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
      const meteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,apparent_temperature,weather_code&hourly=temperature_2m,weather_code&timezone=auto`;

      return fetch(meteoUrl);
    })
    .then(res => res.json())
    .then(meteoData => {
      console.log(meteoData);
      updateWeatherUI(meteoData);
    })
    .catch(err => console.error(err));
});

// Formatage de la date iso récupérée de l'API 
function isoToDate(date, format = "full") {
  const dateObj = new Date(date);

  let options;

  if (format === "weekday") {
    options = { weekday: "short" }
  } else {
    options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  } 

  return dateObj.toLocaleDateString("en-US", options);
}

function formatHour(time) {
  const date = new Date(time);
  let hours = date.getHours(); // 0 → 23

  const ampm = hours >= 12 ? " PM" : " AM";

  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return `${hours}${ampm}`;
}

// Update HTML des données récupérées 
function updateWeatherUI(data) {
  // Update current forecast
  document.getElementById("time").textContent = isoToDate(data.current.time);

  document.getElementById("temperature").textContent =
    Math.round(data.current.temperature_2m) + "°";

  document.getElementById("weather-code-icon").src = weatherIcon(data.current.weather_code);

  document.getElementById("temperature-feels").textContent =
    Math.round(data.current.apparent_temperature) + "°";

  document.getElementById("humidity").textContent =
    data.current.relative_humidity_2m + "%";

  document.getElementById("wind").textContent =
    Math.round(data.current.wind_speed_10m) + "km/h";

  document.getElementById("precipitation").textContent =
    data.current.precipitation + "mm";

  // Update daily forecast
  const forecastContainer = document.querySelector('.forecast_container');
  forecastContainer.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const day = data.daily.time[i];
    const tempMax = data.daily.temperature_2m_max[i];
    const tempMin = data.daily.temperature_2m_min[i];

    const icon = weatherIcon(data.daily.weather_code[i]);

    forecastContainer.innerHTML += `
      <div class="card py-4 px-2.5">
        <h3 class="card__title">
          ${isoToDate(day, "weekday")}
        </h3>
        <img src="${icon}" alt="Weather Icon" class="card__icon">
        <div class="card__temperatures flex justify-between">
          <p class="card__temperature">
            ${Math.round(tempMax)}<sup>°</sup>
          </p>
          <p class="card__temperature card__temperature--low">
            ${Math.round(tempMin)}<sup>°</sup>
          </p>
        </div>
      </div>
    `;
  }

  // Update hourly forecast
  const hourlyContainer = document.querySelector('.hourly_container');
  hourlyContainer.innerHTML = "";

  // Trouver l'index de l'heure actuelle
  const now = new Date();
  const startIndex = data.hourly.time.findIndex(time => {
    return new Date(time) >= now;
  });

  for (let i = startIndex; i < startIndex + 8; i++) {
    const hourlyTemp = data.hourly.temperature_2m[i];
    const hourlyIcon = weatherIcon(data.hourly.weather_code[i]);
    const hourlyTime = formatHour(data.hourly.time[i]);

    hourlyContainer.innerHTML += `
      <div class="hourly_container card card--light flex flex-row items-center justify-between mt-4 py-2 px-3">
        <div class="flex flex-row items-center">
          <img src="${hourlyIcon}" alt="" class="card__icon w-10">
          <p class="card__hour ml-2">${hourlyTime}</p>
        </div>
  
        <p class="card__temperature">${hourlyTemp}<sup>°</sup></p>
      </div>
    `;
  };
}

// Update weather icon en fonction du weather code
function weatherIcon(weatherCode) {
  if (weatherCode === 0) {
    return "./assets/images/icon-sunny.webp";
  };
  if (weatherCode === 2) {
    return "./assets/images/icon-partly-cloudy.webp";
  } 
  if (weatherCode === 1 || weatherCode === 3) {
    return "./assets/images/icon-overcast.webp";
  };
  if (weatherCode === 45 || weatherCode ===  48) {
    return "./assets/images/icon-fog.webp";
  }
  if (weatherCode === 53) {
    return "./assets/images/icon-drizzle.webp";
  }
  if (weatherCode === 63) {
    return "./assets/images/icon-rain.webp";
  }
  if (weatherCode === 73) {
    return "./assets/images/icon-snow.webp";
  }
  if (weatherCode === 95) {
    return "./assets/images/icon-storm.webp";
  }
  return "./assets/images/icon-sunny.webp";
}