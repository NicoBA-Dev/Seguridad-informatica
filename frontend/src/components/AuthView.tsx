import React, { useState } from 'react';
import { CyberBackground } from './auth/CyberBackground';
import { LoginView } from './auth/LoginView';
import { RegisterView } from './auth/RegisterView';

interface AuthViewProps {
    onSuccess: (userData: any, mensaje: string) => void;
    onError: (mensaje: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, onError }) => {
    const [isRegister, setIsRegister] = useState(false);

    return (
        <div style={{
            position: 'relative',
            minHeight: '82vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflow: 'hidden'
        }}>
            <CyberBackground />

            {!isRegister ? (
                <LoginView
                    onSwitchToRegister={() => setIsRegister(true)}
                    onSuccess={onSuccess}
                    onError={onError}
                />
            ) : (
                <RegisterView
                    onSwitchToLogin={() => setIsRegister(false)}
                    onSuccess={onSuccess}
                    onError={onError}
                />
            )}
        </div>
    );
};