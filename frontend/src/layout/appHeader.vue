<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

function readPayload() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const payload = ref(readPayload());

// Sync when route changes (covers login redirect and logout redirect)
watch(() => route.path, () => {
  payload.value = readPayload();
});

const isLoggedIn = computed(() => payload.value !== null);
const isAdmin = computed(() => payload.value?.role === 'admin');

const userName = computed(() => {
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return user.prenom || '';
  } catch {
    return '';
  }
});

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  payload.value = null;
  router.push('/');
};
</script>

<template>
  <header class="app-header">

    <!-- Logo -->
    <div class="header-logo" @click="router.push('/')" style="cursor:pointer">
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

      <!-- État non connecté -->
      <template v-if="!isLoggedIn">
        <a class="nav-link" @click.prevent="router.push('/register')">S'inscrire</a>
        <div class="nav-divider"></div>
        <button class="nav-btn" @click="router.push('/login')">Se connecter</button>
      </template>

      <!-- État connecté -->
      <template v-else>
        <span v-if="userName" class="nav-user">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {{ userName }}
        </span>

        <div class="nav-divider"></div>

        <button class="nav-link-btn" @click="router.push('/UserSpace')">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          Mon espace
        </button>

        <button v-if="isAdmin" class="nav-btn admin" @click="router.push('/adminSpace')">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Admin
        </button>

        <button class="nav-logout" @click="handleLogout" title="Se déconnecter">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </template>

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
  box-sizing: border-box;
}

/* ── Logo ── */
.header-logo {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-decoration: none;
  user-select: none;
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

.logo-icon svg { width: 22px; height: 22px; }

.logo-text { display: flex; flex-direction: column; }

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

/* ── Nav ── */
.header-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-divider {
  width: 1px;
  height: 36px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.3) 0px,
    rgba(255, 255, 255, 0.3) 4px,
    transparent 4px,
    transparent 8px
  );
  margin: 0 0.25rem;
}

/* Nom de l'utilisateur */
.nav-user {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  white-space: nowrap;
}

/* Lien texte (S'inscrire, Mon espace) */
.nav-link,
.nav-link-btn {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.25rem;
  border-radius: 6px;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link-btn:hover {
  color: #ffffff;
}

/* Bouton primaire (Se connecter) */
.nav-btn {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: none;
  text-decoration: none;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  padding: 0.45rem 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background-color 0.2s, border-color 0.2s;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #ffffff;
}

/* Bouton Admin (accent orange) */
.nav-btn.admin {
  border-color: #e05a2b;
  color: #e05a2b;
}

.nav-btn.admin:hover {
  background-color: rgba(224, 90, 43, 0.12);
  border-color: #e05a2b;
  color: #ff7a47;
}

/* Bouton déconnexion (icône seule) */
.nav-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.4rem;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.nav-logout:hover {
  border-color: rgba(255, 255, 255, 0.6);
  color: #ffffff;
}
</style>
