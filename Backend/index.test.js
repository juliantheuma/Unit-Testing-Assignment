

const axios = require('axios');
jest.mock('axios');

const API = require("./index")

let _api = new API.MyAPI();

const { stub_primary_ip_api_success } = require("./Stubs/Stubs_PrimaryIpApi")


describe('API Calls', () => {

    let api;

    beforeEach(() => {
        api = new API.MyAPI();
    })

    describe('callPrimaryIpGeolocationApi', () => {
        test('should return geolocation data for a valid IP address', async () => {
            const mockData = { lat: 10, lon: 20 };
            axios.get.mockResolvedValue({ data: mockData });

            const result = await api.callPrimaryIpGeolocationApi('8.8.8.8');
            expect(result).toEqual(mockData);
        });

        test("Should return an error object if there is an error", async () => {

            axios.get.mockRejectedValue("Network error")

                let data = await api.callPrimaryIpGeolocationApi("8.8.8.8");
                expect(data).toHaveProperty("error")

        })

    });

    describe('callSecondaryIpGeolocationApi', () => {
        test('should return geolocation data for a valid API call', async () => {
            const mockData = { lat: 40, lon: -74 }; // Mock geolocation data
            axios.get.mockResolvedValue({ data: mockData });
    
            const result = await api.callSecondaryIpGeolocationApi('8.8.4.4');
            expect(result).toEqual(mockData);
        });
    
        test('should return an error object when the API call fails', async () => {
            const errorMessage = 'Network Error';
            axios.get.mockRejectedValue({ message: errorMessage });
    
            const result = await api.callSecondaryIpGeolocationApi('8.8.4.4');
            expect(result).toEqual({ error: errorMessage });
        });

    });
    

    describe('callWeatherForecastApi', () => {
        const mockLongitude = 123.45;
        const mockLatitude = 67.89;
        const mockDate = '2023-11-19';
    
        test('should return weather forecast data for given longitude, latitude, and date', async () => {
            const mockForecastData = {
                forecast: {
                    forecastday: [{
                        day: {
                            avgtemp_c: 20,
                            totalprecip_mm: 5
                        }
                    }]
                }
            };
            axios.request.mockResolvedValue({ data: mockForecastData });
    
            const result = await api.callWeatherForecastApi(mockLongitude, mockLatitude, mockDate);
            expect(result).toEqual(mockForecastData);
        });
    
        test('should handle API errors gracefully', async () => {
            axios.request.mockRejectedValue(new Error('API Error'));
    
            await expect(api.callWeatherForecastApi(mockLongitude, mockLatitude, mockDate))
                .rejects.toThrow();
        });
    });
    

    describe('callAirportApi', () => {
        const mockIataCode = 'MLT';
        const mockIcaoCode = 'KLAX';
    
        test('should return airport data for a given IATA code', async () => {
            const mockAirportData = { name: 'Malta International Airport', iata: 'MLT'};
            axios.request.mockResolvedValue({ data: mockAirportData });
    
            const result = await api.callAirportApi(mockIataCode, null);
            expect(result).toEqual(mockAirportData);
        });
    
        test('should return airport data for a given ICAO code', async () => {
            axios.request.mockResolvedValue({ data: { name: 'Los Angeles International Airport', icao: 'KLAX' }});
    
            const result = await api.callAirportApi(null, mockIcaoCode);
            expect(result).toHaveProperty('icao', 'KLAX');
        });
    
        test('should handle API errors gracefully', async () => {
            axios.request.mockRejectedValue(new Error('API Error'));
    
            await expect(api.callAirportApi(mockIataCode, null)).rejects.toThrow();
        });
    
    });

    describe('callCurrentWeatherApi', () => {
        const mockLatitude = 34.05; // Example latitude
        const mockLongitude = -118.25; // Example longitude
    
        test('callCurrentWeatherApi should return temperature and precipitation data for given longitude and latitude', async () => {
            const mockWeatherData = {
                current: {
                    temp_c: 22,
                    precip_mm: 0
                }
            };
            axios.request.mockResolvedValue({ data: mockWeatherData });
    
            const result = await api.callCurrentWeatherApi(mockLongitude, mockLatitude);
            expect(result).toEqual(mockWeatherData);
        });

        test("Should throw an exception if there was an error getting weather data", async () => {
            axios.request.mockRejectedValue( new Error("Netowrk error"));
            
            expect(async () => {
                await api.callCurrentWeatherApi(mockLongitude, mockLatitude);

            }).rejects.toThrow()
        })
    
    });
    
});

    describe('calculateWeatherConditions', () => {
        test('should correctly determine weather conditions', () => {
            let api = new API.MyAPI();
            expect(api.calculateWeatherConditions(10, 0)).toEqual({ isCold: true, isRaining: false });
            expect(api.calculateWeatherConditions(20, 10)).toEqual({ isCold: false, isRaining: true });
        }); 
    });

    describe('determineAirportCodeType', () => {
        let api;
        beforeEach(() => {
            api = new API.MyAPI();

        })
        test('should correctly identify IATA and ICAO codes', () => {
            expect(api.determineAirportCodeType('JFK')).toEqual({ iataCode: 'JFK', icaoCode: null });
            expect(api.determineAirportCodeType('KJFK')).toEqual({ iataCode: null, icaoCode: 'KJFK' });
            
        });

        test("Should throw on invalid input", () => {
            expect(() => {
                api.determineAirportCodeType("23")
            }).toThrow()

            expect(() => {
                api.determineAirportCodeType("ABCDE")
            }).toThrow()
        })
    });

