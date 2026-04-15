<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getReports, createReport } from '@/api/report'
import type { User } from '@/types/user'

const router = useRouter()
const reports = ref<any[]>([])
const user = ref<User | null>(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return
  }

  user.value = JSON.parse(localStorage.getItem('user') || 'null')
  
  const data = await getReports()
  if (!data.error) {
    reports.value = data
  }
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

const showModal = ref(false)
const form = ref({ title: '', description: '', latitude: '', longitude: '', image_url: '' })
const formError = ref('')

async function submitReport() {
  formError.value = ''
  console.log('Soumission du formulaire:', form.value)

  if (!form.value.title || !form.value.description) {
    formError.value = 'Titre et description obligatoires.'
    return
  }

  const result = await createReport({
    title: form.value.title,
    description: form.value.description,
    latitude: Number(form.value.latitude),
    longitude: Number(form.value.longitude),
    image_url: form.value.image_url
  })

  if (result.error) {
    formError.value = result.error
    console.log('Erreur lors de la création du signalement')
  } else {
    console.log('Report créé avec succès:', result)
    showModal.value = false
    form.value = { title: '', description: '', latitude: '', longitude: '', image_url: '' }
    const data = await getReports()
    if (!data.error) reports.value = data
  }
}


</script>

<template>
  <div class="user-space">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-avatar">
        <div class="avatar">IB</div>
        <div class="avatar-info">
          <span class="avatar-name">{{ user?.nom }} {{ user?.prenom }}</span>
          <span class="avatar-role">Habitant</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Tableau de bord
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Mes signalements
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          Notifications
          <span class="badge">3</span>
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          Mon profil
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Paramètres
        </a>
      </nav>

      <a @click.prevent="logout" href="/" class="sidebar-logout">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        Se déconnecter
      </a>
    </aside>

    <!-- Contenu principal -->
    <main class="main-content">

      <header class="content-header">
        <div>
          <h1>Bonjour, Ibrahim</h1>
          <p class="header-subtitle">Voici un aperçu de vos signalements et activités.</p>
        </div>
        <button class="btn-new" @click="showModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 4v16m8-8H4"/></svg>
          Nouveau signalement
        </button>
      </header>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total signalements</span>
          <span class="stat-value">{{ reports.length }}</span>
        </div>
      </div>

      <!-- Signalements récents -->
      <section class="section">
        <h2 class="section-title">Mes signalements récents</h2>
        <div class="reports-list">

          <div v-if="reports.length === 0" class="report-empty">
            Aucun signalement pour le moment.
          </div>

          <div v-for="report in reports" :key="report.id" class="report-item">
            <div class="report-icon muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </div>
            <div class="report-info">
              <span class="report-title">{{ report.title }}</span>
              <span class="report-date">{{ report.description }}</span>
            </div>
            <span class="status-badge muted">{{ report.status ?? 'En attente' }}</span>
          </div>

        </div>
      </section>

    </main>

    <!-- Modal nouveau signalement -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Nouveau signalement</h3>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>

        <form @submit.prevent="submitReport" class="modal-form">
          <div class="form-group">
            <label>Titre</label>
            <input v-model="form.title" type="text" placeholder="Ex: Nid de poule rue Pasteur" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3" placeholder="Décrivez le problème..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Latitude</label>
              <input v-model="form.latitude" type="number" step="any" placeholder="48.7937" />
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input v-model="form.longitude" type="number" step="any" placeholder="2.3647" />
            </div>
          </div>
          <div class="form-group">
            <label>URL de l'image (optionnel)</label>
            <input v-model="form.image_url" type="text" placeholder="https://..." />
          </div>

          <p v-if="formError" class="form-error">{{ formError }}</p>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showModal = false">Annuler</button>
            <button type="submit" class="btn-submit">Envoyer</button>
          </div>
        </form>
      </div>
    </div>

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
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0 0.5rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  margin-bottom: 1rem;
}

.avatar {
  width: 44px;
  height: 44px;
  background-color: rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.avatar-info {
  display: flex;
  flex-direction: column;
}

.avatar-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
}

.avatar-role {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.875rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-weight: 600;
}

.badge {
  margin-left: auto;
  background-color: #e05a2b;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
}

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.875rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.45);
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
  margin-top: 1rem;
}

.sidebar-logout:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
}

/* ── Main ── */
.main-content {
  padding: 2.5rem 2.75rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.content-header h1 {
  font-family: var(--font-title);
  font-size: 1.75rem;
  color: var(--color-primary);
  margin-bottom: 0.2rem;
}

.header-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.7rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
}

.btn-new:hover {
  opacity: 0.85;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background-color: #ffffff;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-value.accent-orange { color: #e05a2b; }
.stat-value.accent-green  { color: #2b9e5a; }
.stat-value.accent-muted  { color: var(--color-text-muted); }

/* ── Section ── */
.section-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.reports-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.report-item {
  background-color: #ffffff;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.report-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.report-icon.orange { background-color: rgba(224, 90, 43, 0.1); color: #e05a2b; }
.report-icon.green  { background-color: rgba(43, 158, 90, 0.1); color: #2b9e5a; }
.report-icon.muted  { background-color: rgba(4, 44, 83, 0.07); color: var(--color-text-muted); }

.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.report-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.report-date {
  font-size: 0.775rem;
  color: var(--color-text-muted);
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
}

.report-empty {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  padding: 1rem 0;
}

.status-badge.orange { background-color: rgba(224, 90, 43, 0.1); color: #e05a2b; }
.status-badge.green  { background-color: rgba(43, 158, 90, 0.1); color: #2b9e5a; }
.status-badge.muted  { background-color: rgba(4, 44, 83, 0.07); color: var(--color-text-muted); }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(4, 44, 83, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #ffffff;
  border-radius: 14px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(4, 44, 83, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-family: var(--font-title);
  font-size: 1.25rem;
  color: var(--color-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
}

label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
}

input, textarea {
  background-color: var(--color-background);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 0.65rem 0.875rem;
  font-size: 0.875rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s;
  font-family: var(--font-body);
  resize: vertical;
}

input:focus, textarea:focus {
  border-color: var(--color-primary);
}

.form-error {
  font-size: 0.8rem;
  color: #c0392b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  background: none;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 0.65rem 1.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.btn-submit {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:hover { opacity: 0.85; }
</style>
