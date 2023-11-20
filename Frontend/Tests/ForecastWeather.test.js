const { default: expect } = require("expect");
const ForecastWeather = require("../Pages/ForecastWeather");
const mockAxios = require("axios")

jest.mock("axios")


describe("Forecast weather must be functional", () => {
    let forecastWeather;

    beforeEach(() => {
        forecastWeather = new ForecastWeather();
    })
    describe("Date validation must be correct", () => {
        test("Months greater than 12 should be rejected", () => {
            
            expect(() => {
            forecastWeather.validateDateInput("2023-13-25");
        }).toThrow()
    
        })
    
        test("Dates greater than 31 should be rejected", () => {
            
            expect(() => {
            forecastWeather.validateDateInput("2023-12-32");
        }).toThrow()
    
        })
    
        test("Dates not in yyyy-mm-dd format must be rejected", () => {
            expect(() => {
            forecastWeather.validateDateInput("2023/12/32");
        }).toThrow()
    
        expect(() => {
        forecastWeather.validateDateInput("2023");
    }).toThrow()
        })

        test("Incorrect leap year dates must be rejected", () => {
            expect(() => {
                forecastWeather.validateDateInput("2023-02-29");
            }).toThrow();

            expect(() => {
                forecastWeather.validateDateInput("2024-02-29");
            }).not.toThrow();
        })

        test("Months less than 1 shall be rejected", () => {
            expect(() => {
                forecastWeather.validateDateInput("2023-00-15");
            }).toThrow();
        })

        test("Days less than 1 shall be rejected", () => {
            expect(() => {
                forecastWeather.validateDateInput("2023-05-00");
            }).toThrow();
        })

        test("A month without 31 days must be rejected if 31 days is inputted", () => {
            expect(() => {
                forecastWeather.validateDateInput("2023-04-31");
            }).toThrow();

            expect(() => {
                forecastWeather.validateDateInput("2023-06-31");
            }).toThrow();
        })

        test("Empty dates should be rejected", () => {
            expect(() => {
                forecastWeather.validateDateInput("");
            }).toThrow();

            expect(() => {
                forecastWeather.validateDateInput(null);
            }).toThrow();
        })
    
    })
    
    describe("Airport code validation must be correct", () => {
        
        test("Airport codes less than 3 characters must be rejected", () => {
            expect(() => {
                forecastWeather.validateAirportCode("AA")
            }).toThrow();
        })

        test("Airport codes longer than 4 characters must be rejected", () => {
            expect(() => {
                forecastWeather.validateAirportCode("AA")
            }).toThrow();
        })

        test("Airport codes with non numeric characters must be rejected", () => {
            expect(() => {
                forecastWeather.validateAirportCode("AA9")
            }).toThrow();

            expect(() => {
                forecastWeather.validateAirportCode("AAA9")
            }).toThrow()
        })

        test("Airport codes with spaces must be rejected", () => {
            expect(() => {
                forecastWeather.validateAirportCode("M L T")
            }).toThrow();
        })

        test("Empty airport codes must be rejected", () => {

            expect(() => {
                forecastWeather.validateAirportCode("")
            }).toThrow();

            expect(() => {
                forecastWeather.validateAirportCode(null)
            }).toThrow();

        })
    })

    describe("getWeatherData must return the correct data returned from the api", () => {
        test("Data in the expected format should be returned as is", async () => {
            

            mockAxios.get.mockImplementation(() => Promise.resolve(
                {
                    data: {
                        isCold: true,
                        isRaining: true
                    }
                }
            )
            )
            let data = await forecastWeather.getWeatherData("MLT", "2023-11-23")
            expect(data).toEqual({
                isCold: true,
                isRaining: true
            })

            mockAxios.get.mockImplementation(() => Promise.resolve(
                {
                    data: {
                        isCold: false,
                        isRaining: false
                    }
                }
            )
            )
            let data2 = await forecastWeather.getWeatherData("MLT", "2023-11-23")
            expect(data2).toEqual({
                isCold: false,
                isRaining: false
            })
        })

        test("If there is an error in the api call, it must throw an error", async () => {
            
                mockAxios.get.mockImplementation(() => {
                    return Promise.reject(new Error("Host not found"));
                }
                )
    
                await expect(forecastWeather.getWeatherData("MLT", "2023-11-23"))
                .rejects.toThrow("Error collecting weather data");

        })

        test("If the api returns missing data, it must throw an error", async () => {
            mockAxios.get.mockImplementation(() => {
                return Promise.resolve({data: {
                    isCold: true
                    //missing isRaining
                }});
            }
            )

            await expect(forecastWeather.getWeatherData("MLT", "2023-11-23"))
                .rejects.toThrow("Error collecting weather data");
        })

        test("If the api doesn't return a data object, it must throw an error", async() => {

            mockAxios.get.mockImplementation(() => {
                return Promise.resolve({});
            }
            )

            await expect(forecastWeather.getWeatherData("MLT", "2023-11-23"))
                .rejects.toThrow("Error collecting weather data");

        })
    })

    describe("User must be asked for the correct data", () => {

        test("User should be asked for an arrival date using readline question", () => {
            let questionSpy = jest.spyOn(forecastWeather.rl , "question");
            forecastWeather.askForDate();

            expect(questionSpy).toHaveBeenCalledWith("Enter your Date of Arrival (2024-05-27): ", expect.any(Function))
        })

        test("User should be asked for an airport code using readline question", () => {
            let questionSpy2 = jest.spyOn(forecastWeather.rl , "question");
            forecastWeather.askForAirportCode();

            expect(questionSpy2).toHaveBeenCalledWith("Enter your destination airport code: ", expect.any(Function))
        })

        test("askForAirportCode should return the value from the user correctly", async () => {
            
            jest.spyOn(forecastWeather.rl, "question")
            
            forecastWeather.rl.question.mockImplementationOnce((question, callback) => {
                callback("MLT");
            })
    
            await expect(forecastWeather.askForAirportCode()).resolves.toEqual("MLT");

        })

        test("askForDate should return the value from the user correctly", async () => {
            jest.spyOn(forecastWeather.rl, "question")
            
            forecastWeather.rl.question.mockImplementationOnce((question, callback) => {
                callback("2023-11-25");
            })
    
            await expect(forecastWeather.askForDate()).resolves.toEqual("2023-11-25");
        })
    })

    describe("User input validation flow must be correct", () => {

        describe("Airport code validation flow", () => {
            test("User must be only prompted for airport code once, if it passes validation", async () => {
                jest.spyOn(forecastWeather, "askForAirportCode");
                jest.spyOn(forecastWeather, "validateAirportCode");
                let ravSpy = jest.spyOn(forecastWeather, "requestAndValidateAirportCode")
                forecastWeather.askForAirportCode.mockImplementation(() => {
                    return Promise.resolve("MLT")
                })
                forecastWeather.validateAirportCode.mockImplementation(() => {})
    
                await forecastWeather.requestAndValidateAirportCode();
                expect(ravSpy).toHaveBeenCalledTimes(1)
            })
    
            test("User must be only prompted for airport code twice, if it fails validation once", async () => {
                jest.spyOn(forecastWeather, "askForAirportCode");
                jest.spyOn(forecastWeather, "validateAirportCode");
                let ravSpy = jest.spyOn(forecastWeather, "requestAndValidateAirportCode")
                forecastWeather.askForAirportCode.mockImplementation(() => {
                    return Promise.resolve("MLT");
                })
                forecastWeather.validateAirportCode.mockImplementationOnce(() => {
                    throw new Error("Invalid Airport Code")
                })
    
                await forecastWeather.requestAndValidateAirportCode();
    
                expect(ravSpy).toHaveBeenCalledTimes(2)
            })
    
            test("User must be only prompted for airport code three times, if it fails validation twice", async () => {
                jest.spyOn(forecastWeather, "askForAirportCode");
                jest.spyOn(forecastWeather, "validateAirportCode");
                let ravSpy = jest.spyOn(forecastWeather, "requestAndValidateAirportCode")
    
                forecastWeather.askForAirportCode.mockImplementation(() => {
                    return Promise.resolve("MLT");
                })
                forecastWeather.validateAirportCode.mockImplementationOnce(() => {
                    throw new Error("Invalid Airport Code")
                })
                forecastWeather.validateAirportCode.mockImplementationOnce(() => {
                    throw new Error("Invalid Airport Code")
                })
                forecastWeather.validateAirportCode.mockImplementationOnce(() => {})
    
                await forecastWeather.requestAndValidateAirportCode();
    
                expect(ravSpy).toHaveBeenCalledTimes(3)
            })
        })
        
        describe("Date validation flow", () => {
            test("User must be only prompted for date once, if it passes validation", async() => {
                jest.spyOn(forecastWeather, "askForAirportCode");
                jest.spyOn(forecastWeather, "validateAirportCode");
                jest.spyOn(forecastWeather, "askForDate");
                jest.spyOn(forecastWeather, "validateDateInput");

                let ravSpy = jest.spyOn(forecastWeather, "requestAndValidateDate")

                forecastWeather.askForAirportCode.mockImplementation(() => {
                    return Promise.resolve("MLT")
                })
                forecastWeather.validateAirportCode.mockImplementation(() => {})
                forecastWeather.askForDate.mockImplementation(() => {
                    return Promise.resolve("2023-11-25")
                })
                forecastWeather.validateDateInput.mockImplementation(() => {})
    
                await forecastWeather.requestAndValidateDate();
                expect(ravSpy).toHaveBeenCalledTimes(1)
            })

            test("User must be only prompted for date twice, if it fails validation once", async() => {
                jest.spyOn(forecastWeather, "askForAirportCode");
                jest.spyOn(forecastWeather, "validateAirportCode");
                jest.spyOn(forecastWeather, "askForDate");
                jest.spyOn(forecastWeather, "validateDateInput");

                let ravSpy = jest.spyOn(forecastWeather, "requestAndValidateDate")

                forecastWeather.askForAirportCode.mockImplementation(() => {
                    return Promise.resolve("MLT")
                })
                forecastWeather.validateAirportCode.mockImplementation(() => {})
                forecastWeather.askForDate.mockImplementation(() => {
                    return Promise.resolve("2023-11-25")
                })

                forecastWeather.validateDateInput.mockImplementationOnce(() => {
                    throw new Error("Invalid Date")
                })
    
                await forecastWeather.requestAndValidateDate();
                expect(ravSpy).toHaveBeenCalledTimes(2)
            })

            test("User must be only prompted for date three times, if it fails validation twice", async() => {
                jest.spyOn(forecastWeather, "askForAirportCode");
                jest.spyOn(forecastWeather, "validateAirportCode");
                jest.spyOn(forecastWeather, "askForDate");
                jest.spyOn(forecastWeather, "validateDateInput");

                let ravSpy = jest.spyOn(forecastWeather, "requestAndValidateDate")

                forecastWeather.askForAirportCode.mockImplementation(() => {
                    return Promise.resolve("MLT")
                })
                forecastWeather.validateAirportCode.mockImplementation(() => {})
                forecastWeather.askForDate.mockImplementation(() => {
                    return Promise.resolve("2023-11-25")
                })

                //simulate validation failing twice
                forecastWeather.validateDateInput.mockImplementationOnce(() => {
                    throw new Error("Invalid Date")
                })
                forecastWeather.validateDateInput.mockImplementationOnce(() => {
                    throw new Error("Invalid Date")
                })
    
                await forecastWeather.requestAndValidateDate();
                expect(ravSpy).toHaveBeenCalledTimes(3)
            })

        })

    })

    describe("Weather data must be displayed correctly", () => {
        test("If it is raining and cold, data must be displayed correctly", () => {
            
            let consoleSpy = jest.spyOn(console, "log")
            forecastWeather.displayWeatherData({
                isCold: true,
                isRaining: true
            }, "2023-11-25")

            expect(consoleSpy).toHaveBeenCalledWith("It is cold so you should wear warm clothing.")
            expect(consoleSpy).toHaveBeenCalledWith("It is raining so you do need an umbrella.")

        })

        test("If it is not raining and cold, data must be displayed correctly", () => {
            
            let consoleSpy = jest.spyOn(console, "log")
            forecastWeather.displayWeatherData({
                isCold: true,
                isRaining: false
            }, "2023-11-25")

            expect(consoleSpy).toHaveBeenCalledWith("It is cold so you should wear warm clothing.")
            expect(consoleSpy).toHaveBeenCalledWith("It is not raining so you don't need an umbrella.")

        })

        test("If it is not raining and not cold, data must be displayed correctly", () => {
            
            let consoleSpy = jest.spyOn(console, "log")
            forecastWeather.displayWeatherData({
                isCold: false,
                isRaining: false
            }, "2023-11-25")

            expect(consoleSpy).toHaveBeenCalledWith("It is warm so you should wear light clothing.")
            expect(consoleSpy).toHaveBeenCalledWith("It is not raining so you don't need an umbrella.")

        })

        test("If it is not raining and cold, data must be displayed correctly", () => {
            
            let consoleSpy = jest.spyOn(console, "log")
            forecastWeather.displayWeatherData({
                isCold: false,
                isRaining: false
            }, "2023-11-25")

            expect(consoleSpy).toHaveBeenCalledWith("It is cold so you should wear warm clothing.")
            expect(consoleSpy).toHaveBeenCalledWith("It is not raining so you don't need an umbrella.")

        })

        test("Console should be cleared before displaying data", () => {
            let consoleSpy = jest.spyOn(console, "clear")
            forecastWeather.displayWeatherData({
                isCold: false,
                isRaining: false
            }, "2023-11-25")

            expect(consoleSpy).toHaveBeenCalled()
        })

        test("Date should be displayed correctly", () => {
            let consoleSpy = jest.spyOn(console, "log")
            forecastWeather.displayWeatherData({
                isCold: false,
                isRaining: false
            }, "2023-11-25")

            expect(consoleSpy).toHaveBeenCalledWith("\nOn the 2023-11-25,")
        })

    })
})

