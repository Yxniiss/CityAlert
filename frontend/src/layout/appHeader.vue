<template>
  <header class="app-header">
    <!-- Logo -->
    <div class="header-logo">
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

    <!-- Nav droite -->
    <nav class="header-nav">
      <div class="nav-divider"></div>
      <a href="#" class="nav-link">Signaler un problème</a>
      <a href="#" class="nav-btn">Mon espace</a>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #042C53;
  padding: 0 2.5rem;
  height: 68px;
  width: 100%;
}

/* Logo */
.header-logo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-decoration: none;
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

/* Nav droite */
.header-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-divider {
  width: 1px;
  height: 40px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.3) 0px,
    rgba(255, 255, 255, 0.3) 4px,
    transparent 4px,
    transparent 8px
  );
  margin-right: 0.5rem;
}

.nav-link {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-btn {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  text-decoration: none;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  padding: 0.45rem 1.25rem;
  white-space: nowrap;
  transition: background-color 0.2s, border-color 0.2s;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}
</style>
