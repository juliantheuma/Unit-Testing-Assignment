const ForecastWeather = require("../Pages/ForecastWeather");
jest.mock("../Pages/ForecastWeather");

describe("validation should be done well", () => {

    test("Airport code validation",()=>{
        let forecastWeather = new ForecastWeather();

        expect(() => {
            forecastWeather.validateAirportCode("ABC");
            forecastWeather.validateAirportCode("ABCD");
        }).not.toThrow()
        expect(() => {
            forecastWeather.validateAirportCode("   IIUHWEIUFHIUWEHF")
        }).toThrow()
    })

    // test("Date validation should be correct", () => {
    //     let forecastWeather = new ForecastWeather();
    //     expect(() => {
    //         forecastWeather.validateDateInput("9999")
    //     }).toThrow();

    //     expect(() => {
    //         forecastWeather.validateDateInput("2024-27-05")
    //     }).toThrow()

    //     expect(() => {
    //         forecastWeather.validateDateInput("0000-27-05")
    //     }).toThrow()

    //     expect(() => {
    //         forecastWeather.validateDateInput("9999")
    //     }).toThrow()
    // })


})

// describe("Data should be requested from the user", () => {

//     test("User should be questioned for Airport code", () => {
//         let forecastWeather = new ForecastWeather();
//         let questionSpy = jest.spyOn(forecastWeather.rl, "question");
        
//         forecastWeather.askForAirportCode()
//         expect(questionSpy).toHaveBeenCalledWith("Enter the Airport ICAO Code: ", expect.any(Function))
        
//     })
// })