<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  getAdminReports, approveReport, rejectReport, resolveReport,
  getStats, getStatsStatus, getUsers, updateUserRole
} from '@/api/admin';

const router = useRouter();

// ── Navigation ──
const currentView = ref<'reports' | 'users'>('reports');
const currentStatusFilter = ref('pending');

// ── Data ──
const stats = ref({ totalReports: 0, pendingCount: 0, resolvedCount: 0, rejectedCount: 0, activeUsers: 0 });
const reports = ref<any[]>([]);
const users = ref<any[]>([]);
const userRoleEdits = ref<Record<number, string>>({});

// ── UI state ──
const isLoading = ref(false);
const notification = ref<{ type: 'success' | 'error'; message: string } | null>(null);

function showNotification(type: 'success' | 'error', message: string) {
  notification.value = { type, message };
  setTimeout(() => { notification.value = null; }, 3500);
}

// ── Auth ──
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
};

// ── Stats ──
const fetchStats = async () => {
  const totalStats = await getStats();
  if (totalStats && !totalStats.error) {
    stats.value.totalReports = totalStats.totalReports;
    stats.value.activeUsers = totalStats.totalUsers;
  }
  const statusStats = await getStatsStatus();
  if (Array.isArray(statusStats)) {
    stats.value.pendingCount = statusStats.find((s: any) => s.status === 'pending')?.count ?? 0;
    stats.value.resolvedCount = statusStats.find((s: any) => s.status === 'resolved')?.count ?? 0;
    stats.value.rejectedCount = statusStats.find((s: any) => s.status === 'rejected')?.count ?? 0;
  }
};

// ── Reports ──
const fetchReports = async (status: string) => {
  isLoading.value = true;
  currentStatusFilter.value = status;
  const data = await getAdminReports(status);
  if (data && data.reports) reports.value = data.reports;
  isLoading.value = false;
};

const handleApprove = async (id: number) => {
  const res = await approveReport(id);
  if (res && !res.error) {
    showNotification('success', 'Signalement approuvé avec succès');
    fetchReports(currentStatusFilter.value);
    fetchStats();
  } else {
    showNotification('error', res?.error || 'Erreur lors de l\'approbation');
  }
};

const handleReject = async (id: number) => {
  const res = await rejectReport(id);
  if (res && !res.error) {
    showNotification('success', 'Signalement rejeté');
    fetchReports(currentStatusFilter.value);
    fetchStats();
  } else {
    showNotification('error', res?.error || 'Erreur lors du rejet');
  }
};

const handleResolve = async (id: number) => {
  const res = await resolveReport(id);
  if (res && !res.error) {
    showNotification('success', 'Signalement marqué comme résolu');
    fetchReports(currentStatusFilter.value);
    fetchStats();
  } else {
    showNotification('error', res?.error || 'Erreur lors de la résolution');
  }
};

// ── Users ──
const fetchUsers = async () => {
  isLoading.value = true;
  const data = await getUsers();
  if (data && data.users) {
    users.value = data.users;
    userRoleEdits.value = {};
    for (const u of data.users) {
      userRoleEdits.value[u.id] = u.role;
    }
  }
  isLoading.value = false;
};

const handleRoleUpdate = async (userId: number) => {
  const newRole = userRoleEdits.value[userId];
  const res = await updateUserRole(userId, newRole);
  if (res && !res.error) {
    showNotification('success', 'Rôle mis à jour avec succès');
    fetchUsers();
    fetchStats();
  } else {
    showNotification('error', res?.error || 'Erreur lors de la mise à jour du rôle');
    const user = users.value.find((u: any) => u.id === userId);
    if (user) userRoleEdits.value[userId] = user.role;
  }
};

// ── Navigation handler ──
function navigateTo(view: 'reports' | 'users', filter?: string) {
  currentView.value = view;
  if (view === 'reports' && filter) {
    fetchReports(filter);
  } else if (view === 'users') {
    fetchUsers();
  }
}

