<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getReports } from '@/api/report'
import { BASE_URL } from '@/api/index'

// Fix default marker icons broken by Vite's asset pipeline
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const mapContainer = ref<HTMLElement | null>(null)
const reportCount = ref(0)
let map: L.Map | null = null

const STATUS_LABELS: Record<string, string> = {
  pending:  'En attente',
  approved: 'Pris en charge',
  resolved: 'Résolu',
  rejected: 'Rejeté',
}

onMounted(async () => {
  if (!mapContainer.value) return

  // Villejuif center
  map = L.map(mapContainer.value).setView([48.7937, 2.3647], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  const data = await getReports()
  const reports = data.results ?? []
  reportCount.value = reports.length

  const bounds: [number, number][] = []

  for (const report of reports) {
    const lat = parseFloat(report.latitude)
    const lng = parseFloat(report.longitude)

    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) continue
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue

    bounds.push([lat, lng])

    const statusLabel = STATUS_LABELS[report.status] ?? 'En attente'
    const statusClass = report.status ?? 'pending'
    const date = report.created_at
      ? new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : ''
    const imgHtml = report.image_url
      ? `<img src="${BASE_URL}/uploads/${report.image_url}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin:6px 0 2px" />`
      : ''
    const countHtml = (report.report_count ?? 1) > 1
      ? `<p class="map-popup-count">▲ ${report.report_count} signalements similaires</p>`
      : ''

    const popup = `
      <div class="map-popup">
        <span class="map-popup-status ${statusClass}">${statusLabel}</span>
        <strong>${report.title}</strong>
        <p>${report.description}</p>
        ${date ? `<p class="map-popup-date">${date}</p>` : ''}
        ${countHtml}
        ${imgHtml}
      </div>
    `

    L.marker([lat, lng])
      .addTo(map!)
      .bindPopup(popup, { maxWidth: 240 })
  }

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
  }
})

onUnmounted(() => {
  map?.remove()
  map = null
})
</script>

<template>
  <!-- ── Hero ── -->
  <section class="hero">
    <div class="hero-left">
      <h1 class="hero-title">Votre ville,<br>Votre <em>voix</em></h1>
      <p class="hero-desc">
        Signalez un lampadaire défaillant, un trou dans la chaussée
        ou un feu rouge en panne. La mairie prend en charge et vous
        tient informé.
      </p>
      <div class="hero-actions">
        <button class="btn-primary">Faire un signalement</button>
        <button class="btn-outline">Voir les problèmes en cours</button>
      </div>

      <div class="hero-stats">
        <div class="stat">
          <span class="stat-number">1 284</span>
          <span class="stat-label">Signalements traités</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-number">93%</span>
          <span class="stat-label">Taux de résolution</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-number">48h</span>
          <span class="stat-label">Délai moyen de réponse</span>
        </div>
      </div>
    </div>

    <div class="hero-right">
      <div class="report-card">
        <div class="card-header">
          <span class="card-badge voirie">Voirie</span>
          <span class="card-id">#1230</span>
        </div>
        <p class="card-desc">Nid de poule dangereux au carrefour de la rue Pasteur, profond d'environ 15cm.</p>
        <div class="card-img-placeholder"><span>1 photo jointe</span></div>
        <div class="card-footer">
          <span class="card-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            Rue Pasteur, Villejuif
          </span>
          <span class="card-votes">▲ 12 signalements</span>
        </div>
      </div>

      <div class="report-card">
        <div class="card-header">
          <span class="card-badge eclairage">Éclairage public</span>
          <span class="card-id">#1229</span>
        </div>
        <p class="card-desc">Lampadaire éteint depuis 3 jours avenue de la République.</p>
        <div class="card-footer">
          <span class="card-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            Av. de la République, Villejuif
          </span>
          <span class="card-votes">▲ 8 signalements</span>
        </div>
      </div>

      <div class="report-card">
        <div class="card-header">
          <span class="card-badge eclairage">Éclairage public</span>
          <span class="card-id">#1228</span>
        </div>
        <p class="card-desc">Lampadaire éteint depuis 3 jours avenue de la République.</p>
        <div class="card-footer">
          <span class="card-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
            Av. de la République, Villejuif
          </span>
          <span class="card-votes">▲ 5 signalements</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ── Carte ── -->
  <section class="map-section">
    <div class="map-header">
      <div>
        <h2 class="map-title">Signalements en cours</h2>
        <p class="map-subtitle">{{ reportCount }} signalement{{ reportCount !== 1 ? 's' : '' }} sur la carte</p>
      </div>
    </div>
    <div ref="mapContainer" class="map-container"></div>
  </section>
</template>

<style scoped>
/* ── Hero ── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 5rem 4rem;
  min-height: calc(100vh - 68px);
  background-color: var(--color-background);
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.hero-title {
  font-family: var(--font-title);
  font-size: 3.5rem;
  line-height: 1.1;
  color: var(--color-primary);
}

.hero-title em { font-style: italic; }

.hero-desc {
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.7;
  max-width: 420px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.85; }

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
  padding: 0.75rem 1.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-outline:hover { background-color: rgba(4, 44, 83, 0.06); }

.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.stat { display: flex; flex-direction: column; gap: 0.2rem; }

.stat-number {
  font-family: var(--font-title);
  font-size: 1.75rem;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label { font-size: 0.72rem; color: var(--color-text-muted); }

.stat-divider { width: 1px; height: 36px; background-color: var(--color-border); }

.hero-right { display: flex; flex-direction: column; gap: 0.875rem; }

.report-card {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-shadow: 0 2px 8px rgba(4, 44, 83, 0.07);
}

.card-header { display: flex; align-items: center; gap: 0.6rem; }

.card-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
.card-badge.voirie  { background-color: #FFF3CD; color: #7A5200; }
.card-badge.eclairage { background-color: #D4EDDA; color: #155724; }

.card-id { font-size: 0.72rem; color: var(--color-text-muted); }

.card-desc { font-size: 0.85rem; color: var(--color-text); line-height: 1.5; }

.card-img-placeholder {
  background-color: #f0f4f8;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.card-footer { display: flex; align-items: center; justify-content: space-between; }

.card-location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.card-votes { font-size: 0.75rem; color: var(--color-text-muted); }

/* ── Map section ── */
.map-section {
  padding: 3rem 4rem 4rem;
  background-color: #f7f9fc;
  border-top: 1px solid var(--color-border);
}

.map-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.map-title {
  font-family: var(--font-title);
  font-size: 1.75rem;
  color: var(--color-primary);
  margin-bottom: 0.2rem;
}

.map-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.map-container {
  width: 100%;
  height: 520px;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(4, 44, 83, 0.08);
}
</style>

<!-- Popup styles (non-scoped car injectés par Leaflet dans le DOM) -->
<style>
.map-popup { display: flex; flex-direction: column; gap: 4px; font-family: inherit; }
.map-popup strong { font-size: 0.875rem; color: #042c53; }
.map-popup p { font-size: 0.8rem; color: #555; margin: 0; line-height: 1.4; }
.map-popup-date { font-size: 0.7rem !important; color: #999 !important; }
.map-popup-count { font-size: 0.7rem !important; color: #777 !important; }
.map-popup-status {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  width: fit-content;
  margin-bottom: 2px;
}
.map-popup-status.pending  { background: #FFF3CD; color: #7A5200; }
.map-popup-status.approved { background: #D4EDDA; color: #155724; }
.map-popup-status.resolved { background: #D1ECF1; color: #0C5460; }
.map-popup-status.rejected { background: #F8D7DA; color: #721C24; }
</style>
