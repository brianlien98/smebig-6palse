'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { Upload, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 1. 處理檔案上傳
  const handleFileChange = (e: any) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    
    setLoading(true);
    setStatus('AI 正在讀取您的資料...');

    Papa.parse(uploadedFile, {
      header: true,
      preview: 1, // 只讀第一行給 AI 看
      complete: async (results) => {
        try {
          // 呼叫我們剛剛寫的 API
          const res = await fetch('/api/map-columns', {
            method: 'POST',
            body: JSON.stringify({ 
              headers: results.meta.fields, 
              previewData: results.data[0] 
            }),
          });
          const aiResult = await res.json();
          setMapping(aiResult);
          setStatus('AI 分析完成！請確認欄位對應。');
        } catch (err) {
          setStatus('AI 分析失敗，請稍後再試。');
        }
        setLoading(false);
      }
    });
  };

  // 2. 執行匯入
  const executeImport = () => {
    if (!file || !mapping) return;
    setLoading(true);
    setStatus('正在匯入資料庫...');

    Papa.parse(file, {
      header: true,
      chunk: async (results, parser) => {
        parser.pause(); // 暫停一下，等寫入 DB
        
        // 資料清洗與轉換
        const formatted = results.data
          .filter((row: any) => row[mapping.order_date] && row[mapping.amount])
          .map((row: any) => ({
            order_date: new Date(row[mapping.order_date]),
            customer_id: row[mapping.customer_id],
            amount: parseFloat(row[mapping.amount]),
            product_name: row[mapping.product_name],
            channel: row[mapping.channel],
            raw_data: row,
            import_batch_id: 'batch_' + Date.now()
          }));

        const { error } = await supabase.from('transactions').insert(formatted);
        if (error) console.error('匯入錯誤:', error);
        parser.resume();
      },
      complete: () => {
        setLoading(false);
        setStatus('🎉 匯入成功！數據已進入戰情室。');
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="bg-blue-600 text-white p-2 rounded-lg"><Upload size={20}/></span>
          SMEbig 資料匯入中心
        </h1>

        {/* 上傳區塊 */}
        {!mapping && (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition relative cursor-pointer">
            <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-blue-50 rounded-full text-blue-600"><Upload size={32}/></div>
              <p className="font-medium text-slate-600">拖曳 CSV 檔案至此，或點擊上傳</p>
              <p className="text-sm text-slate-400">AI 將自動辨識您的資料格式</p>
            </div>
          </div>
        )}

        {/* 狀態顯示 */}
        {loading && (
          <div className="flex items-center gap-3 justify-center py-8 text-blue-600">
            <Loader2 className="animate-spin" />
            <span className="font-medium">{status}</span>
          </div>
        )}

        {/* AI 對應結果 & 確認按鈕 */}
        {mapping && !loading && (
          <div className="space-y-6">
            <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                🤖 AI 建議的欄位對應
              </h3>
              <div className="space-y-2">
                {Object.entries(mapping).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 shadow-sm">
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                    <ArrowRight size={16} className="text-slate-300" />
                    <span className="font-medium text-slate-800">{value ? String(value) : '❌ 未找到'}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={executeImport}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <CheckCircle size={20}/>
              確認並開始匯入
            </button>
          </div>
        )}

        {status.includes('成功') && (
           <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg text-center font-bold border border-green-200">
             {status}
           </div>
        )}
      </div>
    </div>
  );
}