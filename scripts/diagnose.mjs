#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://krotxjppdiyxvfuoqdqp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtyb3R4anBwZGl5eHZmdW9xZHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzk4OTUsImV4cCI6MjA4NjkxNTg5NX0.qyPNPmT2-7jCC-wr_x8-dbdF0jkv8UuEIFVnjol9-ew';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 TUTTI 회원가입 진단 시작...\n');

// 1. user_profiles 테이블 컬럼 확인
console.log('=== 1. user_profiles 테이블 구조 ===');
const { data: profiles, error: profileError } = await supabase
  .from('user_profiles')
  .select('*')
  .limit(1);

if (profileError) {
  console.log('❌ 테이블 조회 실패:', profileError.message);
} else {
  console.log('✅ 테이블 존재. 샘플 데이터:', profiles);
}

// 2. 고아 auth.users 확인 (이건 RPC 필요)
console.log('\n=== 2. 데이터 상태 확인 ===');
const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
console.log('Auth users 수:', authData?.users?.length || 0);

const { count: profileCount } = await supabase
  .from('user_profiles')
  .select('*', { count: 'exact', head: true });
console.log('user_profiles 수:', profileCount);

if (authData?.users) {
  for (const user of authData.users) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!profile) {
      console.log('⚠️ 고아 레코드 발견:', user.email, '(id:', user.id, ')');
    }
  }
}

// 3. RLS 정책 테스트
console.log('\n=== 3. INSERT 권한 테스트 ===');
const testUserId = 'test-' + Date.now();
const { error: insertError } = await supabase
  .from('user_profiles')
  .insert({
    id: testUserId,
    user_type: 'individual',
    display_name: '테스트',
    created_at: new Date().toISOString()
  });

if (insertError) {
  console.log('❌ INSERT 실패:', insertError.message);
  console.log('   Code:', insertError.code);
  console.log('   Details:', insertError.details);
} else {
  console.log('✅ INSERT 성공 (이건 anon key로는 안 되어야 정상)');
  // 롤백
  await supabase.from('user_profiles').delete().eq('id', testUserId);
}

console.log('\n📋 다음 단계:');
console.log('1. Supabase Studio에서 debug_signup.sql 전체 실행 필요');
console.log('2. 특히 트리거 함수 정의(prosrc)와 RLS 정책 확인');
