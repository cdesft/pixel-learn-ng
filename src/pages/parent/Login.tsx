import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PixelMascot } from '@/components/PixelMascot';

export default function ParentLogin() {
  const { schoolSlug } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    const fetchSchool = async () => {
      const schoolsQuery = query(collection(db, 'schools'), where('slug', '==', schoolSlug));
      const snapshot = await getDocs(schoolsQuery);
      if (!snapshot.empty) {
        setSchoolData(snapshot.docs[0].data());
      }
    };
    fetchSchool();
  }, [schoolSlug]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idTokenResult = await userCredential.user.getIdTokenResult();
      
      if (idTokenResult.claims.role !== 'parent') {
        toast.error('Access denied. Parent credentials required.');
        await auth.signOut();
        return;
      }

      toast.success('Welcome back!');
      
      if (idTokenResult.claims.requiresPasswordChange) {
        navigate(`/${schoolSlug}/parent/reset-password`);
      } else {
        navigate(`/${schoolSlug}/parent/dashboard`);
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pixel-red via-pixel-orange to-pixel-yellow">
      <div className="pixel-card w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          {schoolData?.logoUrl && (
            <img src={schoolData.logoUrl} alt="School Logo" className="w-24 h-24 mb-4 rounded-lg border-4 border-border-dark" />
          )}
          <h1 className="pixel-text text-2xl mb-2">{schoolData?.name || 'School'}</h1>
          <p className="text-lg font-semibold text-text-light">Parent Portal</p>
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
              placeholder="parent@email.com"
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
          <a href="#" className="text-sm text-pixel-red hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}
