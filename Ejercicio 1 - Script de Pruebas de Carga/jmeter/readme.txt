PRUEBA DE CARGA – SERVICIO DE LOGIN (FAKESTORE API)
===================================================

Tecnologías y versiones utilizadas
----------------------------------
- Apache JMeter: 5.6.3
- Java: OpenJDK Temurin 21.0.8+9 (LTS)
- SO de referencia: Windows 11 (reproducible en Linux/macOS)

Objetivo
--------
Validar el desempeño del endpoint de autenticación:
POST https://fakestoreapi.com/auth/login

Criterios de aceptación (SLA)
-----------------------------
- Throughput (TPS): ≥ 20
- Latencia: p95 ≤ 1500 ms (validación operativa con 1500 ms por request)
- Error rate: < 3%

Estructura del proyecto
-----------------------
login-loadtest/
 ├─ login-loadtest.jmx
 ├─ usuarios.csv
 ├─ summary.csv                      (resultado de una corrida de ejemplo)
 └─ readme.txt

Datos de prueba (CSV)
---------------------
Archivo: usuarios.csv

Encabezado y filas:
user,passwd
donero,ewedon
kevinryan,kev02937@
johnd,m38rmF$
derek,jklg*_56
mor_2314,83r5^_

Configuración del CSV en JMeter (CSV Data Set Config):
- Filename: (ruta a usuarios.csv)
- Delimiter: ,
- Ignore first line: TRUE
- Recycle on EOF: TRUE
- Stop thread on EOF: FALSE
- Variable names: (vacío, se usan los de la primera fila)

Plan de prueba (resumen de componentes)
---------------------------------------
- Thread Group (TG Login)
  - Users (threads): 50
  - Ramp-up: 10 s
  - Loop Count: 1
  - Specify Thread lifetime: ON
  - Duration: 180 s
- CSV Data Set Config: conforme a “Datos de prueba (CSV)”
- HTTP Request Defaults (opcional):
  - Protocol: https
  - Server Name: fakestoreapi.com
- HTTP Request (Login Request)
  - Method: POST
  - Path: /auth/login
  - Body Data (JSON):
    {
      "username": "${user}",
      "password": "${passwd}"
    }
- HTTP Header Manager
  - Content-Type: application/json
  - Accept: application/json
- Response Assertion
  - Field to Test: Response Code
  - Pattern Matching: Matches
  - Pattern: 20(0|1)   (acepta 200 o 201)
- Duration Assertion
  - Duration (ms): 1500
- Constant Throughput Timer
  - Target throughput: 1200   (muestras/min = 20 TPS × 60)
  - Calculate throughput based on: All active threads
- Listeners
  - Summary Report
  - (opcional) View Results Tree para validación funcional

Ejecución (GUI)
---------------
1) Abrir JMeter (bin/jmeter.bat en Windows).
2) Cargar login-loadtest.jmx.
3) Verificar ruta correcta al usuarios.csv en el CSV Data Set Config.
4) Ejecutar el Test Plan (duración controlada por el Thread Group).
5) Revisar resultados en “Summary Report”.

Ejecución (no GUI – recomendado para reproducibilidad)
------------------------------------------------------
Desde la raíz del proyecto:

Windows:
"%JMETER_HOME%\bin\jmeter.bat" -n -t login-loadtest.jmx -l results.jtl -e -o report

Linux/macOS:
/path/to/jmeter/bin/jmeter -n -t login-loadtest.jmx -l results.jtl -e -o report

- results.jtl: archivo crudo de resultados
- report/: reporte HTML autogenerado (abrir report/index.html)

Validaciones a comprobar
------------------------
- Throughput ≥ 20 TPS (columna “Throughput” del Summary Report)
- Error % < 3%
- Average y p95 ≤ 1500 ms (en reporte HTML, “Statistics” y percentiles)

Notas
-----
- La primera fila del CSV (user,passwd) es encabezado; se ignora con “Ignore first line”.
- El endpoint puede responder 200 o 201 en logins correctos; por ello la aserción acepta 20(0|1).
- Para escalar TPS, ajustar el Constant Throughput Timer (TPS × 60) y, si fuera necesario, aumentar usuarios (Ley de Little).
