const { withModuleFederationPlugin, shareAll } = require("@angular-architects/module-federation/webpack");

/**
 * portal-shell — Angular Host Shell (Module Federation HOST).
 * Loads lgu-civic (port 4201) and ha-clinical (port 4202) on demand.
 * For production, replace localhost URLs with CDN/DMZ endpoints.
 */
module.exports = withModuleFederationPlugin({
  remotes: {
    // LGU Civic React remote — localhost for dev, CDN for prod
    lguCivic:    "lguCivic@http://localhost:4201/remoteEntry.js",
    // HA Clinical Angular remote — localhost for dev, DMZ for prod
    haClinical:  "haClinical@http://localhost:4202/remoteEntry.js",
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: "auto" }),
  },
});
