require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');

const MUSTACHE_MAIN_DIR = './main.mustache';

let DATA = {
  refresh_date: new Date().toLocaleDateString('Pt-br', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'America/Sao_Paulo',
  }),
};

getWeatherData = async () => {
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=recife&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
  )
    .then(response => response.json())
    .then(response => {
      if (response.cod !== 200) {
        throw new Error(response.message);
      }
      DATA.city_temperature = Math.round(response.main.temp);
      DATA.city_weather = response.weather[0].description;
      DATA.sun_rise = new Date(response.sys.sunrise * 1000).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      });
      DATA.sun_set = new Date(response.sys.sunset * 1000).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo',
      });
    });
};

generateReadme = async () => {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
};

action = async () => {
  // Fetch Weather Data from OpenWeather API
  await getWeatherData();

  // Generate new README.md
  await generateReadme();
};

action();
