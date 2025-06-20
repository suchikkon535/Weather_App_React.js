require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const WEATHERBIT_API_KEY = process.env.WEATHERBIT_API_KEY;

// Routes
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Current weather endpoint
    const response = await axios.get(
      `https://api.weatherbit.io/v2.0/current?city=${city}&key=${WEATHERBIT_API_KEY}&units=M`
    );

    if (!response.data.data || response.data.data.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const weatherData = response.data.data[0];
    
    const formattedData = {
      city: weatherData.city_name,
      country: weatherData.country_code,
      temperature: weatherData.temp,
      feels_like: weatherData.app_temp,
      humidity: weatherData.rh,
      wind_speed: weatherData.wind_spd,
      wind_dir: weatherData.wind_cdir,
      pressure: weatherData.pres,
      precipitation: weatherData.precip,
      description: weatherData.weather.description,
      icon: weatherData.weather.icon,
      sunrise: weatherData.sunrise,
      sunset: weatherData.sunset,
      uv: weatherData.uv,
      visibility: weatherData.vis,
    };

    res.json(formattedData);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: 'City not found' });
    }
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

// 16-day forecast endpoint
app.get('/api/forecast', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const response = await axios.get(
      `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHERBIT_API_KEY}&days=7&units=M`
    );

    if (!response.data.data || response.data.data.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    // Format the forecast data
    const forecastData = response.data.data.map(day => ({
      date: day.valid_date,
      max_temp: day.max_temp,
      min_temp: day.min_temp,
      pop: day.pop, // Probability of precipitation
      description: day.weather.description,
      icon: day.weather.icon,
      uv: day.uv,
      wind_spd: day.wind_spd,
      wind_dir: day.wind_cdir,
    }));

    res.json({
      city: response.data.city_name,
      country: response.data.country_code,
      forecast: forecastData
    });
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    res.status(500).json({ error: 'Error fetching forecast data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});