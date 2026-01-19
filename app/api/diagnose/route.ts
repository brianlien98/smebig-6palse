import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 確保 .env.local 有 GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 兼容 V5.4 前端傳來的完整資料結構
    const { clientName, revenue, scores, topProducts, page, dataSummary } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let context = "";

    // 模式 A: 來自首頁的「六脈綜合診斷」 (V5.4 前端呼叫)
    if (clientName && scores) {
        context = `
        你是一位嚴厲但具建設性的「品牌數據顧問」。請根據以下客戶數據進行診斷：

        【客戶資料】
        - 品牌：${clientName}
        - 年營收：$${revenue?.toLocaleString()}
        - 六脈體質分數 (0-5分)：
          1. 流量力: ${scores.traffic} (新客獲取能力)
          2. 轉換力: ${scores.conversion} (訂單成交率)
          3. 獲利力: ${scores.profit} (營收規模)
          4. 主顧力: ${scores.vip} (VIP 80/20 貢獻度)
          5. 回購力: ${scores.retention} (舊客回頭率)
        - 熱銷商品前三名：${topProducts?.join(", ")}

        【診斷任務】
        1. 用一段話總結該品牌的「最大優勢」與「最大隱憂」。
        2. 請針對分數最低的項目，給出一個具體的行銷活動建議。
        3. 語氣要專業、直接，不要講客套話。
        4. 總字數限制：150字以內。
      `;
    } 
    // 模式 B: 來自其他分頁的局部診斷 (保留舊邏輯)
    else if (page) {
        context = `
        任務：請扮演「SME資深數據顧問」，針對 ${page === 'page1' ? '營運營收' : '顧客留存'} 數據進行短評。
        數據摘要：${JSON.stringify(dataSummary)}
        要求：嚴厲指出問題點，100字以內。
      `;
    } else {
        return NextResponse.json({ diagnosis: "缺乏足夠數據進行診斷。" });
    }

    const result = await model.generateContent(context);
    const text = result.response.text();
    
    return NextResponse.json({ diagnosis: text });

  } catch (error: any) {
    console.error("AI Diagnose Error:", error);
    return NextResponse.json({ diagnosis: "顧問連線忙碌中... (API Error)" }, { status: 500 });
  }
}