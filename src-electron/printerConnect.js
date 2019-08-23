const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;


module.exports = {
    PrinterTypes:PrinterTypes,
    printTest: () => {
        console.log(PrinterTypes)
        let printer = new ThermalPrinter({
            type: "epson",
            interface:'printer:Taco',
            driver: require('electron-printer')
        })
        printer.alignCenter();
        printer.println("Hola mundo")
        printer.cut()
        try {
            printer.execute();
            console.log('Print complete')
        } catch (error) {
            console.error(error)
        }
    }
}