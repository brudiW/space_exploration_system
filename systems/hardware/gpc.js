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
  exec(code) {
    if (!this.active) {
      console.warn(`GPC ${this.id} ist deaktiviert. exec() übersprungen.`);
      return null;
    }

    try {
      // Code als Funktion ausführen, memory wird als Scope übergeben
      const func = new Function(code);
      return func();
    } catch (e) {
      this.fault = true;
      this.memory = e;
      console.error(`GPC ${this.id} exec Fehler:`, e);
      return false;
    }
  }
}