// ── Helpers ──
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: 'En attente', approved: 'Approuvé', rejected: 'Rejeté', resolved: 'Résolu' };
  return map[status] ?? status;
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = { approved: 'orange', resolved: 'green', rejected: 'red' };
  return map[status] ?? 'muted';
};

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = { admin: 'Admin', moderateur: 'Modérateur', user: 'Utilisateur' };
  return map[role] ?? role;
};

const getRoleClass = (role: string) => {
  if (role === 'admin') return 'role-admin';
  if (role === 'moderateur') return 'role-mod';
  return 'role-user';
};

const getUserInitials = (user: any) =>
  ((user.prenom?.[0] ?? '') + (user.nom?.[0] ?? '')).toUpperCase() || '?';

const getPageTitle = () => {
  if (currentView.value === 'users') return 'Gestion des utilisateurs';
  if (currentStatusFilter.value === 'rejected') return 'Signalements rejetés';
  return 'Tableau de bord';
};

onMounted(() => {
  fetchStats();
  fetchReports('pending');
});
</script>

<template>
  <div class="admin-space">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-tag">ADMIN</span>
        <span class="brand-name">CityAlert</span>
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-item"
           :class="{ active: currentView === 'reports' && currentStatusFilter === 'pending' }"
           @click.prevent="navigateTo('reports', 'pending')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Vue d'ensemble
          <span v-if="stats.pendingCount > 0" class="badge">{{ stats.pendingCount }}</span>
        </a>

        <a href="#" class="nav-item"
           :class="{ active: currentView === 'reports' && currentStatusFilter === 'approved' }"
           @click.prevent="navigateTo('reports', 'approved')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Approuvés
        </a>

        <a href="#" class="nav-item"
           :class="{ active: currentView === 'reports' && currentStatusFilter === 'resolved' }"
           @click.prevent="navigateTo('reports', 'resolved')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Résolus
        </a>

        <a href="#" class="nav-item"
           :class="{ active: currentView === 'reports' && currentStatusFilter === 'rejected' }"
           @click.prevent="navigateTo('reports', 'rejected')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
          Rejetés
          <span v-if="stats.rejectedCount > 0" class="badge red">{{ stats.rejectedCount }}</span>
        </a>

        <div class="nav-separator"></div>

        <a href="#" class="nav-item"
           :class="{ active: currentView === 'users' }"
           @click.prevent="navigateTo('users')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Utilisateurs
          <span v-if="stats.activeUsers > 0" class="badge">{{ stats.activeUsers }}</span>
        </a>
      </nav>

      <a href="#" class="sidebar-logout" @click.prevent="handleLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        Se déconnecter
      </a>
    </aside>

    <!-- Contenu principal -->
    <main class="main-content">

      <!-- Toast notification -->
      <transition name="notif">
        <div v-if="notification" class="notification" :class="notification.type">
          <svg v-if="notification.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          {{ notification.message }}
        </div>
      </transition>

      <header class="content-header">
        <div>
          <h1>{{ getPageTitle() }}</h1>
          <p class="header-subtitle">Mairie de Villejuif — Espace administrateur</p>
        </div>
        <div class="header-actions">
          <button class="btn-export">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Exporter
          </button>
        </div>
      </header>

      <!-- Stats (vue rapports uniquement) -->
      <div v-if="currentView === 'reports'" class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Signalements totaux</span>
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
          </div>
          <span class="stat-value">{{ stats.totalReports }}</span>
          <span class="stat-trend up">Total</span>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">En attente</span>
            <div class="stat-icon orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
          </div>
          <span class="stat-value">{{ stats.pendingCount }}</span>
          <span class="stat-trend warn">À traiter</span>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Résolus</span>
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <span class="stat-value">{{ stats.resolvedCount }}</span>
          <span class="stat-trend up">Total résolus</span>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Utilisateurs</span>
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
          <span class="stat-value">{{ stats.activeUsers }}</span>
          <span class="stat-trend up">Inscrits</span>
        </div>
      </div>

      <!-- ── Section Signalements ── -->
      <section v-if="currentView === 'reports'" class="section">
        <div class="section-header">
          <h2 class="section-title">Signalements — {{ getStatusLabel(currentStatusFilter) }}</h2>
          <div class="filter-tabs">
            <button @click="fetchReports('pending')" :class="{ active: currentStatusFilter === 'pending' }">En attente</button>
            <button @click="fetchReports('approved')" :class="{ active: currentStatusFilter === 'approved' }">Approuvés</button>
            <button @click="fetchReports('resolved')" :class="{ active: currentStatusFilter === 'resolved' }">Résolus</button>
            <button @click="fetchReports('rejected')" :class="{ active: currentStatusFilter === 'rejected' }">Rejetés</button>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th>Signalement</th>
                <th>Localisation</th>
                <th>Citoyen</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody v-if="!isLoading">
              <tr v-for="report in reports" :key="report.id">
                <td class="td-title">{{ report.title }}</td>
                <td class="td-loc">{{ report.latitude }}, {{ report.longitude }}</td>
                <td class="td-user">{{ report.prenom }} {{ report.nom }}</td>
                <td class="td-date">{{ formatDate(report.created_at) }}</td>
                <td><span class="status-badge" :class="getStatusClass(report.status)">{{ getStatusLabel(report.status) }}</span></td>
                <td class="td-actions">
                  <button v-if="report.status === 'pending'" class="btn-action approve" @click="handleApprove(report.id)">Approuver</button>
                  <button v-if="report.status === 'pending'" class="btn-action reject" @click="handleReject(report.id)">Rejeter</button>
                  <button v-if="report.status === 'approved'" class="btn-action resolve" @click="handleResolve(report.id)">Résoudre</button>
                  <span v-if="report.status === 'resolved' || report.status === 'rejected'" class="no-action">—</span>
                </td>
              </tr>
              <tr v-if="reports.length === 0">
                <td colspan="6" class="empty-state">Aucun signalement trouvé.</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr><td colspan="6" class="empty-state">Chargement…</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── Section Utilisateurs ── -->
      <section v-if="currentView === 'users'" class="section">
        <div class="section-header">
          <h2 class="section-title">Liste des utilisateurs ({{ users.length }})</h2>
        </div>

        <div class="table-wrapper">
          <table class="reports-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle actuel</th>
                <th>Modifier le rôle</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody v-if="!isLoading">
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar">{{ getUserInitials(user) }}</div>
                    <div>
                      <div class="td-title">{{ user.prenom }} {{ user.nom }}</div>
                      <div class="td-id">#{{ user.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="td-user">{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="getRoleClass(user.role)">{{ getRoleLabel(user.role) }}</span>
                </td>
                <td>
                  <select v-model="userRoleEdits[user.id]" class="role-select">
                    <option value="user">Utilisateur</option>
                    <option value="moderateur">Modérateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="td-actions">
                  <button
                    class="btn-action save"
                    :disabled="userRoleEdits[user.id] === user.role"
                    @click="handleRoleUpdate(user.id)"
                  >
                    Sauvegarder
                  </button>
                </td>
              </tr>
              <tr v-if="users.length === 0">
                <td colspan="5" class="empty-state">Aucun utilisateur trouvé.</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr><td colspan="5" class="empty-state">Chargement…</td></tr>
            </tbody>
          </table>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
