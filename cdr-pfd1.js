import { PFD1CDRController } from "./software/pfd1CDRController.js";

// OV is your orbiter object with imuData and ssme info
OV.screens.cdr_pfd1.setOrbiter(OV);

// Manually trigger an update if needed
OV.screens.cdr_pfd1.triggerUpdate(5, 10, 180);

// Stop automatic updates if necessary
// commanderPFD.stop();
