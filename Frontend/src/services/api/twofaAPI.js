import axiosInstance from "./axiosInstance";

export const twofaAPI = {
  setup: () => axiosInstance.post("/auth/perfil/setup"),
  verify2FA: (data) => axiosInstance.post("/auth/perfil/login", data),
  verify: (codigo) => axiosInstance.post("/auth/perfil/verify", { codigo }),
  disable: () => axiosInstance.post("/auth/perfil/disable"),
};
