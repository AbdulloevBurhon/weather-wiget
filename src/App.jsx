import { useState, useEffect } from "react";
import "./index.css";

const KEY = "ef354aa428074050b7e83836253112";

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
        console.log(position); // Log the geolocation result for debugging
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude }); // Save the user's coordinates
      },
      (err) => {
        console.error("Geolocation error", err.message); // Log the geolocation error
        setError("Failed to get your location");
      },
    );
  }, []); // Dependency array is empty, so this runs only once when the component mounts

  // UseEffect to fetch weather data when `city` or `coords` change
  useEffect(() => {
    const controller = new AbortController(); // Create an AbortController for cancelling the fetch
    const signal = controller.signal;

    if (!city.trim() && !coords) {
      setWeatherData(null); // Clear weather data if no city or coordinates are provided
      setError(null); // Clear errors
      return;
    }

    async function getData() {
      setLoading(true); // Set loading state to true before making the API request
      try {
        const query = city.trim()
          ? city
          : `${coords.latitude},${coords.longitude}`;

        // Fetch weather data from the API
        const res = await fetch(
          `http://api.weatherapi.com/v1/current.json?key=${KEY}&q=${query}`,
          {
            signal, // Pass the AbortController signal
          },
        );
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

    getData();

    // Cleanup function to abort the fetch when the component unmounts or dependencies change
    return () => {
      controller.abort();
    };
  }, [city, coords]); // Dependencies: fetch weather data when `city` or `coords` change

  // useEffect for additional API fetch example (commented out)
  // useEffect(() => {
  //   async function getData() {
  //     try {
  //       const res = await fetch(`http://api.weatherapi.com/v1/current.json?key=${KEY}&q=${city}`);
  //       console.log(res);

  //       if (!res.ok) {
  //         throw new Error(`Error: ${res.status}, ${res.statusText}!!!!`);
  //       }
  //       const data = await res.json();

  //       setWeatherData(data);
  //     } catch (err) {
  //       setError(err.message);
  //     }
  //   }
  //   getData();
  // }, []);

  // Function to render an error message
  function renderError() {
    return <p>{error}</p>;
  }

  // Function to render a loading message
  function renderLoading() {
    return <p>Loading...</p>;
  }

  // Function to render the weather card if data is available
  function renderWeather() {
    return (
      <div className="weather-card">
        <h2>{`${weatherData?.location.name}, ${weatherData?.location.country}`}</h2>
        <img
          src={`https:${weatherData?.current?.condition?.icon}`}
          alt="icon"
          className="weather-icon"
        />
        <p className="temperature">
          {" "}
          {Math.round(weatherData?.current?.temp_c)}°C
        </p>
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
      {/* <TimerComponent /> */}
      <div className="widget-container">
        <div className="weather-card-container">
          <h1 className="app-title">Weather Widget</h1>
          <div className="search-container">
            <input
              type="text"
              value={city}
              placeholder="Enter city name"
              className="search-input"
              onChange={(e) => setCity(e.target.value)} // Update city state on input change
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

// TimerComponent function example (commented out for future use)
// function TimerComponent() {
//   const [count, setCount] = useState(0);
//   const [isRunning, setIsRunning] = useState(false);

//   useEffect(() => {
//     let timer;

//     if (isRunning) {
//       // Start the timer if `isRunning` is true
//       timer = setInterval(() => {
//         console.log("Timer running:", count);
//         setCount((prev) => prev + 1);
//       }, 1000);
//     }

//     // Cleanup function to clear the timer
//     return () => {
//       if (timer) {
//         console.log("Cleaning up the timer");
//         clearInterval(timer);
//       }
//     };
//   }, [isRunning]); // Dependencies: run the effect when `isRunning` changes

//   return (
//     <div>
//       <h1>Timer: {count}</h1>
//       <button onClick={() => setIsRunning((prev) => !prev)}>
//         {isRunning ? "Stop Timer" : "Start Timer"}
//       </button>
//       <button onClick={() => setCount(0)} disabled={isRunning}>
//         Reset Timer
//       </button>
//     </div>
//   );
// }

export default App;
