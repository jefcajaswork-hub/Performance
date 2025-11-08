PRUEBA DE CARGA – K6 (SERVICIO DE LOGIN)
========================================

Requisitos
----------
- k6 0.46+
- Node.js 18+ (solo si se desea ver el reporte HTML local)
- Conexión a Internet (k6 descarga librerías externas)

Estructura del directorio
-------------------------
/login-loadtest
 └─ /k6
     ├─ script.js          → Script de prueba
     ├─ usuarios.csv       → Datos parametrizados
     ├─ k6-summary.json    → Reporte JSON (generado automáticamente)
     └─ k6-report.html     → Reporte HTML final (generado automáticamente)

Contenido del CSV
-----------------
El archivo usuarios.csv debe tener la siguiente estructura:

user,passwd
donero,ewedon
kevinryan,kev02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_

Ejecución de la prueba
----------------------
Abrir consola en la carpeta /k6 y ejecutar:

    k6 run script.js

Salida esperada:
- k6-summary.json   → resumen estadístico
- k6-report.html    → reporte gráfico con métricas

Validaciones consideradas (thresholds)
--------------------------------------
- http_req_duration p(95) < 1500 ms
- http_req_failed rate < 3%

Interpretación básica del resultado
----------------------------------
1) Si las dos validaciones aparecen como ✓ → La prueba es exitosa.
2) Si alguna aparece como ✗ → Se considera fallo de rendimiento.

Visualización del Reporte HTML
------------------------------
    start k6-report.html   (Windows)
    open k6-report.html    (Mac)
    xdg-open k6-report.html (Linux)
