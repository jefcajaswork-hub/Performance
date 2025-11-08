import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// 1) Cargar CSV
const usuarios = new SharedArray('usuarios', () => {
  return open('./usuarios.csv')
    .trim()
    .split('\n')
    .slice(1) // <- Ignorar encabezado user,passwd
    .map(line => {
      const [user, passwd] = line.split(',');
      return { user, passwd };
    });
});

// 2) Configuración del escenario (20 TPS por 180s)
export const options = {
  scenarios: {
    login_test: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '180s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.03'],        // Error < 3%
    http_req_duration: ['p(95)<1500'],    // P95 < 1.5s
  },
};

// 3) Test: selecciona credenciales del CSV aleatoriamente
export default function () {
  const u = usuarios[Math.floor(Math.random() * usuarios.length)];

  const payload = JSON.stringify({
    username: u.user,
    password: u.passwd,
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post('https://fakestoreapi.com/auth/login', payload, params);

  check(res, {
    'status is 200/201': r => r.status === 200 || r.status === 201,
  });

  sleep(1);
}

// 4) Generar reportes automático (JSON + HTML)
export function handleSummary(data) {
  return {
    'k6-summary.json': JSON.stringify(data),
    'k6-report.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
