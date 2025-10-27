import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PixelMascot } from '@/components/PixelMascot';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const StudentLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { schoolSlug } = useParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      
      // Celebrate login!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#FFB347'],
      });
      
      navigate(`/${schoolSlug}/pupil/learn`);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pixel-blue/20 via-background to-pixel-green/20">
      <motion.div 
        className="pixel-card max-w-md w-full"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <PixelMascot size="lg" mood="excited" className="mx-auto mb-6" />
          <h1 className="text-3xl mb-3 text-pixel-blue">Let's Learn! 🎉</h1>
          <p className="text-lg font-fredoka text-muted-foreground">
            Welcome back, young learner!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-pixel mb-2">Username</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pixel-input"
              placeholder="your.name@school.socialdev.ng"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pixel-input"
              placeholder="Enter your password"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="pixel-button success w-full text-lg"
            disabled={loading}
          >
            {loading ? 'Loading...' : "Let's Go! 🚀"}
          </button>
        </form>

        <p className="text-center text-sm font-fredoka text-muted-foreground mt-6">
          Need help? Ask your teacher or parent!
        </p>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
