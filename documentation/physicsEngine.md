### Im PhysicsEngine hat jedes Objekt mehrere Vektoren:
- `locVec`: bestimmt die globale Position des Objekts => zeigt vom Erdmittelpunkt zur Position des Objektes
- `faceVec`: die Blickrichtung/Ausrichtung des Objekts
- `velVec`: Geschwindigkeits-/Bewegungsvektor, anhand diesen Vektors wird der `locVec` aktualisiert, Länge entspricht der Gesamtgeschwindigkeit
- `thrustVec`: der Schubvektor, entgegen der Bewegungsrichtung der "Abgase" der Triebwerke



> [!NOTE]
> Wenn nicht anders angegeben sind alle Vektoren in einem ECEF(=Earth-Centered Earth-Fixed)-Koordinatensystem, mit y+ nach oben und der Nullmeridian entlang der xy-Ebene
