import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export class programHandler {
  constructor() {
  }

  // Exec muss async sein, weil loadCode async ist
  async exec(task, target) {
    const eventDownlink = new BroadcastChannel("downlink_event");
    const code = await this.loadCode(task); // Warten bis Code geladen
    let response = target.exec(code, this.OV);       // Code an GPC übergeben mit OV
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
    let resp1 = global.OV.computers.gpc1.exec(code, this.OV);
    console.log(resp1)
    if (resp1 === false) {
      eventDownlink.postMessage(101);
      let resp2 = global.OV.computers.gpc2.exec(code, this.OV);
      console.log(resp2)
      if (resp2 === false) {
        eventDownlink.postMessage(102);
        let resp3 = global.OV.computers.gpc3.exec(code, this.OV);
        console.log(resp3)
        if (resp3 === false) {
          eventDownlink.postMessage(103);
          let resp4 = global.OV.computers.gpc4.exec(code, this.OV);
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
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const filePath = join(__dirname, '../libraries/code.json');
    const jsonData = await readFile(filePath, 'utf-8');
    const jsonval = JSON.parse(jsonData);

    // JSON-Datei muss z. B. so aussehen:
    // {
    //   "abort": "memory.abort = true;",
    //   "start": "memory.running = true;"
    // }
    //console.log(jsonval[task])
    return jsonval[task]; // Gibt den JS-Code für die Aufgabe zurück
  }
}
