<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMyReports, createReport, getReports, updateReport, deleteReport } from '@/api/report'
import { getProfile, updateProfile, BASE_URL } from '@/api/index'
import type { User } from '@/types/user'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const router = useRouter()
const reports = ref<any[]>([])
const user = ref<User | null>(null)

// ── Navigation ──
type Tab = 'dashboard' | 'reports' | 'map' | 'profile'
const activeTab = ref<Tab>('dashboard')

const userInitials = computed(() => {
  if (!user.value) return '?'
  return (user.value.prenom?.[0] ?? '').toUpperCase() + (user.value.nom?.[0] ?? '').toUpperCase()
})

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) { router.push('/login'); return }
  user.value = JSON.parse(localStorage.getItem('user') || 'null')
  const data = await getMyReports()
  if (!data.error) reports.value = data
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/')
}

const pendingCount  = computed(() => reports.value.filter(r => r.status === 'pending').length)
const resolvedCount = computed(() => reports.value.filter(r => r.status === 'resolved').length)
const recentReports = computed(() => reports.value.slice(0, 5))

const STATUS_LABELS: Record<string, string> = {
  pending:  'En attente',
  approved: 'Pris en charge',
  resolved: 'Résolu',
  rejected: 'Rejeté',
}
const STATUS_CLASS: Record<string, string> = {
  pending:  'badge-pending',
  approved: 'badge-approved',
  resolved: 'badge-resolved',
  rejected: 'badge-rejected',
}
function statusLabel(s: string) { return STATUS_LABELS[s] ?? s }
function statusClass(s: string)  { return STATUS_CLASS[s]  ?? 'badge-pending' }
function formatDate(dt: string) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Profil ──
const profileForm    = ref({ nom: '', prenom: '' })
const profileSuccess = ref('')
const profileError   = ref('')
const profileLoading = ref(false)

async function submitProfile() {
  profileSuccess.value = ''
  profileError.value   = ''
  if (!profileForm.value.nom.trim() || !profileForm.value.prenom.trim()) {
    profileError.value = 'Nom et prénom obligatoires.'
    return
  }
  profileLoading.value = true
  const data = await updateProfile(profileForm.value.nom.trim(), profileForm.value.prenom.trim())
  profileLoading.value = false
  if (data.error) {
    profileError.value = data.error
  } else {
    profileSuccess.value = 'Profil mis à jour !'
    user.value = { nom: data.nom, prenom: data.prenom }
    localStorage.setItem('user', JSON.stringify(user.value))
  }
}

// ── Carte de la ville ──
const cityMapContainer = ref<HTMLElement | null>(null)
let cityMap: L.Map | null = null

function createStatusIcon(status: string) {
  const colors: Record<string, string> = {
    pending:  '#f59e0b',
    approved: '#3b82f6',
    resolved: '#22c55e',
    rejected: '#ef4444',
  }
  const color = colors[status] ?? '#6b7280'
  return L.divIcon({
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,0.35)"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

async function initCityMap() {
  if (!cityMapContainer.value || cityMap) return
  cityMap = L.map(cityMapContainer.value).setView([48.7937, 2.3647], 14)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(cityMap)

  const data = await getReports()
  const allReports = data.results ?? []
  const bounds: [number, number][] = []

  for (const report of allReports) {
    const lat = parseFloat(report.latitude)
    const lng = parseFloat(report.longitude)
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) continue
    bounds.push([lat, lng])

    const label = STATUS_LABELS[report.status] ?? 'En attente'
    const date  = report.created_at ? new Date(report.created_at).toLocaleDateString('fr-FR') : ''
    const imgHtml = report.image_url
      ? `<img src="${BASE_URL}/uploads/${report.image_url}" style="width:100%;height:72px;object-fit:cover;border-radius:6px;margin:4px 0" />`
      : ''
    const countHtml = (report.report_count ?? 1) > 1
      ? `<p style="font-size:0.7rem;color:#888;margin:2px 0 0">▲ ${report.report_count} signalements similaires</p>`
      : ''
    const popup = `
      <div class="map-popup">
        <span class="map-popup-status ${report.status ?? 'pending'}">${label}</span>
        <strong>${report.title}</strong>
        <p>${report.description}</p>
        ${date ? `<p class="map-popup-date">${date}</p>` : ''}
        ${countHtml}
        ${imgHtml}
      </div>`

    L.marker([lat, lng], { icon: createStatusIcon(report.status) })
      .addTo(cityMap!)
      .bindPopup(popup, { maxWidth: 230 })
  }

  if (bounds.length > 0) cityMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
}

// ── Watch tab ──
watch(activeTab, async (tab, prev) => {
  if (prev === 'map') { cityMap?.remove(); cityMap = null }

  if (tab === 'profile') {
    profileSuccess.value = ''
    profileError.value   = ''
    const data = await getProfile()
    if (!data.error) {
      profileForm.value.nom    = data.nom    ?? ''
      profileForm.value.prenom = data.prenom ?? ''
    }
  }
  if (tab === 'map') {
    await nextTick()
    await initCityMap()
  }
})

onUnmounted(() => {
  cityMap?.remove()
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  if (debounceTimer) clearTimeout(debounceTimer)
})

// ── Détail signalement ──
const selectedReport = ref<any>(null)
function openDetail(r: any)  { selectedReport.value = r }
function closeDetail()       { selectedReport.value = null }

// ── Édition signalement ──
const editingReport  = ref<any>(null)
const editForm       = ref({ title: '', description: '' })
const editFile       = ref<File | null>(null)
const editPreview    = ref<string | null>(null)
const editLoading    = ref(false)
const editError      = ref('')

function openEdit(r: any, e: Event) {
  e.stopPropagation()
  editingReport.value = r
  editForm.value = { title: r.title, description: r.description }
  editFile.value = null
  if (editPreview.value) URL.revokeObjectURL(editPreview.value)
  editPreview.value = null
  editError.value = ''
}

function closeEdit() {
  editingReport.value = null
  if (editPreview.value) URL.revokeObjectURL(editPreview.value)
  editPreview.value = null
  editFile.value = null
  editError.value = ''
}

function onEditFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  if (editPreview.value) URL.revokeObjectURL(editPreview.value)
  editFile.value = file
  editPreview.value = URL.createObjectURL(file)
}

