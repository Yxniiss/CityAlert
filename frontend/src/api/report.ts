import { apiFetch } from './index'

export function getReports() {
    return apiFetch("/reports?limit=1000", { method: "GET" })
}

export function getMyReports() {
    return apiFetch("/my-reports", { method: "GET" })
}

export function createReport(formData: FormData) {
    const token = localStorage.getItem('token')
    return fetch('http://localhost:3000/reports', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    }).then(r => r.json())
}

export function updateReport(id: number, formData: FormData) {
    const token = localStorage.getItem('token')
    return fetch(`http://localhost:3000/reports/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    }).then(r => r.json())
}

export function deleteReport(id: number) {
    return apiFetch(`/reports/${id}`, { method: "DELETE" })
}





