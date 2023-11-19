function stubUserInputIsNotANumber() {
    throw new Error("Input is not a number")
}

function stubUserInputMustBeANumberFromOneToThree() {
    throw new Error("Input must be between 1 and 3")
}

module.exports = {

    stubUserInputIsNotANumber,
    stubUserInputMustBeANumberFromOneToThree

}