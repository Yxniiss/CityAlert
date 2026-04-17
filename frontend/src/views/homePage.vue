<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { getReports } from '@/api/report'
import { getPublicStats, BASE_URL } from '@/api/index'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const router = useRouter()
const mapContainer = ref<HTMLElement | null>(null)
let map: L.Map | null = null

// ── State ──
const isLoadingStats   = ref(true)
const isLoadingReports = ref(true)
const statsError       = ref(false)
const reportsError     = ref(false)

const stats         = ref({ total: 0, resolved: 0, active: 0, resolutionRate: 0 })
const recentReports = ref<any[]>([])
const mapReportCount = ref(0)

// ── Auth ──
const isLoggedIn = computed(() => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return false
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 > Date.now()
  } catch { return false }
})

// ── Helpers ──
const STATUS_LABELS: Record<string, string> = {
  pending:  'En attente',
  approved: 'Pris en charge',
  resolved: 'Résolu',
  rejected: 'Rejeté',
}

const formatDate = (s: string | null | undefined) => {
  if (!s) return ''
  const d = new Date(s)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const truncate = (s: string, n: number) =>
  s && s.length > n ? s.slice(0, n) + '…' : (s ?? '')

const getStatusClass = (status: string) =>
  ({ pending: 'badge-pending', approved: 'badge-approved', resolved: 'badge-resolved', rejected: 'badge-rejected' }[status] ?? 'badge-pending')

// ── Navigation ──
const goToSignal  = () => router.push(isLoggedIn.value ? '/UserSpace' : '/login')
const scrollToMap = () => document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' })

// ── Marqueurs colorés par statut ──
const STATUS_COLORS: Record<string, string> = {
  pending:  '#f59e0b',
  approved: '#3b82f6',
  resolved: '#22c55e',
  rejected: '#ef4444',
}

function createStatusIcon(status: string) {
  const color = STATUS_COLORS[status] ?? '#6b7280'
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.35)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

// ── Map init (synchrone, dès que le DOM est prêt) ──
function initMap() {
  if (!mapContainer.value || map) return
  map = L.map(mapContainer.value).setView([48.7937, 2.3647], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)
}

// ── Stats ──
async function loadStats() {
  isLoadingStats.value = true
  statsError.value = false
  const data = await getPublicStats()
  if (data && !data.error) {
    stats.value = data
  } else {
    statsError.value = true
  }
  isLoadingStats.value = false
}

// ── Signalements + marqueurs ──
async function loadReports() {
  isLoadingReports.value = true
  reportsError.value = false

  const data = await getReports()

  if (!data || data.error || !Array.isArray(data.results)) {
    reportsError.value = true
    isLoadingReports.value = false
    return
  }

  const reports: any[] = data.results
  recentReports.value = reports.slice(0, 3)
  isLoadingReports.value = false

  // Ajouter les marqueurs sur la carte déjà initialisée
  if (!map) return

  const bounds: [number, number][] = []

  for (const report of reports) {
    const lat = parseFloat(report.latitude)
    const lng = parseFloat(report.longitude)
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) continue
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) continue

    bounds.push([lat, lng])

    const statusLabel = STATUS_LABELS[report.status] ?? 'En attente'
    const date = formatDate(report.created_at)
    const imgHtml = report.image_url
      ? `<img src="${BASE_URL}/uploads/${report.image_url}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin:6px 0 2px" />`
      : ''
    const countHtml = (report.report_count ?? 1) > 1
      ? `<p class="map-popup-count">▲ ${report.report_count} signalements similaires</p>`
      : ''

    L.marker([lat, lng], { icon: createStatusIcon(report.status) })
      .addTo(map!)
      .bindPopup(`
        <div class="map-popup">
          <span class="map-popup-status ${report.status ?? 'pending'}">${statusLabel}</span>
          <strong>${report.title ?? ''}</strong>
          <p>${report.description ?? ''}</p>
          ${date ? `<p class="map-popup-date">${date}</p>` : ''}
          ${countHtml}
          ${imgHtml}
        </div>
      `, { maxWidth: 240 })
  }

  mapReportCount.value = bounds.length

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
  }
}

