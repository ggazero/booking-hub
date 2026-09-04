import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { LoginPage } from './components/LoginPage';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { StatCards } from './components/StatCards';
import { BookingForm } from './components/BookingForm';
import { BookingTable } from './components/BookingTable';
import { MapPanel } from './components/MapPanel';

type Tab = '대시보드' | '예약목록' | '예약추가' | '미확정 관리' | '위치확인';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('대시보드');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMapBooking, setSelectedMapBooking] = useState<any>(null);

  const tabs: Tab[] = ['대시보드', '예약목록', '예약추가', '미확정 관리', '위치확인'];

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
    <div className="min-h-screen" style={{ backgroundColor: '#fffbf7' }}>
      <div className="bg-[#000b50] text-white py-5 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">예약 관리 허브</h1>
            <span className="text-xs text-[#5790eb] font-medium">관리자 모드</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{session.user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#1d6ae5] text-white rounded hover:bg-[#1560c8] text-sm font-medium transition"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-[#1d6ae5] border-[#1d6ae5]'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-5xl mx-auto">

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

          {activeTab === '미확정 관리' && <BookingTable refreshKey={refreshKey} mode="review" />}

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
    </div>
  );
}
