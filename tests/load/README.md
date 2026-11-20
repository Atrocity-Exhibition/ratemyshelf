# Load tests

Requires [k6](https://k6.io/docs/get-started/installation/).

```bash
k6 run tests/load/novel-browse.js
BASE_URL=https://staging.example.com k6 run tests/load/novel-browse.js
```

Thresholds: p95 under 300 ms and error rate under 1% for catalog, search, and trending.
