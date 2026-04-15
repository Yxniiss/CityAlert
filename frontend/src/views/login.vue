<script setup lang="ts">
  import { login } from '@/api/auth'
  import { useRouter } from 'vue-router'
  import { ref } from 'vue'

  const router = useRouter()
  const email = ref('')
  const password = ref('')
  const error = ref('')

  async function Submit(){
    error.value = ""
    console.log('Submit appelé')
    try{
      console.log('Tentative de connexion avec email:', email.value)
      const result = await login({
        email : email.value,
        password: password.value
      })

      if(result.error){
        error.value = "Identifiant incorrect"
      } else {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        router.push('/UserSpace')
      }
    } catch (err){
      error.value  = `Une erreur est survenue lors de l'inscription.`
    }

    email.value = ""
    password.value = ""
  }
</script>

<template>
  <div class="login-page">

    <!-- Panneau gauche -->
    <div class="login-left">
      <div class="left-content">
        <h1>Bon retour<br>parmi nous.</h1>
        <p>Suivez vos signalements et restez informé des actions de la mairie de Villejuif.</p>
      </div>
    </div>

    <!-- Panneau droite -->
    <div class="login-right">
      <div class="form-wrapper">
        <h2>Se connecter</h2>
        <p class="form-subtitle">Pas encore de compte ? <a href="/register">S'inscrire</a></p>

        <form class="form" @submit.prevent="Submit">
          <div class="form-group">
            <label for="email">Adresse e-mail</label>
            <input v-model="email" id="email" type="email" placeholder="ibrahim@villejuif.fr" />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input v-model="password" id="password" type="password" placeholder="••••••••" />
            <a href="#" class="forgot">Mot de passe oublié ?</a>
          </div>
          <p v-if="error">{{ error }}</p>
          <button type="submit" class="btn-submit">Se connecter</button>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
.login-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 68px);
}

/* Gauche */
.login-left {
  background-color: var(--color-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.5rem 3rem;
}

.left-content h1 {
  font-family: var(--font-title);
  font-size: 2.75rem;
  color: #ffffff;
  line-height: 1.15;
  margin-bottom: 1rem;
}

.left-content p {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
  max-width: 340px;
}

/* Droite */
.login-right {
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

.form-wrapper h2 {
  font-family: var(--font-title);
  font-size: 1.75rem;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.form-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1.75rem;
}

.form-subtitle a {
  color: var(--color-primary);
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
}

input {
  background-color: #ffffff;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  padding: 0.65rem 0.875rem;
  font-size: 0.875rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.2s;
}

input::placeholder {
  color: rgba(4, 44, 83, 0.3);
}

input:focus {
  border-color: var(--color-primary);
}

.forgot {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  align-self: flex-end;
}

.forgot:hover {
  color: var(--color-primary);
}

.btn-submit {
  background-color: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0.8rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 0.25rem;
}

.btn-submit:hover {
  opacity: 0.85;
}
</style>
