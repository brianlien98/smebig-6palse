import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. 初始化 (確保這行在外面)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { headers, previewData } = await req.json();

    // 2. 指定我們剛剛查到的超強模型 (Flash 2.0)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 3. 設定 Prompt
    const prompt = `
      你是一個資料處理專家。任務是將 CSV 欄位對應至系統標準欄位。
      
      使用者 CSV 標頭: ${JSON.stringify(headers)}
      第一筆資料範例: ${JSON.stringify(previewData)}

      系統標準欄位 (Target Schema):
      - order_date: 交易日期
      - customer_id: 客戶識別 (ID/Email)
      - amount: 金額 (數字)
      - product_name: 產品名稱
      - channel: 通路

      請回傳純 JSON 物件，Key 是標準欄位，Value 是 CSV 標頭名稱。
      若無對應則填 null。不要 Markdown，只要 JSON。
    `;

    // 4. 呼叫 AI
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error("🔥 AI 處理失敗:", error);
    return NextResponse.json({ error: error.message || "Unknown Error" }, { status: 500 });
  }
}