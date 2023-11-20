async function stub_weather_current_success(){
    return Promise.resolve({
        location: {
          name: 'Buenavista (Kilometro 1.5)',
          region: 'Morelos',
          country: 'Mexico',
          lat: 18.63,
          lon: -99.23,
          tz_id: 'America/Mexico_City',
          localtime_epoch: 1700498145,
          localtime: '2023-11-20 10:35'
        },
        current: {
          last_updated_epoch: 1700497800,
          last_updated: '2023-11-20 10:30',
          temp_c: 25,
          temp_f: 77,
          is_day: 1,
          condition: {
            text: 'Partly cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            code: 1003
          },
          wind_mph: 4.3,
          wind_kph: 6.8,
          wind_degree: 140,
          wind_dir: 'SE',
          pressure_mb: 1020,
          pressure_in: 30.13,
          precip_mm: 0,
          precip_in: 0,
          humidity: 61,
          cloud: 50,
          feelslike_c: 26.4,
          feelslike_f: 79.5,
          vis_km: 9.7,
          vis_miles: 6,
          uv: 6,
          gust_mph: 3.1,
          gust_kph: 5
        }
      })
}

async function stub_weather_current_fail(){
    return Promise.reject("Error getting weather API")
}

module.exports = {
  stub_weather_current_success,
  stub_weather_current_fail

}