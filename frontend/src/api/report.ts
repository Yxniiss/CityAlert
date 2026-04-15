import { apiFetch } from './index'

export function getReports() {
    return apiFetch("/reports", {
        method: "GET"
    })
}

export function createReport(data : { title: string, description: string, latitude: number, longitude: number, image_url: string}){
    return apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify(data)
    })
}



