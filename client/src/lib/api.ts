import axios, { AxiosInstance } from "axios";

const configOptions = {
    baseURL: "/api/v1",
    withCredentials: true
}

const api: AxiosInstance = axios.create(configOptions)

api.interceptors.response.use((res) => res, async (error) => {
    const isUnAuthError = error.response?.status === 401
    const originalReq = error.config

    if (!isUnAuthError || originalReq._retry || originalReq.url?.includes("/auth/rotate")) {
        return Promise.reject(error)
    }

    originalReq._retry = true

    await api.post("/auth/rotate")
    return api(originalReq)
})

export default api
