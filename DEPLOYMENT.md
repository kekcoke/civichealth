# Hybrid Deployment Strategy

Because this is a monorepo spanning two different infrastructure paradigms, deployment is highly segmented using `nx affected`.

## Public Cloud Pipeline (LGU & Shell)
Triggered on merges to `main` that affect `apps/portal-shell` or `apps/lgu-civic`.
1.  `nx affected:build --target=portal-shell,lgu-civic --configuration=production`
2.  Deploy `dist/apps/portal-shell` to AWS S3 / Azure Blob Storage.
3.  Deploy `dist/apps/lgu-civic` to an adjacent S3 bucket.
4.  Invalidate Public CDN Cache.

## Private Cloud Pipeline (Health Authority)
Triggered on merges to `main` that affect `apps/ha-clinical`.
1.  `nx affected:build --target=ha-clinical --configuration=production`
2.  Containerize the output using Docker.
3.  Push image to the HA's private container registry (e.g., Harbor).
4.  Update Kubernetes deployment within the HA's On-Premise cluster.

*Note: The Angular Shell resolves the HA remote URL dynamically via an environment configuration file loaded at runtime, allowing the Private Cloud to deploy independently.*
