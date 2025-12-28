import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// 1. 取得任務
export async function GET(req: Request) {
  const { data, error } = await supabase.from('optimization_tasks').select('*').order('id', { ascending: false }); // 新的在上面
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// 2. 更新任務 (核准、狀態改變、內容編輯)
export async function PATCH(req: Request) {
  const { id, status, content } = await req.json();
  
  const updateData: any = {};
  if (status) updateData.status = status;
  if (content) updateData.content = content; // 支援內容修改

  const { error } = await supabase
    .from('optimization_tasks')
    .update(updateData)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// 3. 刪除任務 (顧問覺得建議太爛)
export async function DELETE(req: Request) {
  const { id } = await req.json();
  const { error } = await supabase.from('optimization_tasks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// 4. 新增任務 (AI 生成 或 顧問手動)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // A. 顧問手動新增
    if (body.manual) {
      const { pulse, content } = body;
      const { error } = await supabase.from('optimization_tasks').insert({
        pulse,
        content,
        source: 'Human', // 標記為真人顧問
        status: 'approved' // 顧問自己寫的當然直接核准
      });
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // B. AI 自動生成 (一次 12 條)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      請針對電商網站的「六脈」(Traffic, Conversion, VIP, Retention, Reputation, Profit)，
      各提供 2 條具體的優化建議任務 (Total 12條)。
      格式必須是 JSON Array，包含 [{ "pulse": "Traffic", "content": "建議內容..." }, ...]。
      建議內容要具體可執行 (Actionable)，約 20-30 字。
      只回傳 JSON，不要 Markdown。
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const tasks = JSON.parse(text);

    const dbTasks = tasks.map((t: any) => ({
      pulse: t.pulse,
      content: t.content,
      source: 'AI',
      status: 'pool' 
    }));

    const { error } = await supabase.from('optimization_tasks').insert(dbTasks);
    if (error) throw error;

    return NextResponse.json({ success: true, count: dbTasks.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}