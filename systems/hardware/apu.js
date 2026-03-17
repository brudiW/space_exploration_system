export class APU {
    constructor(id) {
        this.id = id;
        this.state = "off"; //"ready", "on", "fail"
        this.autoStartEnabble = false;
        this.speedPerc = 0.0; // %
        this.fuelQty = 100.0; // %
        this.fuelPress = 2516586.0; // Pa
        this.fuelTemp = 70.0; // °C
        this.h2oQty = 100.0; // %
        this.h2oPress = 4.0; // Pa
        this.h2oTemp = 25.0; // °C
        this.oilQty = 100.0; // %
        this.oilPress = 22.5; // Pa
        this.oilTemp = 60.0; // °C
        this.apuTemp = 45.0; // °C




        setInterval(() => {
            this.run();
        }, 1000);
    }


    run() {

    }

    start() {
        this.state = "on";
    }

    
    
    
}