.admin-space {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: calc(100vh - 68px);
  background-color: var(--color-background);
}

/* ── Sidebar ── */
.sidebar {
  background-color: #0a1f3c;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.25rem;
  gap: 0.5rem;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0 0.5rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.brand-tag {
  background-color: #e05a2b;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.brand-name {
  font-family: var(--font-title);
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
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
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: #ffffff;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-weight: 600;
}

.nav-separator {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0.875rem;
}

.badge {
  margin-left: auto;
  background-color: #e05a2b;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
}

.badge.red {
  background-color: #dc2626;
}

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.875rem;
  border-radius: 8px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
  margin-top: 1rem;
}

.sidebar-logout:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
}

/* ── Notification toast ── */
.notification {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  position: fixed;
  top: 1.25rem;
  right: 1.5rem;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.notification.success {
  background-color: #f0fdf4;
  border: 1.5px solid #86efac;
  color: #166534;
}

.notification.error {
  background-color: #fef2f2;
  border: 1.5px solid #fca5a5;
  color: #991b1b;
}

.notif-enter-active, .notif-leave-active { transition: all 0.3s ease; }
.notif-enter-from, .notif-leave-to { opacity: 0; transform: translateY(-8px); }

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

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #ffffff;
  color: var(--color-primary);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 0.65rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s;
}

