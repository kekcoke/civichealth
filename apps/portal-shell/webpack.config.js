const { withModuleFederationPlugin, shareAll } = require("@angular-architects/module-federation/webpack");

/**
 * portal-shell — Angular Host Shell (Module Federation HOST).
 * Addresses Gap 8: Host config defining remote entry points.
 * Loads lgu-civic (Public Cloud CDN) and ha-clinical (Private Cloud DMZ) on demand.
 */
module.exports = withModuleFederationPlugin({
  remotes: {
    // LGU Civic React remote — served from Public Cloud CDN
    lguCivic:    "lguCivic@https://cdn.civic.gov/lgu-civic/remoteEntry.js",
    // HA Clinical Angular remote — served from Private Cloud via DMZ
    haClinical:  "haClinical@https://ha-proxy.internal/ha-clinical/remoteEntry.js",
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: "auto" }),
  },
});
