async function stub_airport_api_success(){
    return Promise.resolve({
        id: 4778,
        iata: 'MLT',
        icao: 'KMLT',
        name: 'Millinocket Municipal Airport',
        location: 'Millinocket, Maine, United States',
        street_number: '152',
        street: 'Medway Road',
        city: 'Millinocket',
        county: 'Penobscot County',
        state: 'Maine',
        country_iso: 'US',
        country: 'United States',
        postal_code: '4462',
        phone: '+1 207-723-6649',
        latitude: 45.6493,
        longitude: -68.68753,
        uct: -240,
        website: 'http://www.millinocket.org/'
      })
}

async function stub_airport_api_fail(){
    return Promise.reject("Error getting airport data")
}

module.exports = {
    stub_airport_api_fail,
    stub_airport_api_success
}