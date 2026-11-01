import { useEffect, useMemo, useState } from 'react'
import './index.css'

const countriesUrl = 'https://studies.cs.helsinki.fi/restcountries/api/all'
const weatherUrl = 'https://api.open-meteo.com/v1/forecast'
const weatherCodes = { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain', 71: 'Light snow', 80: 'Rain showers', 95: 'Thunderstorm' }

function CountryDetails({ country }) {
  const [weather, setWeather] = useState(null)
  const [weatherError, setWeatherError] = useState('')
  const capital = country.capital?.[0]

  useEffect(() => {
    setWeather(null)
    setWeatherError('')
    if (!capital) return undefined
    const controller = new AbortController()
    const loadWeather = async () => {
      try {
        const query = new URLSearchParams({ name: capital, count: '1', language: 'en', format: 'json' })
        const placeResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${query}`, { signal: controller.signal })
        if (!placeResponse.ok) throw new Error('Could not find capital coordinates.')
        const places = await placeResponse.json()
        const place = places.results?.[0]
        if (!place) throw new Error('Capital location is unavailable.')
        const params = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, current: 'temperature_2m,wind_speed_10m,weather_code', wind_speed_unit: 'ms' })
        const weatherResponse = await fetch(`${weatherUrl}?${params}`, { signal: controller.signal })
        if (!weatherResponse.ok) throw new Error('Could not load forecast.')
        const report = await weatherResponse.json()
        setWeather(report.current)
      } catch (error) {
        if (error.name !== 'AbortError') setWeatherError('Weather is temporarily unavailable.')
      }
    }
    loadWeather()
    return () => controller.abort()
  }, [capital])

  const languages = Object.values(country.languages || {})
  return (
    <article className="country-card">
      <div className="country-title"><div><p className="eyebrow">COUNTRY PROFILE</p><h2>{country.name.common}</h2><p className="official-name">{country.name.official}</p></div><span className="country-emoji" aria-label={`${country.name.common} flag`}>{country.flag}</span></div>
      <div className="country-facts"><p><span>Capital</span><strong>{capital || 'Not listed'}</strong></p><p><span>Area</span><strong>{country.area?.toLocaleString()} km²</strong></p><p><span>Region</span><strong>{country.region}</strong></p><p><span>Population</span><strong>{country.population?.toLocaleString()}</strong></p></div>
      <div className="languages"><p className="eyebrow">LANGUAGES</p><div>{languages.map((language) => <span className="language-chip" key={language}>{language}</span>)}</div></div>
      {country.flags?.svg && <img className="flag-image" src={country.flags.svg} alt={country.flags.alt || `Flag of ${country.name.common}`} />}
      <section className="weather"><p className="eyebrow">WEATHER IN {capital?.toUpperCase() || 'THE CAPITAL'}</p>{weather ? <div className="weather-row"><strong>{Math.round(weather.temperature_2m)}°C</strong><span>{weatherCodes[weather.weather_code] || 'Current conditions'}</span><span>Wind {weather.wind_speed_10m} m/s</span></div> : <p className="weather-status">{weatherError || (capital ? 'Loading local forecast…' : 'No capital city listed.')}</p>}</section>
    </article>
  )
}

export default function App() {
  const [countries, setCountries] = useState([])
  const [query, setQuery] = useState('')
  const [selectedCode, setSelectedCode] = useState('')
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    fetch(countriesUrl)
      .then((response) => { if (!response.ok) throw new Error('Country service unavailable'); return response.json() })
      .then((data) => { setCountries(data); setStatus('ready') })
      .catch(() => setStatus('error'))
  }, [])

  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return []
    return countries.filter((country) => country.name.common.toLocaleLowerCase().includes(normalized))
  }, [countries, query])

  const selectedCountry = countries.find((country) => country.cca3 === selectedCode)
  const singleCountry = matches.length === 1 ? matches[0] : null

  return (
    <main className="country-app">
      <header className="country-header"><a className="wordmark" href="#top"><span className="brand-mark">W</span> World, nearby</a><span className="top-label">FULL STACK OPEN · 2.18–2.20</span></header>
      <section className="search-hero" id="top"><p className="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</p><h1>Find a place<br />in the world.</h1><p className="hero-copy">Explore country profiles, local languages, and a live forecast for each capital.</p><label className="country-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedCode('') }} placeholder="Search a country…" aria-label="Search countries" /></label><span className="search-hint">Try “Japan”, “Brazil”, or “New Zealand”</span></section>
      <section className="results" aria-live="polite">{status === 'loading' && <p className="empty-state">Loading country data…</p>}{status === 'error' && <p className="error-state">We couldn’t load country data. Check your connection and refresh.</p>}{status === 'ready' && query.trim() && matches.length === 0 && <p className="empty-state">No countries found. Try another spelling.</p>}{status === 'ready' && matches.length > 10 && <p className="empty-state">There are {matches.length} matches. Make your search more specific.</p>}{status === 'ready' && matches.length > 1 && matches.length <= 10 && <ul className="matches">{matches.map((country) => <li key={country.cca3}><span className="match-flag">{country.flag}</span><span>{country.name.common}</span><button type="button" onClick={() => setSelectedCode(country.cca3)}>Show</button></li>)}</ul>}{status === 'ready' && ((selectedCountry && matches.some((country) => country.cca3 === selectedCode)) || singleCountry) && <CountryDetails country={selectedCountry || singleCountry} />}{status === 'ready' && !query.trim() && <div className="prompt-card"><span>01</span><p>Start with a country name to see its flag, facts, languages, and capital weather.</p></div>}</section>
      <footer className="country-footer">Country facts · Helsinki REST Countries API <span>Weather · Open-Meteo</span></footer>
    </main>
  )
}
