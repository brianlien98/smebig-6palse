import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // 抓取真實的 RFM 數據
  const { data, error } = await supabase
    .from('rfm_analysis')
    .select('recency, frequency, monetary')
    .limit(2000); // 為了效能，我們先抓前 2000 個點來畫圖 (Scatter Chart 太多點會卡)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 轉換格式給 Recharts 用 (x, y, z)
  const formattedData = data.map(row => ({
    x: row.recency,   // R: 幾天沒買 (X軸)
    y: row.frequency, // F: 買幾次 (Y軸)
    z: row.monetary   // M: 花多少錢 (泡泡大小)
  }));

  return NextResponse.json(formattedData);
}