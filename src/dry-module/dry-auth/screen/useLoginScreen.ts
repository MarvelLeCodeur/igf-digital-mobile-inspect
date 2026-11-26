import { useState } from 'react';
import { authService } from '../service/dry-auth.service';

interface LoginState {
    busy:boolean;
    setBusy:(value:boolean) => void;
    setError:(value:string) => void;
    onConnected:(token:string) => void;
}

export function useLoginScreen({ busy,setBusy,setError,onConnected }: LoginState) {
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [remember,setRemember] = useState(false);

    async function connect() {
        if (busy || !username.trim() || !password) return;
        setBusy(true);
        setError('');
        try {
            const credentials = await authService.signInLocal(username,password);
            onConnected(credentials);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : 'Connexion locale indisponible.');
        } finally {
            setPassword('');
            setBusy(false);
        }
    }

    return { remember,setRemember,username,setUsername,password,setPassword,connect };
}
