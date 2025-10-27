import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PixelMascot } from '@/components/PixelMascot';
import { ArrowRight, GraduationCap, Heart, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <PixelMascot size="lg" mood="excited" className="mx-auto mb-8" />
          
          <h1 className="text-4xl md:text-6xl mb-6 text-pixel-blue">
            SocialDev Nigeria
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 font-fredoka text-foreground max-w-3xl mx-auto">
            AI-Powered Learning Adventures for Nigerian Children
          </p>

          <motion.button
            onClick={() => navigate('/superadmin/access/login')}
            className="pixel-button text-lg px-12"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started <ArrowRight className="inline ml-2" />
          </motion.button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            className="pixel-card text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-pixel-blue rounded-2xl border-4 border-[#2C3E50] flex items-center justify-center">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h3 className="text-xl mb-3">Learn Through Questions</h3>
            <p className="font-fredoka text-muted-foreground">
              Our AI teacher guides children to discover answers themselves through fun conversations
            </p>
          </motion.div>

          <motion.div
            className="pixel-card text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-pixel-green rounded-2xl border-4 border-[#2C3E50] flex items-center justify-center">
              <Heart size={32} className="text-white" />
            </div>
            <h3 className="text-xl mb-3">Nigerian Context</h3>
            <p className="font-fredoka text-muted-foreground">
              Learning examples use familiar Nigerian culture, food, and everyday life experiences
            </p>
          </motion.div>

          <motion.div
            className="pixel-card text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-pixel-yellow rounded-2xl border-4 border-[#2C3E50] flex items-center justify-center">
              <Zap size={32} className="text-[#2C3E50]" />
            </div>
            <h3 className="text-xl mb-3">Personalized Learning</h3>
            <p className="font-fredoka text-muted-foreground">
              Lessons adapt to each child's interests, hobbies, and career aspirations
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl mb-6">Simple, Affordable Pricing</h2>
          
          <div className="pixel-card max-w-md mx-auto bg-gradient-to-br from-pixel-blue/10 to-pixel-green/10">
            <div className="text-5xl font-pixel mb-4 text-pixel-blue">₦2,000</div>
            <p className="text-xl font-fredoka mb-4">Per child for 3 months</p>
            <div className="space-y-2 text-left font-fredoka">
              <p className="flex items-center gap-2">✓ 7-day free trial</p>
              <p className="flex items-center gap-2">✓ Unlimited AI conversations</p>
              <p className="flex items-center gap-2">✓ Progress tracking for parents</p>
              <p className="flex items-center gap-2">✓ Nigerian curriculum aligned</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t-4 border-[#2C3E50] py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-fredoka text-muted-foreground">
            © 2025 SocialDev Nigeria. Making learning fun for every Nigerian child.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
