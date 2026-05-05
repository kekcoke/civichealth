# Cross-Origin Resource Sharing (CORS) Policy

## Overview
This document defines the CORS and reverse-proxy rules for the hybrid public/private
cloud boundary. All cross-domain requests flow through the HA Secure Proxy Agent (BFF)
in the DMZ — the internal SQL Server is never directly accessible from the public cloud.

## Public Cloud → Private Cloud (Outbound from Angular Shell)

| Origin | Target | Allowed Methods | Allowed Headers | Notes |
|---|---|---|---|---|
| `https://portal.civic.gov` | `https://ha-proxy.internal/api/ha/v1/graphql` | `POST, OPTIONS` | `Authorization, Content-Type` | JWT required |
| `https://portal.civic.gov` | `https://ha-proxy.internal/health` | `GET` | — | Health check only |

**Rule:** The Angular Shell never calls the internal HA DB directly.
All HA requests are proxied through the Ruby BFF in the DMZ.

## Nginx Reverse Proxy (DMZ Gateway)

```nginx
# /etc/nginx/conf.d/ha-proxy.conf

server {
    listen 443 ssl http2;
    server_name ha-proxy.internal;

    ssl_certificate     /etc/ssl/ha-proxy.crt;
    ssl_certificate_key /etc/ssl/ha-proxy.key;

    # Only allow traffic from Public Cloud IP range
    allow  10.0.0.0/16;   # Public Cloud VNET CIDR
    deny   all;

    location /api/ha/v1/graphql {
        add_header Access-Control-Allow-Origin  "https://portal.civic.gov" always;
        add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        add_header Access-Control-Max-Age       3600 always;

        if ($request_method = OPTIONS) { return 204; }

        proxy_pass         http://ha-bff:9292;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    location /health {
        proxy_pass http://ha-bff:9292/health;
    }
}
```

## VPN / ExpressRoute Bridging

```
Public Cloud (Azure/AWS)                    Private Cloud (HA On-Premise)
┌─────────────────────────┐                 ┌──────────────────────────────┐
│  Angular Shell (CDN)    │                 │  HA Internal Web Server      │
│  LGU React Remote       │                 │  ha-clinical Angular Remote  │
│  LGU API (.NET 10)      │                 │                              │
│                         │  VPN Tunnel /   │  DMZ                         │
│  Public VNET            │◄──ExpressRoute─►│  ┌──────────────────────┐   │
│  10.0.0.0/16            │                 │  │ Nginx Reverse Proxy  │   │
└─────────────────────────┘                 │  │ ha-proxy.internal    │   │
                                            │  └──────────┬───────────┘   │
                                            │             │                │
                                            │  ┌──────────▼───────────┐   │
                                            │  │  Ruby BFF (Puma)     │   │
                                            │  │  :9292               │   │
                                            │  └──────────┬───────────┘   │
                                            │             │                │
                                            │  ┌──────────▼───────────┐   │
                                            │  │  SQL Server (HA DB)  │   │
                                            │  │  Always Encrypted    │   │
                                            │  └──────────────────────┘   │
                                            └──────────────────────────────┘
```

## Security Constraints
- **JWT validation**: Every request to `/api/ha/v1/graphql` must carry a Keycloak-issued JWT
- **Role enforcement**: `ha_clinician` role required for write mutations and PHI field access
- **IP allowlist**: Nginx only accepts connections from the Public Cloud VNET CIDR
- **TLS**: All inter-service traffic is TLS 1.3 minimum
- **No direct DB access**: SQL Server port 1433 is firewalled; only the Ruby BFF can connect
