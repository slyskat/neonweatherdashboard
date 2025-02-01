// script.js
const API_KEY = '3df9363a35ef99583a051da77bfdac4b'; // Replace with your key

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const tempElement = document.getElementById('temp');
const cityElement = document.getElementById('city');
const descElement = document.getElementById('desc');
const mainIcon = document.getElementById('main-icon');
const forecastContainer = document.querySelector('.forecast-container');

// App State
let isCelsius = true;

// Weather Animations
const weatherAnimations = {
    Rain: 'rain-animation',
    Clouds: 'cloud-animation',
    Clear: 'sun-spin',
    Thunderstorm: 'thunder-flash'
};

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
document.getElementById('unit-toggle')?.addEventListener('click', toggleUnits);

// Initial Load
window.addEventListener('load', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        handleSearch();
    }
});

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        showAlert('Please enter a city name');
        return;
    }

    try {
        toggleLoading(true);
        await Promise.all([getWeather(city), getForecast(city)]);
        localStorage.setItem('lastCity', city);
    } catch (error) {
        showAlert(error.message);
    } finally {
        toggleLoading(false);
    }
}

async function getWeather(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${isCelsius ? 'metric' : 'imperial'}&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        updateCurrentWeather(data);
        updateBackground(data.main.temp);
    } catch (error) {
        throw new Error('Failed to fetch weather: ' + error.message);
    }
}

async function getForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${isCelsius ? 'metric' : 'imperial'}&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('Forecast unavailable');
        
        const data = await response.json();
        updateForecast(data);
    } catch (error) {
        throw new Error('Failed to fetch forecast');
    }
}

function updateCurrentWeather(data) {
    tempElement.textContent = `${Math.round(data.main.temp)}°${isCelsius ? 'C' : 'F'}`;
    cityElement.textContent = `${data.name}, ${data.sys.country}`;
    descElement.textContent = data.weather[0].description;
    mainIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png">`;
    
    // Apply animation
    const condition = data.weather[0].main;
    mainIcon.className = `weather-icon ${weatherAnimations[condition] || ''}`;
}

function updateForecast(data) {
    forecastContainer.innerHTML = data.list
        .filter((_, index) => index % 8 === 0)
        .slice(0, 5)
        .map(forecast => `
            <div class="forecast-card glass-effect">
                <h3>${new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png">
                </div>
                <p>${Math.round(forecast.main.temp)}°${isCelsius ? 'C' : 'F'}</p>
            </div>
        `).join('');
}

function updateBackground(temp) {
    const hue = isCelsius ? 
        temp > 25 ? 20 : 200 : 
        temp > 77 ? 20 : 200;
        
    document.body.style.background = `
        linear-gradient(45deg, 
            hsl(${hue}, 70%, 30%), 
            hsl(${hue + 20}, 70%, 20%)
        )
    `;
}

function toggleUnits() {
    isCelsius = !isCelsius;
    if (cityInput.value.trim()) handleSearch();
}

function toggleLoading(isLoading) {
    searchBtn.disabled = isLoading;
    searchBtn.innerHTML = isLoading 
        ? `<i class="fas fa-spinner fa-spin"></i>`
        : `<i class="fas fa-search"></i>`;
}

function showAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'weather-alert';
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 3000);
}