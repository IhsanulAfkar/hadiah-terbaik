import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { Eye, EyeOff } from 'lucide-react';
import { TrustcaptchaComponent } from "@trustcomponent/trustcaptcha-react";
import { toast } from 'react-toastify';
const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const trustcaptchaRef = useRef(null);
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if (!verificationResult) {
        //     toast.error('Invalid Captcha')
        //     return
        // }

        setError('');
        setIsLoading(true);

        try {
            const result = await login({
                username, password,
                captcha: verificationResult
            });
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
    function solved(verificationToken) {
        console.log(`Verification-token: ${verificationToken}`);
        setVerificationResult(verificationToken)
    }

    function failed(error) {
        console.error(error);
    }


    const resetCaptcha = () => {
        trustcaptchaRef.current.reset();
        setForm({ message: '', verificationToken: null });
        setVerificationResult(null);
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
                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={isLoading}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Lupa password?
                        </a>
                    </div>
                </div>

                {/* <TrustcaptchaComponent
                    ref={trustcaptchaRef}
                    sitekey="fd049106-ed60-4af5-9b8f-6fc5dbe7ec22"
                    language="id"
                    theme="light"
                    tokenFieldName="tc-verification-token"
                    onCaptchaSolved={event => solved(event.detail)}
                    onCaptchaFailed={event => failed(event.detail)}
                ></TrustcaptchaComponent> */}
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
