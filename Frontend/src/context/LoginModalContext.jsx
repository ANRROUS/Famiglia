import { createContext, useContext, useState } from 'react';

const LoginModalContext = createContext();

export const LoginModalProvider = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  const showLoginModal = (path = null) => {
    setIsLoginModalOpen(true);
    setRedirectPath(path);
  };

  const hideLoginModal = () => {
    setIsLoginModalOpen(false);
    setRedirectPath(null);
  };

  return (
    <LoginModalContext.Provider value={{ 
      isLoginModalOpen, 
      showLoginModal, 
      hideLoginModal,
      redirectPath 
    }}>
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
};