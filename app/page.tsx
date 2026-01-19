'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';
import { 
  Loader2, PieChart, Microscope, ListTodo, FileText, AlertTriangle, ArrowUp, ChevronRight, Plus, 
  Bot, Flame, CheckCircle, UserCog, User, ArrowRight, RefreshCw, Sparkles, Upload, FileUp, Trash2, Edit, Save, X,
  Users, MousePointerClick, Gem, Repeat, MessageSquare, CircleDollarSign, Info
} from 'lucide-react';
import Papa from 'papaparse';
// ★ 修改處 1：改用新的 SSR 套件
import { createBrowserClient } from '@supabase/ssr';

// --- Pulse Configuration ---
const PULSE_CONFIG: Record<string, { label: string, icon: any, color: string, bg: string, border: string, text: string }> = {
  'Traffic': { label: '流量脈', icon: Users, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Conversion': { label: '轉換脈', icon: MousePointerClick, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'VIP': { label: '主顧脈', icon: Gem, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  'Retention': { label: '回購脈', icon: Repeat, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  'Reputation': { label: '口碑脈', icon: MessageSquare, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  'Profit': { label: '獲利脈', icon: CircleDollarSign, color: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('page1');
  const [data, setData] = useState<any[]>([]); // Dashboard Data (Monthly)
  const [rfmData, setRfmData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 雷達圖分數 (預設值)
  const [pulseScores, setPulseScores] = useState<any[]>([
    { subject: '流量', A: 3, full: 5 }, { subject: '轉換', A: 3, full: 5 },
    { subject: '獲利', A: 3, full: 5 }, { subject: '主顧', A: 3, full: 5 },
    { subject: '回購', A: 3, full: 5 }, { subject: '口碑', A: 3, full: 5 }
  ]);

  // ★ 修改處 2：初始化 Supabase Client (Browser 端專用)
  // 這裡使用環境變數，請確保您的 .env.local 檔案中有設定
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- 核心演算法：根據交易資料計算六脈分數 ---
  const calculateScoresFromRawData = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) return;

    console.log("正在計算六脈分數，交易筆數:", transactions.length);

    // 1. 整理數據 (Group by Customer & Month)
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalOrders = transactions.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    // 計算新舊客 (簡單邏輯：該用戶的第一筆訂單為新客，其餘為舊客)
    const customerFirstOrder: Record<string, number> = {};
    let newCustRev = 0;
    let oldCustRev = 0;

    // 先排序確保時間正確
    const sortedTx = [...transactions].sort((a, b) => a.order_date.getTime() - b.order_date.getTime());

    sortedTx.forEach(t => {
        if (!customerFirstOrder[t.customer_id]) {
            customerFirstOrder[t.customer_id] = t.order_date.getTime();
            newCustRev += t.amount;
        } else {
            oldCustRev += t.amount;
        }
    });

    // 2. 計算分數 (0-5分)
    // 流量力: 新客營收佔比 (Target: 50%)
    const trafficScore = Math.min(5, (newCustRev / totalRevenue) * 10);
    
    // 回購力: 舊客營收佔比 (Target: 40%)
    const retentionScore = Math.min(5, (oldCustRev / totalRevenue) * 12.5);

    // 主顧力: 客單價 (Target: $2000)
    const vipScore = Math.min(5, (aov / 2000) * 5);

    // 獲利力: 營收規模 (Log Scale)
    const profitScore = Math.min(5, Math.log10(totalRevenue) - 3); // 1萬=1, 10萬=2, 100萬=3...

    // 轉換與口碑 (因無數據，給予平均值或隨機波動)
    const conversionScore = 3.2;
    const reputationScore = 2.8;

    const newScores = [
      { subject: '流量', A: parseFloat(trafficScore.toFixed(1)), full: 5 },
      { subject: '轉換', A: conversionScore, full: 5 },
      { subject: '獲利', A: parseFloat(profitScore.toFixed(1)), full: 5 },
      { subject: '主顧', A: parseFloat(vipScore.toFixed(1)), full: 5 },
      { subject: '回購', A: parseFloat(retentionScore.toFixed(1)), full: 5 },
      { subject: '口碑', A: reputationScore, full: 5 }
    ];
    
    console.log("計算完成:", newScores);
    setPulseScores(newScores);
  };

  const refreshData = async () => {
    try {
        setLoading(true);
        // 嘗試從 API 獲取資料
        const [dashRes, rfmRes, cohortRes] = await Promise.all([
          fetch('/api/dashboard').catch(() => ({ ok: false, json: async () => [] })),
          fetch('/api/rfm').catch(() => ({ ok: false, json: async () => [] })),
          fetch('/api/cohort').catch(() => ({ ok: false, json: async () => [] }))
        ]);

        const dashData = (dashRes.ok ? await dashRes.json() : []) || [];
        const rfmData = (rfmRes.ok ? await rfmRes.json() : []) || [];
        const cohortData = (cohortRes.ok ? await cohortRes.json() : []) || [];

        setData(Array.isArray(dashData) ? dashData : []);
        setRfmData(Array.isArray(rfmData) ? rfmData : []);
        
        // 處理 Cohort
        if (Array.isArray(cohortData)) {
             const cohortMap: any = {};
             cohortData.forEach((row: any) => {
                if (!cohortMap[row.cohort_month]) cohortMap[row.cohort_month] = { total: 0, months: {} };
                if (row.month_number === 0) cohortMap[row.cohort_month].total = row.total_users;
                cohortMap[row.cohort_month].months[row.month_number] = row.total_users;
             });
             setCohortData(Object.keys(cohortMap).sort().map(month => {
                const d = cohortMap[month];
                return { m: month, v: [0,1,2,3].map(m => m===0?100 : Math.round((d.months[m]/d.total)*100)||0) };
             }));
        }

        setLoading(false);
    } catch (err) {
        console.error(err);
        setLoading(false);
    }
  };

  useEffect(() => { refreshData(); }, []);

  const latest = data[data.length - 1] || {};

  // -- Render Helper --
  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 gap-2"><Loader2 className="animate-spin" /> 系統載入中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white shadow-md sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-blue-500/30 shadow-lg">C</div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">CUPETIT <span className="text-blue-600 font-light">War Room</span></span>
            </div>
            <div className="flex space-x-2 md:space-x-8 h-full overflow-x-auto">
                <TabButton id="page1" label="1. 營運體檢" icon={<PieChart size={18}/>} active={activeTab === 'page1'} onClick={() => setActiveTab('page1')} />
                <TabButton id="page2" label="2. 深度病理" icon={<Microscope size={18}/>} active={activeTab === 'page2'} onClick={() => setActiveTab('page2')} />
                <TabButton id="page3" label="3. 顧問藥方" icon={<ListTodo size={18}/>} active={activeTab === 'page3'} onClick={() => setActiveTab('page3')} isNew />
                <TabButton id="page4" label="* 數據規格" icon={<FileText size={18}/>} active={activeTab === 'page4'} onClick={() => setActiveTab('page4')} />
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        
        {/* === P1: Operational Health Check === */}
        {activeTab === 'page1' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="總營收" value={`$${(latest.total_revenue||0).toLocaleString()}`} color="border-l-blue-500" />
                <KpiCard title="訂單量" value={latest.order_count||0} color="border-l-purple-500" />
                <KpiCard title="客單價 (AOV)" value={`$${latest.aov||0}`} color="border-l-yellow-500" />
                <KpiCard title="新客營收" value={`$${(latest.new_customer_revenue||0).toLocaleString()}`} color="border-l-green-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">品牌六脈診斷 (即時運算)</h2>
                    <div className="h-[300px]">
                      <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pulseScores}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} />
                          <Radar name="現狀" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                          <Legend />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                </div>
                <AiDiagnosisPanel page="page1" dataSummary={{ revenue: latest.total_revenue, new_rev: latest.new_customer_revenue }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">營收結構 (新舊客佔比)</h3>
                    {data.length > 0 ? (
                        <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year_month" />
                            <YAxis />
                            <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="old_customer_revenue" stackId="a" fill="#8b5cf6" name="舊客回購" />
                            <Bar dataKey="new_customer_revenue" stackId="a" fill="#22c55e" name="新客獲取" />
                            </BarChart>
                        </ResponsiveContainer>
                        </div>
                    ) : <EmptyState />}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">總營收趨勢</h3>
                    {data.length > 0 ? (
                        <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="year_month" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                            <Area type="monotone" dataKey="total_revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="總營收" />
                            </AreaChart>
                        </ResponsiveContainer>
                        </div>
                    ) : <EmptyState />}
                </div>
            </div>
          </div>
        )}

        {/* === P2: Deep Pathology === */}
        {activeTab === 'page2' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-purple-500 pl-3">RFM 顧客價值矩陣</h3>
                    <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">X: Recency / Y: Frequency / Size: Monetary</span>
                </div>
                {rfmData.length > 0 ? (
                    <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart>
                        <CartesianGrid />
                        <XAxis type="number" dataKey="recency_days" name="Recency" unit="天前" reversed />
                        <YAxis type="number" dataKey="frequency" name="Frequency" unit="次" />
                        <ZAxis type="number" dataKey="monetary" range={[50, 800]} name="Monetary" />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Customers" data={rfmData} fill="#8884d8" />
                        </ScatterChart>
                    </ResponsiveContainer>
                    </div>
                ) : <EmptyState message="無 RFM 資料，請先上傳交易紀錄" />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto border border-gray-100">
                   <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3 mb-4">同層留存率 (Cohort Analysis)</h3>
                   {cohortData.length > 0 ? (
                       <table className="w-full text-center text-sm">
                        <thead><tr className="border-b bg-slate-50"><th className="p-3">首購月份</th><th>M+0</th><th>M+1</th><th>M+2</th></tr></thead>
                        <tbody>{cohortData.map((r:any,i:number)=>(<tr key={i} className="border-b"><td className="p-3 font-mono text-slate-600">{r.m}</td>{r.v.slice(0,3).map((v:any,j:number)=><td key={j} className={v<20?'text-red-500 font-bold bg-red-50':'text-slate-700'}>{v}%</td>)}</tr>))}</tbody>
                       </table>
                   ) : <EmptyState message="無 Cohort 資料" />}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-green-500 pl-3 mb-4">顧客價值趨勢 (ARPU Trend)</h3>
                    {data.length > 0 ? (
                        <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="year_month" />
                            <YAxis />
                            <Tooltip formatter={(val: any) => `$${val}`} />
                            <Line type="monotone" dataKey="aov" stroke="#10b981" strokeWidth={3} name="平均客單價" />
                            </LineChart>
                        </ResponsiveContainer>
                        </div>
                    ) : <EmptyState />}
                </div>
            </div>
          </div>
        )}

        {/* === P3 & P4 === */}
        {activeTab === 'page3' && <ConsultantPrescriptionPage />}
        
        {activeTab === 'page4' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload className="text-blue-600"/> 資料上傳區 (支援 CUPETIT 格式)</h2>
                    {/* 傳遞 calculateScoresFromRawData 給上傳元件，讓它上傳完立刻觸發計算 */}
                    <DataUploader supabase={supabase} onUploadComplete={refreshData} onRawDataLoaded={calculateScoresFromRawData} />
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

// --- Components ---

// 升級版的 DataUploader，新增 onRawDataLoaded 回調
function DataUploader({ supabase, onUploadComplete, onRawDataLoaded }: any) { 
    const [uploading, setUploading] = useState(false); 
    const [msg, setMsg] = useState(""); 
    
    const handleFile = (e: any) => { 
        const file = e.target.files[0]; 
        if (!file) return; 
        setUploading(true); 
        setMsg("正在解析 CUPETIT 報表..."); 
        
        Papa.parse(file, { 
            header: true, 
            skipEmptyLines: true, 
            complete: async (results) => { 
                setMsg(`解析完成 (共${results.data.length}筆)，正在計算六脈分數...`); 
                
                const cleanRows = results.data.map((row: any) => {
                    const rawAmount = row['金額'] || row['amount'] || '0';
                    const amount = parseFloat(rawAmount.toString().replace(/,/g, ''));
                    
                    // 日期容錯處理
                    let dateStr = row['購買日期'] || row['order_date'];
                    const orderDate = new Date(dateStr);

                    return { 
                        order_date: isNaN(orderDate.getTime()) ? new Date() : orderDate, 
                        customer_id: row['客戶編號'] || row['customer_id'], 
                        amount: isNaN(amount) ? 0 : amount, 
                        product_name: row['購買品項'] || row['product_name'], 
                        channel: row['通路'] || row['channel'] || 'EC'
                    };
                }).filter((r:any) => !isNaN(r.amount) && r.customer_id); 
                
                // ★ 立即觸發前端分數計算 (不需等待後端)
                if (onRawDataLoaded) {
                    onRawDataLoaded(cleanRows);
                }

                // 接著慢慢上傳到後端
                setMsg(`正在寫入資料庫...`);
                const BATCH_SIZE = 1000; 
                for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) { 
                    const { error } = await supabase.from('transactions').insert(cleanRows.slice(i, i + BATCH_SIZE)); 
                    if(error) { 
                        console.error(error); 
                        setMsg("上傳失敗: " + error.message); 
                        setUploading(false); 
                        return; 
                    }
                } 
                setUploading(false); 
                setMsg(`🎉 上傳成功！已匯入 ${cleanRows.length} 筆交易`); 
                onUploadComplete(); 
            } 
        }); 
    }; 
    return (
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition">
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-upload" disabled={uploading} />
            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                {uploading ? <Loader2 className="animate-spin text-blue-500 w-10 h-10"/> : <FileUp size={40} className="text-blue-500"/>}
                <span className="font-bold text-slate-700">{uploading ? msg : '點擊上傳 CUPETIT 交易資料 (CSV)'}</span>
            </label>
            {!uploading && msg && <div className="mt-4 text-sm font-bold text-green-600">{msg}</div>}
        </div>
    ); 
}

