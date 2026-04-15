<script setup lang="ts">
    import {ref} from 'vue'
    import { register } from '@/api/auth'
    import { useRouter } from 'vue-router'

    const firstName = ref('')
    const lastName = ref('')
    const email = ref('')
    const password = ref('')
    const confirm = ref('')
    const error = ref('')

    const router = useRouter()


    async function Submit(){
        console.log('Submit appelé')
        error.value = ""
        if(password.value != confirm.value){
            error.value = "Les mots de passe ne correspondent pas"
            return
        }

        if(password.value.length < 8){
            error.value = "Mot de passe trop petit"
            return
        }
        try{
          const result = await register({
            email: email.value,
            password: password.value,
            nom: lastName.value,
            prenom: firstName.value
          })

          if (result.error) {
            error.value = result.error
          } else {
            // Rediriger vers la page de connexion ou la page d'accueil
            router.push("/login")
          }
        } catch (err) {
          error.value = `Une erreur est survenue lors de l'inscription. error: ${err}`
        }

        email.value = ""
        password.value = ""
        confirm.value = ""
        lastName.value = ""
        firstName.value = ""
    }
    
</script>

<template>
  <div class="register-page">

    <!-- Panneau gauche -->
    <div class="register-left">

      <div class="left-content">
        <h1>Rejoignez<br>la communauté.</h1>
        <p>Signalez, suivez et améliorez votre cadre de vie avec les autres habitants de Villejuif.</p>
      </div>
    </div>

    <!-- Panneau droite -->
    <div class="register-right">
      <div class="form-wrapper">
        <h2>Créer un compte</h2>
        <p class="form-subtitle">Déjà inscrit ? <a href="/login">Se connecter</a></p>

        <form class="form" @submit.prevent="Submit">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom</label>
              <input v-model="firstName" id="firstName" type="text" placeholder="Ibrahim" required />
            </div>
            <div class="form-group">
              <label for="lastName">Nom</label>
              <input v-model="lastName" id="lastName" type="text" placeholder="Bakaran" required />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Adresse e-mail</label>
            <input v-model="email" id="email" type="email" placeholder="ibrahim@villejuif.fr" required />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input v-model="password" id="password" type="password" placeholder="••••••••" required />
          </div>

          <div class="form-group">
            <label for="confirm">Confirmer le mot de passe</label>
            <input v-model="confirm" id="confirm" type="password" placeholder="••••••••" required />
          </div>

          <p v-if="error">{{ error }}</p>

          <button  type="submit" class="btn-submit">Créer mon compte</button>
        </form>
      </div>
    </div>

  </div>
</template>



<style scoped>
.register-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: calc(100vh - 68px);
}

/* Gauche */
.register-left {
  background-color: var(--color-primary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2.5rem 3rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: auto;
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

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.08em;
  line-height: 1.2;
}

.brand-city {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.2;
}

.left-content {
  margin-bottom: 4rem;
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
.register-right {
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
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
