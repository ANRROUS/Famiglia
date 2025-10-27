import { Snackbar, Alert } from '@mui/material';

export default function NotificationSnackbar({ open, message, onClose, severity = 'success' }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity={severity}
        sx={{
          backgroundColor: severity === 'success' ? '#ffe5e5' : undefined,
          color: severity === 'success' ? '#771919' : undefined,
          '& .MuiAlert-icon': {
            color: severity === 'success' ? '#771919' : undefined
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}