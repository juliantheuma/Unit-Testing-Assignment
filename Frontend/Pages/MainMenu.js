const readliine = require("readline");
const CurrentWeather = require("./CurrentWeather");
const ForecastWeather = require("./ForecastWeather");

class MainMenu {

    constructor(){
        this.rl = readliine.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    }

    initialize(){
        this.showMainMenu();
        this.askForInput();
    }

    showMainMenu(){
        console.log("WeatherWear.com")
        console.log("_______________")
        console.log(
`
1. Reccomend clothing for current location
2. Reccomend clothing for future location
3. Exit
`

        )
    }

    askForInput(){
        this.rl.question("Enter choice: ", (choice) => {
            try{
                this.validateInput(choice);
                this.rl.close();
                this.navigateToPage(choice)
            }
            catch (error) {
                console.clear();
                this.showMainMenu();
                console.log(error.message);
                this.askForInput();
            }
        })
    }

    validateInput(userInput) {

        let parsedInput = parseInt(userInput)
        if(isNaN(parseInt(parsedInput))) {
            throw new Error("Input is not a number")
        }
        else if(parsedInput < 1 || parsedInput > 3) {
            throw new Error("Input must be between 1 and 3")
        }
    }

    navigateToPage(pageId){
        pageId = parseInt(pageId);

        if(pageId === 1) {
            let currentWeather = new CurrentWeather();
            currentWeather.initialize();
        }
        else if(pageId === 2) {
            let forecastWeather = new ForecastWeather();
            forecastWeather.initialize();
        }
        else if(pageId === 3) {
            process.exit();
        }
    }

}

module.exports = MainMenu