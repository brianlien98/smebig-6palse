// scripts/import-data.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');
require('dotenv').config({ path: '.env.local' }); // 讀取環境變數

// 1. 設定 Supabase 連線
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // 或使用 SERVICE_ROLE_KEY 如果有權限問題

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 錯誤：找不到環境變數。請確認 .env.local 檔案存在且內容正確。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
  console.log('🚀 開始讀取 CSV 檔案...');
  
  // 2. 讀取 CSV
  const filePath = path.resolve(__dirname, '../transactions.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // 3. 解析 CSV
  Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data;
      console.log(`📊 成功解析，共 ${rows.length} 筆資料。準備寫入資料庫...`);

      // 4. 資料清洗與對應 (Mapping)
      const formattedRows = rows.map(row => {
        // 清洗金額：移除逗號 (例如 "1,000" -> 1000)
        let cleanAmount = 0;
        if (row['Amount']) {
             cleanAmount = parseFloat(row['Amount'].toString().replace(/,/g, ''));
        }

        return {
          order_date: new Date(row['Order_Date']), // 轉換日期
          customer_id: row['Customer_ID'],
          amount: cleanAmount,
          product_name: row['Product_Service'],
          channel: row['Channel'],
          import_batch_id: 'seed_2025_init', // 標記這是初始化資料
          raw_data: row // 備份原始資料
        };
      });

      // 5. 分批寫入 (Batch Insert) - 避免一次塞太滿炸掉
      const BATCH_SIZE = 1000;
      for (let i = 0; i < formattedRows.length; i += BATCH_SIZE) {
        const batch = formattedRows.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabase
          .from('transactions')
          .insert(batch);

        if (error) {
          console.error(`❌ 第 ${i + 1} - ${i + batch.length} 筆寫入失敗:`, error.message);
        } else {
          console.log(`✅ 已寫入第 ${i + 1} - ${i + batch.length} 筆...`);
        }
      }

      console.log('🎉 全部匯入完成！現在請去戰情室查看數據。');
    }
  });
}

importData();