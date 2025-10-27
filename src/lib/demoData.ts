import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { addDays } from 'date-fns';

export const seedDemoData = async (schoolId: string) => {
  try {
    // Create demo students
    const students = [
      {
        firstName: 'Chidi',
        lastName: 'Okafor',
        age: 7,
        class: 'Primary 2',
        gender: 'Male',
        career: 'Pilot',
        hobbies: ['Reading stories', 'Playing football', 'Drawing/Painting'],
      },
      {
        firstName: 'Amina',
        lastName: 'Bello',
        age: 6,
        class: 'Primary 1',
        gender: 'Female',
        career: 'Doctor',
        hobbies: ['Singing', 'Reading stories', 'Playing with friends'],
      },
      {
        firstName: 'Emeka',
        lastName: 'Nwosu',
        age: 8,
        class: 'Primary 3',
        gender: 'Male',
        career: 'Engineer',
        hobbies: ['Building things', 'Solving puzzles', 'Playing video games'],
      },
      {
        firstName: 'Blessing',
        lastName: 'Adeyemi',
        age: 9,
        class: 'Primary 4',
        gender: 'Female',
        career: 'Artist',
        hobbies: ['Drawing/Painting', 'Dancing', 'Watching cartoons'],
      },
    ];

    // Create demo parent
    const parentId = `parent_${Date.now()}`;
    await setDoc(doc(db, `schools/${schoolId}/users`, parentId), {
      role: 'parent',
      firstName: 'Grace',
      lastName: 'Okafor',
      fullName: 'Grace Okafor',
      email: 'grace.okafor@email.com',
      phone: '08012345678',
      address: '12 Admiralty Way, Lekki',
      state: 'Lagos',
      zipcode: '101245',
      country: 'Nigeria',
      childrenIds: [],
      paymentHistory: [],
      lastLogin: null,
      createdAt: serverTimestamp(),
    });

    // Create students
    for (const student of students) {
      const studentId = `student_${student.firstName.toLowerCase()}_${Date.now()}`;
      const email = `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@demo.socialdev.ng`;
      
      await setDoc(doc(db, `schools/${schoolId}/users`, studentId), {
        role: 'student',
        ...student,
        fullName: `${student.firstName} ${student.lastName}`,
        email,
        parentId,
        trialStartDate: serverTimestamp(),
        trialExpiryDate: addDays(new Date(), 5),
        subscriptionStatus: 'trial',
        subscriptionExpiryDate: null,
        totalTimeSpent: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        chatHistory: [],
      });

      // Create sample chat for first student
      if (student.firstName === 'Chidi') {
        const chatId = await addDoc(collection(db, `schools/${schoolId}/chats`), {
          studentId,
          studentName: `${student.firstName} ${student.lastName}`,
          startedAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          messages: [
            {
              role: 'student',
              text: 'How do airplanes fly?',
              timestamp: serverTimestamp(),
            },
            {
              role: 'ai',
              text: 'Great question, Chidi! Before I explain, can you tell me what happens when you throw a ball up in the air?',
              timestamp: serverTimestamp(),
            },
            {
              role: 'student',
              text: 'It comes back down',
              timestamp: serverTimestamp(),
            },
            {
              role: 'ai',
              text: 'Exactly! Now, airplanes need to push against the air to stay up. Can you guess what part of the airplane does the pushing?',
              timestamp: serverTimestamp(),
            },
            {
              role: 'student',
              text: 'The wings?',
              timestamp: serverTimestamp(),
            },
            {
              role: 'ai',
              text: 'Perfect, Chidi! The wings are very special. When the airplane moves fast, air flows over and under the wings in different ways. This creates a force that lifts the airplane up!',
              timestamp: serverTimestamp(),
            },
          ],
          firstMessagePreview: 'How do airplanes fly?',
          totalMessages: 6,
          durationMinutes: 8,
        });
      }
    }

    return { success: true, message: 'Demo data created successfully!' };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return { success: false, message: 'Failed to create demo data' };
  }
};
