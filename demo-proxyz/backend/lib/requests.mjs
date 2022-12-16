const Sources = {
  ip: [
    {
      prefix: 104,
      asn: "AS24940 Hetzner Online GmbH",
      cc: ["DE", "FI"],
    },
    {
      prefix: 85,
      asn: "AS3249 Telia Eesti AS",
      cc: ["EE"],
    },
    {
      prefix: 97,
      asn: "AS3320 Deutsche Telekom AG",
      cc: ["DE"],
    },
    {
      prefix: 8,
      asn: "AS15169 GOOGLE",
      cc: ["US", "UK", "IE", "SG"],
    },
    {
      prefix: 206,
      asn: "AS54113 FASTLY",
      cc: ["US", "DE", "FI", "AU", "SG"],
    },
  ],
  urls: [
    "/pages/index.php",
    "/pages/about/contact.php",
    "/api/v1.0/auth.php",
    "/api/v2.1/categories.php",
    "/wp-login.php",
    "/tags/potato/index.php",
    "/admin/login.php",
    "/phpinfo.php",
  ],
  upstream_host: ["www0", "webserv", "webapp1", "webapp2"],
  ua: [
    "Mozilla/5.0 (Linux NT 5.4; x86; Doors 95)",
    "AppleWebKit 543.21 (XHTML, like Iguana)",
    "GoobleBot 1.0 (crawler)",
    "Mozilla/5.0 (Series40; Nokia6300/07.30; Profile/MIDP-2.0 Configuration/CLDC-1.1) Gecko/20100401 S40OviBrowser/5.5.0.0.27",
  ],
  host: [
    ["crispy", "magic", "perplexed", "noisy", "bipedal"],
    ["potato", "garfunkel", "mystery", "cheeto", "harpoon", "crustacean"],
  ],
  tld: ["ee", "co.uk", "gov", "xyz"],
};

const rnd = Math.random.bind(Math);
const fl = Math.floor.bind(Math);

const pick = (arr) =>
  arr.length < 2 ? arr[arr.length - 1] : arr[fl(rnd() * arr.length)];

export function makeUpRequests(num, opts) {
  const reqs = [];

  let { request, next } = makeUpARequest(opts);
  reqs.push(request);
  --num;

  while (num > 0) {
    const n = next();
    next = n.next;
    reqs.push(n.request);
    --num;
  }

  return reqs;
}

export function makeUpARequest(opts = {}) {
  // Earliest start time
  const clockstart = opts.clockstart ?? Date.now() - 42 * 69 * 1337;
  // Probability of slow requests
  const slowrequests = opts.slowrequests ?? 1 / 10;
  // Probability of upstream errors (4xx)
  const upstreamerr = opts.upstreamerr ?? 1 / 20;
  // Probability of upstream server failures (5xx)
  const upstreamservfail = opts.upstreamservfail ?? 1 / 33;

  const R = {};

  R.id = mkid();

  // Request start
  R.request_start = new Date(clockstart + fl(rnd() * 1111));
  // Request duration (0-1s)
  R.request_time = rnd();
  // Slow request
  if (rnd() < slowrequests) R.request_time *= 60;

  // Remote
  const remote = Sources.ip[fl(rnd() * Sources.ip.length)];
  R.remote_addr = [
    remote.prefix,
    fl(rnd() * 255),
    fl(rnd() * 255),
    fl(rnd() * 255),
  ].join(".");
  R.remote_asn = remote.asn;
  R.remote_cc = pick(remote.cc);

  // Request length
  R.request_length = fl(rnd() * 2486) * 2;
  R.host = [
    pick(Sources.host[0]) + "-" + pick(Sources.host[1]),
    pick(Sources.tld),
  ].join(".");

  // Request type, GET and POST are the most frequent
  R.method = pick([
    "GET",
    "GET",
    "GET",
    "GET",
    "POST",
    "POST",
    "PUT",
    "DELETE",
  ]);

  // Add extra weight to POST/PUT bodies
  if (R.method == "POST" || R.method == "PUT") {
    R.request_length += fl(rnd(8192)) * 4;
  }

  // Determine status
  if (rnd() < upstreamerr)
    R.status = pick([404, 404, 404, 404, 403, 403, 401, 401, 400, 405, 408]);
  if (rnd() < upstreamservfail)
    R.status = pick([500, 500, 500, 500, 500, 502, 503, 504]);

  if (!R.status) R.status = pick([200, 200, 200, 200, 200, 200, 201, 204]);

  R.uri = pick(Sources.urls);

  // wp-login.php always 404
  if (R.uri.includes("wp-login.php")) R.status = 404;

  R.upstream_host = pick(Sources.upstream_host);
  R.user_agent = pick(Sources.ua);
  R.content_type = pick([
    "text/html",
    "text/html",
    "text/html",
    "text/plain",
    "application/json",
  ]);

  return {
    request: R,
    next: makeUpARequest.bind(null, {}),
  };
}

// Generates a "reasonably unique" alphanumeric request id
function mkid() {
  return Date.now().toString(36) + ((Math.random() * 36 * 36) | 0).toString(36);
}
