import { SFD1CDRController } from "./software/sfd1CDRController.js";

screens.cdr_sfd1 = new SFD1CDRController("cdr-sfd-1");
setInterval(() => {screens.cdr_sfd1.setOrbiter(OV);
    screens.cdr_sfd1.displayedTab = OV.screens.cdr_sfd1;
}, 100);