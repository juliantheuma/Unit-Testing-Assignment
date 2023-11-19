const CurrentWeather = require("../Pages/CurrentWeather");
const mockAxios = require("axios");
const { stub_always_cold_and_not_rainy, stub_always_cold_and_rainy, stub_not_cold_and_always_rainy } = require("./Stubs/Stubs_CurrentWeather");

jest.mock("axios")

describe("Current Weather Page should initialize correctly", () => {

    let currentWeather = null;
    beforeEach(() => {
        currentWeather = new CurrentWeather();
    })

    test("It should display a loading message", () => {
        const consoleSpy = jest.spyOn(console, "log");
        currentWeather.initialize();

        expect(consoleSpy).toHaveBeenCalledWith("Collecting weather data...");
    })

    test("It should call the current weather api", () => {
        let cwspy = jest.spyOn(currentWeather, "getCurrentWeather").mockImplementation(stub_always_cold_and_not_rainy)
        currentWeather.initialize();

        expect(cwspy).toHaveBeenCalled()
    })

    test("It should call the display message function", async () => {
        jest.spyOn(currentWeather, "getCurrentWeather").mockImplementation(stub_always_cold_and_not_rainy)
        let cwspy = jest.spyOn(currentWeather, "displayClothingSuggestions")
        await currentWeather.initialize();

        expect(cwspy).toHaveBeenCalled()
    })

})

describe("Clothing suggestions must be correct", () => {

    let currentWeather = null;
    beforeEach(() => {
        currentWeather = new CurrentWeather();
    })

    test("It should display 'It is cold so you should wear warm clothing.' when it is cold", ()=>{
        let weatherData = stub_always_cold_and_rainy();
        const consoleSpy = jest.spyOn(console, "log");

        currentWeather.displayClothingSuggestions(weatherData)
        expect(consoleSpy).toHaveBeenCalledWith("It is cold so you should wear warm clothing.");

    })
    
    test("It should display 'It is warm so you should wear light clothing.' when it is warm", () => {
        let weatherData = stub_not_cold_and_always_rainy();
        const consoleSpy = jest.spyOn(console, "log");

        currentWeather.displayClothingSuggestions(weatherData)
        expect(consoleSpy).toHaveBeenCalledWith("It is warm so you should wear light clothing.");

    })
    
    test("It should display 'It is currently raining so you do need an umbrella.' when it is raining", () => {
        let weatherData = stub_always_cold_and_rainy();
        const consoleSpy = jest.spyOn(console, "log");

        currentWeather.displayClothingSuggestions(weatherData)
        expect(consoleSpy).toHaveBeenCalledWith("It is currently raining so you do need an umbrella.");
    })


    test("It should display 'It is not raining so you don't need an umbrella.' when it is not raining", () => {
        let weatherData = stub_always_cold_and_rainy();
        const consoleSpy = jest.spyOn(console, "log");

        currentWeather.displayClothingSuggestions(weatherData)
        expect(consoleSpy).toHaveBeenCalledWith("It is not raining so you don't need an umbrella.");
    })

})