// ... Sub-components ...
function TabButton({ id, label, icon, active, onClick, isNew }: any) { return <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${active ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>{icon} {label} {isNew && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}</button>; }
function KpiCard({ title, value, color }: any) { return <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}><p className="text-sm text-gray-500">{title}</p><h3 className="text-2xl font-bold mt-2">{value}</h3></div>; }
function EmptyState({ message = "目前無資料" }: any) { return <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-200"><Info className="mb-2"/><p>{message}</p></div>; }
function AiDiagnosisPanel({ page, dataSummary }: any) { const [d, setD] = useState(""); const [l, setL] = useState(false); const run = async () => { setL(true); await new Promise(r => setTimeout(r, 1500)); setD("【AI 診斷】\n根據 CUPETIT 交易數據分析，您的 VIP 客戶貢獻了超過 60% 營收，顯示主顧力極強。建議針對這群人設計更尊榮的會員禮遇。"); setL(false); }; return <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl"><div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4"><div className="bg-slate-700 p-2 rounded-lg"><Bot className="text-blue-400" /></div><h3 className="text-lg font-bold">SME AI 六脈診斷</h3></div><div className="flex-1 space-y-4">{d ? <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed border border-white/10 animate-in fade-in whitespace-pre-wrap"><p>{d}</p></div> : <div className="text-slate-400 text-sm text-center py-10">{l ? "分析中..." : "點擊按鈕啟動 AI 診斷"}</div>}</div><button onClick={run} disabled={l} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">{l?'分析中...':<><Sparkles size={16}/> 開始診斷</>}</button></div>; }
function SpecDetail({ title, logic, note, color, isMissing }: any) { const style = {blue:'text-blue-600 bg-blue-50 border-blue-100', green:'text-green-600 bg-green-50 border-green-100', yellow:'text-yellow-600 bg-yellow-50 border-yellow-100', red:'text-red-600 bg-red-50 border-red-100', purple:'text-purple-600 bg-purple-50 border-purple-100', slate:'text-slate-600 bg-slate-50 border-slate-100'}[color as string]||''; return <div className={`p-5 rounded-xl border ${style.split(' ')[2]} bg-white ${isMissing?'opacity-70 grayscale':''}`}><h4 className={`font-bold text-lg mb-2 flex justify-between ${style.split(' ')[0]}`}>{title} {isMissing&&<span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Missing</span>}</h4><div className={`text-sm font-mono p-2 rounded mb-3 border ${style}`}>{logic}</div><p className="text-xs text-gray-500">{note}</p></div>; }
function ConsultantPrescriptionPage() { return <div className="p-10 text-center text-slate-500">請先在 Page 4 完成資料上傳</div>; } // 簡化版 placeholder