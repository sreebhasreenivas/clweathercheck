// WeatherCheck — fetches weather from Open-Meteo (no API key required).
(function () {
  var GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  var WX_URL = 'https://api.open-meteo.com/v1/forecast';

  var form = document.getElementById('search-form');
  var input = document.getElementById('city');
  var submitBtn = form.querySelector('button[type="submit"]');
  var statusEl = document.getElementById('status');
  var currentEl = document.getElementById('current');
  var forecastSection = document.getElementById('forecast-section');
  var forecastList = document.getElementById('forecast');
  var emptyEl = document.getElementById('empty');

  // WMO weather interpretation codes.
  var CODES = {
    0: ['Clear sky', '☀️'],
    1: ['Mainly clear', '🌤️'],
    2: ['Partly cloudy', '⛅'],
    3: ['Overcast', '☁️'],
    45: ['Fog', '🌫️'],
    48: ['Rime fog', '🌫️'],
    51: ['Light drizzle', '🌦️'],
    53: ['Drizzle', '🌦️'],
    55: ['Heavy drizzle', '🌧️'],
    56: ['Freezing drizzle', '🌧️'],
    57: ['Freezing drizzle', '🌧️'],
    61: ['Light rain', '🌦️'],
    63: ['Rain', '🌧️'],
    65: ['Heavy rain', '🌧️'],
    66: ['Freezing rain', '🌧️'],
    67: ['Freezing rain', '🌧️'],
    71: ['Light snow', '🌨️'],
    73: ['Snow', '🌨️'],
    75: ['Heavy snow', '❄️'],
    77: ['Snow grains', '🌨️'],
    80: ['Light showers', '🌦️'],
    81: ['Showers', '🌧️'],
    82: ['Violent showers', '⛈️'],
    85: ['Snow showers', '🌨️'],
    86: ['Heavy snow showers', '❄️'],
    95: ['Thunderstorm', '⛈️'],
    96: ['Thunderstorm with hail', '⛈️'],
    99: ['Thunderstorm with hail', '⛈️']
  };

  function describe(code) {
    return CODES[code] || ['Unknown', '🌡️'];
  }

  function setStatus(msg, isError) {
    statusEl.textContent = msg || '';
    statusEl.classList.toggle('error', !!isError);
  }

  function round(n) { return Math.round(n); }

  async function geocode(name) {
    var url = GEO_URL + '?count=1&language=en&format=json&name=' + encodeURIComponent(name);
    var res = await fetch(url);
    if (!res.ok) throw new Error('Location lookup failed (' + res.status + ').');
    var data = await res.json();
    if (!data.results || !data.results.length) throw new Error('No city found for "' + name + '".');
    return data.results[0];
  }

  async function getWeather(lat, lon) {
    var params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '5'
    });
    var res = await fetch(WX_URL + '?' + params.toString());
    if (!res.ok) throw new Error('Weather lookup failed (' + res.status + ').');
    return res.json();
  }

  function renderCurrent(place, wx) {
    var c = wx.current;
    var d = describe(c.weather_code);
    var label = [place.name, place.admin1, place.country].filter(Boolean).join(', ');

    document.getElementById('current-place').textContent = label;
    document.getElementById('current-desc').textContent = d[0];
    document.getElementById('current-icon').textContent = d[1];
    document.getElementById('current-temp-value').textContent = round(c.temperature_2m) + '°';
    document.getElementById('stat-feels').textContent = round(c.apparent_temperature) + '°C';
    document.getElementById('stat-humidity').textContent = round(c.relative_humidity_2m) + '%';
    document.getElementById('stat-wind').textContent = round(c.wind_speed_10m) + ' km/h';
    var rain = wx.daily.precipitation_probability_max && wx.daily.precipitation_probability_max[0];
    document.getElementById('stat-rain').textContent = rain == null ? '—' : rain + '%';

    currentEl.hidden = false;
  }

  function renderForecast(wx) {
    var daily = wx.daily;
    forecastList.innerHTML = '';
    daily.time.forEach(function (iso, i) {
      var d = describe(daily.weather_code[i]);
      var date = new Date(iso + 'T00:00:00');
      var dayName = i === 0 ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' });

      var li = document.createElement('li');
      li.className = 'day';

      var name = document.createElement('div');
      name.className = 'day-name';
      name.textContent = dayName;

      var icon = document.createElement('span');
      icon.className = 'wx-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = d[1];

      var desc = document.createElement('p');
      desc.className = 'day-desc';
      desc.textContent = d[0];

      var temps = document.createElement('div');
      temps.className = 'day-temps';
      var hi = document.createElement('span');
      hi.className = 'day-hi';
      hi.textContent = round(daily.temperature_2m_max[i]) + '°';
      var lo = document.createElement('span');
      lo.className = 'day-lo';
      lo.textContent = round(daily.temperature_2m_min[i]) + '°';
      temps.append(hi, lo);

      li.append(name, icon, desc, temps);
      forecastList.appendChild(li);
    });
    forecastSection.hidden = false;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var city = input.value.trim();
    if (!city) return;

    submitBtn.disabled = true;
    setStatus('Loading weather for ' + city + '…');
    try {
      var place = await geocode(city);
      var wx = await getWeather(place.latitude, place.longitude);
      renderCurrent(place, wx);
      renderForecast(wx);
      emptyEl.hidden = true;
      setStatus('');
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Please try again.', true);
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
