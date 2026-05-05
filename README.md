# Civic Health Portal

A hybrid cloud platform connecting local government services with health authority data.

## Tech Stack

### Frontend
- **Host Shell:** Angular (Module Federation)
- **LGU Remote:** React
- **HA Remote:** Angular

### Backend
- **Public Cloud API:** .NET 10
  - Handles civic data, billing, and public permits.
  - Scalable cloud-native architecture.
- **Private Cloud BFF:** Ruby
  - Secure proxy for clinical data and EMR access.
  - Implements strict sanitization and local HA auth mapping.

## Architecture
See [ARCHITECTURE.md](./ARCHITECTURE.md) for the hybrid topology and data flow diagrams.
