const axios = require('axios');
jest.mock('axios');

const {
    callPrimaryIpGeolocationApi,
    callSecondaryIpGeolocationApi,
    callWeatherForecastApi,
    callAirportApi,
    callCurrentWeatherApi,
    callGeoLocationApisWithFallback,
    calculateWeatherConditions,
    determineAirportCodeType,
    fallbackTimeout
} = require('./index'); // Replace 'yourServerFile' with the actual file name

describe('API Calls', () => {

    describe('callPrimaryIpGeolocationApi', () => {
        test('should return geolocation data for a valid IP address', async () => {
            const mockData = { lat: 10, lon: 20 };
            axios.get.mockResolvedValue({ data: mockData });

            const result = await callPrimaryIpGeolocationApi('8.8.8.8');
            expect(result).toEqual(mockData);
        });

    });

    describe('callSecondaryIpGeolocationApi', () => {
        test('should return geolocation data for a valid API call', async () => {
            const mockData = { lat: 40, lon: -74 }; // Mock geolocation data
            axios.get.mockResolvedValue({ data: mockData });
    
            const result = await callSecondaryIpGeolocationApi('8.8.4.4');
            expect(result).toEqual(mockData);
        });
    
        test('should return an error object when the API call fails', async () => {
            const errorMessage = 'Network Error';
            axios.get.mockRejectedValue({ message: errorMessage });
    
            const result = await callSecondaryIpGeolocationApi('8.8.4.4');
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
    
            const result = await callWeatherForecastApi(mockLongitude, mockLatitude, mockDate);
            expect(result).toEqual(mockForecastData);
        });
    
        test('should handle API errors gracefully', async () => {
            axios.request.mockRejectedValue(new Error('API Error'));
    
            await expect(callWeatherForecastApi(mockLongitude, mockLatitude, mockDate))
                .rejects.toThrow('API Error');
        });
    });
    

    describe('callAirportApi', () => {
        const mockIataCode = 'LAX';
        const mockIcaoCode = 'KLAX';
    
        test('should return airport data for a given IATA code', async () => {
            const mockAirportData = { name: 'Los Angeles International Airport', iata: 'LAX', icao: 'KLAX' };
            axios.request.mockResolvedValue({ data: mockAirportData });
    
            const result = await callAirportApi(mockIataCode, null);
            expect(result).toEqual(mockAirportData);
        });
    
        test('should return airport data for a given ICAO code', async () => {
            axios.request.mockResolvedValue({ data: { name: 'Los Angeles International Airport', iata: 'LAX', icao: 'KLAX' }});
    
            const result = await callAirportApi(null, mockIcaoCode);
            expect(result).toHaveProperty('icao', 'KLAX');
        });
    
        test('should handle API errors gracefully', async () => {
            axios.request.mockRejectedValue(new Error('API Error'));
    
            await expect(callAirportApi(mockIataCode, null)).rejects.toThrow('API Error');
        });
    
    });
    

    describe('callCurrentWeatherApi', () => {
        const mockLatitude = 34.05; // Example latitude
        const mockLongitude = -118.25; // Example longitude
    
        it('should return current weather data for given longitude and latitude', async () => {
            const mockWeatherData = {
                current: {
                    temp_c: 22,
                    precip_mm: 0
                }
            };
            axios.request.mockResolvedValue({ data: mockWeatherData });
    
            const result = await callCurrentWeatherApi(mockLongitude, mockLatitude);
            expect(result).toEqual(mockWeatherData);
        });
    
    });
    
});

describe('Utility Functions', () => {

    describe('calculateWeatherConditions', () => {
        test('should correctly determine weather conditions', () => {
            expect(calculateWeatherConditions(10, 0)).toEqual({ isCold: true, isRaining: false });
            expect(calculateWeatherConditions(20, 10)).toEqual({ isCold: false, isRaining: true });
            // Additional scenarios...
        });
    });

    describe('determineAirportCodeType', () => {
        test('should correctly identify IATA and ICAO codes', () => {
            expect(determineAirportCodeType('JFK')).toEqual({ iataCode: 'JFK', icaoCode: null });
            expect(determineAirportCodeType('KJFK')).toEqual({ iataCode: null, icaoCode: 'KJFK' });
            // Additional scenarios...
        });
    });


});

// Fallback Timeout Test
describe('fallbackTimeout', () => {
    jest.useFakeTimers();

    test('should resolve after specified duration', async () => {
        const promise = fallbackTimeout(1000);
        jest.advanceTimersByTime(1000);
        await expect(promise).resolves.toEqual({ data: null, timeoutError: true });
    });
});
