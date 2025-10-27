import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Student, Payment } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function ParentDashboard() {
  const { schoolSlug } = useParams();
  const { user, logout } = useAuth();
  const [schoolData, setSchoolData] = useState<any>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [children, setChildren] = useState<Student[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [user, schoolSlug]);

  const fetchData = async () => {
    if (!user || !schoolSlug) return;

    // Fetch school
    const schoolsQuery = query(collection(db, 'schools'), where('slug', '==', schoolSlug));
    const schoolSnapshot = await getDocs(schoolsQuery);
    if (!schoolSnapshot.empty) {
      const schoolId = schoolSnapshot.docs[0].id;
      setSchoolData({ id: schoolId, ...schoolSnapshot.docs[0].data() });

      // Fetch parent data
      const parentsQuery = query(
        collection(db, `schools/${schoolId}/users`),
        where('role', '==', 'parent'),
        where('email', '==', user.email)
      );
      const parentSnapshot = await getDocs(parentsQuery);
      if (!parentSnapshot.empty) {
        const parentDoc = parentSnapshot.docs[0];
        const parentInfo = { id: parentDoc.id, ...parentDoc.data() } as any;
        setParentData(parentInfo);

        // Fetch children
        if (parentInfo.childrenIds && Array.isArray(parentInfo.childrenIds) && parentInfo.childrenIds.length > 0) {
          const childrenPromises = parentInfo.childrenIds.map((childId: string) =>
            getDoc(doc(db, `schools/${schoolId}/users`, childId))
          );
          const childrenDocs = await Promise.all(childrenPromises);
          const childrenData = childrenDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() } as Student));
          setChildren(childrenData);
        }
      }
    }
  };

  const handlePayment = () => {
    if (selectedChildren.length === 0) {
      toast.error('Please select at least one child');
      return;
    }

    // Integrate Paystack
    const handler = (window as any).PaystackPop.setup({
      key: 'pk_test_xxxxx', // Replace with actual Paystack public key
      email: parentData.email,
      amount: 2000 * selectedChildren.length * 100, // In kobo
      currency: 'NGN',
      ref: 'SD-' + Math.random().toString(36).substr(2, 9),
      metadata: {
        parentId: parentData.id,
        schoolId: schoolData.id,
        childrenIds: selectedChildren
      },
      callback: function(response: any) {
        toast.success('Payment successful!');
        setShowPaymentModal(false);
        fetchData();
      },
      onClose: function() {
        toast.error('Payment cancelled');
      }
    });
    handler.openIframe();
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildren(prev =>
      prev.includes(childId)
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const getSubscriptionBadge = (status: string) => {
    if (status === 'active') return <span className="pixel-badge">Active ✓</span>;
    if (status === 'trial') return <span className="pixel-badge trial">Trial</span>;
    return <span className="pixel-badge expired">Expired</span>;
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
            <div>
              <h1 className="pixel-text text-xl">{schoolData?.name}</h1>
              <p className="text-sm text-text-light">Parent Dashboard</p>
            </div>
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
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="school">School Info</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <h2 className="pixel-text text-2xl mb-6">My Children</h2>

            {children.length === 0 ? (
              <div className="pixel-card text-center p-8">
                <p className="text-text-light">No children enrolled yet.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {children.map((child) => (
                  <div key={child.id} className="pixel-card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{child.fullName}</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="pixel-badge">{child.class}</span>
                          <span className="text-text-light">Age {child.age}</span>
                          {getSubscriptionBadge(child.subscriptionStatus || 'expired')}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-text-light">Total Time This Week</p>
                            <p className="text-xl font-bold text-pixel-blue">
                              {Math.floor((child.totalTimeSpent || 0) / 60)}h {(child.totalTimeSpent || 0) % 60}m
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-light">Last Active</p>
                            <p className="text-xl font-bold text-pixel-green">
                              {child.lastLogin ? formatDistanceToNow(
                                child.lastLogin instanceof Date ? child.lastLogin : (child.lastLogin as any).toDate(), 
                                { addSuffix: true }
                              ) : 'Never'}
                            </p>
                          </div>
                        </div>

                        {(child.subscriptionStatus === 'expired' || child.subscriptionStatus === 'pending_trial') && (
                          <Button
                            onClick={() => {
                              setSelectedChildren([child.id || '']);
                              setShowPaymentModal(true);
                            }}
                            className="pixel-button primary mt-4"
                          >
                            Pay Subscription (₦2,000)
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {children.some(c => c.subscriptionStatus === 'expired' || c.subscriptionStatus === 'pending_trial') && (
              <Button
                onClick={() => {
                  setSelectedChildren(children.filter(c => c.subscriptionStatus !== 'active').map(c => c.id || ''));
                  setShowPaymentModal(true);
                }}
                className="pixel-button success w-full mt-6"
              >
                Pay for Multiple Children
              </Button>
            )}
          </TabsContent>

          <TabsContent value="payments">
            <h2 className="pixel-text text-2xl mb-6">Payment History</h2>
            {parentData?.paymentHistory && parentData.paymentHistory.length > 0 ? (
              <div className="grid gap-4">
                {parentData.paymentHistory.map((payment: Payment, index: number) => (
                  <div key={index} className="pixel-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">₦{payment.amount}</p>
                        <p className="text-sm text-text-light">
                          {payment.date ? (payment.date instanceof Date ? payment.date : (payment.date as any).toDate()).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm mt-2">Children: {payment.childrenCovered?.join(', ')}</p>
                      </div>
                      <span className="pixel-badge">Success</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pixel-card text-center p-8">
                <p className="text-text-light">No payment history yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="school">
            <h2 className="pixel-text text-2xl mb-6">School Information</h2>
            {schoolData && (
              <div className="pixel-card">
                {schoolData.logoUrl && (
                  <img src={schoolData.logoUrl} alt="School Logo" className="w-32 h-32 mb-4 rounded-lg border-4 border-border-dark" />
                )}
                <h3 className="text-2xl font-bold mb-4">{schoolData.name}</h3>
                <div className="space-y-2">
                  <p><strong>Address:</strong> {schoolData.address}</p>
                  <p><strong>Phone:</strong> {schoolData.phone}</p>
                  <p><strong>Email:</strong> {schoolData.adminEmail}</p>
                  <p><strong>State:</strong> {schoolData.state}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="pixel-text text-2xl">Pay Subscription</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-lg font-semibold">Select children to pay for:</p>
            
            {children.filter(c => c.subscriptionStatus !== 'active').map((child) => (
              <label key={child.id} className="flex items-center gap-3 p-4 border-4 border-border-dark rounded-lg cursor-pointer hover:bg-bg-primary">
                <input
                  type="checkbox"
                  checked={selectedChildren.includes(child.id || '')}
                  onChange={() => toggleChildSelection(child.id || '')}
                  className="w-5 h-5"
                />
                <span className="font-semibold">{child.fullName}</span>
              </label>
            ))}

            <div className="border-t-4 border-border-dark pt-4">
              <p className="text-xl font-bold">Total: ₦{2000 * selectedChildren.length}</p>
              <p className="text-sm text-text-light">₦2,000 × {selectedChildren.length} child(ren) for 3 months</p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={selectedChildren.length === 0}
              className="pixel-button primary w-full"
            >
              Proceed to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
