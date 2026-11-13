require('dotenv').config();

const express = require('express');
const cors = require('cors');

const {
  CONFIG_URL,
  LOG_URL,
  LOG_API_TOKEN,
  PORT = 3000,
} = process.env;

const PER_PAGE = 12;

// ตรวจสอบ Environment Variables ก่อนเริ่ม Server
if (!CONFIG_URL || !LOG_URL || !LOG_API_TOKEN) {
  throw new Error(
    'Missing required environment variables: CONFIG_URL, LOG_URL, LOG_API_TOKEN'
  );
}

const app = express();

app.use(cors({
  exposedHeaders: [
    'X-Page',
    'X-Per-Page',
    'X-Total-Items',
    'X-Total-Pages',
  ],
}));

app.use(express.json());

// จัดการ Error จาก API
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(e.status || 502).json({
      error: e.message || 'Upstream server error',
    });
  });

const fail = (status, message) =>
  Object.assign(new Error(message), { status });

// ตรวจสอบ Drone ID
const checkId = (id) => {
  if (!/^\d+$/.test(id)) {
    throw fail(400, 'droneId must be a number');
  }
};

// ดึง Drone Config จาก Config Server
async function findDrone(id) {
  checkId(id);

  const r = await fetch(CONFIG_URL, {
    redirect: 'follow',
  });

  if (!r.ok) {
    throw fail(502, `Config server responded ${r.status}`);
  }

  const j = await r.json();

  const list = Array.isArray(j)
    ? j
    : Array.isArray(j.data)
      ? j.data
      : [j];

  const d = list.find(
    (x) => String(x.drone_id) === id
  );

  if (!d) {
    throw fail(404, `Drone ${id} not found`);
  }

  return d;
}

// API information
app.get('/', (_req, res) => {
  res.json({
    service: 'Drone API Server',
    routes: [
      'GET /configs/:droneId',
      'GET /status/:droneId',
      'GET /logs/:droneId?page=1',
      'POST /logs',
    ],
  });
});

// 1. GET Drone Configuration
app.get('/configs/:droneId', wrap(async (req, res) => {
  const d = await findDrone(req.params.droneId);

  const {
    drone_id,
    drone_name,
    light,
    country,
    weight,
  } = d;

  res.json({
    drone_id,
    drone_name,
    light,
    country,
    weight,
  });
}));

// 2. GET Drone Status
app.get('/status/:droneId', wrap(async (req, res) => {
  const d = await findDrone(req.params.droneId);

  res.json({
    condition: d.condition,
  });
}));

// 3. GET Drone Logs with Pagination
app.get('/logs/:droneId', wrap(async (req, res) => {
  checkId(req.params.droneId);

  const page = Math.max(
    1,
    parseInt(req.query.page, 10) || 1
  );

  const qs = new URLSearchParams({
    filter: `(drone_id=${req.params.droneId})`,
    sort: '-created',
    page: String(page),
    perPage: String(PER_PAGE),
  });

  const r = await fetch(`${LOG_URL}?${qs}`, {
    headers: {
      Authorization: LOG_API_TOKEN,
    },
  });

  if (!r.ok) {
    throw fail(502, `Log server responded ${r.status}`);
  }

  const j = await r.json();

  
  if (!Array.isArray(j.items)) {
    throw fail(502, 'Invalid logs response from server');
  }

  // Pagination Headers
  res.set({
    'X-Page': j.page,
    'X-Per-Page': j.perPage,
    'X-Total-Items': j.totalItems,
    'X-Total-Pages': Math.max(1, j.totalPages),
  });

 
  const logs = j.items.map(({
    drone_id,
    drone_name,
    created,
    country,
    celsius,
  }) => ({
    drone_id,
    drone_name,
    created,
    country,
    celsius,
  }));

  res.json(logs);
}));


app.post('/logs', wrap(async (req, res) => {
  const {
    drone_id,
    drone_name,
    country,
    celsius,
  } = req.body || {};

  // ตรวจสอบข้อมูลก่อนส่งไปยัง Log Server
  if (
    drone_id == null ||
    !/^\d+$/.test(String(drone_id)) ||
    !drone_name ||
    !country ||
    celsius === '' ||
    celsius == null ||
    !Number.isFinite(Number(celsius))
  ) {
    throw fail(
      400,
      'Body must contain drone_id, drone_name, country, celsius (number)'
    );
  }

  const body = {
    drone_id: Number(drone_id),
    drone_name,
    country,
    celsius: Number(celsius),
  };
  
  const r = await fetch(LOG_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LOG_API_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

    const responseText = await r.text();

  let c = {};
  try {
    c = responseText ? JSON.parse(responseText) : {};
  } catch {
    c = { message: responseText };
  }

  if (!r.ok) {
    console.error('PocketBase Error:', r.status, c);

    throw fail(
      r.status,
      `Log server responded ${r.status}: ${
        c.message || 'Unknown error'
      } | ${JSON.stringify(c.data || {})}`
    );
  }

  res.status(201).json({
    drone_id: c.drone_id,
    drone_name: c.drone_name,
    country: c.country,
    celsius: c.celsius,
    created: c.created,
  });
}));


app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