function removeEditFile() {
  if (editPreview.value) URL.revokeObjectURL(editPreview.value)
  editFile.value = null
  editPreview.value = null
}

async function submitEdit() {
  editError.value = ''
  if (!editForm.value.title.trim() || !editForm.value.description.trim()) {
    editError.value = 'Titre et description obligatoires.'
    return
  }
  editLoading.value = true
  const fd = new FormData()
  fd.append('title', editForm.value.title.trim())
  fd.append('description', editForm.value.description.trim())
  if (editFile.value) fd.append('image', editFile.value)

  const result = await updateReport(editingReport.value.id, fd)
  editLoading.value = false
  if (result.error) {
    editError.value = result.error
  } else {
    closeEdit()
    const d = await getMyReports()
    if (!d.error) reports.value = d
  }
}

// ── Suppression signalement ──
const confirmDeleteId = ref<number | null>(null)
const deleteLoading   = ref(false)

function askDelete(id: number, e: Event) {
  e.stopPropagation()
  confirmDeleteId.value = id
}

function cancelDelete() { confirmDeleteId.value = null }

async function confirmDelete() {
  if (confirmDeleteId.value === null) return
  deleteLoading.value = true
  const result = await deleteReport(confirmDeleteId.value)
  deleteLoading.value = false
  confirmDeleteId.value = null
  if (!result.error) {
    const d = await getMyReports()
    if (!d.error) reports.value = d
  }
}

// ── Formulaire nouveau signalement ──
const showModal = ref(false)
const form      = ref({ title: '', description: '', latitude: '', longitude: '' })
const formError = ref('')

