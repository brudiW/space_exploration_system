export class GPC {
  constructor(id) {
    this.id = id;
    this.active = true;
    this.memory = "";
    this.fault = false;
  }

  // Sensoren auslesen
  readSensors(sensorData) {
    if (!this.active) return null;
    return sensorData;
  }


  // Hardware deaktivieren
  deactivate() {
    this.active = false;
  }

  // Neue Methode: JS-Code dynamisch ausführen
  exec(code, OV) {
    if (!this.active) {
      console.warn(`GPC ${this.id} ist deaktiviert. exec() übersprungen.`);
      return null;
    }

    try {
      // Code als Funktion ausführen, OV wird als Parameter übergeben
      const func = new Function('OV', code);
      return func(OV);
    } catch (e) {
      this.fault = true;
      this.memory = e;
      console.error(`GPC ${this.id} exec Fehler:`, e);
      return false;
    }
  }
}
