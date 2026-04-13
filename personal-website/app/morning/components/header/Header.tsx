import { WEATHER_URL, weatherCodeToDisplay } from "../../../lib/constants";
import type { WeatherData, HourlyWeather } from "../../../lib/types";
import SunArc from "./SunArc";
import NflCountdowns from "../nfl/NflCountdowns";
import styles from "./header.module.css";

const MOCK_WEATHER: WeatherData = {
  temperature: 14,
  weatherCode: 2,
  windSpeed: 18,
  humidity: 72,
  sunrise: new Date(new Date().setHours(6, 42, 0, 0)).toISOString(),
  sunset: new Date(new Date().setHours(20, 48, 0, 0)).toISOString(),
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: new Date(new Date().setHours(i, 0, 0, 0)).toISOString(),
    temperature: 10 + Math.sin((i - 6) * 0.3) * 6,
    weatherCode: i > 6 && i < 20 ? 1 : 0,
  })),
};

async function fetchWeather(): Promise<WeatherData> {
  try {
    const res = await fetch(WEATHER_URL, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error("Weather fetch failed");
    const data = await res.json();

    const hourly: HourlyWeather[] = data.hourly.time.map(
      (t: string, i: number) => ({
        time: t,
        temperature: data.hourly.temperature_2m[i],
        weatherCode: data.hourly.weather_code[i],
      })
    );

    return {
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      humidity: data.current.relative_humidity_2m,
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
      hourly,
    };
  } catch {
    return MOCK_WEATHER;
  }
}

export default async function Header() {
  const weather = await fetchWeather();
  const { description } = weatherCodeToDisplay(weather.weatherCode);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Amsterdam",
  });

  // Get the next 8 hours of forecast starting from current hour
  const currentHour = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })
  ).getHours();
  const upcomingHourly = weather.hourly.slice(currentHour, currentHour + 8);

  return (
    <header className={styles.header}>
      <div className={styles.leftColumn}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>Good Morning, Scott</h1>
          <p className={styles.date}>{dateStr}</p>
        </div>
        <NflCountdowns />
      </div>
      <div className={styles.weatherPanel}>
        <div className={styles.weatherTop}>
          <div className={styles.tempBlock}>
            <span className={styles.temp}>
              {Math.round(weather.temperature)}°
            </span>
            <span className={styles.weatherDesc}>
              {description} &middot; {Math.round(weather.windSpeed)} km/h
            </span>
            <span className={styles.weatherLoc}>Amsterdam</span>
          </div>
          <SunArc
            sunrise={weather.sunrise}
            sunset={weather.sunset}
          />
        </div>
        <div className={styles.hourlyRow}>
          {upcomingHourly.map((h) => {
            const hour = new Date(h.time).getHours();
            const { icon } = weatherCodeToDisplay(h.weatherCode);
            return (
              <div key={h.time} className={styles.hourlyItem}>
                <span className={styles.hourlyTime}>
                  {hour === currentHour ? "Now" : `${hour}:00`}
                </span>
                <span className={styles.hourlyIcon}>{icon}</span>
                <span className={styles.hourlyTemp}>
                  {Math.round(h.temperature)}°
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
