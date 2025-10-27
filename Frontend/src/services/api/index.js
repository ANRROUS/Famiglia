import API from "./axiosInstance.js";

export const ProductosAPI= {
    getAll: () => API.get('/productos'),
    getById: (id) => API.get(`/productos/${id}`),
    getByCategoria: (id_categoria) => API.get(`/productos/categoria/${id_categoria}`)
}

export const categoriaAPI = {
    getAll: () => API.get('/categorias'),
    getById: (id) => API.get(`/categorias/${id}`)
}

export const authAPI = {
    register: (userData) => API.post('/auth/register', userData),
    login: (credentials) => API.post('/auth/login', credentials),
    logout: () => API.post('/auth/logout'),
    getPerfil: () => API.get('/auth/perfil')
}

export const pagoAPI = {
    procesarPago: (datosPago) => API.post('/api/pedido/pago/procesar', datosPago)
}

export const pedidoAPI = {
    getHistorialPedidos: () => API.get('/pedidos/historial/mis-pedidos')
}

export const preferencesAPI = {
    getHistorialTests: () => API.get('/api/preferences/history')
}






