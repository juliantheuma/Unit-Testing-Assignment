const express = require('express');
const app = express();
const port = 3000;
const axios = require("axios")
require("dotenv").config();

const airportApiUrl = "https://airport-info.p.rapidapi.com/airport";
const primaryIpApiUrl = "http://ip-api.com"
const weatherApiUrl = "https://weatherapi-com.p.rapidapi.com"

app.use(express.json())

app.get("/weather/current", async (req, res) => {

    
    let {isCold, isRaining} = await getCurrentWeather(req);
    res.json({isRaining, isCold})
})

async function getCurrentWeather(req){

    let geoLocationData = await callGeoLocationApisWithFallback(req.ip)
    //get longitude and latitude

    let latitude = geoLocationData.lat;
    let longitude = geoLocationData.lon;

    //call weather api
    let weatherData = await callCurrentWeatherApi(longitude, latitude);
    let temperature = weatherData.current.temp_c;
    let precipitation = weatherData.current.precip_mm;

    //set isCold and isRaining
    let { isCold, isRaining } = calculateWeatherConditions(temperature, precipitation);
    return { isCold, isRaining}
}

app.get("/weather/forecast", async (req, res) => {

        await getForecast();
    })

    async function getForecast(req, res){

        try{
            let { airportCode, dateOfArrival } = req.query; //get airport code and date of arrival from query parameters
       
            let { iataCode, icaoCode } = determineAirportCodeType(airportCode);
       
            //Call airport info api with airport code
           let airportData = await callAirportApi(iataCode, icaoCode);
       
           let latitude = airportData.latitude;
           let longitude = airportData.longitude;
       
            //Call the weather api using longitude, latitude and date
           let weatherForecast = await callWeatherForecastApi(longitude, latitude, dateOfArrival);
       
           let temperature =  weatherForecast.forecast.forecastday[0].day.avgtemp_c;
           let precipitation = weatherForecast.forecast.forecastday[0].day.totalprecip_mm;
       
           let { isCold, isRaining } = calculateWeatherConditions(temperature, precipitation);
       
           res.json({isRaining, isCold})
       
           }
           catch(error){
               res.status(500).json({
                   error: error.message
               })
           }

    }

function determineAirportCodeType(airportCode){
    
    const regex = /^[A-Za-z]{3,4}$/; //Only letters, and 3-4 characters long
    let validated =  regex.test(airportCode);
        

    if(!validated){
        throw new Error("Invalid Airport Code")
    }

    if(airportCode.length === 3){
        return { iataCode: airportCode, icaoCode: null };
    }
    else if(airportCode.length === 4) {
        return { iataCode: null, icaoCode: airportCode };
    }
}

function calculateWeatherConditions(temperature, precipitation){
    let isCold = false;
    let isRaining = false;

    if(temperature <= 15){
        isCold = true;
    }
    if(precipitation > 0){
        isRaining = true;
    }

    return { isCold, isRaining };
}
function fallbackTimeout(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                data: null,
                timeoutError: true
            })
        }, duration)
    })
}

async function callGeoLocationApisWithFallback(ipAdress){

    let geoLocationData = null;

    try{
        let primaryResult = 
        await Promise.race([
            callPrimaryIpGeolocationApi(ipAdress),
            fallbackTimeout(3000)
        ])

        if(primaryResult.timeoutError){
            throw new Error("Request timed out")
        }

        if(primaryResult){
            console.log(primaryResult)
            geoLocationData = primaryResult
        }
    }
    catch (error) {

        try {
                let secondaryResult = await callSecondaryIpGeolocationApi(ipAdress);
            
                if(secondaryResult.data){
                    geoLocationData = secondaryResult.data
                }

            } catch (error) {
                throw new Error("Error calling secondary API")
            }

    }
    finally {

        if(geoLocationData === null){
            throw new Error("Failed to retrieve geolocation data")
        }
        return geoLocationData;
    }

}

async function callPrimaryIpGeolocationApi(ipAdress){

    try {
        let geoLocationData = null;
    if(process.env.DEVELOPMENT_BUILD){

    let res = await axios.get(`${primaryIpApiUrl}/json`);
        geoLocationData = res.data;
    }
    else{
        let res = await axios.get(`${primaryIpApiUrl}/json/${ipAdress}`);
        geoLocationData = res.data;
    }
    return geoLocationData;
    
    } catch (error) {
        return {
            error: error.message
        }
        }
    

}

async function callSecondaryIpGeolocationApi(ipAdress=null){
    try {
        let apiKey = "77e0604ec1b44c408b757829fc57ce0c";
        let result = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`)
        console.log(result.data)
        return result.data
    } catch (error) {
        return {
            error: error.message
        }
    }
    
}

async function callCurrentWeatherApi(longitude, latitude){

    const options = {
        method: 'GET',
        url: 'https://weatherapi-com.p.rapidapi.com/current.json',
        params: {q: `${latitude},${longitude}`},
        headers: {
          'X-RapidAPI-Key': 'a34ee6699cmshf13baad37a21d5bp1a3d47jsn5f2c5a262cfa',
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
          console.log(response.data);
          return response.data
      } catch (error) {
          console.error(error);
      }
}

async function callAirportApi(iataCode, icaoCode){

    const options = {
        method: 'GET',
        url: 'https://airport-info.p.rapidapi.com/airport',
        params: {iata: iataCode, icao: icaoCode},
        headers: {
          'X-RapidAPI-Key': 'a34ee6699cmshf13baad37a21d5bp1a3d47jsn5f2c5a262cfa',
          'X-RapidAPI-Host': 'airport-info.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
            return response.data
      } catch (error) {
          throw new Error(error.message)
      }

}

async function callWeatherForecastApi(longitude, latitude, date){

    const options = {
        method: 'GET',
        url: 'https://weatherapi-com.p.rapidapi.com/forecast.json',
        params: {
          q: `${latitude},${longitude}`,
          days: '1',
          dt: date
        },
        headers: {
          'X-RapidAPI-Key': 'a34ee6699cmshf13baad37a21d5bp1a3d47jsn5f2c5a262cfa',
          'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
          console.log(response.data);
          return response.data
      } catch (error) {
          throw new Error(error.message)
      }

}

module.exports = {
    callPrimaryIpGeolocationApi,
    callSecondaryIpGeolocationApi,
    callWeatherForecastApi,
    callAirportApi,
    callCurrentWeatherApi,
    callGeoLocationApisWithFallback,
    calculateWeatherConditions,
    determineAirportCodeType,
    fallbackTimeout
}


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
  });