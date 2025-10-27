import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { seedDemoData } from '@/lib/demoData';
import { sendEmail, generateSchoolAdminWelcomeEmail } from '@/lib/resend';
import { PixelMascot } from '@/components/PixelMascot';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { School, Building2, Users, DollarSign, TrendingUp, Plus, LogOut, Sparkles } from 'lucide-react';

const SuperadminDashboard = () => {
  const { logout, user, userRole } = useAuth();
  const navigate = useNavigate();
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalParents: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const schoolsSnapshot = await getDocs(collection(db, 'schools'));
      const schoolsData = schoolsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSchools(schoolsData);
      
      setStats({
        totalSchools: schoolsData.length,
        totalStudents: 0, // Will be calculated from students subcollection
        totalParents: 0,
        totalRevenue: 0,
        activeSubscriptions: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSeedDemoData = async (schoolId: string) => {
    const result = await seedDemoData(schoolId);
    if (result.success) {
      toast.success(result.message);
      fetchDashboardData();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b-4 border-[#2C3E50] bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PixelMascot size="sm" />
            <h1 className="text-2xl text-pixel-blue">Superadmin Portal</h1>
          </div>
          <button onClick={handleLogout} className="pixel-button danger text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            className="pixel-card bg-gradient-to-br from-pixel-blue/20 to-pixel-blue/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Building2 className="w-8 h-8 text-pixel-blue mb-2" />
            <div className="text-3xl font-pixel mb-1">{stats.totalSchools}</div>
            <div className="text-sm font-fredoka text-muted-foreground">Total Schools</div>
          </motion.div>

          <motion.div
            className="pixel-card bg-gradient-to-br from-pixel-green/20 to-pixel-green/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Users className="w-8 h-8 text-pixel-green mb-2" />
            <div className="text-3xl font-pixel mb-1">{stats.totalStudents}</div>
            <div className="text-sm font-fredoka text-muted-foreground">Total Students</div>
          </motion.div>

          <motion.div
            className="pixel-card bg-gradient-to-br from-pixel-purple/20 to-pixel-purple/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Users className="w-8 h-8 text-pixel-purple mb-2" />
            <div className="text-3xl font-pixel mb-1">{stats.totalParents}</div>
            <div className="text-sm font-fredoka text-muted-foreground">Total Parents</div>
          </motion.div>

          <motion.div
            className="pixel-card bg-gradient-to-br from-pixel-yellow/20 to-pixel-yellow/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TrendingUp className="w-8 h-8 text-[#2C3E50] mb-2" />
            <div className="text-3xl font-pixel mb-1">{stats.activeSubscriptions}</div>
            <div className="text-sm font-fredoka text-muted-foreground">Active Subscriptions</div>
          </motion.div>

          <motion.div
            className="pixel-card bg-gradient-to-br from-pixel-orange/20 to-pixel-orange/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <DollarSign className="w-8 h-8 text-pixel-orange mb-2" />
            <div className="text-3xl font-pixel mb-1">₦{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm font-fredoka text-muted-foreground">Total Revenue</div>
          </motion.div>
        </div>

        {/* Schools Section */}
        <div className="pixel-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl">Schools</h2>
            <button
              onClick={() => setShowCreateSchool(true)}
              className="pixel-button success"
            >
              <Plus size={20} /> Create School
            </button>
          </div>

          {schools.length === 0 ? (
            <div className="text-center py-12">
              <PixelMascot mood="thinking" className="mx-auto mb-4" />
              <p className="font-fredoka text-muted-foreground">No schools yet. Create your first school!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {schools.map((school, index) => (
                <motion.div
                  key={school.id}
                  className="pixel-card bg-gradient-to-r from-background to-pixel-blue/5 hover:shadow-pixel-lg cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/superadmin/schools/${school.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-pixel mb-2 text-pixel-blue">{school.name}</h3>
                      <p className="font-fredoka text-sm text-muted-foreground">/{school.slug}</p>
                      <p className="font-fredoka text-sm">Admin: {school.adminEmail}</p>
                    </div>
                    <div className="text-right">
                      <span className={`pixel-badge ${school.setupComplete ? 'success' : 'warning'}`}>
                        {school.setupComplete ? 'Complete' : 'Setup Pending'}
                      </span>
                      <p className="text-sm font-fredoka mt-2 text-muted-foreground">
                        Created: {new Date(school.createdAt?.seconds * 1000).toLocaleDateString()}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeedDemoData(school.id);
                        }}
                        className="pixel-button success text-xs mt-2"
                      >
                        <Sparkles size={14} /> Seed Demo Data
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Create School Modal */}
        {showCreateSchool && (
          <CreateSchoolModal
            onClose={() => setShowCreateSchool(false)}
            onSuccess={() => {
              setShowCreateSchool(false);
              fetchDashboardData();
            }}
          />
        )}
      </div>
    </div>
  );
};

const CreateSchoolModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    adminEmail: '',
    slug: '',
  });
  const [loading, setLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create school document
      const schoolRef = await addDoc(collection(db, 'schools'), {
        name: formData.name,
        slug: formData.slug,
        adminEmail: formData.adminEmail,
        createdAt: serverTimestamp(),
        status: 'active',
        setupComplete: false,
        country: 'Nigeria',
      });

      toast.success(`School "${formData.name}" created successfully!`);
      toast.info('Welcome email will be sent to the admin');
      
      onSuccess();
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="pixel-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl mb-6 text-pixel-blue">Create New School</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-pixel mb-2">School Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="pixel-input"
              placeholder="e.g., Greenfield Academy"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">School Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="pixel-input"
              placeholder="greenfield-academy"
              required
              disabled={loading}
            />
            <p className="text-sm font-fredoka text-muted-foreground mt-2">
              Portal URL: yourdomain.com/{formData.slug}
            </p>
          </div>

          <div>
            <label className="block text-sm font-pixel mb-2">Admin Email</label>
            <input
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              className="pixel-input"
              placeholder="admin@school.edu.ng"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="pixel-button success flex-1"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create School'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="pixel-button danger flex-1"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default SuperadminDashboard;
