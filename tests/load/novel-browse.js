import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<300"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/novels`],
    ["GET", `${BASE_URL}/search?q=solo`],
    ["GET", `${BASE_URL}/api/trpc/novels.trending?input=${encodeURIComponent(
      JSON.stringify({ json: { limit: 8 } }),
    )}`],
  ]);

  for (const response of responses) {
    check(response, {
      "status is 200": (res) => res.status === 200,
      "response under 300ms": (res) => res.timings.duration < 300,
    });
  }

  sleep(1);
}
