const express = require('express');
const app = express();
const port = 3000;
const axios = require("axios")
require("dotenv").config();

const airportApiUrl = "https://airport-info.p.rapidapi.com/airport";
const primaryIpApiUrl = "http://ip-api.com"
const weatherApiUrl = "https://weatherapi-com.p.rapidapi.com"

let api;

app.use(express.json())

app.get("/weather/current", async (req, res) => {

    await api.getCurrentWeatherHandler(req, res)

})

app.get("/weather/forecast", async (req, res) => {

        await api.getForecast(req, res);
    })

    


class MyAPI {

    constructor(){

    }

    async getForecast(req, res){

        try{
            let { airportCode, dateOfArrival } = req.query; //get airport code and date of arrival from query parameters
       
            let { iataCode, icaoCode } = this.determineAirportCodeType(airportCode);
       
            //Call airport info api with airport code
           let airportData = await this.callAirportApi(iataCode, icaoCode);
       
           let latitude = airportData.latitude;
           let longitude = airportData.longitude;
       
            //Call the weather api using longitude, latitude and date
           let weatherForecast = await this.callWeatherForecastApi(longitude, latitude, dateOfArrival);
       
           let temperature =  weatherForecast.forecast.forecastday[0].day.avgtemp_c;
           let precipitation = weatherForecast.forecast.forecastday[0].day.totalprecip_mm;
       
           let { isCold, isRaining } = this.calculateWeatherConditions(temperature, precipitation);
       
           res.json({isRaining, isCold})
       
           }
           catch(error){
               res.json({
                   error: error.message
               })
           }

    }

    async getCurrentWeatherHandler(req, res) {
        try{
    
            let {isCold, isRaining} = await this.getCurrentWeather(req);
            res.json({isRaining, isCold})
            }
            catch {
                res.json({
                    error: "Error getting current weather conditions"
                })
            }
    }
    
    async getCurrentWeather(req){
    
        try{
    
        let geoLocationData = await this.callGeoLocationApisWithFallback(req.ip)
        //get longitude and latitude
    
        let latitude = geoLocationData.lat;
        let longitude = geoLocationData.lon;
    
        //call weather api
        let weatherData = await this.callCurrentWeatherApi(longitude, latitude);
        let temperature = weatherData.current.temp_c;
        let precipitation = weatherData.current.precip_mm;
    
        //set isCold and isRaining
        let { isCold, isRaining } = this.calculateWeatherConditions(temperature, precipitation);
        return { isCold, isRaining}
    
        }
        catch {
    
            throw new Error("Error getting current weather")
        }
    }


 determineAirportCodeType(airportCode){
    
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

 calculateWeatherConditions(temperature, precipitation){
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
 fallbackTimeout(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                data: null,
                timeoutError: true
            })
        }, duration)
    })
}

async callGeoLocationApisWithFallback(ipAdress){

    let geoLocationData = null;

    try{
        let primaryResult = 
        await Promise.race([
            this.callPrimaryIpGeolocationApi(ipAdress),
            this.fallbackTimeout(3000)
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
                let secondaryResult = await this.callSecondaryIpGeolocationApi(ipAdress);
            
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

async callPrimaryIpGeolocationApi(ipAdress){

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

async callSecondaryIpGeolocationApi(ipAdress=null){
    try {
        let apiKey = "77e0604ec1b44c408b757829fc57ce0c";
        let result;
        if(process.env.DEVELOPMENT_BUILD)
        {
            result = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`)
        }
        else{
            result = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ipAdress}`)
        }

        console.log(result.data)
        return result.data
    } catch (error) {
        return {
            error: error.message
        }
    }
    
}

async callCurrentWeatherApi(longitude, latitude){

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
          throw new Error("Error getting weather API")
      }
}

async callAirportApi(iataCode, icaoCode){

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
          console.log(response.data)
            return response.data
      } catch (error) {
          throw new Error("Error getting airport data")
      }

}

async callWeatherForecastApi(longitude, latitude, date){

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
        console.log(error)
          throw new Error("Error getting forecast weather data")
      }

}
}

module.exports = {MyAPI}


app.listen(3000, () => {
    api = new MyAPI();
    console.log('Server is running on http://localhost:3000');
  });