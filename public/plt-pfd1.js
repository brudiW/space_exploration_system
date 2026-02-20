import { PFD1PLTController } from "./software/pfd1PLTController.js";

screens.plt_pfd1 = new PFD1PLTController("plt-pfd-1");

// OV is your orbiter object with imuData and ssme info
setInterval(() => screens.plt_pfd1.setOrbiter(OV), 100);

// Manually trigger an update if needed
screens.plt_pfd1.triggerUpdate(5, 10, 180);

// Stop automatic updates if necessary
// commanderPFD.stop();