describe('fallback Timeout should be functional', () => {
    jest.useFakeTimers();

    test('should resolve after specified duration', async () => {
        let api = new API.MyAPI();

        const promise = api.fallbackTimeout(1000);
        jest.advanceTimersByTime(1000);
        await expect(promise).resolves.toEqual({ data: null, timeoutError: true });
    });
});

describe("callGeoLocationApisWithFallback", () => {

    let api;

    beforeEach(() => {

        api = new API.MyAPI();

    })
test("if primary api suceeds before timer, its data should be returned", async () => {

    let callPrimaryIpApiSpy = jest.spyOn(api, "callPrimaryIpGeolocationApi");

    callPrimaryIpApiSpy.mockImplementation(() => Promise.resolve({
        status: 'success',
        country: 'Malta',
        countryCode: 'MT',
        region: '05',
        regionName: 'Birzebbuga',
        city: 'Birżebbuġa',
        zip: 'BBG',
        lat: 35.8246,
        lon: 14.5309,
        timezone: 'Europe/Malta',
        isp: 'Datastream Ltd.',
        org: '',
        as: 'AS15735 GO p.l.c.',
        query: '85.232.194.82'
      }))


    let data = await api.callGeoLocationApisWithFallback("8.8.8.8");

    expect(data).toHaveProperty("lat");
    expect(data).toHaveProperty("lon");
})

test("if primary api takes longer than 3 seconds, the second api should be called", async () => {
    jest.useFakeTimers();
    
    let callPrimaryIpApiSpy = jest.spyOn(api, "callPrimaryIpGeolocationApi");

    callPrimaryIpApiSpy.mockImplementation(() => 
    new Promise((resolve) => setTimeout(() => resolve({
        country: 'Primary',
      }), 10000)))

    let callSecondaryIpApiSpy = jest.spyOn(api, "callSecondaryIpGeolocationApi");
    callSecondaryIpApiSpy.mockResolvedValue({data: {
        country: 'Secondary',
      }})


    let apiPromise = api.callGeoLocationApisWithFallback("8.8.8.8");
    jest.advanceTimersByTime(3000);
    let result = await apiPromise;

    expect(callSecondaryIpApiSpy).toHaveBeenCalledTimes(1);
    expect(result.country).toEqual("Secondary");
})

test("if primary api fails, the secondary api should be called", async () => {
    let callPrimaryIpApiSpy = jest.spyOn(api, "callPrimaryIpGeolocationApi");

    callPrimaryIpApiSpy.mockRejectedValue("Error fetching primary Api")

    let callSecondaryIpApiSpy = jest.spyOn(api, "callSecondaryIpGeolocationApi");
    callSecondaryIpApiSpy.mockResolvedValue({data: {
        country: 'Secondary',
      }})

    await api.callGeoLocationApisWithFallback("8.8.8.8");

    expect(callSecondaryIpApiSpy).toHaveBeenCalledTimes(1)

})

test("It should throw an error if secondary api fails", async () => {

    let callPrimaryIpApiSpy = jest.spyOn(api, "callPrimaryIpGeolocationApi");

    callPrimaryIpApiSpy.mockRejectedValue("Error fetching primary Api")

    let callSecondaryIpApiSpy = jest.spyOn(api, "callSecondaryIpGeolocationApi");
    callSecondaryIpApiSpy.mockRejectedValue("Error in second api call")

    expect(async () => {
        await api.callGeoLocationApisWithFallback("8.8.8.8");

    }).rejects.toThrow();

})



})