.btn-export:hover { border-color: var(--color-primary); }

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
  gap: 0.4rem;
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue   { background-color: rgba(4, 44, 83, 0.08); color: var(--color-primary); }
.stat-icon.orange { background-color: rgba(224, 90, 43, 0.1); color: #e05a2b; }
.stat-icon.green  { background-color: rgba(43, 158, 90, 0.1); color: #2b9e5a; }

.stat-value {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-trend { font-size: 0.75rem; font-weight: 500; }
.stat-trend.up   { color: #2b9e5a; }
.stat-trend.warn { color: #e05a2b; }

/* ── Section ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-family: var(--font-title);
  font-size: 1.1rem;
  color: var(--color-primary);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.filter-tabs button {
  background-color: transparent;
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  padding: 0.35rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button.active {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

/* ── Table ── */
.table-wrapper {
  background-color: #ffffff;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.reports-table {
  width: 100%;
  border-collapse: collapse;
}

.reports-table thead {
  background-color: rgba(4, 44, 83, 0.04);
}

.reports-table th {
  text-align: left;
  padding: 0.85rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1.5px solid var(--color-border);
}

.reports-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.15s;
}

.reports-table tbody tr:last-child { border-bottom: none; }
.reports-table tbody tr:hover { background-color: rgba(4, 44, 83, 0.02); }

.reports-table td {
  padding: 0.9rem 1.25rem;
  font-size: 0.875rem;
  color: var(--color-text);
  vertical-align: middle;
}

.td-title { font-weight: 600; }
.td-loc   { color: var(--color-text-muted); }
.td-user  { color: var(--color-text-muted); }
.td-date  { color: var(--color-text-muted); white-space: nowrap; }
.td-id    { font-size: 0.75rem; color: var(--color-text-muted); }

.td-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 2.5rem !important;
  color: var(--color-text-muted);
  font-style: italic;
}

.no-action {
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

/* ── Status badges ── */
.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
}

.status-badge.orange { background-color: rgba(224, 90, 43, 0.1); color: #e05a2b; }
.status-badge.green  { background-color: rgba(43, 158, 90, 0.1); color: #2b9e5a; }
.status-badge.red    { background-color: rgba(220, 38, 38, 0.1); color: #dc2626; }
.status-badge.muted  { background-color: rgba(4, 44, 83, 0.07); color: var(--color-text-muted); }

/* ── Action buttons ── */
.btn-action {
  background-color: transparent;
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  padding: 0.35rem 0.875rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  white-space: nowrap;
}

.btn-action:hover { border-color: var(--color-primary); background-color: rgba(4, 44, 83, 0.04); }
.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-action.approve { border-color: #2b9e5a; color: #2b9e5a; }
.btn-action.approve:hover { background-color: rgba(43, 158, 90, 0.1); }

.btn-action.reject { border-color: #dc2626; color: #dc2626; }
.btn-action.reject:hover { background-color: rgba(220, 38, 38, 0.08); }

.btn-action.resolve { border-color: var(--color-primary); color: var(--color-primary); }

.btn-action.save { border-color: var(--color-primary); color: var(--color-primary); }
.btn-action.save:not(:disabled):hover { background-color: var(--color-primary); color: #ffffff; }

/* ── Users section ── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background-color: rgba(4, 44, 83, 0.1);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.role-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  white-space: nowrap;
}

.role-admin { background-color: rgba(224, 90, 43, 0.12); color: #c2410c; }
.role-mod   { background-color: rgba(4, 44, 83, 0.1); color: var(--color-primary); }
.role-user  { background-color: rgba(43, 158, 90, 0.1); color: #166534; }

.role-select {
  border: 1.5px solid var(--color-border);
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  color: var(--color-text);
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.role-select:focus { border-color: var(--color-primary); }
</style>
