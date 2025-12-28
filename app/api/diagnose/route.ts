import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { page, dataSummary } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let context = "";
    if (page === 'page1') {
      context = `
        頁面：營運體檢 (KPI & 營收趨勢)。
        數據摘要：${JSON.stringify(dataSummary)}
        任務：請扮演「SME資深數據顧問」。
        1. 用嚴厲但也具建設性的口吻，分析目前的營收健康度與新舊客佔比。
        2. 如果發現新客(New Customer)歸零或過低，請發出嚴重警告。
        3. 總字數限制：100字以內。不要列點，直接給一段精闢的短評。
      `;
    } else if (page === 'page2') {
      context = `
        頁面：深度病理 (RFM & Cohort)。
        數據摘要：${JSON.stringify(dataSummary)}
        任務：請扮演「SME資深數據顧問」。
        1. 分析 RFM 分佈與 Cohort 留存率 (特別是 M+1)。
        2. 指出客戶流失的具體時間點。
        3. 總字數限制：100字以內。不要列點，直接給一段精闢的短評。
      `;
    }

    const result = await model.generateContent(context);
    const text = result.response.text();
    
    return NextResponse.json({ diagnosis: text });

  } catch (error: any) {
    console.error("AI Diagnose Error:", error);
    return NextResponse.json({ diagnosis: "顧問連線忙碌中...請稍後再試。" });
  }
}