describe("Get Forecast should be functional", () => {

    let api;

    beforeEach(() => {
        api = new API.MyAPI();
    })

    test("Get forecast should return weather conditions", async () => {

        const mockReq = {
            query: {
                airportCode: 'ABC',
                dateOfArrival: '2023-11-20'
            }
        };

        const mockRes = { json: jest.fn() };

        let determineCodeTypeSpy = jest.spyOn(api, "determineAirportCodeType");
        determineCodeTypeSpy.mockReturnValue({ iataCode: "ABC", icaoCode: null})

        let callAirportApiSpy = jest.spyOn(api, "callAirportApi");
        callAirportApiSpy.mockResolvedValue({latitude: 35, longitude: 139});

        let callWeatherForecastApiSpy = jest.spyOn(api , "callWeatherForecastApi");
        callWeatherForecastApiSpy.mockResolvedValue({
            forecast: {
                forecastday: [{
                    day: {
                        avgtemp_c: 22,
                        totalprecip_mm: 0
                    }
                }]
            }
        })

        let calculateWeatherConditionsSpy = jest.spyOn(api, "calculateWeatherConditions");
        calculateWeatherConditionsSpy.mockImplementation(() => {
            return { isCold: false, isRaining: false}
        })

        await api.getForecast(mockReq, mockRes);

        expect(mockRes.json).toHaveBeenCalledWith({isRaining: false, isCold: false})
    })

    test("Any exception should be caught, and an error must be thrown", async () => {
        const mockReq = {
            query: {
                airportCode: 'XYZ', // This could be any value
                dateOfArrival: '2023-11-21' // This could be any value
            }
        };
        const mockRes = { json: jest.fn() };
    
        jest.spyOn(api, "callAirportApi").mockRejectedValue(new Error("API Error"));
    
        await api.getForecast(mockReq, mockRes);
    
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
    });
    

})

describe("Get current weather should be functional", () => {
    let api;

    beforeEach(() => {
        api = new API.MyAPI();
    })
    test('should return current weather conditions', async () => {
        const mockReq = {}; 
        const mockRes = { json: jest.fn() };

        let getCurrentWeatherSpy = jest.spyOn(api, "getCurrentWeather")
        getCurrentWeatherSpy.mockResolvedValue({ isCold: false, isRaining: true });

        await api.getCurrentWeatherHandler(mockReq, mockRes);

        expect(getCurrentWeatherSpy).toHaveBeenCalledWith(mockReq);
        expect(mockRes.json).toHaveBeenCalledWith({ isRaining: true, isCold: false });
    });

    test('should handle errors and return an error message', async () => {
        const mockReq = {};
        const mockRes = { json: jest.fn() };

        let getCurrentWeatherSpy = jest.spyOn(api, "getCurrentWeather")

        getCurrentWeatherSpy.mockRejectedValue(new Error('API Error'));

        await api.getCurrentWeatherHandler(mockReq, mockRes);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error getting current weather conditions' });
    });
})

describe("getCurrentWeather should be functional", () => {

    let api;
    beforeEach(() => {
        api = new API.MyAPI();
    })

    test("Should return current weather conditions", async () => {
        const mockReq = { ip: "8.8.8.8"};
        let callGeoLocationsSpy = jest.spyOn(api, "callGeoLocationApisWithFallback")
        callGeoLocationsSpy.mockResolvedValue({lat: 35, lon: 139})

        let callCurrentWeatherApiSpy = jest.spyOn(api, "callCurrentWeatherApi")
        callCurrentWeatherApiSpy.mockResolvedValue({
            current: {
                temp_c: 22,
                precip_mm: 0
            }
        })

        let calculateWeatherConditionsSpy = jest.spyOn(api, "calculateWeatherConditions")
        calculateWeatherConditionsSpy.mockReturnValue({isCold: false, isRaining: false});

        const result = await api.getCurrentWeather(mockReq)
        expect(result).toEqual({ isCold: false, isRaining: false });
        expect(callGeoLocationsSpy).toHaveBeenCalledWith(mockReq.ip);
        expect(callCurrentWeatherApiSpy).toHaveBeenCalledWith(139, 35);
        expect(calculateWeatherConditionsSpy).toHaveBeenCalledWith(22, 0);
    });

    test('should throw an error if unable to get weather', async () => {
        const mockReq = { ip: '8.8.8.8' };
        let callGeoLocationsSpy = jest.spyOn(api, "callGeoLocationApisWithFallback")

        callGeoLocationsSpy.mockRejectedValue(new Error("API Error"));

        await expect(api.getCurrentWeather(mockReq))
            .rejects.toThrow("Error getting current weather");
    });

    })