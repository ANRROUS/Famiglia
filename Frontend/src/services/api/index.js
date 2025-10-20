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



