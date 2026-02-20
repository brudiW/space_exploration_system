export class programHandler {
  constructor() { }

  // Exec muss async sein, weil loadCode async ist
  async exec(task, target) {
    const code = await this.loadCode(task); // Warten bis Code geladen
    let response = target.exec(code);       // Code an GPC übergeben
    console.log(response);
    if (response === false) {
      let gpcResp = await this.gpcRun(code);
      console.log(gpcResp);
      if (!gpcResp) {
        //console.log(1044)
        //if (OV) {
        //let resp = OV.computers.gpc5.exec(code);
        //console.log(resp)
        //if (resp === false) {
        //const eventDownlink = new BroadcastChannel("downlink_event");
        //eventDownlink.postMessage(105);
        //eventDownlink.postMessage(-1);
        eventDownlink.postMessage(-2);
        //}
        //}
      }
    }

  }
  async gpcRun(code) {
    const eventDownlink = new BroadcastChannel("downlink_event");
    let resp1 = OV.computers.gpc1.exec(code);
    console.log(resp1)
    if (resp1 === false) {
      eventDownlink.postMessage(101);
      let resp2 = OV.computers.gpc2.exec(code);
      console.log(resp2)
      if (resp2 === false) {
        eventDownlink.postMessage(102);
        let resp3 = OV.computers.gpc3.exec(code);
        console.log(resp3)
        if (resp3 === false) {
          eventDownlink.postMessage(103);
          let resp4 = OV.computers.gpc4.exec(code);
          console.log(resp4)
          if (resp4 === false) {
            eventDownlink.postMessage(104);
            console.log(104);
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
    return true;

  }

  async loadCode(task) {
    const response = await fetch('../libraries/code.json');
    const jsonval = await response.json();

    // JSON-Datei muss z. B. so aussehen:
    // {
    //   "abort": "memory.abort = true;",
    //   "start": "memory.running = true;"
    // }
    //console.log(jsonval[task])
    return jsonval[task]; // Gibt den JS-Code für die Aufgabe zurück
  }
}
