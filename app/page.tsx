'use client';

import { useEffect, useState } from 'react';
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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// --- Interface Definitions ---
interface Task {
  id: number;
  pulse: string;
  content: string;
  source: string;
  status: 'pool' | 'approved' | 'active' | 'done';
}

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
  const [data, setData] = useState<any[]>([]);
  const [rfmData, setRfmData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 初始化 Supabase 客戶端 (用於直接上傳 CSV)
  const supabase = createClientComponentClient();

  // --- 真實數據請求 (Real Data Fetching) ---
  const refreshData = async () => {
    try {
        setLoading(true);
        setError('');

        // 同時發送三個 API 請求
        const [dashRes, rfmRes, cohortRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/rfm'),
          fetch('/api/cohort')
        ]);

        // 檢查回應狀態
        if (!dashRes.ok || !rfmRes.ok || !cohortRes.ok) {
            throw new Error('API 回應錯誤 (500/404)。請確認 Supabase 是否已喚醒。');
        }

        const dashJson = await dashRes.json();
        const rfmJson = await rfmRes.json();
        const cohortJson = await cohortRes.json();

        // 防呆機制：如果回傳是空陣列或錯誤格式，給予預設空值
        setData(Array.isArray(dashJson) ? dashJson : []);
        setRfmData(Array.isArray(rfmJson) ? rfmJson : []);
        processCohortData(Array.isArray(cohortJson) ? cohortJson : []);
        
        setLoading(false);
      } catch (err: any) { 
        console.error("Data Load Error:", err); 
        setError(err.message || '無法連線至資料庫');
        setLoading(false); 
      }
  };

  useEffect(() => { refreshData(); }, []);

  // 處理 Cohort 資料轉為熱力圖格式
  const processCohortData = (rawData: any[]) => {
    try {
        const cohortMap: any = {};
        rawData.forEach(row => {
            if (!cohortMap[row.cohort_month]) cohortMap[row.cohort_month] = { total: 0, months: {} };
            if (row.month_number === 0) cohortMap[row.cohort_month].total = row.total_users;
            cohortMap[row.cohort_month].months[row.month_number] = row.total_users;
        });
        setCohortData(Object.keys(cohortMap).sort().map(month => {
            const d = cohortMap[month];
            return { m: month, v: [0,1,2,3].map(m => m===0?100 : Math.round((d.months[m]/d.total)*100)||0) };
        }));
    } catch(e) {
        console.error("Cohort Process Error", e);
    }
  };

  const latest = data[data.length - 1] || {};

  if (loading) return <div className="h-screen flex flex-col items-center justify-center text-blue-600 gap-4"><Loader2 className="animate-spin w-10 h-10" /><p className="font-bold">正在連線至戰情室資料庫...</p></div>;

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-600 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">資料載入失敗</h2>
        <p>{error}</p>
        <button onClick={refreshData} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">重試連線</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white shadow-md sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-blue-500/30 shadow-lg">S</div>
                <span className="text-xl font-bold text-slate-800 tracking-tight">SMEbig <span className="text-blue-600 font-light">War Room</span></span>
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
            {/* 1. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard title="總營收" value={`$${(latest.total_revenue||0).toLocaleString()}`} color="border-l-blue-500" />
                <KpiCard title="訂單量" value={latest.order_count||0} color="border-l-purple-500" />
                <KpiCard title="客單價" value={`$${latest.aov||0}`} color="border-l-yellow-500" />
                <KpiCard title="新客營收" value={`$${(latest.new_customer_revenue||0).toLocaleString()}`} color="border-l-green-500" />
            </div>

            {/* 2. Radar & Diagnosis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">品牌六脈診斷</h2>
                    {/* 注意：這裡的雷達圖資料目前還是寫死的，因為 API 還沒回傳分數計算。後續可再優化。 */}
                    <div className="h-[300px]"><ResponsiveContainer><RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{subject:'流量',A:5,full:5},{subject:'轉換',A:3,full:5},{subject:'獲利',A:2.5,full:5},{subject:'主顧',A:4.5,full:5},{subject:'回購',A:2.0,full:5},{subject:'口碑',A:1.5,full:5}]}><PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis angle={30} domain={[0,5]} /><Radar name="現狀" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} /><Legend/></RadarChart></ResponsiveContainer></div>
                </div>
                <AiDiagnosisPanel page="page1" dataSummary={{ revenue: latest.total_revenue, new_rev: latest.new_customer_revenue }} />
            </div>

            {/* 3. Revenue Trend & Mix */}
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

        {/* === P2: Deep Pathology (Rich Charts) === */}
        {activeTab === 'page2' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* 1. RFM Scatter Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-purple-500 pl-3">RFM 顧客價值矩陣</h3>
                    <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">X: 最近購買(天) / Y: 頻率(次) / 泡泡: 金額</span>
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
                {/* 2. Cohort Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto border border-gray-100">
                   <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3 mb-4">同層留存率 (Cohort Analysis)</h3>
                   {cohortData.length > 0 ? (
                       <table className="w-full text-center text-sm">
                        <thead><tr className="border-b bg-slate-50"><th className="p-3">首購月份</th><th>M+0</th><th>M+1</th><th>M+2</th></tr></thead>
                        <tbody>{cohortData.map((r:any,i:number)=>(<tr key={i} className="border-b"><td className="p-3 font-mono text-slate-600">{r.m}</td>{r.v.slice(0,3).map((v:any,j:number)=><td key={j} className={v<20?'text-red-500 font-bold bg-red-50':'text-slate-700'}>{v}%</td>)}</tr>))}</tbody>
                       </table>
                   ) : <EmptyState message="無 Cohort 資料" />}
                   <p className="text-xs text-gray-400 mt-2 text-right">* M+1 代表次月回購率</p>
                </div>

                {/* 3. CLTV Trend (New Chart) */}
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
                    <p className="text-xs text-gray-400 mt-2">觀察客單價是否隨時間提升，作為 LTV 的先行指標。</p>
                </div>
            </div>
          </div>
        )}

        {/* === P3: Consultant Prescription === */}
        {activeTab === 'page3' && <ConsultantPrescriptionPage />}

        {/* === P4: Data Specs === */}
        {activeTab === 'page4' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Raw Data Upload */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload className="text-blue-600"/> 資料上傳區 (Raw Data)</h2>
                    <DataUploader supabase={supabase} onUploadComplete={refreshData} />
                </div>

                {/* Specs Definitions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText className="text-slate-600"/> 品牌六脈模型定義</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SpecDetail title="流量脈 (Traffic)" logic="網站訪客數" note="來源：GA。狀態：無資料 (Value=0)。" color="slate" isMissing />
                        <SpecDetail title="轉換脈 (Conversion)" logic="轉換率 (Orders / Visitors)" note="狀態：無流量資料 (Value=0)。" color="slate" isMissing />
                        <SpecDetail title="主顧脈 (VIP)" logic="VIP 營收佔比" note="需定義 VIP 門檻。" color="yellow" />
                        <SpecDetail title="回購脈 (Retention)" logic="舊客營收 / 總營收" note="舊客定義：Order Date > First Purchase Date。" color="red" />
                        <SpecDetail title="口碑脈 (Reputation)" logic="推薦營收佔比" note="通路為 'Referral' 或 'Partner'。" color="purple" />
                        <SpecDetail title="獲利脈 (Profit)" logic="毛利率" note="來源：成本表。狀態：無資料 (Value=0)。" color="slate" isMissing />
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

// --- Consultant Prescription Page (Task Board) ---
function ConsultantPrescriptionPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    
    const fetchTasks = async () => { 
        try {
            const res = await fetch('/api/tasks');
            if (res.ok) setTasks(await res.json());
        } catch(e) { console.error(e); }
        setLoading(false); 
    };
    
    useEffect(() => { fetchTasks(); }, []);

    // 這裡為了簡化，僅展示讀取狀態，實際操作功能需對接 /api/tasks 的 POST/PATCH/DELETE
    const approvedTasks = tasks.filter(t => t.status === 'approved');
    const activeTasks = tasks.filter(t => t.status === 'active');
    const doneTasks = tasks.filter(t => t.status === 'done');

    if(loading) return <div className="p-10 text-center text-slate-500">載入顧問建議中...</div>;

    return (
        <div className="space-y-10 animate-in fade-in">
            {/* 1. Prescriptions */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Sparkles className="text-purple-600"/> 顧問建議藥方 (請點擊加入改善)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(PULSE_CONFIG).map(pulseKey => {
                        const config = PULSE_CONFIG[pulseKey];
                        const pulseTasks = approvedTasks.filter(t => t.pulse === pulseKey);
                        const Icon = config.icon;
                        return (
                            <div key={pulseKey} className={`bg-white rounded-xl border-t-4 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full ${config.bg.replace('bg-', 'border-')}`}>
                                <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${config.bg}`}>
                                    <h4 className={`font-bold flex items-center gap-2 ${config.text}`}><Icon size={18}/> {config.label}</h4>
                                    <span className="text-xs bg-white/60 px-2 py-0.5 rounded-full font-bold text-slate-600">{pulseTasks.length}</span>
                                </div>
                                <div className="p-4 space-y-3 flex-1">
                                    {pulseTasks.length === 0 ? <div className="text-center text-slate-300 text-xs py-4">目前無建議</div> : pulseTasks.map(t => (
                                        <div key={t.id} className="w-full text-left bg-white border border-slate-200 p-3 rounded-lg hover:border-purple-400 transition group relative">
                                            <p className="text-sm text-slate-700 mb-1">{t.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// --- Sub-components ---
function TabButton({ id, label, icon, active, onClick, isNew }: any) { return <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${active ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>{icon} {label} {isNew && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}</button>; }
function KpiCard({ title, value, color }: any) { return <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}><p className="text-sm text-gray-500">{title}</p><h3 className="text-2xl font-bold mt-2">{value}</h3></div>; }
function EmptyState({ message = "目前無資料" }: any) { return <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-200"><Info className="mb-2"/><p>{message}</p></div>; }
function AiDiagnosisPanel({ page, dataSummary }: any) { 
    const [d, setD] = useState(""); 
    const [l, setL] = useState(false); 
    const run = async () => { 
        setL(true); 
        // 這裡可以接上 Gemini API
        await new Promise(r => setTimeout(r, 1500));
        setD("【AI 診斷】\n根據即時數據，您的「獲客成本」雖有下降，但「首購留存率」依然低迷。建議在 Page 3 領取『首購 30 天喚醒計畫』任務並執行。"); 
        setL(false); 
    }; 
    return <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl"><div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4"><div className="bg-slate-700 p-2 rounded-lg"><Bot className="text-blue-400" /></div><h3 className="text-lg font-bold">SME AI 六脈診斷</h3></div><div className="flex-1 space-y-4">{d ? <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed border border-white/10 animate-in fade-in whitespace-pre-wrap"><p>{d}</p></div> : <div className="text-slate-400 text-sm text-center py-10">{l ? "分析中..." : "點擊按鈕啟動 AI 診斷"}</div>}</div><button onClick={run} disabled={l} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">{l?'分析中...':<><Sparkles size={16}/> 開始診斷</>}</button></div>; 
}
function SpecDetail({ title, logic, note, color, isMissing }: any) { const style = {blue:'text-blue-600 bg-blue-50 border-blue-100', green:'text-green-600 bg-green-50 border-green-100', yellow:'text-yellow-600 bg-yellow-50 border-yellow-100', red:'text-red-600 bg-red-50 border-red-100', purple:'text-purple-600 bg-purple-50 border-purple-100', slate:'text-slate-600 bg-slate-50 border-slate-100'}[color as string]||''; return <div className={`p-5 rounded-xl border ${style.split(' ')[2]} bg-white ${isMissing?'opacity-70 grayscale':''}`}><h4 className={`font-bold text-lg mb-2 flex justify-between ${style.split(' ')[0]}`}>{title} {isMissing&&<span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Missing</span>}</h4><div className={`text-sm font-mono p-2 rounded mb-3 border ${style}`}>{logic}</div><p className="text-xs text-gray-500">{note}</p></div>; }
function DataUploader({ supabase, onUploadComplete }: any) { 
    const [uploading, setUploading] = useState(false); 
    const [msg, setMsg] = useState(""); 
    const handleFile = (e: any) => { 
        const file = e.target.files[0]; 
        if (!file) return; 
        setUploading(true); 
        setMsg("解析中..."); 
        Papa.parse(file, { 
            header: true, 
            skipEmptyLines: true, 
            complete: async (results) => { 
                setMsg(`上傳中 (共${results.data.length}筆)...`); 
                const cleanRows = results.data.map((row: any) => ({ 
                    order_date: new Date(row['Order_Date']), 
                    customer_id: row['Customer_ID'], 
                    amount: row['Amount'] ? parseFloat(row['Amount'].toString().replace(/,/g, '')) : 0, 
                    product_name: row['Product_Service'], 
                    channel: row['Channel']
                })).filter((r:any) => !isNaN(r.amount)); 
                
                const BATCH_SIZE = 1000; 
                for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) { 
                    const { error } = await supabase.from('transactions').insert(cleanRows.slice(i, i + BATCH_SIZE)); 
                    if(error) { console.error(error); setMsg("上傳失敗: " + error.message); setUploading(false); return; }
                } 
                setUploading(false); 
                setMsg("🎉 上傳成功！"); 
                onUploadComplete(); 
            } 
        }); 
    }; 
    return <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition"><input type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-upload" disabled={uploading} /><label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2"><FileUp size={40} className="text-blue-500"/><span className="font-bold text-slate-700">{uploading ? '處理中...' : '點擊上傳 CSV'}</span></label>{msg && <div className="mt-4 text-sm font-bold text-blue-600">{msg}</div>}</div>; 
}