const locationMode  = ref<'address' | 'map'>('address')
const addressQuery  = ref('')
const addressLoading = ref(false)
const addressResult = ref('')
const addressError  = ref('')
const suggestions   = ref<any[]>([])
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(addressQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  addressResult.value = ''
  if (!val.trim() || val.length < 3) { suggestions.value = []; addressLoading.value = false; return }
  addressLoading.value = true
  debounceTimer = setTimeout(async () => {
    try {
      const q = encodeURIComponent(val + ', Villejuif, France')
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5&accept-language=fr`,
        { headers: { 'User-Agent': 'CityAlert/1.0' } }
      )
      suggestions.value = await res.json()
    } catch { addressError.value = 'Erreur lors de la recherche.' }
    addressLoading.value = false
  }, 400)
})

function selectSuggestion(s: any) {
  form.value.latitude  = parseFloat(s.lat).toFixed(6)
  form.value.longitude = parseFloat(s.lon).toFixed(6)
  addressResult.value  = s.display_name
  addressQuery.value   = s.display_name
  suggestions.value    = []
  addressError.value   = ''
}
function onAddressBlur() { setTimeout(() => { suggestions.value = [] }, 150) }

const mapPickerContainer = ref<HTMLElement | null>(null)
let pickerMap: L.Map | null = null
let pickerMarker: L.Marker | null = null
const VILLEJUIF_BOUNDS = L.latLngBounds([48.775, 2.340], [48.810, 2.395])

watch(locationMode, async (mode) => {
  if (mode === 'map') {
    await nextTick()
    if (!mapPickerContainer.value || pickerMap) return
    pickerMap = L.map(mapPickerContainer.value, {
      maxBounds: VILLEJUIF_BOUNDS, maxBoundsViscosity: 1.0, minZoom: 13, maxZoom: 19,
    }).setView([48.7937, 2.3647], 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(pickerMap)
    const lat = parseFloat(form.value.latitude)
    const lng = parseFloat(form.value.longitude)
    if (!isNaN(lat) && !isNaN(lng)) {
      pickerMarker = L.marker([lat, lng]).addTo(pickerMap)
      pickerMap.setView([lat, lng], 16)
    }
    pickerMap.on('click', (e: L.LeafletMouseEvent) => {
      form.value.latitude  = e.latlng.lat.toFixed(6)
      form.value.longitude = e.latlng.lng.toFixed(6)
      if (pickerMarker) pickerMarker.setLatLng(e.latlng)
      else pickerMarker = L.marker(e.latlng).addTo(pickerMap!)
    })
  } else {
    pickerMap?.remove(); pickerMap = null; pickerMarker = null
  }
})

function closeDrawer() {
  showModal.value = false
  locationMode.value = 'address'
  addressQuery.value = ''
  addressResult.value = ''
  addressError.value = ''
  suggestions.value = []
  pickerMap?.remove(); pickerMap = null; pickerMarker = null
  form.value = { title: '', description: '', latitude: '', longitude: '' }
  formError.value = ''
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  selectedFile.value = null
  imagePreview.value = null
}

const selectedFile  = ref<File | null>(null)
const imagePreview  = ref<string | null>(null)
const isDragging    = ref(false)

function setFile(file: File) {
  if (!file.type.startsWith('image/')) return
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  selectedFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}
function onDrop(e: DragEvent)   { isDragging.value = false; const f = e.dataTransfer?.files[0]; if (f) setFile(f) }
function onFileChange(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (f) setFile(f) }
function removeFile()           { if (imagePreview.value) URL.revokeObjectURL(imagePreview.value); selectedFile.value = null; imagePreview.value = null }

function imageUrl(filename: string) { return filename ? `${BASE_URL}/uploads/${filename}` : null }

async function submitReport() {
  formError.value = ''
  if (!form.value.title || !form.value.description) { formError.value = 'Titre et description obligatoires.'; return }
  if (!form.value.latitude || !form.value.longitude) { formError.value = 'Veuillez sélectionner une localisation (adresse ou carte).'; return }
  const fd = new FormData()
  fd.append('title', form.value.title)
  fd.append('description', form.value.description)
  fd.append('latitude', form.value.latitude)
  fd.append('longitude', form.value.longitude)
  if (selectedFile.value) fd.append('image', selectedFile.value)
  const result = await createReport(fd)
  if (result.error) { formError.value = result.error }
  else { closeDrawer(); const d = await getMyReports(); if (!d.error) reports.value = d }
}
</script>

<template>
  <div class="user-space">

    <!-- ── Sidebar ── -->
    <aside class="sidebar">
      <div class="sidebar-avatar">
        <div class="avatar">{{ userInitials }}</div>
        <div class="avatar-info">
          <span class="avatar-name">{{ user?.prenom }} {{ user?.nom }}</span>
          <span class="avatar-role">Habitant</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-item" :class="{ active: activeTab === 'dashboard' }" @click.prevent="activeTab = 'dashboard'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Tableau de bord
        </a>
        <a href="#" class="nav-item" :class="{ active: activeTab === 'reports' }" @click.prevent="activeTab = 'reports'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Mes signalements
        </a>
        <a href="#" class="nav-item" :class="{ active: activeTab === 'map' }" @click.prevent="activeTab = 'map'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4"/></svg>
          Carte de la ville
        </a>
        <a href="#" class="nav-item" :class="{ active: activeTab === 'profile' }" @click.prevent="activeTab = 'profile'">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          Mon profil
        </a>
      </nav>

      <a @click.prevent="logout" href="/" class="sidebar-logout">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        Se déconnecter
      </a>
    </aside>

    <!-- ── Main ── -->
    <main class="main-content">

      <header class="content-header">
        <div>
          <h1>Bonjour, {{ user?.prenom ?? 'utilisateur' }}</h1>
          <p class="header-subtitle">Voici un aperçu de vos signalements et activités.</p>
        </div>
        <button class="btn-new" @click="showModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 4v16m8-8H4"/></svg>
          Nouveau signalement
        </button>
      </header>

      <!-- Tableau de bord -->
      <template v-if="activeTab === 'dashboard'">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Total signalements</span>
            <span class="stat-value">{{ reports.length }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">En attente</span>
            <span class="stat-value accent-orange">{{ pendingCount }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Résolus</span>
            <span class="stat-value accent-green">{{ resolvedCount }}</span>
          </div>
        </div>

        <section class="section">
          <h2 class="section-title">Signalements récents</h2>
          <div class="reports-list">
            <div v-if="reports.length === 0" class="report-empty">Aucun signalement pour le moment.</div>
            <div
              v-for="report in recentReports" :key="report.id"
              class="report-item clickable"
              @click="openDetail(report)"
            >
              <div v-if="report.image_url" class="report-thumbnail-wrap">
                <img :src="imageUrl(report.image_url)!" class="report-thumbnail" :alt="report.title" />
              </div>
              <div v-else class="report-icon muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              </div>
              <div class="report-info">
                <span class="report-title-text">{{ report.title }}</span>
                <span class="report-desc">{{ report.description }}</span>
              </div>
              <span class="status-badge" :class="statusClass(report.status)">{{ statusLabel(report.status) }}</span>
              <div class="item-actions">
                <button class="btn-icon btn-edit" title="Modifier" @click="openEdit(report, $event)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-delete" title="Supprimer" @click="askDelete(report.id, $event)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
            <p v-if="reports.length > 5" class="see-all" @click="activeTab = 'reports'">Voir tous les signalements →</p>
          </div>
        </section>
      </template>

      <!-- Mes signalements -->
      <template v-if="activeTab === 'reports'">
        <section class="section">
          <h2 class="section-title">Mes signalements ({{ reports.length }})</h2>
          <div class="reports-list">
            <div v-if="reports.length === 0" class="report-empty">Aucun signalement pour le moment.</div>
            <div
              v-for="report in reports" :key="report.id"
              class="report-item clickable"
              @click="openDetail(report)"
            >
              <div v-if="report.image_url" class="report-thumbnail-wrap">
                <img :src="imageUrl(report.image_url)!" class="report-thumbnail" :alt="report.title" />
              </div>
              <div v-else class="report-icon muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              </div>
              <div class="report-info">
                <span class="report-title-text">{{ report.title }}</span>
                <span class="report-desc">{{ report.description }}</span>
              </div>
              <span class="status-badge" :class="statusClass(report.status)">{{ statusLabel(report.status) }}</span>
              <div class="item-actions">
                <button class="btn-icon btn-edit" title="Modifier" @click="openEdit(report, $event)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon btn-delete" title="Supprimer" @click="askDelete(report.id, $event)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- Carte de la ville -->
      <template v-if="activeTab === 'map'">
        <section class="section">
          <h2 class="section-title">Carte de la ville</h2>
          <div class="map-legend">
            <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>En attente</span>
            <span class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span>Pris en charge</span>
            <span class="legend-item"><span class="legend-dot" style="background:#22c55e"></span>Résolu</span>
            <span class="legend-item"><span class="legend-dot" style="background:#ef4444"></span>Rejeté</span>
          </div>
          <div ref="cityMapContainer" class="city-map"></div>
        </section>
      </template>

      <!-- Mon profil -->
      <template v-if="activeTab === 'profile'">
        <section class="section">
          <h2 class="section-title">Mon profil</h2>
          <div class="profile-card">
            <form @submit.prevent="submitProfile" class="profile-form">
              <div class="form-row">
                <div class="form-group">
                  <label>Prénom</label>
                  <input v-model="profileForm.prenom" type="text" placeholder="Votre prénom" />
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input v-model="profileForm.nom" type="text" placeholder="Votre nom" />
                </div>
              </div>
              <p v-if="profileError"   class="form-error-inline">{{ profileError }}</p>
              <p v-if="profileSuccess" class="form-success">{{ profileSuccess }}</p>
              <button type="submit" class="btn-save" :disabled="profileLoading">
                {{ profileLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications' }}
              </button>
            </form>
          </div>
        </section>
      </template>

    </main>

    <!-- ── Détail signalement (drawer) ── -->
    <Transition name="overlay">
      <div v-if="selectedReport" class="drawer-overlay" @click.self="closeDetail"></div>
    </Transition>
    <Transition name="drawer">
      <div v-if="selectedReport" class="drawer detail-drawer">
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">Détail du signalement</h3>
            <span class="status-badge" :class="statusClass(selectedReport.status)" style="margin-top:4px;display:inline-block">
              {{ statusLabel(selectedReport.status) }}
            </span>
          </div>
          <button class="drawer-close" @click="closeDetail">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="detail-body">
          <img
            v-if="selectedReport.image_url"
            :src="imageUrl(selectedReport.image_url)!"
            class="detail-image"
            :alt="selectedReport.title"
          />

          <h4 class="detail-title">{{ selectedReport.title }}</h4>
          <p class="detail-desc">{{ selectedReport.description }}</p>

          <div class="detail-meta">
            <div class="meta-row" v-if="selectedReport.created_at">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {{ formatDate(selectedReport.created_at) }}
            </div>
            <div class="meta-row" v-if="selectedReport.latitude && selectedReport.longitude">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              {{ parseFloat(selectedReport.latitude).toFixed(5) }}, {{ parseFloat(selectedReport.longitude).toFixed(5) }}
            </div>
            <div class="meta-row" v-if="(selectedReport.report_count ?? 1) > 1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
              {{ selectedReport.report_count }} signalements similaires à cet endroit
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Modale confirmation suppression ── -->
    <Transition name="overlay">
      <div v-if="confirmDeleteId !== null" class="confirm-overlay" @click.self="cancelDelete">
        <div class="confirm-box">
          <h4 class="confirm-title">Supprimer ce signalement ?</h4>
          <p class="confirm-text">Cette action est irréversible.</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="cancelDelete">Annuler</button>
            <button class="btn-danger" @click="confirmDelete" :disabled="deleteLoading">
              {{ deleteLoading ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Drawer édition signalement ── -->
    <Transition name="overlay">
      <div v-if="editingReport" class="drawer-overlay" @click.self="closeEdit"></div>
    </Transition>
    <Transition name="drawer">
      <div v-if="editingReport" class="drawer">
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">Modifier le signalement</h3>
            <p class="drawer-subtitle">Modifiez les informations du problème</p>
          </div>
          <button class="drawer-close" @click="closeEdit">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="submitEdit" class="drawer-form">
          <div class="drawer-section">
            <h4 class="drawer-section-title"><span class="section-num">1</span> Informations</h4>
            <div class="form-group">
              <label>Titre <span class="required">*</span></label>
              <input v-model="editForm.title" type="text" placeholder="Titre du signalement" />
            </div>
            <div class="form-group">
              <label>Description <span class="required">*</span></label>
              <textarea v-model="editForm.description" rows="4" placeholder="Description du problème..."></textarea>
            </div>
          </div>

          <div class="drawer-section">
            <h4 class="drawer-section-title"><span class="section-num">2</span> Photo <span class="optional">(optionnel)</span></h4>

            <!-- Photo actuelle -->
            <div v-if="editingReport.image_url && !editPreview" class="current-image-wrap">
              <img :src="imageUrl(editingReport.image_url)!" class="current-image" alt="Photo actuelle" />
              <span class="current-image-label">Photo actuelle</span>
            </div>

            <!-- Nouvelle photo -->
            <div class="drop-zone" @click="($refs.editFileInput as HTMLInputElement).click()">
              <input ref="editFileInput" type="file" accept="image/*" style="display:none" @change="onEditFileChange" />
              <template v-if="editPreview">
                <img :src="editPreview" class="drop-preview" alt="Nouvelle photo" />
                <div class="drop-preview-info">
                  <span class="drop-zone-filename">{{ editFile?.name }}</span>
                  <button type="button" class="drop-zone-remove" @click.stop="removeEditFile">✕ Supprimer</button>
                </div>
              </template>
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m-4-4l4-4 4 4"/></svg>
                <span>{{ editingReport.image_url ? 'Changer la photo' : 'Ajouter une photo' }}</span>
              </template>
            </div>
          </div>

          <p v-if="editError" class="form-error">{{ editError }}</p>

          <div class="drawer-actions">
            <button type="button" class="btn-cancel" @click="closeEdit">Annuler</button>
            <button type="submit" class="btn-submit" :disabled="editLoading">
              {{ editLoading ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </Transition>

    <!-- ── Drawer nouveau signalement ── -->
    <Transition name="overlay">
      <div v-if="showModal" class="drawer-overlay" @click.self="closeDrawer"></div>
    </Transition>
    <Transition name="drawer">
      <div v-if="showModal" class="drawer">
        <div class="drawer-header">
          <div>
            <h3 class="drawer-title">Nouveau signalement</h3>
            <p class="drawer-subtitle">Renseignez les informations du problème</p>
          </div>
          <button class="drawer-close" @click="closeDrawer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="submitReport" class="drawer-form">
          <div class="drawer-section">
            <h4 class="drawer-section-title"><span class="section-num">1</span> Informations</h4>
            <div class="form-group">
              <label>Titre <span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="Ex: Nid de poule rue Pasteur" />
            </div>
            <div class="form-group">
              <label>Description <span class="required">*</span></label>
              <textarea v-model="form.description" rows="4" placeholder="Décrivez le problème en détail..."></textarea>
            </div>
          </div>

          <div class="drawer-section">
            <h4 class="drawer-section-title"><span class="section-num">2</span> Localisation</h4>
            <div class="location-tabs">
              <button type="button" :class="['loc-tab', { active: locationMode === 'address' }]" @click="locationMode = 'address'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Adresse
              </button>
              <button type="button" :class="['loc-tab', { active: locationMode === 'map' }]" @click="locationMode = 'map'">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4"/></svg>
                Choisir sur la carte
              </button>
            </div>

            <div v-if="locationMode === 'address'" class="address-search">
              <div class="address-input-wrap">
                <div class="address-input-row">
                  <input
                    v-model="addressQuery"
                    type="text"
                    placeholder="Ex: 12 rue Jean Jaurès"
                    autocomplete="off"
                    @blur="onAddressBlur"
                  />
                  <span v-if="addressLoading" class="spinner-inline"></span>
                </div>
                <ul v-if="suggestions.length > 0" class="suggestions-dropdown">
                  <li
                    v-for="s in suggestions"
                    :key="s.place_id"
                    class="suggestion-item"
                    @mousedown.prevent="selectSuggestion(s)"
                  >{{ s.display_name }}</li>
                </ul>
              </div>
              <p v-if="addressError"  class="location-hint location-hint--error">{{ addressError }}</p>
              <p v-if="addressResult" class="location-hint location-hint--set">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
                {{ addressResult }}
              </p>
            </div>

            <div v-if="locationMode === 'map'">
              <div ref="mapPickerContainer" class="map-picker"></div>
              <p v-if="!form.latitude" class="location-hint">Cliquez sur la carte pour placer le signalement</p>
              <p v-else class="location-hint location-hint--set">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
                Position sélectionnée
              </p>
            </div>

            <div class="form-row" style="margin-top:0.75rem">
              <div class="form-group">
                <label style="font-size:0.72rem">Latitude</label>
                <input v-model="form.latitude" type="number" step="any" placeholder="48.7937"
                  :readonly="!!form.latitude && locationMode !== 'address'"
                  :class="{ 'input-readonly': !!form.latitude && locationMode !== 'address' }" />
              </div>
              <div class="form-group">
                <label style="font-size:0.72rem">Longitude</label>
                <input v-model="form.longitude" type="number" step="any" placeholder="2.3647"
                  :readonly="!!form.longitude && locationMode !== 'address'"
                  :class="{ 'input-readonly': !!form.longitude && locationMode !== 'address' }" />
              </div>
            </div>
          </div>

          <div class="drawer-section">
            <h4 class="drawer-section-title"><span class="section-num">3</span> Photo <span class="optional">(optionnel)</span></h4>
            <div
              class="drop-zone" :class="{ 'drop-zone--active': isDragging }"
              @dragover.prevent="isDragging = true" @dragleave="isDragging = false"
              @drop.prevent="onDrop" @click="($refs.fileInput as HTMLInputElement).click()"
            >
              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
              <template v-if="imagePreview">
                <img :src="imagePreview" class="drop-preview" :alt="selectedFile?.name" />
                <div class="drop-preview-info">
                  <span class="drop-zone-filename">{{ selectedFile?.name }}</span>
                  <button type="button" class="drop-zone-remove" @click.stop="removeFile">✕ Supprimer</button>
                </div>
              </template>
              <template v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m-4-4l4-4 4 4"/></svg>
                <span>Glisser-déposer ou <u>parcourir</u></span>
              </template>
            </div>
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

          <div class="drawer-actions">
            <button type="button" class="btn-cancel" @click="closeDrawer">Annuler</button>
            <button type="submit" class="btn-submit">Envoyer le signalement</button>
          </div>
        </form>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.user-space {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 68px);
  background-color: var(--color-background);
}

/* ── Sidebar ── */
.sidebar {
  background-color: var(--color-primary);
  display: flex;
  flex-direction: column;
  padding: 2rem 1.25rem;
  gap: 0.5rem;
}
.sidebar-avatar {
  display: flex; align-items: center; gap: 0.875rem;
  padding: 0 0.5rem 1.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  margin-bottom: 1rem;
}
.avatar {
  width: 44px; height: 44px;
  background-color: rgba(255,255,255,0.18);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-title); font-size: 0.95rem; font-weight: 700; color: #fff;
  flex-shrink: 0;
}
.avatar-info { display: flex; flex-direction: column; }
.avatar-name { font-size: 0.875rem; font-weight: 600; color: #fff; }
.avatar-role { font-size: 0.75rem; color: rgba(255,255,255,0.55); }
.sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
.nav-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.65rem 0.875rem; border-radius: 8px;
  font-size: 0.875rem; color: rgba(255,255,255,0.65);
  text-decoration: none; transition: background-color 0.15s, color 0.15s;
}
.nav-item:hover { background-color: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active { background-color: rgba(255,255,255,0.14); color: #fff; font-weight: 600; }
.sidebar-logout {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.65rem 0.875rem; border-radius: 8px;
  font-size: 0.875rem; color: rgba(255,255,255,0.45);
  text-decoration: none; cursor: pointer;
  transition: background-color 0.15s, color 0.15s; margin-top: 1rem;
}
.sidebar-logout:hover { background-color: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }

/* ── Main ── */
.main-content {
  padding: 2.5rem 2.75rem;
  display: flex; flex-direction: column; gap: 2rem;
}
.content-header { display: flex; align-items: flex-start; justify-content: space-between; }
.content-header h1 { font-family: var(--font-title); font-size: 1.75rem; color: var(--color-primary); margin-bottom: 0.2rem; }
.header-subtitle { font-size: 0.875rem; color: var(--color-text-muted); }
.btn-new {
  display: flex; align-items: center; gap: 0.5rem;
  background-color: var(--color-primary); color: #fff;
  border: none; border-radius: 8px; padding: 0.7rem 1.25rem;
  font-size: 0.875rem; font-weight: 600; cursor: pointer;
  transition: opacity 0.2s; white-space: nowrap;
}
.btn-new:hover { opacity: 0.85; }

/* ── Stats ── */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-card {
  background-color: #fff; border: 1.5px solid var(--color-border);
  border-radius: 12px; padding: 1.25rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.stat-label { font-size: 0.78rem; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.stat-value { font-family: var(--font-title); font-size: 2rem; font-weight: 700; color: var(--color-primary); }
.stat-value.accent-orange { color: #e05a2b; }
.stat-value.accent-green  { color: #2b9e5a; }

/* ── Reports list ── */
.section-title { font-family: var(--font-title); font-size: 1.1rem; color: var(--color-primary); margin-bottom: 1rem; }
.reports-list { display: flex; flex-direction: column; gap: 0.75rem; }
.report-item {
  background-color: #fff; border: 1.5px solid var(--color-border);
  border-radius: 10px; padding: 1rem 1.25rem;
  display: flex; align-items: center; gap: 1rem;
}
.report-item.clickable { cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s; }
.report-item.clickable:hover { border-color: var(--color-primary); box-shadow: 0 2px 8px rgba(4,44,83,0.08); }
.report-icon { width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.report-icon.muted { background-color: rgba(4,44,83,0.07); color: var(--color-text-muted); }
.report-info { display: flex; flex-direction: column; gap: 0.2rem; flex: 1; min-width: 0; }
.report-title-text { font-size: 0.875rem; font-weight: 600; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.report-desc { font-size: 0.775rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.report-empty { font-size: 0.875rem; color: var(--color-text-muted); padding: 1rem 0; }
.see-all { font-size: 0.8rem; color: var(--color-primary); cursor: pointer; padding: 0.25rem 0; text-align: right; }
.see-all:hover { text-decoration: underline; }

/* ── Status badges ── */
.status-badge { font-size: 0.75rem; font-weight: 600; padding: 0.3rem 0.75rem; border-radius: 999px; white-space: nowrap; }
.badge-pending  { background: #FFF3CD; color: #7A5200; }
.badge-approved { background: #D4EDDA; color: #155724; }
.badge-resolved { background: #D1ECF1; color: #0C5460; }
.badge-rejected { background: #F8D7DA; color: #721C24; }

/* ── Carte de la ville ── */
.map-legend {
  display: flex; flex-wrap: wrap; gap: 1rem;
  margin-bottom: 1rem; font-size: 0.8rem; color: var(--color-text-muted);
}
.legend-item { display: flex; align-items: center; gap: 0.4rem; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.city-map {
  width: 100%; height: 520px;
  border-radius: 12px; overflow: hidden;
  border: 1.5px solid var(--color-border);
  box-shadow: 0 4px 16px rgba(4,44,83,0.08);
}

/* ── Profil ── */
.profile-card {
  background: #fff; border: 1.5px solid var(--color-border);
  border-radius: 12px; padding: 2rem; max-width: 540px;
}
.profile-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-success { font-size: 0.8rem; color: #059669; font-weight: 500; }
.form-error-inline { font-size: 0.8rem; color: #c0392b; }
.btn-save {
  align-self: flex-start; background-color: var(--color-primary); color: #fff;
  border: none; border-radius: 8px; padding: 0.7rem 1.5rem;
  font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
}
.btn-save:hover { opacity: 0.85; }
.btn-save:disabled { opacity: 0.5; cursor: default; }

/* ── Detail drawer ── */
.detail-body { padding: 1.5rem 1.75rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem; }
.detail-image { width: 100%; max-height: 220px; object-fit: cover; border-radius: 10px; }
.detail-title { font-family: var(--font-title); font-size: 1.2rem; color: var(--color-primary); }
.detail-desc { font-size: 0.875rem; color: var(--color-text); line-height: 1.6; }
.detail-meta { display: flex; flex-direction: column; gap: 0.6rem; }
.meta-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--color-text-muted); }

/* ── Drawer shared ── */
.drawer-overlay { position: fixed; inset: 0; background: rgba(4,44,83,0.45); z-index: 200; }
.drawer {
  position: fixed; top: 68px; right: 0; bottom: 0; width: 480px;
  background: #fff; z-index: 201; display: flex; flex-direction: column;
  box-shadow: -8px 0 40px rgba(4,44,83,0.15);
}
.detail-drawer { width: 440px; }
.drawer-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.75rem 1.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border); flex-shrink: 0;
}
.drawer-title { font-family: var(--font-title); font-size: 1.3rem; color: var(--color-primary); margin-bottom: 0.15rem; }
.drawer-subtitle { font-size: 0.8rem; color: var(--color-text-muted); }
.drawer-close {
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; padding: 0.25rem; border-radius: 6px; transition: background-color 0.15s; flex-shrink: 0;
}
.drawer-close:hover { background-color: rgba(4,44,83,0.07); color: var(--color-primary); }
.drawer-form { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.drawer-section {
  padding: 1.25rem 1.75rem; border-bottom: 1px solid var(--color-border);
  display: flex; flex-direction: column; gap: 0.875rem;
}
.drawer-section-title { display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); }
.section-num { width: 20px; height: 20px; background-color: var(--color-primary); color: #fff; border-radius: 50%; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.optional { font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 0.78rem; }
.required { color: #e05a2b; margin-left: 1px; }
.location-tabs { display: grid; grid-template-columns: 1fr 1fr; border: 1.5px solid var(--color-border); border-radius: 8px; overflow: hidden; }
.loc-tab { display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.6rem; font-size: 0.8rem; font-weight: 600; background: none; border: none; color: var(--color-text-muted); cursor: pointer; transition: background-color 0.15s, color 0.15s; }
.loc-tab:first-child { border-right: 1.5px solid var(--color-border); }
.loc-tab:hover { background-color: rgba(4,44,83,0.04); }
.loc-tab.active { background-color: var(--color-primary); color: #fff; }
.address-search { display: flex; flex-direction: column; gap: 0.5rem; }
.address-input-wrap { position: relative; }
.address-input-row { display: flex; align-items: center; gap: 0.5rem; }
.address-input-row input { flex: 1; }
.spinner-inline { width: 16px; height: 16px; border: 2px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.suggestions-dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0;
  background: #fff; border: 1.5px solid var(--color-border); border-radius: 8px;
  box-shadow: 0 4px 16px rgba(4,44,83,0.12); z-index: 300;
  list-style: none; margin: 0; padding: 0.25rem 0; max-height: 220px; overflow-y: auto;
}
.suggestion-item { padding: 0.6rem 0.875rem; font-size: 0.8rem; color: var(--color-text); cursor: pointer; line-height: 1.4; transition: background-color 0.1s; }
.suggestion-item:hover { background-color: rgba(4,44,83,0.06); }
.map-picker { width: 100%; height: 240px; border-radius: 8px; overflow: hidden; border: 1.5px solid var(--color-border); cursor: crosshair; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
label { font-size: 0.8rem; font-weight: 600; color: var(--color-primary); }
input, textarea { background-color: var(--color-background); border: 1.5px solid var(--color-border); border-radius: 8px; padding: 0.65rem 0.875rem; font-size: 0.875rem; color: var(--color-text); outline: none; transition: border-color 0.2s; font-family: var(--font-body); resize: vertical; }
input:focus, textarea:focus { border-color: var(--color-primary); }
.input-readonly { background-color: #f3f4f6 !important; color: var(--color-text-muted) !important; cursor: default; }
.location-hint { font-size: 0.75rem; color: var(--color-text-muted); display: flex; align-items: center; gap: 0.3rem; }
.location-hint--set   { color: #059669; font-weight: 500; }
.location-hint--error { color: #dc2626; }
.drop-zone { border: 1.5px dashed var(--color-border); border-radius: 8px; padding: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.85rem; color: var(--color-text-muted); cursor: pointer; transition: border-color 0.2s, background-color 0.2s; background-color: var(--color-background); }
.drop-zone:hover, .drop-zone--active { border-color: var(--color-primary); background-color: rgba(4,44,83,0.04); }
.drop-zone-filename { font-size: 0.85rem; color: var(--color-text); font-weight: 500; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.drop-zone-remove { background: none; border: none; font-size: 0.85rem; color: var(--color-text-muted); cursor: pointer; padding: 0; flex-shrink: 0; }
.drop-zone-remove:hover { color: #c0392b; }
.form-error { font-size: 0.8rem; color: #c0392b; padding: 0 1.75rem; }
.drawer-actions { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem 1.75rem; border-top: 1px solid var(--color-border); background: #fff; flex-shrink: 0; }
.btn-cancel { background: none; border: 1.5px solid var(--color-border); border-radius: 8px; padding: 0.65rem 1.25rem; font-size: 0.875rem; color: var(--color-text-muted); cursor: pointer; }
.btn-submit { background-color: var(--color-primary); color: #fff; border: none; border-radius: 8px; padding: 0.65rem 1.5rem; font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
.btn-submit:hover { opacity: 0.85; }
.drop-preview { width: 72px; height: 72px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
.drop-preview-info { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; overflow: hidden; }
.report-thumbnail-wrap { width: 48px; height: 48px; flex-shrink: 0; border-radius: 8px; overflow: hidden; }
.report-thumbnail { width: 100%; height: 100%; object-fit: cover; }

/* ── Boutons action ── */
.item-actions { display: flex; gap: 0.35rem; flex-shrink: 0; }
.btn-icon {
  width: 30px; height: 30px; border-radius: 6px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background-color 0.15s, color 0.15s;
  background: none;
}
.btn-edit  { color: var(--color-text-muted); }
.btn-edit:hover  { background-color: rgba(4,44,83,0.08); color: var(--color-primary); }
.btn-delete { color: var(--color-text-muted); }
.btn-delete:hover { background-color: rgba(220,38,38,0.08); color: #dc2626; }

/* ── Confirmation suppression ── */
.confirm-overlay {
  position: fixed; inset: 0; z-index: 400;
  background: rgba(4,44,83,0.5);
  display: flex; align-items: center; justify-content: center;
}
.confirm-box {
  background: #fff; border-radius: 14px; padding: 2rem;
  max-width: 380px; width: 90%; box-shadow: 0 8px 40px rgba(4,44,83,0.18);
  display: flex; flex-direction: column; gap: 0.75rem;
}
.confirm-title { font-family: var(--font-title); font-size: 1.1rem; color: var(--color-primary); }
.confirm-text  { font-size: 0.875rem; color: var(--color-text-muted); }
.confirm-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
.btn-danger {
  background-color: #dc2626; color: #fff; border: none;
  border-radius: 8px; padding: 0.65rem 1.25rem;
  font-size: 0.875rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
}
.btn-danger:hover { opacity: 0.85; }
.btn-danger:disabled { opacity: 0.5; cursor: default; }

/* ── Photo actuelle (édition) ── */
.current-image-wrap { display: flex; flex-direction: column; gap: 0.4rem; }
.current-image { width: 100%; max-height: 160px; object-fit: cover; border-radius: 8px; border: 1.5px solid var(--color-border); }
.current-image-label { font-size: 0.72rem; color: var(--color-text-muted); }
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.25s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.drawer-enter-active, .drawer-leave-active { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>

<!-- Popup styles Leaflet (non-scoped) -->
<style>
.map-popup { display: flex; flex-direction: column; gap: 4px; font-family: inherit; }
.map-popup strong { font-size: 0.875rem; color: #042c53; }
.map-popup p { font-size: 0.8rem; color: #555; margin: 0; line-height: 1.4; }
.map-popup-status { display: inline-block; font-size: 0.68rem; font-weight: 600; padding: 0.15rem 0.55rem; border-radius: 999px; width: fit-content; margin-bottom: 2px; }
.map-popup-status.pending  { background: #FFF3CD; color: #7A5200; }
.map-popup-status.approved { background: #D4EDDA; color: #155724; }
.map-popup-status.resolved { background: #D1ECF1; color: #0C5460; }
.map-popup-status.rejected { background: #F8D7DA; color: #721C24; }
</style>
