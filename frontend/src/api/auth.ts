import { apiFetch } from './index'

export function register(data : { email: string, password: string, nom: string,prenom: string}){
    return apiFetch("/register", {
        method: "POST",
        body: JSON.stringify(data)
    })
}

export function login(data : { email: string, password: string}){
    return apiFetch("/login", {
        method: "POST",
        body: JSON.stringify(data)
    })
}


