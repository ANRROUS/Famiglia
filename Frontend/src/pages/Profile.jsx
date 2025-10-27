import { useSelector } from 'react-redux';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Profile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Box className="w-full min-h-screen bg-[#FFF5F0] py-12 px-4">
      <Box className="max-w-4xl mx-auto">
        <Paper elevation={3} className="p-8 rounded-lg">
          {/* Header */}
          <Box className="flex items-center gap-6 mb-8 pb-6 border-b border-gray-200">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#8b3e3e',
                fontSize: 48
              }}
            >
              {user?.url_imagen ? (
                <img src={user.url_imagen} alt={user.nombre} className="w-full h-full object-cover" />
              ) : (
                <AccountCircleIcon sx={{ fontSize: 80 }} />
              )}
            </Avatar>
            <Box>
              <Typography variant="h4" className="font-bold text-[#8b3e3e] mb-2">
                {user?.nombre || 'Usuario'}
              </Typography>
              <Typography variant="body1" className="text-gray-600">
                {user?.correo || 'correo@ejemplo.com'}
              </Typography>
            </Box>
          </Box>

          {/* Información del perfil */}
          <Box className="space-y-6">
            <Box>
              <Typography variant="h6" className="font-semibold text-[#8b3e3e] mb-4">
                Información Personal
              </Typography>
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Box className="bg-[#FFF5F0] p-4 rounded-lg">
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Nombre
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-800">
                    {user?.nombre || 'No disponible'}
                  </Typography>
                </Box>
                <Box className="bg-[#FFF5F0] p-4 rounded-lg">
                  <Typography variant="body2" className="text-gray-500 mb-1">
                    Correo Electrónico
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-800">
                    {user?.correo || 'No disponible'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Typography variant="body2" className="text-blue-800">
                💡 <strong>Próximamente:</strong> Podrás editar tu perfil, cambiar tu contraseña y ver tu historial de pedidos.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
