import { useState, useEffect } from "react";
import "./index.css";

const KEY = "9ed25195e11d4859947102643242211";

function App() {
  // State to store the city name entered by the user
  const [city, setCity] = useState("");

  // State to store the fetched weather data
  const [weatherData, setWeatherData] = useState(null);

  // State to handle errors during fetching
  const [error, setError] = useState(null);

  // State to manage the loading state of the application
  const [loading, setLoading] = useState(false);

  // State to store the user's current coordinates
  const [coords, setCoords] = useState(null);

  // UseEffect to get the user's geolocation when the component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude }); // Save the user's coordinates
      },
      (err) => {
        console.error("Geolocation error", err.message);
        setError("Failed to get your location");
      }
    );
  }, []); // Dependency array is empty, so this runs only once when the component mounts

  // Function to handle changes in the input field
  async function handleCityChange(e) {
    const newCity = e.target.value;
    setCity(newCity);

    // If the input is empty and no coordinates are available, reset data and errors
    if (!city.trim() && !coords) {
      setWeatherData(null);
      setError(null);
      return;
    }

    setLoading(true); // Set loading state to true before making the API request
    try {
      const query = newCity.trim() ? city : `${coords.latitude},${coords.longitude}`;

      // Fetch weather data from the API
      const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}`);
      const data = await res.json();

      // Handle API errors
      if (data.error) {
        setError(data.error.message);
        setWeatherData(null);
        return;
      }

      // Save fetched data to state
      setWeatherData(data);
      setError(null);
    } catch {
      // Handle network or other fetch errors
      setError("Failed to fetch weather data");
      setWeatherData(null);
    } finally {
      setLoading(false); // Reset loading state
    }
  }

  // Render an error message if an error occurs
  function renderError() {
    return <p>{error}</p>;
  }

  // Render a loading message while data is being fetched
  function renderLoading() {
    return <p>Loading...</p>;
  }

  // Render the weather card if data is available
  function renderWeather() {
    return (
      <div className="weather-card">
        <h2>{`${weatherData?.location.name}, ${weatherData?.location.country}`}</h2>
        <img
          src={`https:${weatherData?.current?.condition?.icon}`}
          alt="icon"
          className="weather-icon"
        />
        <p className="temperature"> {Math.round(weatherData?.current?.temp_c)}°C</p>
        <p className="condition"> {weatherData?.current?.condition?.text}</p>
        <div className="weather-details">
          <p>Humidity: {weatherData?.current?.humidity}%</p>
          <p>Wind: {weatherData?.current?.wind_kph} km/h</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="widget-container">
        <div className="weather-card-container">
          <h1 className="app-title">Weather Widget</h1>
          <div className="search-container">
            <input
              type="text"
              value={city}
              placeholder="Enter city name"
              className="search-input"
              onChange={handleCityChange} // Trigger fetching data when input changes
            />
          </div>
        </div>
        {error && renderError()}
        {loading && renderLoading()}
        {!loading && !error && weatherData && renderWeather()}
      </div>
    </div>
  );
}

export default App;
