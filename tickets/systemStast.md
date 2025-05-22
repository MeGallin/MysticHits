# System Statistics – Expansion Plan

## 1. Current Coverage

| Area                 | Metrics Exposed                            | Source                                                          |
| -------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| Core health          | uptime, memory usage, DB‑connection status | `GET /api/health`, **HealthCard**                               |
| API performance      | avg / p95 latency, error‑rate              | `GET /api/health/metrics`, **ApiLatencyWidget**                 |
| Traffic & engagement | DAU / WAU, top tracks, page‑views          | `/api/admin/stats/*`, **UserActivityStats**, **TopTracksTable** |
| Error logs           | recent error events (filter & pagination)  | `/api/admin/errors`, **AdminErrorsWidget**                      |

## 2. Proposed Extensions

### Infrastructure

- CPU %, memory, disk & inode usage
- Network in/out, load averages (1 / 5 / 15 min)

### Database

- Collection‑level query latency (avg / p95)
- Active connection pool depth
- Replication lag (clustered)

### Per‑endpoint Performance

- Latency & error‑rate histograms per route

### Concurrency & Throughput

- Requests / sec
- Concurrent WebSocket streams
- Active audio streams

### User Engagement

- Retention cohorts (D1 / D7 / D30)
- Track completion‑rate
- Median playlist length

### Security Posture

- Auth failures / min
- Suspicious IPs flagged
- Rate‑limit hits per endpoint

### Cache Efficiency

- Cache hit / miss ratio
- Eviction count

## 3. Back‑End Changes

1. **Metrics collector** – add Prometheus / OpenTelemetry counters & histograms.

2. **Aggregation helpers** – extend `lib/agg.js` for p95/p99 and time‑bucket roll‑ups.

3. **New API surface**

   ```http
   GET /api/admin/stats/system     # CPU, mem, disk
   GET /api/admin/stats/db         # query latency, connections
   GET /api/admin/stats/traffic    # RPS, active streams
   GET /api/admin/stats/cache      # hit / miss
   ```

   (all cached 30 s behind `adminMiddleware`)

4. **Indexing & TTL** – compound index on `timestamp + endpoint`; TTL ≈ 7 days, nightly cron to `RequestMetricSummary`.

## 4. Front‑End & UX

| Component         | Purpose                          | Implementation Details                                       |
| ----------------- | -------------------------------- | ------------------------------------------------------------ |
| `CpuGauge`        | radial CPU gauge (red > 80 %)    | SVG-based with dynamic color transitions based on thresholds |
| `DbLatencySpark`  | mini spark‑line per collection   | Canvas-rendered time series with configurable time window    |
| `EndpointTable`   | sortable latency & error columns | React Table with server-side sorting and filtering           |
| `CacheHitGauge`   | donut hit vs miss                | D3-powered interactive donut chart with tooltip breakdown    |
| `RetentionCohort` | heat‑map cohort grid             | CSS Grid-based heatmap with customizable color intensity     |
| `SecurityMonitor` | auth failure & suspicious IP viz | Real-time counter with geographic IP mapping                 |

All wrap in existing **KpiCard** and appear under `/admin/stats` tabs: **System**, **Database**, **Traffic**, **Engagement**, **Cache**, and **Security**.
Optional real‑time Server‑Sent Events every 15 s with fallback to polling for older browsers.

## 5. Alerting & Dashboards

- Export Prometheus metrics → **Grafana** for long‑term dashboards.
- **Alertmanager** rules (e.g. CPU > 85 % for 5 min, p95 latency > 1 s).
- Surface SLO breaches in‑app via reuse of `RateLimitBanner`.
- Integration with PagerDuty and Slack for critical alerts.

## 6. Next Steps

1. Prioritise metric families with stakeholders.
2. Finalise API contract & React components.
3. Phase rollout: collectors → API → UI → alerting.
4. Document SLO targets and refine alert thresholds post‑launch.
5. Create demo environment for stakeholder testing and feedback.
6. Conduct performance impact assessment of metric collection.
