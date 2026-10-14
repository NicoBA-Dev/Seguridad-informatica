import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Header } from './components/Header';
import { AuthView } from './components/AuthView';
import { KeysView } from './components/KeysView';
import { SignView } from './components/SignView';
import { VerifyView } from './components/VerifyView';
import { HeroLanding } from './components/HeroLanding';

// Configuración de alerta que se cierra sola con barra de tiempo
const showNotify = (icon: 'success' | 'error' | 'info', title: string, text?: string) => {
  Swal.fire({
    icon,
    title,
    text,
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    background: '#0d1117',
    color: '#f8fafc',
    iconColor: icon === 'success' ? '#22c55e' : '#ef233c',
    customClass: {
      popup: 'border border-[#1e2430] shadow-2xl'
    }
  });
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'auth' | 'keys' | 'sign' | 'verify'>('home');

  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('usuario_firmante');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        if (u.perfil?.llave_publica) setPublicKey(u.perfil.llave_publica);
      } catch { }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario_firmante');
    setCurrentUser(null);
    setPublicKey('');
    setPrivateKey('');
    setActiveTab('home');
    showNotify('info', 'Sesión Finalizada', 'Has cerrado tu sesión correctamente.');
  };

  const handleLoginSuccess = (userData: any, texto: string) => {
    if (userData) {
      setCurrentUser(userData);
      localStorage.setItem('usuario_firmante', JSON.stringify(userData));
      if (userData.perfil?.llave_publica) setPublicKey(userData.perfil.llave_publica);
      setActiveTab('keys');
    }
    showNotify('success', '¡Acceso Autorizado!', texto);
  };

  const handleKeysGenerated = (pub: string, priv: string) => {
    setPublicKey(pub);
    setPrivateKey(priv);
    if (currentUser) {
      const updated = { ...currentUser, perfil: { ...currentUser.perfil, llave_publica: pub } };
      setCurrentUser(updated);
      localStorage.setItem('usuario_firmante', JSON.stringify(updated));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06070a', color: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        onNavigate={tab => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: 1080,
        margin: '0 auto',
        padding: activeTab === 'home' ? '0' : '40px 24px'
      }}>
        {activeTab === 'home' && (
          <HeroLanding
            onStart={() => setActiveTab(currentUser ? 'sign' : 'auth')}
            onVerify={() => setActiveTab('verify')}
          />
        )}

        {activeTab === 'auth' && (
          <AuthView
            onSuccess={handleLoginSuccess}
            onError={txt => showNotify('error', 'Error de Autenticación', txt)}
          />
        )}

        {activeTab === 'keys' && (
          <KeysView
            currentUser={currentUser}
            publicKey={publicKey}
            privateKey={privateKey}
            onKeysGenerated={handleKeysGenerated}
            onSuccess={txt => showNotify('success', 'Operación Criptográfica', txt)}
            onError={txt => showNotify('error', 'Error en Llaves', txt)}
          />
        )}

        {activeTab === 'sign' && (
          <SignView
            currentUser={currentUser}
            privateKey={privateKey}
            onPrivateKeyChange={setPrivateKey}
            onSuccess={txt => showNotify('success', 'Documento Firmado', txt)}
            onError={txt => showNotify('error', 'Error al Firmar', txt)}
          />
        )}

        {activeTab === 'verify' && (
          <VerifyView
            onError={txt => showNotify('error', 'Fallo de Validación', txt)}
          />
        )}
      </main>
    </div>
  );
}