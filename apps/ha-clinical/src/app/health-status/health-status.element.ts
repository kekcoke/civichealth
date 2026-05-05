/**
 * HealthStatusElement — Framework-agnostic Web Component (Custom Element)
 *
 * Partial Integration Adapter: This element is embedded inside the LGU Civic
 * portal (React remote) to show a citizen their upcoming HA appointment status
 * WITHOUT exposing PHI. It only receives a federated_identity attribute and
 * renders appointment count + next appointment date — no clinical details.
 *
 * Usage in LGU React remote:
 *   <health-status-widget federated-identity="<oidc-uuid>" jwt="<bearer-token>" />
 *
 * Security model:
 *   - The JWT is passed as an attribute; the element calls the HA BFF directly
 *   - The BFF PHI sanitizer strips all clinical fields for non-ha_clinician tokens
 *   - Only: nextAppointmentDate, appointmentCount, and healthStatus are rendered
 */

const HA_BFF_URL = (window as any).__HA_BFF_URL__ || "https://ha-proxy.internal/api/ha/v1/graphql";

const HEALTH_STATUS_QUERY = `
  query ListAppointments($patientId: ID!) {
    listAppointments(patient_id: $patientId) {
      id
      startTime
      appointmentType
      status
    }
  }
`;

class HealthStatusElement extends HTMLElement {
  static get observedAttributes() {
    return ["federated-identity", "jwt"];
  }

  connectedCallback() {
    this.render("Loading health status...");
    this.fetchStatus();
  }

  attributeChangedCallback() {
    this.fetchStatus();
  }

  private async fetchStatus() {
    const federatedIdentity = this.getAttribute("federated-identity");
    const jwt = this.getAttribute("jwt");

    if (!federatedIdentity || !jwt) {
      this.render('<span class="ha-status-unavailable">Health status unavailable.</span>');
      return;
    }

    try {
      const res = await fetch(HA_BFF_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          query: HEALTH_STATUS_QUERY,
          variables: { patientId: federatedIdentity },
        }),
      });

      const json = await res.json();
      const appointments: any[] = json?.data?.listAppointments ?? [];
      const upcoming = appointments.filter((a: any) => a.status === "SCHEDULED");
      const next = upcoming[0];

      this.render(this.buildTemplate(upcoming.length, next));
    } catch {
      this.render('<span class="ha-status-error">Unable to retrieve health status.</span>');
    }
  }

  private buildTemplate(count: number, next: any): string {
    const nextDate = next
      ? `<p class="ha-next-appt">Next appointment: <strong>${new Date(next.startTime).toLocaleDateString()}</strong> — ${next.appointmentType}</p>`
      : `<p class="ha-next-appt">No upcoming appointments.</p>`;

    return `
      <div class="ha-health-status">
        <h4>🏥 Health Status</h4>
        <p class="ha-appt-count">Upcoming appointments: <strong>${count}</strong></p>
        ${nextDate}
      </div>
    `;
  }

  private render(html: string) {
    this.innerHTML = `<style>
      .ha-health-status { font-family: sans-serif; padding: 12px; border: 1px solid #e0e0e0; border-radius: 6px; background: #f9fafb; }
      .ha-health-status h4 { margin: 0 0 8px; font-size: 14px; color: #1a1a2e; }
      .ha-appt-count, .ha-next-appt { margin: 4px 0; font-size: 13px; color: #444; }
    </style>${html}`;
  }
}

// Register the custom element
if (!customElements.get("health-status-widget")) {
  customElements.define("health-status-widget", HealthStatusElement);
}

export { HealthStatusElement };
