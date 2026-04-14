import { WEATHER_URL } from "../lib/constants";
import type { WeatherData, HourlyWeather, DailyWeather } from "../lib/types";
import NflCountdownsTw from "./NflCountdownsTw";
import WeatherCardTw from "./WeatherCardTw";

const MOCK_WEATHER: WeatherData = {
  temperature: 14, weatherCode: 2, windSpeed: 18, humidity: 72,
  sunrise: new Date(new Date().setHours(6, 42, 0, 0)).toISOString(),
  sunset: new Date(new Date().setHours(20, 48, 0, 0)).toISOString(),
  hourly: Array.from({ length: 24 }, (_, i) => ({
    time: new Date(new Date().setHours(i, 0, 0, 0)).toISOString(),
    temperature: 10 + Math.sin((i - 6) * 0.3) * 6, weatherCode: i > 6 && i < 20 ? 1 : 0, uvIndex: i > 8 && i < 16 ? Math.sin((i - 8) * 0.4) * 5 : 0,
  })),
  daily: Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { date: d.toISOString(), high: 16 + i, low: 8 + i, weatherCode: i % 3, uvIndexMax: 3 + i * 0.5 };
  }),
};

async function fetchWeather(): Promise<WeatherData> {
  try {
    const res = await fetch(WEATHER_URL, { next: { revalidate: 900 } });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const hourly: HourlyWeather[] = data.hourly.time.map((t: string, i: number) => ({
      time: t, temperature: data.hourly.temperature_2m[i], weatherCode: data.hourly.weather_code[i], uvIndex: data.hourly.uv_index?.[i] ?? 0,
    }));
    const daily: DailyWeather[] = data.daily.time.map((t: string, i: number) => ({
      date: t, high: data.daily.temperature_2m_max[i], low: data.daily.temperature_2m_min[i], weatherCode: data.daily.weather_code[i], uvIndexMax: data.daily.uv_index_max?.[i] ?? 0,
    }));
    return {
      temperature: data.current.temperature_2m, weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m, humidity: data.current.relative_humidity_2m,
      sunrise: data.daily.sunrise[0], sunset: data.daily.sunset[0], hourly, daily,
    };
  } catch { return MOCK_WEATHER; }
}

export default async function Header() {
  const weather = await fetchWeather();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "Europe/Amsterdam",
  });
  const currentHour = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Amsterdam" })).getHours();

  return (
    <header className="flex justify-between items-start gap-6 py-4 max-sm:flex-col">
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-[#d0d7e2]">Good Morning, Scott</h1>
          <p className="text-sm text-[#6a7d92]">{dateStr}</p>
        </div>
        <NflCountdownsTw />
      </div>

      <WeatherCardTw weather={weather} currentHour={currentHour} />
    </header>
  );
}
