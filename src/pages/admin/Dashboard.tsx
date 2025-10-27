import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc, arrayUnion } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CLASSES, STATES } from '@/lib/constants';
import { sendEmail, generateParentWelcomeEmail } from '@/lib/resend';
import { toast } from 'sonner';
import { Student, Parent } from '@/types';
import { add } from 'date-fns';

export default function AdminDashboard() {
  const { schoolSlug } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [schoolData, setSchoolData] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Student form state
  const [studentForm, setStudentForm] = useState({
    firstName: '',
    lastName: '',
    age: 5,
    class: 'Primary 1',
    gender: 'Male',
    parentType: 'new',
    existingParentId: '',
    parentFirstName: '',
    parentLastName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    state: 'Lagos',
    zipcode: ''
  });

  useEffect(() => {
    fetchSchoolData();
    fetchStudents();
    fetchParents();
  }, [schoolSlug]);

  const fetchSchoolData = async () => {
    const schoolsQuery = query(collection(db, 'schools'), where('slug', '==', schoolSlug));
    const snapshot = await getDocs(schoolsQuery);
    if (!snapshot.empty) {
      setSchoolData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }
  };

  const fetchStudents = async () => {
    if (!schoolSlug) return;
    const schoolsQuery = query(collection(db, 'schools'), where('slug', '==', schoolSlug));
    const schoolSnapshot = await getDocs(schoolsQuery);
    if (!schoolSnapshot.empty) {
      const schoolId = schoolSnapshot.docs[0].id;
      const studentsQuery = query(collection(db, `schools/${schoolId}/users`), where('role', '==', 'student'));
      const snapshot = await getDocs(studentsQuery);
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    }
  };

  const fetchParents = async () => {
    if (!schoolSlug) return;
    const schoolsQuery = query(collection(db, 'schools'), where('slug', '==', schoolSlug));
    const schoolSnapshot = await getDocs(schoolsQuery);
    if (!schoolSnapshot.empty) {
      const schoolId = schoolSnapshot.docs[0].id;
      const parentsQuery = query(collection(db, `schools/${schoolId}/users`), where('role', '==', 'parent'));
      const snapshot = await getDocs(parentsQuery);
      setParents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Parent)));
    }
  };

  const generatePassword = (name: string) => {
    return `${name}${Math.floor(Math.random() * 10000)}!`;
  };

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const studentEmail = `${studentForm.firstName.toLowerCase()}.${studentForm.lastName.toLowerCase()}@${schoolSlug}.socialdev.ng`;
      const studentPassword = generatePassword(studentForm.firstName);

      // Create student in Firebase Auth
      const studentCredential = await createUserWithEmailAndPassword(auth, studentEmail, studentPassword);
      
      // Create student document
      const studentData = {
        role: 'student',
        firstName: studentForm.firstName,
        lastName: studentForm.lastName,
        fullName: `${studentForm.firstName} ${studentForm.lastName}`,
        age: studentForm.age,
        class: studentForm.class,
        gender: studentForm.gender,
        email: studentEmail,
        parentId: '',
        trialStartDate: null,
        trialExpiryDate: null,
        subscriptionStatus: 'pending_trial',
        subscriptionExpiryDate: null,
        totalTimeSpent: 0,
        lastLogin: null,
        createdAt: new Date(),
        career: null,
        hobbies: [],
        chatHistory: []
      };

      const studentDocRef = await addDoc(collection(db, `schools/${schoolData.id}/users`), studentData);

      let parentId = studentForm.existingParentId;
      let parentEmail = '';
      let parentPassword = '';

      if (studentForm.parentType === 'new') {
        // Create new parent
        parentEmail = studentForm.parentEmail;
        parentPassword = generatePassword(studentForm.parentFirstName);

        const parentCredential = await createUserWithEmailAndPassword(auth, parentEmail, parentPassword);
        
        const parentData = {
          role: 'parent',
          firstName: studentForm.parentFirstName,
          lastName: studentForm.parentLastName,
          fullName: `${studentForm.parentFirstName} ${studentForm.parentLastName}`,
          email: parentEmail,
          phone: studentForm.parentPhone,
          address: studentForm.address,
          state: studentForm.state,
          zipcode: studentForm.zipcode,
          country: 'Nigeria',
          childrenIds: [studentDocRef.id],
          paymentHistory: [],
          lastLogin: null,
          createdAt: new Date()
        };

        const parentDocRef = await addDoc(collection(db, `schools/${schoolData.id}/users`), parentData);
        parentId = parentDocRef.id;
      } else {
        // Link to existing parent
        await updateDoc(doc(db, `schools/${schoolData.id}/users`, parentId), {
          childrenIds: arrayUnion(studentDocRef.id)
        });
        const parentDoc = await getDoc(doc(db, `schools/${schoolData.id}/users`, parentId));
        const parentData = parentDoc.data();
        parentEmail = parentData?.email || '';
      }

      // Update student with parentId
      await updateDoc(doc(db, `schools/${schoolData.id}/users`, studentDocRef.id), {
        parentId
      });

      // Send welcome email to parent
      if (studentForm.parentType === 'new') {
        await sendEmail({
          to: parentEmail,
          subject: `Welcome to SocialDev Nigeria - ${studentForm.firstName}'s Learning Journey Begins!`,
          html: generateParentWelcomeEmail(
            `${studentForm.parentFirstName} ${studentForm.parentLastName}`,
            parentEmail,
            parentPassword,
            `${studentForm.firstName} ${studentForm.lastName}`,
            studentEmail,
            studentPassword,
            schoolData.name,
            schoolSlug || ''
          )
        });
      }

      toast.success('Student created successfully! Welcome email sent to parent.');
      setShowStudentModal(false);
      fetchStudents();
      fetchParents();
      
      // Reset form
      setStudentForm({
        firstName: '',
        lastName: '',
        age: 5,
        class: 'Primary 1',
        gender: 'Male',
        parentType: 'new',
        existingParentId: '',
        parentFirstName: '',
        parentLastName: '',
        parentEmail: '',
        parentPhone: '',
        address: '',
        state: 'Lagos',
        zipcode: ''
      });
    } catch (error: any) {
      console.error('Error creating student:', error);
      toast.error(error.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top Navigation */}
      <nav className="bg-white border-b-4 border-border-dark p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {schoolData?.logoUrl && (
              <img src={schoolData.logoUrl} alt="School Logo" className="w-12 h-12 rounded-lg border-4 border-border-dark" />
            )}
            <h1 className="pixel-text text-xl">{schoolData?.name}</h1>
          </div>
          <Button onClick={logout} className="pixel-button danger">
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="parents">Parents</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="pixel-card">
                <h3 className="text-2xl font-bold text-pixel-blue">{students.length}</h3>
                <p className="text-text-light">Total Students</p>
              </div>
              <div className="pixel-card">
                <h3 className="text-2xl font-bold text-pixel-green">{parents.length}</h3>
                <p className="text-text-light">Total Parents</p>
              </div>
              <div className="pixel-card">
                <h3 className="text-2xl font-bold text-pixel-yellow">{students.filter(s => s.subscriptionStatus === 'active').length}</h3>
                <p className="text-text-light">Active Subscriptions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Button onClick={() => setShowStudentModal(true)} className="pixel-button primary min-h-[80px] text-lg">
                + Create Student
              </Button>
              <Button onClick={() => navigate(`/${schoolSlug}/admin/parents/create`)} className="pixel-button success min-h-[80px] text-lg">
                + Create Parent
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="students">
            <div className="flex justify-between items-center mb-6">
              <h2 className="pixel-text text-2xl">Students</h2>
              <Button onClick={() => setShowStudentModal(true)} className="pixel-button primary">
                + Create Student
              </Button>
            </div>

            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student.id} className="pixel-card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{student.fullName}</h3>
                      <p className="text-text-light">{student.class} • Age {student.age}</p>
                      <p className="text-sm text-text-light mt-2">{student.email}</p>
                      <div className="mt-2">
                        <span className={`pixel-badge ${student.subscriptionStatus === 'active' ? '' : student.subscriptionStatus === 'trial' ? 'trial' : 'expired'}`}>
                          {student.subscriptionStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="parents">
            <h2 className="pixel-text text-2xl mb-6">Parents</h2>
            <div className="grid gap-4">
              {parents.map((parent) => (
                <div key={parent.id} className="pixel-card">
                  <h3 className="text-xl font-bold">{parent.fullName}</h3>
                  <p className="text-text-light">{parent.email}</p>
                  <p className="text-text-light">{parent.phone}</p>
                  <p className="text-sm mt-2">Children: {parent.childrenIds?.length || 0}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Student Modal */}
      <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="pixel-text text-2xl">Create New Student</DialogTitle>
          </DialogHeader>

          <form onSubmit={createStudent} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">First Name</label>
                <Input
                  value={studentForm.firstName}
                  onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Last Name</label>
                <Input
                  value={studentForm.lastName}
                  onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Age</label>
                <Input
                  type="number"
                  min="5"
                  max="10"
                  value={studentForm.age}
                  onChange={(e) => setStudentForm({ ...studentForm, age: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Class</label>
                <Select value={studentForm.class} onValueChange={(value) => setStudentForm({ ...studentForm, class: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Gender</label>
                <Select value={studentForm.gender} onValueChange={(value) => setStudentForm({ ...studentForm, gender: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t-4 border-border-dark pt-4">
              <h3 className="font-bold mb-4">Parent Information</h3>
              
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="parentType"
                    checked={studentForm.parentType === 'new'}
                    onChange={() => setStudentForm({ ...studentForm, parentType: 'new' })}
                  />
                  Create New Parent
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="parentType"
                    checked={studentForm.parentType === 'existing'}
                    onChange={() => setStudentForm({ ...studentForm, parentType: 'existing' })}
                  />
                  Link to Existing Parent
                </label>
              </div>

              {studentForm.parentType === 'new' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Parent First Name</label>
                      <Input
                        value={studentForm.parentFirstName}
                        onChange={(e) => setStudentForm({ ...studentForm, parentFirstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Parent Last Name</label>
                      <Input
                        value={studentForm.parentLastName}
                        onChange={(e) => setStudentForm({ ...studentForm, parentLastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Parent Email</label>
                      <Input
                        type="email"
                        value={studentForm.parentEmail}
                        onChange={(e) => setStudentForm({ ...studentForm, parentEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Parent Phone</label>
                      <Input
                        value={studentForm.parentPhone}
                        onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-semibold mb-2">Address</label>
                    <Input
                      value={studentForm.address}
                      onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">State</label>
                      <Select value={studentForm.state} onValueChange={(value) => setStudentForm({ ...studentForm, state: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Zipcode</label>
                      <Input
                        value={studentForm.zipcode}
                        onChange={(e) => setStudentForm({ ...studentForm, zipcode: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold mb-2">Select Parent</label>
                  <Select value={studentForm.existingParentId} onValueChange={(value) => setStudentForm({ ...studentForm, existingParentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a parent" />
                    </SelectTrigger>
                    <SelectContent>
                      {parents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id || ''}>
                          {parent.fullName} ({parent.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button type="submit" disabled={loading} className="pixel-button primary w-full">
              {loading ? 'Creating...' : 'Create Student'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
