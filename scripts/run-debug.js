#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runQuery(sql) {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    // RPC 함수가 없으면 직접 실행
    const { data: directData, error: directError } = await supabase
      .from('_dummy')
      .select('*')
      .limit(0);
    
    console.error('⚠️ Cannot execute raw SQL via client. Manual execution needed.');
    return null;
  }
  
  return data;
}

async function main() {
  console.log('🔍 TUTTI 회원가입 진단 시작...\n');
  
  const sqlFile = path.join(__dirname, '../supabase/debug_signup.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  // Split by step markers
  const queries = sql.split(/-- \d+\./);
  
  for (const query of queries) {
    if (query.trim()) {
      console.log('\n' + '='.repeat(60));
      const lines = query.trim().split('\n');
      const title = lines[0].replace(/^-+\s*/, '');
      console.log(title);
      console.log('='.repeat(60));
      
      const actualQuery = lines.slice(1).join('\n').trim();
      
      try {
        const result = await runQuery(actualQuery);
        console.log(result || '⚠️ Manual execution required');
      } catch (err) {
        console.error('Error:', err.message);
      }
    }
  }
}

main().catch(console.error);
