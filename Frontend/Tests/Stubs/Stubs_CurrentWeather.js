function stub_always_cold_and_rainy(){
    return {
        isCold : true,
        isRaining : true
    }
}

function stub_always_cold_and_not_rainy(){
    return {
        isCold : true,
        isRaining : false
    }
}

function stub_not_cold_and_always_rainy(){
    return {
        isCold : false,
        isRaining : true
    }
}

function stub_not_cold_and_not_rainy(){
    return {
        isCold : false,
        isRaining : false
    }
}

module.exports = {
    stub_always_cold_and_rainy,
    stub_always_cold_and_not_rainy,
    stub_not_cold_and_always_rainy,
    stub_not_cold_and_not_rainy
}