import { PFD2CDRController } from "./software/pfd2CDRController.js";

screens.cdr_pfd2 = new PFD2CDRController("cdr-pfd-2");


setInterval(() => {
    screens.cdr_pfd2.setOrbiter(OV);
}, 100);
setInterval(() => {
    screens.cdr_pfd2.displayedTab = OV.screens.cdr_pfd2;
    screens.cdr_pfd2.update();
}, 100);