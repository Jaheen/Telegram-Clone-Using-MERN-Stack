export const SERVER_URL = "http://192.168.225.128:8080"

export const getServerAuthToken = () => localStorage.getItem("server-auth-token")
export const setServerAuthToken = (serverAuthToken) => localStorage.setItem("server-auth-token", serverAuthToken)