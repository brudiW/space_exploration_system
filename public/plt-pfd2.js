import { PFD2PLTController } from "./software/pfd2PLTController.js";

screens.plt_pfd2 = new PFD2PLTController("plt-pfd-2");

setInterval(() => screens.plt_pfd2.setOrbiter(OV), 100);