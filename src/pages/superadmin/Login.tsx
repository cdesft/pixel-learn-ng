import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PixelMascot } from '@/components/PixelMascot';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SUPERADMIN_USERNAME = "superadmin@socialdev.ng";
const SUPERADMIN_PASSWORD = "SuperSecure2025!";

const SuperadminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email !== SUPERADMIN_USERNAME || password !== SUPERADMIN_PASSWORD) {
      toast.error('Invalid superadmin credentials');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/superadmin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        className="pixel-card max-w-md w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <PixelMascot size="lg" className="mx-auto mb-6" />
          <h1 className="text-2xl mb-2 text-pixel-blue">Superadmin</h1>
          <p className="text-muted-foreground text-base font-fredoka">System Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-pixel mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pixel-input"
              placeholder="admin@socialdev.ng"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pixel-input"
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="pixel-button w-full"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Access System'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SuperadminLogin;
