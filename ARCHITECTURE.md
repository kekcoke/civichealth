# System Architecture

## Cloud-Hybrid Topology

```mermaid
graph TD
    subgraph "Client Browser"
        Shell[Angular Host Shell]
        Shell -->|Loads| LGU_MFE[LGU React Remote]
        Shell -->|Loads| HA_MFE[HA Angular Remote]
    end

    subgraph "Public Cloud (Azure/AWS)"
        LGU_CDN[CDN / S3] -->|Serves| LGU_MFE
        Shell_CDN[CDN / S3] -->|Serves| Shell
        IdP[Keycloak OIDC] -->|Issues JWT| Shell
        LGU_API[LGU API - .NET 10] -->|Civic Data| LGU_MFE
    end

    subgraph "Private Cloud (HA On-Premise)"
        HA_Server[Internal Web Server] -->|Serves via DMZ| HA_MFE
        HA_Proxy[Secure HA BFF - Ruby] -->|Clinical Data| HA_MFE
    end
    
    LGU_MFE -.->|Cross-Entity Event| HA_MFE
