const { default: expect } = require("expect");
const { beforeEach } = require("node:test");
const MainMenu = require("../Pages/MainMenu");
const { stubUserInputIsNotANumber, stubUserInputMustBeANumberFromOneToThree } = require("./Stubs/Stubs_MainMenu");
const CurrentWeather = require("../Pages/CurrentWeather");
const ForecastWeather = require("../Pages/ForecastWeather");

jest.mock("../Pages/CurrentWeather")
jest.mock("../Pages/ForecastWeather")

describe("Main Menu should initialize correctly", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Main Menu page should construct with a readline object", () => {
        let mainMenu = new MainMenu();
        expect(mainMenu.rl).toBeTruthy()
    })

    test("Main Menu page should display website name", () => {
        
        const consoleSpy = jest.spyOn(console, "log")
        let mainMenu = new MainMenu();
        mainMenu.showMainMenu();

        expect(consoleSpy).toHaveBeenCalledWith("WeatherWear.com")

    })

    test("Main Menu page should display the three options", () => {

        const consoleSpy = jest.spyOn(console, "log")
        let mainMenu = new MainMenu();
        mainMenu.showMainMenu();

        expect(consoleSpy).toHaveBeenCalledWith(
`
1. Reccomend clothing for current location
2. Reccomend clothing for future location
3. Exit
`
        )

    })

    test("Website name should be underlined", () => {

        const consoleSpy = jest.spyOn(console, "log")
        let mainMenu = new MainMenu();
        mainMenu.showMainMenu();

        expect(consoleSpy).toHaveBeenCalledWith("WeatherWear.com")
        expect(consoleSpy).toHaveBeenCalledWith("_______________")

    })

})

describe("User input in main menu should be handled correctly", () => {
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Main menu should ask for user input", () => {

        let mainMenu = new MainMenu()
        let questionSpy = jest.spyOn(mainMenu.rl, "question")

        mainMenu.askForInput()
        expect(questionSpy).toBeCalledWith("Enter choice: ", expect.any(Function))
    })

    test("User input of 1 triggers call to navigateToPage with argument 1", () => {
        let mainMenu = new MainMenu();
        let questionSpy = jest.spyOn(mainMenu.rl, "question")
        let navigateToPageSpy = jest.spyOn(mainMenu, "navigateToPage")
        
        mainMenu.rl.question.mockImplementationOnce((question, callback) => {
            callback(1);
        })
 
        mainMenu.askForInput();
        expect(navigateToPageSpy).toBeCalledWith(1);
    })

    describe("User input in main menu should be validated correctly", () => {

        afterEach(() => {
            jest.clearAllMocks();
        });

        test("User must be asked for another input if there was an error", () => {

            let mainMenu = new MainMenu();
            let questionSpy = jest.spyOn(mainMenu.rl, "question")
            let consoleSpy = jest.spyOn(console, "log")
            let validationSpy = jest.spyOn(mainMenu, "validateInput")
            
            mainMenu.rl.question.mockImplementationOnce((question, callback) => {
                callback("ABCD"); //simulate incorrect user input
            })

            validationSpy.mockImplementationOnce(() => {
                stubUserInputIsNotANumber();
            });
            
            mainMenu.askForInput();
            
            expect(questionSpy).toBeCalledTimes(2);
        })

        test("Validation error message must be logged to user", () => {

            let mainMenu = new MainMenu();
            let consoleSpy = jest.spyOn(console, "log")
            let validationSpy = jest.spyOn(mainMenu, "validateInput")
            jest.spyOn(mainMenu.rl, "question")

            mainMenu.rl.question.mockImplementationOnce((question, callback) => {
                callback("ABCD"); //simulate incorrect user input
            })

            validationSpy.mockImplementationOnce(() => {
                stubUserInputIsNotANumber();
            });

            mainMenu.askForInput();
            expect(consoleSpy).toBeCalledWith("Input is not a number");
        })

        describe("Main menu input validation", () => {

            test("Validation should throw error for non-numeric input", () => {
                let mainMenu = new MainMenu();
                expect(() => {
                    mainMenu.validateInput("a")
                }).toThrow("Input is not a number");
            });
        
            test("Validation should throw error for input outside of range 1-3", () => {
                let mainMenu = new MainMenu();

                expect(() => {
                    mainMenu.validateInput("4")
                }).toThrow("Input must be between 1 and 3");
        
                expect(() => {
                    mainMenu.validateInput("0")
                }).toThrow("Input must be between 1 and 3");
            });
        
            test("Validation should accept numeric input within range 1-3", () => {
                let mainMenu = new MainMenu();
                expect(() => {
                    mainMenu.validateInput("1")
                }).not.toThrow();
        
                expect(() => {
                    mainMenu.validateInput("3")
                }).not.toThrow();
            });
        
        });
        

    })

})

describe("Page navigation in main menu should be handled correctly", () => {

    test("Input of 1 should navigate to current weather page", () => {
        let mainMenu = new MainMenu();

        mainMenu.navigateToPage(1);
        expect(CurrentWeather.mock.instances[0].initialize).toHaveBeenCalledTimes(1);
        //spy on 1st instance of CurrentWeather being created

    })
    test("Input of 2 should navigate to future weather page", () => {

        let mainMenu = new MainMenu();
        mainMenu.navigateToPage(2);

        expect(ForecastWeather.mock.instances[0].initialize).toHaveBeenCalledTimes(1)

    })
    test("Input of 3 should exit the program", () => {
        let processSpy = jest.spyOn(process, "exit")
                        .mockImplementationOnce(() => {}); //overwrite closing the process so tests won't end

        let mainMenu = new MainMenu();
        mainMenu.navigateToPage(3);

        expect(processSpy).toHaveBeenCalledTimes(1);
    })

})