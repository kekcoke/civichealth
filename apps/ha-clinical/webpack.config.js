const { ModuleFederationPlugin } = require("webpack").container;
const { shareAll, withModuleFederationPlugin } = require("@angular-architects/module-federation/webpack");

/**
 * ha-clinical — Angular Micro-Frontend Remote
 * Served from Private Cloud internal web server via DMZ.
 * Exposes ClinicalModule to the Portal Shell host.
 */
module.exports = withModuleFederationPlugin({
  name: "haClinical",

  exposes: {
    // Clinician dashboard — loaded only when JWT contains ha_clinician role
    "./ClinicalModule": "./src/app/clinical/clinical.module.ts",
    // Health Status Web Component (partial integration for citizen portal)
    "./HealthStatusElement": "./src/app/health-status/health-status.element.ts",
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
    }),
  },
});