onMounted(() => {
  // 1. Carte initialisée immédiatement (synchrone)
  initMap()
  // 2. Données chargées en parallèle (asynchrone)
  loadStats()
  loadReports()
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
        <button class="btn-primary" @click="goToSignal">Faire un signalement</button>
        <button class="btn-outline" @click="scrollToMap">Voir les problèmes en cours</button>
      </div>

      <!-- Stats dynamiques -->
      <div class="hero-stats">
        <template v-if="isLoadingStats">
          <div class="stat"><div class="skeleton-num"></div><span class="stat-label">Signalements traités</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><div class="skeleton-num"></div><span class="stat-label">Taux de résolution</span></div>
          <div class="stat-divider"></div>
          <div class="stat"><div class="skeleton-num"></div><span class="stat-label">En cours</span></div>
        </template>
        <template v-else-if="!statsError">
          <div class="stat">
            <span class="stat-number">{{ stats.resolved.toLocaleString('fr-FR') }}</span>
            <span class="stat-label">Signalements traités</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-number">{{ stats.resolutionRate }}%</span>
            <span class="stat-label">Taux de résolution</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-number">{{ stats.active.toLocaleString('fr-FR') }}</span>
            <span class="stat-label">En cours</span>
          </div>
        </template>
        <template v-else>
          <p class="stats-error">Données non disponibles</p>
        </template>
      </div>
    </div>

    <!-- Cartes signalements récents -->
    <div class="hero-right">

      <!-- Skeleton loading -->
      <template v-if="isLoadingReports">
        <div v-for="i in 3" :key="i" class="report-card skeleton-card">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line short"></div>
        </div>
      </template>

      <!-- Erreur chargement -->
      <div v-else-if="reportsError" class="reports-error-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <p>Impossible de charger les signalements.<br>Vérifiez que le serveur est démarré.</p>
        <button class="btn-retry" @click="loadReports">Réessayer</button>
      </div>

      <!-- Aucun signalement -->
      <div v-else-if="recentReports.length === 0" class="reports-empty-box">
        <p>Aucun signalement pour le moment.<br>Soyez le premier à signaler un problème !</p>
        <button class="btn-primary small" @click="goToSignal">Faire un signalement</button>
      </div>

      <!-- Cartes réelles -->
      <template v-else>
        <div v-for="report in recentReports" :key="report.id" class="report-card">
          <div class="card-header">
            <span class="card-badge" :class="getStatusClass(report.status)">
              {{ STATUS_LABELS[report.status] ?? 'En attente' }}
            </span>
            <span class="card-id">#{{ report.id }}</span>
          </div>
          <p class="card-title">{{ truncate(report.title, 52) }}</p>
          <p class="card-desc">{{ truncate(report.description, 95) }}</p>
          <div v-if="report.image_url" class="card-img-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
            </svg>
            1 photo jointe
          </div>
          <div class="card-footer">
            <span v-if="formatDate(report.created_at)" class="card-date">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              {{ formatDate(report.created_at) }}
            </span>
            <span v-else class="card-date">#{{ report.id }}</span>
            <span v-if="(report.report_count ?? 1) > 1" class="card-votes">
              ▲ {{ report.report_count }}
            </span>
          </div>
        </div>
      </template>

    </div>
  </section>

  <!-- ── Carte ── -->
  <section id="map-section" class="map-section">
    <div class="map-header">
      <div>
        <h2 class="map-title">Signalements en cours</h2>
        <p class="map-subtitle">
          <template v-if="isLoadingReports">Chargement des marqueurs…</template>
          <template v-else-if="mapReportCount > 0">
            {{ mapReportCount }} signalement{{ mapReportCount !== 1 ? 's' : '' }} sur la carte
          </template>
          <template v-else-if="!reportsError">Aucun signalement géolocalisé</template>
          <template v-else>Carte disponible — données en erreur</template>
        </p>
      </div>
    </div>
    <div class="map-legend">
      <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>En attente</span>
      <span class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span>Pris en charge</span>
      <span class="legend-item"><span class="legend-dot" style="background:#22c55e"></span>Résolu</span>
      <span class="legend-item"><span class="legend-dot" style="background:#ef4444"></span>Rejeté</span>
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

.hero-left  { display: flex; flex-direction: column; gap: 1.75rem; }

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

.hero-actions { display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start; }

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
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
.btn-primary.small { padding: 0.5rem 1.25rem; font-size: 0.75rem; margin-top: 0.5rem; }

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

/* ── Stats ── */
.hero-stats { display: flex; align-items: center; gap: 1.5rem; padding-top: 0.5rem; }
.stat { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-number { font-family: var(--font-title); font-size: 1.75rem; color: var(--color-primary); line-height: 1; }
.stat-label  { font-size: 0.72rem; color: var(--color-text-muted); }
.stat-divider { width: 1px; height: 36px; background-color: var(--color-border); }
.stats-error { font-size: 0.8rem; color: var(--color-text-muted); font-style: italic; }

/* ── Skeleton ── */
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
.skeleton-num,
.skeleton-line {
  background: linear-gradient(90deg, #e6edf5 25%, #d0dcea 50%, #e6edf5 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 4px;
}
.skeleton-num    { width: 60px; height: 28px; margin-bottom: 4px; }
.skeleton-line   { width: 100%; height: 12px; margin: 5px 0; }
.skeleton-line.short  { width: 50%; }
.skeleton-line.medium { width: 75%; }

/* ── Cards ── */
.hero-right { display: flex; flex-direction: column; gap: 0.875rem; }

.report-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(4, 44, 83, 0.07);
}
.skeleton-card { min-height: 110px; }

.card-header { display: flex; align-items: center; gap: 0.6rem; }
.card-id     { font-size: 0.72rem; color: var(--color-text-muted); }

.card-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}
.badge-pending  { background-color: #FFF3CD; color: #7A5200; }
.badge-approved { background-color: #cce5ff; color: #004085; }
.badge-resolved { background-color: #D4EDDA; color: #155724; }
.badge-rejected { background-color: #f8d7da; color: #721c24; }

.card-title { font-size: 0.875rem; font-weight: 600; color: var(--color-text); line-height: 1.4; }
.card-desc  { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.5; }

.card-img-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: #f0f4f8;
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  width: fit-content;
}

.card-footer { display: flex; align-items: center; justify-content: space-between; }
.card-date {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.card-votes { font-size: 0.75rem; color: var(--color-text-muted); }

/* Error / empty */
.reports-error-box,
.reports-empty-box {
  background-color: #fff;
  border-radius: 10px;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.875rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(4, 44, 83, 0.07);
  line-height: 1.6;
}
.reports-error-box svg { color: #e05a2b; opacity: 0.8; }

.btn-retry {
  margin-top: 0.25rem;
  background: none;
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  padding: 0.45rem 1.1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}
.btn-retry:hover { border-color: var(--color-primary); background-color: rgba(4,44,83,0.04); }

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

.map-subtitle { font-size: 0.875rem; color: var(--color-text-muted); }

.map-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.legend-item { display: flex; align-items: center; gap: 0.4rem; }
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.25);
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

<!-- Popup Leaflet — non scoped car injecté dans le DOM par Leaflet -->
<style>
.map-popup { display: flex; flex-direction: column; gap: 4px; font-family: inherit; }
.map-popup strong { font-size: 0.875rem; color: #042c53; }
.map-popup p { font-size: 0.8rem; color: #555; margin: 0; line-height: 1.4; }
.map-popup-date  { font-size: 0.7rem !important; color: #999 !important; }
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
.map-popup-status.approved { background: #cce5ff; color: #004085; }
.map-popup-status.resolved { background: #D4EDDA; color: #155724; }
.map-popup-status.rejected { background: #F8D7DA; color: #721C24; }
</style>
