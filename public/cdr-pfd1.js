import { PFD1CDRController } from "./software/pfd1CDRController.js";
screens.cdr_pfd1 = new PFD1CDRController("cdr-pfd-1");


// OV is your orbiter object with imuData and ssme info
setInterval(() => {
    screens.cdr_pfd1.setOrbiter(OV);
}, 100);

// Manually trigger an update if needed
screens.cdr_pfd1.triggerUpdate(5, 10, 180);

// Stop automatic updates if necessary
// commanderPFD.stop();
