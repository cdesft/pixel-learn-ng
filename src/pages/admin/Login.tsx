import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PixelMascot } from '@/components/PixelMascot';

export default function AdminLogin() {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);

  // Fetch school data on mount
  useState(() => {
    const fetchSchool = async () => {
      const schoolsSnapshot = await getDoc(doc(db, 'schools', schoolSlug || ''));
      if (schoolsSnapshot.exists()) {
        setSchoolData(schoolsSnapshot.data());
      }
    };
    fetchSchool();
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      
      if (idTokenResult.claims.role !== 'schoolAdmin') {
        toast.error('Access denied. School admin credentials required.');
        await auth.signOut();
        return;
      }

      toast.success('Welcome back!');
      
      // Check if password change required or setup incomplete
      if (idTokenResult.claims.requiresPasswordChange) {
        navigate(`/${schoolSlug}/admin/reset-password`);
      } else if (schoolData && !schoolData.setupComplete) {
        navigate(`/${schoolSlug}/admin/setup`);
      } else {
        navigate(`/${schoolSlug}/admin/dashboard`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Invalid email or password');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pixel-blue via-pixel-purple to-pixel-green">
      <div className="pixel-card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          {schoolData?.logoUrl && (
            <img src={schoolData.logoUrl} alt="School Logo" className="w-24 h-24 mb-4 rounded-lg border-4 border-border-dark" />
          )}
          <h1 className="pixel-text text-2xl mb-2">{schoolData?.name || 'School'}</h1>
          <p className="text-lg font-semibold text-text-light">Admin Portal</p>
        </div>

        <div className="flex justify-center mb-6">
          <PixelMascot mood="happy" size="md" />
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Email Address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.com"
              required
              className="pixel-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="pixel-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="pixel-button primary w-full"
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-pixel-blue hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}
