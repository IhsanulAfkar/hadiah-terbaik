import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';
// import { jwtDecode } from 'jwt-decode'; // We might not need this if we store user object from login response, but safer to decode or rely on 'me' endpoint.
// For simplicity in this phase, we rely on the login response 'data.user'.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            return (storedUser && token) ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse user from local storage', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    });
    const [loading] = useState(false);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Login failed', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
