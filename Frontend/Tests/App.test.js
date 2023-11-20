const MainMenu = require("../Pages/MainMenu");
const  startApp  = require("../app");
const { default: expect } = require("expect")
describe("App should initialize correctly", () => {

    
    test("App must clear the console on start", () => {
        
        let consoleSpy = jest.spyOn(console, "clear");
        startApp();
        
        expect(consoleSpy).toHaveBeenCalledTimes(1)
        
    })



    })