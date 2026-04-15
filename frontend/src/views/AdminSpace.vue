<template>
  <div class="admin-space">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-tag">ADMIN</span>
        <span class="brand-name">CityAlert</span>
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-item active">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Vue d'ensemble
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          Signalements
          <span class="badge">12</span>
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Utilisateurs
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          Statistiques
        </a>
        <a href="#" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Paramètres
        </a>
      </nav>

      <a href="/login" class="sidebar-logout">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        Se déconnecter
      </a>
    </aside>

    <!-- Contenu principal -->
    <main class="main-content">

      <header class="content-header">
        <div>
          <h1>Tableau de bord</h1>
          <p class="header-subtitle">Mairie de Villejuif — Espace administrateur</p>
        </div>
        <div class="header-actions">
          <button class="btn-export">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Exporter
          </button>
        </div>
      </header>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Signalements totaux</span>
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
          </div>
          <span class="stat-value">142</span>
          <span class="stat-trend up">+18 ce mois</span>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">En attente</span>
            <div class="stat-icon orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
          </div>
          <span class="stat-value">12</span>
          <span class="stat-trend warn">À traiter</span>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Résolus ce mois</span>
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <span class="stat-value">34</span>
          <span class="stat-trend up">+5 vs mois dernier</span>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Utilisateurs actifs</span>
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
          <span class="stat-value">89</span>
          <span class="stat-trend up">+12 cette semaine</span>
        </div>
      </div>

      <!-- Signalements récents -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">Signalements récents</h2>
          <a href="#" class="see-all">Voir tout</a>
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
            <tbody>
              <tr>
                <td class="td-title">Nid de poule</td>
                <td class="td-loc">Rue de la République</td>
                <td class="td-user">Ibrahim B.</td>
                <td class="td-date">13 avr. 2026</td>
                <td><span class="status-badge orange">En cours</span></td>
                <td><button class="btn-action">Gérer</button></td>
              </tr>
              <tr>
                <td class="td-title">Graffiti sur mur</td>
                <td class="td-loc">Place de la Mairie</td>
                <td class="td-user">Yasmine D.</td>
                <td class="td-date">12 avr. 2026</td>
                <td><span class="status-badge muted">En attente</span></td>
                <td><button class="btn-action">Gérer</button></td>
              </tr>
              <tr>
                <td class="td-title">Lampadaire hors service</td>
                <td class="td-loc">Av. du Président Wilson</td>
                <td class="td-user">Marc L.</td>
                <td class="td-date">11 avr. 2026</td>
                <td><span class="status-badge green">Résolu</span></td>
                <td><button class="btn-action">Voir</button></td>
              </tr>
              <tr>
                <td class="td-title">Dépôt sauvage</td>
                <td class="td-loc">Parc Paul Hochart</td>
                <td class="td-user">Fatima K.</td>
                <td class="td-date">10 avr. 2026</td>
                <td><span class="status-badge muted">En attente</span></td>
                <td><button class="btn-action">Gérer</button></td>
              </tr>
              <tr>
                <td class="td-title">Canalisations bouchées</td>
                <td class="td-loc">Rue Pasteur</td>
                <td class="td-user">Antoine R.</td>
                <td class="td-date">9 avr. 2026</td>
                <td><span class="status-badge orange">En cours</span></td>
                <td><button class="btn-action">Gérer</button></td>
              </tr>
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
  position: relative;
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
  color: rgba(255, 255, 255, 0.35);
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
  margin-top: 1rem;
}

.sidebar-logout:hover {
  background-color: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.7);
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

.btn-export:hover {
  border-color: var(--color-primary);
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

.stat-trend {
  font-size: 0.75rem;
  font-weight: 500;
}

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

.see-all {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.see-all:hover {
  text-decoration: underline;
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

.reports-table tbody tr:last-child {
  border-bottom: none;
}

.reports-table tbody tr:hover {
  background-color: rgba(4, 44, 83, 0.02);
}

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

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
}

.status-badge.orange { background-color: rgba(224, 90, 43, 0.1); color: #e05a2b; }
.status-badge.green  { background-color: rgba(43, 158, 90, 0.1); color: #2b9e5a; }
.status-badge.muted  { background-color: rgba(4, 44, 83, 0.07); color: var(--color-text-muted); }

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
}

.btn-action:hover {
  border-color: var(--color-primary);
  background-color: rgba(4, 44, 83, 0.04);
}
</style>
