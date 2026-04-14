<template>
  <section class="hero">

    <!-- Colonne gauche -->
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
          <span class="stat-number">1 284</span>
          <span class="stat-label">Délai moyen de réponse</span>
        </div>
      </div>
    </div>

    <!-- Colonne droite -->
    <div class="hero-right">

      <div class="report-card">
        <div class="card-header">
          <span class="card-badge voirie">Voirie</span>
          <span class="card-id">#1230</span>
        </div>
        <p class="card-desc">Nid de poule dangereux au carrefour de la rue Pasteur, profond d'environ 15cm.</p>
        <div class="card-img-placeholder">
          <span>1 photo jointe</span>
        </div>
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
            Rue Pasteur, Villejuif
          </span>
          <span class="card-votes">▲ 12 signalements</span>
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
            Rue Pasteur, Villejuif
          </span>
          <span class="card-votes">▲ 12 signalements</span>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 5rem 4rem;
  min-height: calc(100vh - 68px);
  background-color: var(--color-background);
}

/* Gauche */
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

.hero-title em {
  font-style: italic;
}

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

.btn-primary:hover {
  opacity: 0.85;
}

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

.btn-outline:hover {
  background-color: rgba(4, 44, 83, 0.06);
}

/* Stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.stat-number {
  font-family: var(--font-title);
  font-size: 1.75rem;
  color: var(--color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 36px;
  background-color: var(--color-border);
}

/* Droite — cartes */
.hero-right {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.report-card {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-shadow: 0 2px 8px rgba(4, 44, 83, 0.07);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.card-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.card-badge.voirie {
  background-color: #FFF3CD;
  color: #7A5200;
}

.card-badge.eclairage {
  background-color: #D4EDDA;
  color: #155724;
}

.card-id {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.card-desc {
  font-size: 0.85rem;
  color: var(--color-text);
  line-height: 1.5;
}

.card-img-placeholder {
  background-color: #f0f4f8;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-location {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.card-votes {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
