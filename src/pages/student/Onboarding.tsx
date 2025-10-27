import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { PixelMascot } from '@/components/PixelMascot';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { addDays } from 'date-fns';

const careers = [
  { name: 'Doctor', emoji: '👨‍⚕️' },
  { name: 'Teacher', emoji: '👨‍🏫' },
  { name: 'Engineer', emoji: '👷' },
  { name: 'Pilot', emoji: '✈️' },
  { name: 'Artist', emoji: '🎨' },
  { name: 'Musician', emoji: '🎵' },
  { name: 'Footballer', emoji: '⚽' },
  { name: 'Scientist', emoji: '🔬' },
  { name: 'Chef', emoji: '👨‍🍳' },
  { name: 'Lawyer', emoji: '⚖️' },
];

const hobbies = [
  'Reading stories',
  'Playing football',
  'Drawing/Painting',
  'Singing',
  'Dancing',
  'Playing video games',
  'Watching cartoons',
  'Cooking',
  'Building things',
  'Playing with friends',
  'Swimming',
  'Writing stories',
  'Solving puzzles',
  'Riding bicycle',
  'Playing basketball',
];

const StudentOnboarding = () => {
  const [step, setStep] = useState(1);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, schoolId } = useAuth();
  const navigate = useNavigate();
  const { schoolSlug } = useParams();

  const handleCareerSelect = (career: string) => {
    setSelectedCareer(career);
    setTimeout(() => setStep(2), 500);
  };

  const toggleHobby = (hobby: string) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== hobby));
    } else if (selectedHobbies.length < 3) {
      setSelectedHobbies([...selectedHobbies, hobby]);
    } else {
      toast.info('You can only select up to 3 hobbies!');
    }
  };

  const handleComplete = async () => {
    if (selectedHobbies.length === 0) {
      toast.error('Please select at least one hobby!');
      return;
    }

    setLoading(true);
    try {
      if (!user || !schoolId) throw new Error('Not authenticated');

      const trialStart = new Date();
      const trialExpiry = addDays(trialStart, 7);

      await updateDoc(doc(db, `schools/${schoolId}/users`, user.uid), {
        career: selectedCareer,
        hobbies: selectedHobbies,
        requiresOnboarding: false,
        trialStartDate: serverTimestamp(),
        trialExpiryDate: trialExpiry,
        subscriptionStatus: 'trial',
      });

      setStep(3);
      
      // Celebration!
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#FFB347'],
      });

      setTimeout(() => {
        navigate(`/${schoolSlug}/pupil/learn`);
      }, 3000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pixel-yellow/30 via-background to-pixel-purple/30 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center"
            >
              <PixelMascot size="lg" mood="excited" className="mx-auto mb-6" />
              <h1 className="text-4xl mb-4 text-pixel-blue">Hello! 🎉</h1>
              <h2 className="text-2xl font-fredoka mb-12">What do you want to become when you grow up?</h2>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {careers.map((career, index) => (
                  <motion.button
                    key={career.name}
                    className="pixel-card hover:shadow-pixel-lg text-center p-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCareerSelect(career.name)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="text-5xl mb-3">{career.emoji}</div>
                    <p className="font-fredoka text-sm">{career.name}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="text-center"
            >
              <PixelMascot size="lg" mood="happy" className="mx-auto mb-6" />
              <h2 className="text-2xl font-fredoka mb-4">What do you love doing?</h2>
              <p className="text-lg font-fredoka text-muted-foreground mb-8">
                Pick up to 3 things you enjoy! ({selectedHobbies.length}/3 selected)
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {hobbies.map((hobby, index) => (
                  <motion.button
                    key={hobby}
                    className={`pixel-card text-center p-4 relative ${
                      selectedHobbies.includes(hobby) ? 'bg-gradient-to-br from-pixel-green/30 to-pixel-green/10' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleHobby(hobby)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    {selectedHobbies.includes(hobby) && (
                      <CheckCircle2 className="absolute top-2 right-2 text-status-active" size={24} />
                    )}
                    <p className="font-fredoka text-sm">{hobby}</p>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={handleComplete}
                className="pixel-button success text-xl px-12"
                disabled={loading || selectedHobbies.length === 0}
              >
                {loading ? 'Setting up...' : "Let's Start Learning! 🚀"}
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <PixelMascot size="lg" mood="excited" className="mx-auto mb-6 animate-float" />
              <motion.h1
                className="text-5xl mb-6 text-pixel-blue"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              >
                Awesome! 🎉
              </motion.h1>
              <p className="text-2xl font-fredoka mb-4">You're all set!</p>
              <p className="text-xl font-fredoka text-muted-foreground">
                Your AI teacher is ready to help you learn anything!
              </p>
              <div className="mt-8">
                <div className="pixel-loader mx-auto" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentOnboarding;
