import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { LoginPage } from './components/LoginPage';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { StatCards } from './components/StatCards';
import { BookingForm } from './components/BookingForm';
import { BookingTable } from './components/BookingTable';
import { MapPanel } from './components/MapPanel';

type Tab = '대시보드' | '예약목록' | '예약추가' | '상태관리' | '위치확인';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('대시보드');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMapBooking, setSelectedMapBooking] = useState<any>(null);

  const tabs: Tab[] = ['대시보드', '예약목록', '예약추가', '상태관리', '위치확인'];

  async function checkAdminStatus(userEmail: string) {
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('email')
        .eq('email', userEmail)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsAdmin(!!data);
    } catch (err) {
      console.error('관리자 확인 실패:', err);
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        checkAdminStatus(session.user.email).then(() => {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user?.email) {
        await checkAdminStatus(session.user.email);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">확인 중...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!isAdmin) {
    return <UnauthorizedPage email={session.user?.email || ''} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">예약 관리 허브</h1>
              <span className="text-xs text-green-600 font-medium">관리자 모드</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">{session.user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>

          {activeTab === '대시보드' && <StatCards refreshKey={refreshKey} />}

          {activeTab === '예약목록' && <BookingTable refreshKey={refreshKey} />}

          {activeTab === '예약추가' && (
            <BookingForm
              onSuccess={() => {
                setRefreshKey(refreshKey + 1);
                setActiveTab('예약목록');
              }}
            />
          )}

          {activeTab === '상태관리' && <BookingTable refreshKey={refreshKey} />}

          {activeTab === '위치확인' && (
            <div className="space-y-6">
              <MapPanel selectedBooking={selectedMapBooking} />
              <BookingTable
                refreshKey={refreshKey}
                onBookingSelect={setSelectedMapBooking}
                selectedBookingId={selectedMapBooking?.id}
              />
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-5xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
