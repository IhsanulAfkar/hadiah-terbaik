import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(username, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
                setPassword('');
            }
        } catch {
            setError('Username atau password salah');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-slate-900">Selamat Datang</h2>
                <p className="text-slate-500 mt-2">Silakan masuk ke akun Anda untuk melanjutkan</p>
            </div>

            {error && (
                <Alert variant="destructive" title="Gagal Masuk" className="mb-6">
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Username / NIP"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username atau NIP"
                    disabled={isLoading}
                    required
                />

                <div className="space-y-1">
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={isLoading}
                        required
                    />
                    <div className="flex justify-end">
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Lupa password?
                        </a>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        isLoading={isLoading}
                    >
                        Masuk Aplikasi
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Login;
