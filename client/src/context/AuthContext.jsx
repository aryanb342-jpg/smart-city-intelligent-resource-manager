import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            try {
                // simple simulated decode since jwt-decode takes more time and we just store user locally if needed
                // In a real app we parse token directly or fetch user profile. 
                const rawPayload = JSON.parse(atob(token.split('.')[1]));
                setUser({ id: rawPayload.id, role: rawPayload.role });
            } catch (e) {
                console.error("Invalid token", e);
            }
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
