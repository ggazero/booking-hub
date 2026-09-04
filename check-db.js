const dotenv = require('dotenv');
dotenv.config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('✓ .env 로드 완료');
console.log('Supabase URL:', supabaseUrl ? '설정됨' : '❌ 없음');
console.log('Supabase Key:', supabaseKey ? '설정됨' : '❌ 없음\n');

const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  try {
    // 1. 기존 데이터 조회 (1개)
    console.log('=== 1단계: 데이터 조회 ===');
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 조회 에러:', error.message);
      return;
    }

    console.log('✓ 첫 번째 예약 데이터 조회 성공');
    if (data && data.length > 0) {
      console.log('\n데이터 필드:');
      Object.entries(data[0]).forEach(([key, val]) => {
        console.log(`  ${key}: ${typeof val} ${val === null ? '(NULL)' : `= ${JSON.stringify(val)}`}`);
      });
    }

    // 2. 전체 행 수
    console.log('\n=== 2단계: 전체 행 수 ===');
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count 에러:', countError.message);
    } else {
      console.log(`✓ 총 예약 수: ${count}`);
    }

    // 3. 새 컬럼 존재 여부 확인
    console.log('\n=== 3단계: 새 컬럼 존재 여부 ===');
    const newColumns = ['kind', 'form', 'memo', 'slots_wanted', 'decision'];
    if (data && data[0]) {
      newColumns.forEach(col => {
        const exists = col in data[0];
        const value = data[0][col];
        console.log(`  ${col}: ${exists ? '✓ 있음' : '❌ 없음'} ${value === null ? '(NULL)' : ''}`);
      });
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
})();
