const readline = require("readline");
const axios = require("axios");
const { stub_airport_code_response_valid } = require("../Tests/Stubs/Stubs_ForecastWeather");

class ForecastWeather {

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    }

    async initialize() {
        try{
            
        console.clear()
        let airportCode = await this.requestAndValidateAirportCode();
        let date = await this.requestAndValidateDate();

        console.clear()
        console.log("Collecting weather data...")
        let weatherData = await this.getWeatherData(airportCode, date);
        this.displayWeatherData(weatherData, date)

    }
    catch (error){
            await this.initializeWithRetry();
    }
    }

    async initializeWithRetry() {
        setTimeout(() => {
            this.initialize();
        }, 1000);
    }

    displayWeatherData(weatherData, date){
        console.clear()
        console.log(`\nOn the ${date},`)

        if(weatherData.isCold){
            console.log("It is cold so you should wear warm clothing.")
        }
        else {
            console.log("It is warm so you should wear light clothing.")
        }

        if(weatherData.isRaining){
            console.log("It is raining so you do need an umbrella.")
        }
        else{
            console.log("It is not raining so you don't need an umbrella.")
        }
    }

    async requestAndValidateAirportCode(){
        let airportCode = await this.askForAirportCode();
        try {
            this.validateAirportCode(airportCode);
            return airportCode;
        } catch (error) {
            console.log(error.message);

            return await this.requestAndValidateAirportCode();
        }
    }

    async requestAndValidateDate(){
        let date = await this.askForDate();
        console.log(date)
        try {
            this.validateDateInput(date);
            return date
        } catch (error) {
            console.log(error.message);

            return await this.requestAndValidateDate();
        }
    }

    async askForAirportCode(){
        return new Promise((resolve, reject) => {

        this.rl.question("Enter your destination airport code: ", (answer) => {
            resolve(answer)
        })

    })

    }

    async askForDate(){
        return new Promise((resolve, reject) => {

            this.rl.question("Enter your Date of Arrival (2024-05-27): ", (answer) => {
                resolve(answer)
            })

        })
    }

    validateAirportCode(airportAnswer){
  
        const regex = /^[A-Za-z]{3,4}$/; //Only letters, and 3-4 characters long
        let validated =  regex.test(airportAnswer);
        if(!validated || !airportAnswer){
            throw new Error("Airport code is invalid");
        }
    }

    validateDateInput(date) {
        console.log(date)

        if(!date){
            throw new Error("Date is not valid")
        }
        const regex = /^\d{4}-\d{2}-\d{2}$/; 
        if (!regex.test(date)) {
            console.log("Regex failed")
            throw new Error("Date must be in the format of YYYY-MM-DD");
        }
    
        const [year, month, day] = date.split('-').map(Number);
    
        if (year <= 0 || month <= 0 || month > 12 || day <= 0 || day > 31) {
            throw new Error("Date is not valid");
        }
    
        let parsedDate = new Date(year, month - 1, day);
        if (parsedDate.getFullYear() !== year || parsedDate.getMonth() !== month - 1 || parsedDate.getDate() !== day) {
            throw new Error("Date is not valid");
        }
    }

    async getWeatherData(airportCode, date){

        try{

            let result = await axios.get(`http://localhost:3000/weather/forecast?airportCode=${airportCode}&dateOfArrival=${date}`)
            if(result.data && 
                (result.data.isCold !== null && result.data.isCold !== undefined)
                && (result.data.isRaining !== null && result.data.isRaining !== undefined)){

            return result.data

            }

            else {
                throw new Error("Error collecting weather data")
            }
        }
    catch
        {
            throw new Error("Error collecting weather data")   
        }
    }

}

module.exports = ForecastWeather