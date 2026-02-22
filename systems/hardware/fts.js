export class FlightTerminationSystem {
    constructor() {
        this.activated = false;
        
        this.terminationSequencer()
    }
    terminationSequencer() {
        const fts_channel = new BroadcastChannel("FTS Uplink");
        fts_channel.onmessage = (e) => {
            const d = e.data;
            if (d[0] == "terminateConfirm") {
                this.terminate(d[1]);
            }
        }
    }
    terminate(element) {
        if (OV) {
            switch (element) {
                case "srbL":
                    if (OV.SRBs.l.seperated) {
                        OV.SRBs.l.TERMINATED = true;
                    } else {
                        OV.SRBs.l.seperate();
                        setTimeout(() => {
                            OV.SRBs.l.TERMINATED = true;
                        }, 1500);
                    }
                    break;
                case "srbR":
                    if (OV.SRBs.r.seperated) {
                        OV.SRBs.r.TERMINATED = true;
                    } else {
                        OV.SRBs.r.seperate();
                        setTimeout(() => {
                            OV.SRBs.r.TERMINATED = true;
                        }, 1500);
                    }
                    break;
                case "srb":
                    if (OV.SRBs.l.seperated) {
                        OV.SRBs.l.TERMINATED = true;
                    } else {
                        OV.SRBs.l.seperate();
                        setTimeout(() => {
                            OV.SRBs.l.TERMINATED = true;
                        }, 1500);
                    }
                    if (OV.SRBs.r.seperated) {
                        OV.SRBs.r.TERMINATED = true;
                    } else {
                        OV.SRBs.r.seperate();
                        setTimeout(() => {
                            OV.SRBs.r.TERMINATED = true;
                        }, 1500);
                    }
                    break;
                case "et":
                    if (OV.et.seperated) {
                        OV.et.TERMINATED = true;
                    } else {
                        OV.computers.programHandler.exec("SSMEshutdown", OV.computers.gpc1);
                        OV.et.seperate();
                        setTimeout(() => {
                            OV.et.TERMINATED = true;
                        }, 4500);
                    }
                    break;
                case "lv":
                    if (OV.SRBs.l.seperated) {
                        OV.SRBs.l.TERMINATED = true;
                    } else {
                        OV.SRBs.l.seperate();
                        setTimeout(() => {
                            OV.SRBs.l.TERMINATED = true;
                        }, 1500);
                    }
                    if (OV.SRBs.r.seperated) {
                        OV.SRBs.r.TERMINATED = true;
                    } else {
                        OV.SRBs.r.seperate();
                        setTimeout(() => {
                            OV.SRBs.r.TERMINATED = true;
                        }, 1500);
                    }
                    if (OV.et.seperated) {
                        OV.et.TERMINATED = true;
                    } else {
                        OV.computers.programHandler.exec("SSMEshutdown", OV.computers.gpc1);
                        OV.et.seperate();
                        setTimeout(() => {
                            OV.et.TERMINATED = true;
                        }, 4500);
                    }
                    break;
                case "all":
                    if (OV.computers.clasComputer.armState) {
                        OV.computers.programHandler.exec("abort", OV.computers.gpc1);
                        setTimeout(() => {
                            OV.SRBs.l.TERMINATED = true;
                            OV.SRBs.r.TERMINATED = true;
                            OV.et.TERMINATED = true;
                            // AFT FUSELAGE + PAYLOAD BAY
                        })
                    } else {
                        if (OV.SRBs.l.seperated) {
                            OV.SRBs.l.TERMINATED = true;
                        } else {
                            OV.SRBs.l.seperate();
                            setTimeout(() => {
                                OV.SRBs.l.TERMINATED = true;
                            }, 1500);
                        }
                        if (OV.SRBs.r.seperated) {
                            OV.SRBs.r.TERMINATED = true;
                        } else {
                            OV.SRBs.r.seperate();
                            setTimeout(() => {
                                OV.SRBs.r.TERMINATED = true;
                            }, 1500);
                        }
                        if (OV.et.seperated) {
                            OV.et.TERMINATED = true;
                        } else {
                            OV.computers.programHandler.exec("SSMEshutdown", OV.computers.gpc1);
                            OV.et.seperate();
                            setTimeout(() => {
                                OV.et.TERMINATED = true;
                            }, 4500);
                        }
                    }
                    break;

            }
        }
    }
}
