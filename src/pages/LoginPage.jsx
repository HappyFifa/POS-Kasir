import React, { useState } from 'react';
import Card from '../components/Card';
import { AlertCircle } from 'lucide-react';
import { loginUser } from '../utils/auth';
import { CONFIG, ERROR_MESSAGES } from '../utils/constants';

const LoginPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.username || !formData.password) {
            setError(ERROR_MESSAGES.REQUIRED_FIELDS);
            return;
        }

        setIsLoading(true);
        
        try {
            const result = await loginUser(formData.username, formData.password);
            
            if (result.success) {
                onLogin();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(ERROR_MESSAGES.UNKNOWN_ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-neutral-900">
            <div className="w-full max-w-sm">
                <h1 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">{CONFIG.APP_NAME}</h1>
                <p className="text-neutral-400 text-center mb-10">Selamat datang kembali, silakan login.</p>
                <Card className="p-8">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500">
                                <AlertCircle size={20} />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Username</label>
                            <input 
                                type="text" 
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white"
                                placeholder="Masukkan username"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                            <input 
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-white"
                                placeholder="Masukkan password"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isLoading ? 'Memproses...' : 'Login'}
                        </button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;