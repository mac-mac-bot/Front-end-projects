
const search = document.querySelector(".city-input");
const button = document.querySelector(".search-icon");

// Weather condition based on Open-Meteo weather codes
function getWeatherCondition(code) {
    if (code === 0) return "Clear Sky";
    if (code === 1) return "Mainly Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 85 && code <= 86) return "Snow Showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";

    return "Unknown";
}

// Update weather icon
function updateWeatherIcon(code) {
    const icon = document.getElementById("weather-icon");

    if (code === 0 || code === 1) {
        icon.src = "assets/sun.svg";
    } else if (code === 2 || code === 3) {
        icon.src = "assets/cloudy.svg";
    } else if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82)
    ) {
        icon.src = "assets/cloud-rain.svg";
    } else {
        icon.src = "assets/cloudy.svg";
    }
}

// Search button event
button.addEventListener("click", function(event) {
    event.preventDefault();

    const city = search.value.trim();

    if (city === "") {
        alert("Please enter a city");
        return;
    }

    // STEP 1: Get latitude and longitude
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Location API request failed");
            }
            return response.json();
        })
        .then(locationData => {

            if (!locationData.results || locationData.results.length === 0) {
                alert("City not found. Please try again.");
                return null;
            }

            const location = locationData.results[0];

            const latitude = location.latitude;
            const longitude = location.longitude;

            // STEP 2: Fetch weather data
            return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,apparent_temperature,cloud_cover,weather_code`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Weather API request failed");
                    }

                    return response.json();
                })
                .then(weatherData => ({
                    weatherData: weatherData,
                    location: location
                }));
        })

        // STEP 3: Update HTML
        .then(result => {
            if (!result) return;

            const weather = result.weatherData.current;
            const location = result.location;

            document.getElementById("temperature").textContent =
                weather.temperature_2m + "°C";

            document.getElementById("humidity").textContent =
                weather.relative_humidity_2m + "%";

            document.getElementById("wind-speed").textContent =
                weather.wind_speed_10m + " km/h";

            document.getElementById("feels-like").textContent =
                weather.apparent_temperature + "°C";

            document.getElementById("cloud-cover").textContent =
                weather.cloud_cover + "%";

            document.getElementById("city-name").textContent =
                location.name + ", " + location.country;

            // STEP 4: Update weather condition
            const code = weather.weather_code;

            document.getElementById("condition").textContent =
                getWeatherCondition(code);

            updateWeatherIcon(code);
        })

        // STEP 5: Handle errors
        .catch(error => {
            console.error("Error:", error);
            alert("Unable to fetch weather data. Please try again.");
        });
});
