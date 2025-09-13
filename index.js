require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');

const MUSTACHE_MAIN_DIR = './main.mustache';

let DATA = {
  refresh_date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'America/Sao_Paulo',
  }),
};

getRandomPhoto = async () => {
  try {
    await fetch(
      `https://api.unsplash.com/photos/random/?client_id=${process.env.UNSPLASH_KEY}&query=street%20Japan&orientation=landscape&featured=true&order_by=popular`
    )
      .then(response => response.json())
      .then(response => {
        if (response.cod !== 200) {
          console.log('Unsplash Error occurred: ', response.errors)
        }
        DATA.background_image = response.urls.regular;
        DATA.background_author = response.user.name;
        DATA.background_date = new Date(response.created_at).toLocaleDateString('en-GB', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          year: 'numeric',
          timeZoneName: 'short',
          timeZone: 'America/Sao_Paulo',
        });
      });
  } catch (err) {
    console.log(err);
  }
};

getWeatherData = async () => {
  try {
    await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=recife&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`
    )
      .then(response => response.json())
      .then(response => {
        if (response.cod !== 200) {
          console.log('OpenWeatherMap Error occurred: ', response.errors)
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
  } catch (err) {
    console.log(err);
  }
};

generateReadme = async () => {
  fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    try {
      if (err) throw err;
      const output = Mustache.render(data.toString(), DATA);
      fs.writeFileSync('README.md', output);
    } catch (err) {
      throw err;
    }
  });
};

action = async () => {
  // Fetch Random Photo from Unsplash API
  await getRandomPhoto();

  // Fetch Weather Data from OpenWeather API
  await getWeatherData();

  // Generate new README.md
  await generateReadme();
};

action();
