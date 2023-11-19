const { default: axios } = require("axios")

class CurrentWeather {

    constructor(){

    }

    async initialize(){
        console.log("Collecting weather data...")
        let weatherData = await this.getCurrentWeather();
        
        console.clear()
        this.displayClothingSuggestions(weatherData);
    }

    async getCurrentWeather(){
        try {            
            let res = await axios.get("http://localhost:3000/weather/current");
            return res.data
        } catch (error) {
            return null
        }
    }

    displayClothingSuggestions(weatherData) {

        try{
        
        if(weatherData.isCold){
            console.log("It is cold so you should wear warm clothing.")
        }
        else{
            console.log("It is warm so you should wear light clothing.")
        }

        if(weatherData.isRaining){
            console.log("It is currently raining so you do need an umbrella.")
        }
        else {
            console.log("It is not raining so you don't need an umbrella.")
        }

    }
    catch {
        console.log("Sorry, something went wrong...")

    }
    }

}

module.exports = CurrentWeather