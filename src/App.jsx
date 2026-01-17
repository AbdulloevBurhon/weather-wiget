// const KEY = "ef354aa428074050b7e83836253112";
// import { useEffect, useState } from "react";
// import "./index.css";

const KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => setError("Location access denied"),
    );
  }, []);

  useEffect(() => {
    if (!city.trim() && !coords) return;

    const controller = new AbortController();

    async function fetchWeather() {
      setLoading(true);
      setError(null);

      try {
        const query = city.trim()
          ? city
          : `${coords.latitude},${coords.longitude}`;

        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}`,
          { signal: controller.signal },
        );

        const data = await res.json();

        if (data.error) {
          setError(data.error.message);
          setWeatherData(null);
        } else {
          setWeatherData(data);
        }
      } catch {
        setError("Failed to fetch weather");
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();

    return () => controller.abort();
  }, [city, coords]);

  return (
    <div className="app">
      <div className="widget-container">
        <h1 className="app-title">Weather Widget</h1>

        <input
          className="search-input"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}

        {weatherData && !loading && !error && (
          <div className="weather-card">
            <h2>
              {weatherData.location.name}, {weatherData.location.country}
            </h2>

            <img
              src={`https:${weatherData.current.condition.icon}`}
              alt="weather"
            />

            <p>{Math.round(weatherData.current.temp_c)}°C</p>
            <p>{weatherData.current.condition.text}</p>
            <p>Humidity: {weatherData.current.humidity}%</p>
            <p>Wind: {weatherData.current.wind_kph} km/h</p>
          </div>
        )}
      </div>
    </div>
  );
}
