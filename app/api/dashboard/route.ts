import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // 直接從我們剛建好的 View 抓資料，不需要在程式碼裡重算
  const { data, error } = await supabase
    .from('monthly_brand_pulse')
    .select('*')
    .order('year_month', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}