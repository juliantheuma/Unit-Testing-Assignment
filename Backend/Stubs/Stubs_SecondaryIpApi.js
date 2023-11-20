async function stub_secondary_ip_api_success(){
    return Promise.resolve({
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
      })
}

async function stub_secondary_ip_api_fail(){
    return Promise.resolve({error: "Error connecting to host"})
}

module.exports = {
    stub_secondary_ip_api_fail,
    stub_secondary_ip_api_success
}