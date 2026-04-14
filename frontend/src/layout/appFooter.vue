<template>
  <footer class="app-footer">
    <div class="footer-top">
      <div class="footer-logo">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="22" y2="22" />
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-name">SIGNALIZ</span>
          <span class="logo-subtitle">Ville de Villejuif</span>
        </div>
      </div>
      <p class="footer-description">
        Un service numérique de la mairie pour améliorer le<br>cadre de vie des habitants.
      </p>
    </div>

    <div class="footer-divider"></div>

    <div class="footer-bottom">
      <span class="footer-copyright">© 2026 Mairie de Villejuif. Tous droits réservés.</span>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #042C53;
  padding: 2.5rem 2.5rem 1.5rem;
  width: 100%;
}

/* Top */
.footer-top {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background-color: #B8892A;
  border-radius: 10px;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 22px;
  height: 22px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-name {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.footer-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* Divider */
.footer-divider {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.15);
  margin-bottom: 1.25rem;
}

/* Bottom */
.footer-bottom {
  display: flex;
  align-items: center;
}

.footer-copyright {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
