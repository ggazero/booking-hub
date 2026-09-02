import { supabase } from '../lib/supabaseClient';

export function UnauthorizedPage({ email }: { email: string }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">접근 불가</h1>
        <p className="text-gray-600 mb-2">{email}</p>
        <p className="text-red-600 font-medium mb-6">관리자 권한이 없습니다</p>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