describe("forecast weather should initialize correctly", () => {
    let forecastWeather;
    beforeEach(() => {
        forecastWeather = new ForecastWeather();
    })
    test("Initialization should clear the console", async () => {
        let consoleSpy = jest.spyOn(console, "log")

        let requestAndValidateAirportCodeSpy = jest.spyOn(forecastWeather, "requestAndValidateAirportCode")
        requestAndValidateAirportCodeSpy.mockResolvedValue("MLT")

        let requestAndValidateDateSpy = jest.spyOn(forecastWeather, "requestAndValidateDate");
        requestAndValidateDateSpy.mockResolvedValue("2023-11-25")

        let getWeatherDataSpy = jest.spyOn(forecastWeather, "getWeatherData");
        getWeatherDataSpy.mockResolvedValue({isCold: true, isRaining: true})



        await forecastWeather.initialize();

        expect(consoleSpy).toHaveBeenCalled();

    })

    test("Initialization should display correct clothing suggestions", async () => {

        let requestAndValidateAirportCodeSpy = jest.spyOn(forecastWeather, "requestAndValidateAirportCode")
        requestAndValidateAirportCodeSpy.mockResolvedValue("MLT")

        let requestAndValidateDateSpy = jest.spyOn(forecastWeather, "requestAndValidateDate");
        requestAndValidateDateSpy.mockResolvedValue("2023-11-25")

        let getWeatherDataSpy = jest.spyOn(forecastWeather, "getWeatherData");
        getWeatherDataSpy.mockResolvedValue({isCold: true, isRaining: true})

        let displayWeatherDataSpy = jest.spyOn(forecastWeather, "displayWeatherData");

        await forecastWeather.initialize();

        expect(displayWeatherDataSpy).toHaveBeenCalledWith({isCold: true, isRaining: true}, "2023-11-25");

    })

    test("Error in initialisation should call initialisation again after 1 second", async () => {
        
        const requestAndValidateAirportCodeSpy = jest.spyOn(forecastWeather, "requestAndValidateAirportCode")
            .mockResolvedValue("MLT");
        const requestAndValidateDateSpy = jest.spyOn(forecastWeather, "requestAndValidateDate")
            .mockRejectedValue(new Error("Error collecting date"));
        const getWeatherDataSpy = jest.spyOn(forecastWeather, "getWeatherData")
            .mockResolvedValue({isCold: true, isRaining: true});
        
        const initializeSpy = jest.spyOn(forecastWeather, "initialize");
        initializeSpy.mockClear();
    
        const initializeWithRetrySpy = jest.spyOn(forecastWeather, "initializeWithRetry")

        await forecastWeather.initialize();
    
        expect(initializeWithRetrySpy).toHaveBeenCalled();
    });

    test("Retry initialisation must call initialise after 1 second", () => {
        jest.useFakeTimers();
        
        const initializeSpy = jest.spyOn(forecastWeather, 'initialize');
        forecastWeather.initializeWithRetry();

        jest.advanceTimersByTime(1000);

        expect(initializeSpy).toHaveBeenCalledTimes(1);
    })
})