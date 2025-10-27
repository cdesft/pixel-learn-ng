import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { PixelMascot } from '@/components/PixelMascot';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Send, Plus, LogOut, Clock } from 'lucide-react';

interface Message {
  role: 'student' | 'ai';
  text: string;
  timestamp: Date;
}

const StudentLearn = () => {
  const { logout, user, schoolId } = useAuth();
  const navigate = useNavigate();
  const { schoolSlug } = useParams();
  
  const [studentData, setStudentData] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !schoolId) {
      navigate(`/${schoolSlug}/pupil/login`);
      return;
    }
    fetchStudentData();
  }, [user, schoolId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchStudentData = async () => {
    if (!user || !schoolId) return;
    
    try {
      const studentDoc = await getDoc(doc(db, `schools/${schoolId}/users`, user.uid));
      if (studentDoc.exists()) {
        setStudentData({ id: studentDoc.id, ...studentDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load your profile');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading || !studentData) return;

    const userMessage: Message = {
      role: 'student',
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      // Import and call Gemini API directly
      const { generateAIResponse } = await import('@/lib/gemini');
      
      const aiResponseText = await generateAIResponse(userMessage.text, {
        name: studentData.firstName,
        age: studentData.age,
        class: studentData.class,
        career: studentData.career || 'Doctor',
        hobbies: studentData.hobbies || ['Reading'],
      });
      
      const aiMessage: Message = {
        role: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Save to Firestore
      if (!currentChatId) {
        const chatRef = await addDoc(collection(db, `schools/${schoolId}/chats`), {
          studentId: studentData.id,
          studentName: studentData.fullName,
          startedAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          messages: [
            { role: userMessage.role, text: userMessage.text, timestamp: serverTimestamp() },
            { role: aiMessage.role, text: aiMessage.text, timestamp: serverTimestamp() },
          ],
          firstMessagePreview: userMessage.text,
          totalMessages: 2,
          durationMinutes: 0,
        });
        setCurrentChatId(chatRef.id);
      } else {
        // Update existing chat
        await updateDoc(doc(db, `schools/${schoolId}/chats`, currentChatId), {
          lastMessageAt: serverTimestamp(),
          messages: [
            ...messages.map(m => ({ role: m.role, text: m.text, timestamp: m.timestamp })),
            { role: userMessage.role, text: userMessage.text, timestamp: serverTimestamp() },
            { role: aiMessage.role, text: aiMessage.text, timestamp: serverTimestamp() },
          ],
          totalMessages: increment(2),
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Fallback AI response
      const fallbackMessage: Message = {
        role: 'ai',
        text: `Great question, ${studentData.firstName}! Let me help you think about that. Can you tell me what you already know about this topic?`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!studentData) return { status: 'unknown', text: 'Loading...', color: 'bg-muted' };
    
    const status = studentData.subscriptionStatus;
    if (status === 'active') {
      return { status: 'active', text: 'Learning Pass Active ✓', color: 'bg-status-active' };
    } else if (status === 'trial') {
      const daysLeft = studentData.trialExpiryDate 
        ? Math.ceil((new Date(studentData.trialExpiryDate.seconds * 1000).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;
      return { status: 'trial', text: `Free Trial - ${daysLeft} days left ⏱️`, color: 'bg-status-trial' };
    } else {
      return { status: 'expired', text: 'Trial Ended - Ask parent to subscribe', color: 'bg-status-expired' };
    }
  };

  const subscriptionInfo = getSubscriptionStatus();
  const isBlocked = subscriptionInfo.status === 'expired';

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="pixel-loader" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <nav className="border-b-4 border-[#2C3E50] bg-white">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelMascot size="sm" mood="happy" />
            <div>
              <h1 className="text-lg font-pixel text-pixel-blue">{studentData.firstName}</h1>
              <p className="text-xs font-fredoka text-muted-foreground">{studentData.class}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`pixel-badge ${subscriptionInfo.status}`}>
              {subscriptionInfo.text}
            </span>
            <button onClick={logout} className="pixel-button danger text-xs p-3">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 && !isBlocked ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-2xl text-center">
              <PixelMascot size="lg" mood="excited" className="mx-auto mb-6" />
              <h2 className="text-3xl mb-4 text-pixel-blue">
                Hello {studentData.firstName}! 🎉
              </h2>
              <p className="text-xl font-fredoka mb-8">
                What would you like to learn today?
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <motion.button
                  className="pixel-card hover:shadow-pixel-lg text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput('How do airplanes fly?')}
                >
                  <p className="font-fredoka">How do airplanes fly? ✈️</p>
                </motion.button>
                <motion.button
                  className="pixel-card hover:shadow-pixel-lg text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput('Why is the sky blue?')}
                >
                  <p className="font-fredoka">Why is the sky blue? 🌤️</p>
                </motion.button>
                <motion.button
                  className="pixel-card hover:shadow-pixel-lg text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput('How do plants grow?')}
                >
                  <p className="font-fredoka">How do plants grow? 🌱</p>
                </motion.button>
                <motion.button
                  className="pixel-card hover:shadow-pixel-lg text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setInput('What makes thunder?')}
                >
                  <p className="font-fredoka">What makes thunder? ⚡</p>
                </motion.button>
              </div>
            </div>
          </div>
        ) : isBlocked ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="pixel-card max-w-md text-center">
              <PixelMascot mood="thinking" className="mx-auto mb-6" />
              <h2 className="text-2xl mb-4 text-pixel-red">Oh no! Your learning pass has ended.</h2>
              <p className="font-fredoka text-lg mb-6">
                Please ask your parent to subscribe so we can keep learning together!
              </p>
              <p className="font-fredoka text-muted-foreground">
                Parent Email: {studentData.parentEmail || 'Check with your parent'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'ai' && (
                      <PixelMascot size="sm" mood="happy" className="mr-3 flex-shrink-0" />
                    )}
                    <div className={`chat-bubble ${msg.role}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <div className="flex justify-start">
                  <PixelMascot size="sm" mood="thinking" className="mr-3" />
                  <div className="chat-bubble ai">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        {!isBlocked && (
          <div className="border-t-4 border-[#2C3E50] bg-white p-4">
            <div className="max-w-4xl mx-auto flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pixel-input flex-1"
                placeholder="Ask me anything! Like: How do birds fly?"
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                className="pixel-button success"
                disabled={loading || !input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLearn;
