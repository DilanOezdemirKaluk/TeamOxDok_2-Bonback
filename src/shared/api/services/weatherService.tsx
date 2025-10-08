import { IWeatherForecast } from "../../../models/WeatherForecast/IWeatherForecast";
import { httpClient } from "../httpClient";

const loadAll = async (): Promise<IWeatherForecast[]> => {
  const response = await httpClient.get<IWeatherForecast[]>(
    "api/weatherforecast"
  );
  return response.data;
};

const weatherForecastService = {
  loadAll,
};

export default weatherForecastService;
