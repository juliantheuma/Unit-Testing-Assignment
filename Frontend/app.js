const MainMenu = require("./Pages/MainMenu");
startApp();

function startApp(){

    console.clear();
    let mainMenu = new MainMenu();
    mainMenu.initialize();
    
}

module.exports = startApp