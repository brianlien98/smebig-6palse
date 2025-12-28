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
import { supabase } from '@/lib/supabase';
import Papa from 'papaparse';

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

  const refreshData = async () => {
    try {
        const [dashRes, rfmRes, cohortRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/rfm'),
          fetch('/api/cohort')
        ]);
        setData(await dashRes.json() || []);
        setRfmData(await rfmRes.json() || []);
        processCohortData(await cohortRes.json() || []);
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { refreshData(); }, []);

  const processCohortData = (rawData: any[]) => {
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
  };

  const latest = data[data.length - 1] || {};

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 gap-2"><Loader2 className="animate-spin" /> System Loading...</div>;

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
                    <h2 className="text-xl font-bold mb-4">品牌六脈診斷 (模擬)</h2>
                    <div className="h-[300px]"><ResponsiveContainer><RadarChart cx="50%" cy="50%" outerRadius="80%" data={[{subject:'流量',A:0,full:5},{subject:'轉換',A:0,full:5},{subject:'獲利',A:0,full:5},{subject:'主顧',A:4.5,full:5},{subject:'回購',A:2.0,full:5},{subject:'口碑',A:1.5,full:5}]}><PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis angle={30} domain={[0,5]} /><Radar name="現狀" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} /><Legend/></RadarChart></ResponsiveContainer></div>
                    <div className="text-center text-xs text-gray-400 mt-2">註：部分指標因無 GA/成本 資料顯示為 0。</div>
                </div>
                <AiDiagnosisPanel page="page1" dataSummary={{ revenue: latest.total_revenue, new_rev: latest.new_customer_revenue }} />
            </div>

            {/* 3. Revenue Trend & Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">營收結構 (新舊客佔比)</h3>
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
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">總營收趨勢</h3>
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
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="x" name="Recency" unit="天前" reversed />
                      <YAxis type="number" dataKey="y" name="Frequency" unit="次" />
                      <ZAxis type="number" dataKey="z" range={[50, 400]} name="Monetary" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Customers" data={rfmData} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 2. Cohort Table */}
                <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto border border-gray-100">
                   <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3 mb-4">同層留存率 (Cohort Analysis)</h3>
                   <table className="w-full text-center text-sm">
                     <thead><tr className="border-b bg-slate-50"><th className="p-3">首購月份</th><th>M+0</th><th>M+1</th><th>M+2</th></tr></thead>
                     <tbody>{cohortData.map((r:any,i:number)=>(<tr key={i} className="border-b"><td className="p-3 font-mono text-slate-600">{r.m}</td>{r.v.slice(0,3).map((v:any,j:number)=><td key={j} className={v<20?'text-red-500 font-bold bg-red-50':'text-slate-700'}>{v}%</td>)}</tr>))}</tbody>
                   </table>
                   <p className="text-xs text-gray-400 mt-2 text-right">* M+1 代表次月回購率</p>
                </div>

                {/* 3. CLTV Trend (New Chart) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-green-500 pl-3 mb-4">顧客價值趨勢 (ARPU Trend)</h3>
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
                    <p className="text-xs text-gray-400 mt-2">觀察客單價是否隨時間提升，作為 LTV 的先行指標。</p>
                </div>
            </div>
          </div>
        )}

        {/* === P3: Consultant Prescription (New Layout) === */}
        {activeTab === 'page3' && <ConsultantPrescriptionPage />}

        {/* === P4: Data Specs & Chart Guide === */}
        {activeTab === 'page4' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* Raw Data Upload */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload className="text-blue-600"/> 資料上傳區 (Raw Data)</h2>
                    <DataUploader onUploadComplete={refreshData} />
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

                {/* Chart Guide (New Section) */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Info className="text-blue-500"/> 圖表閱讀指南</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-bold text-purple-700 mb-2">1. RFM 矩陣圖</h4>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                                <li><strong>X軸 (Recency)</strong>: 越靠右邊，代表最近才剛買過 (活躍)。</li>
                                <li><strong>Y軸 (Frequency)</strong>: 越靠上面，代表買越多次 (忠誠)。</li>
                                <li><strong>泡泡大小 (Monetary)</strong>: 越大顆代表花越多錢 (大戶)。</li>
                                <li><strong>解讀</strong>: 理想狀況是泡泡往「右上角」移動且變大。</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-orange-700 mb-2">2. Cohort 留存熱圖</h4>
                            <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                                <li><strong>縱軸 (群組)</strong>: 該月份首次購買的新客人。</li>
                                <li><strong>橫軸 (M+N)</strong>: 過了 N 個月後，這群人還有多少 % 回來買。</li>
                                <li><strong>顏色</strong>: <span className="text-green-600 font-bold">綠色</span>代表留存佳，<span className="text-red-500 font-bold">紅色</span>代表流失嚴重。</li>
                                <li><strong>解讀</strong>: 若 M+1 全是紅色，代表新客都是「一次性消費」。</li>
                            </ul>
                        </div>
                    </div>
                </div>
             </div>
        )}

      </main>
    </div>
  );
}

// --- Consultant Prescription Page Component (New Layout) ---
function ConsultantPrescriptionPage() {
    const [isAdmin, setIsAdmin] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Admin States
    const [manualPulse, setManualPulse] = useState('Traffic');
    const [manualContent, setManualContent] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');

    const fetchTasks = async () => { const res = await fetch('/api/tasks'); setTasks(await res.json()); setLoading(false); };
    useEffect(() => { fetchTasks(); }, []);

    // API Actions (Generate, Add, Update, Delete)
    const generateAiTasks = async () => { setLoading(true); await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({}) }); await fetchTasks(); };
    const addManualTask = async () => { if (!manualContent) return; await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({ manual: true, pulse: manualPulse, content: manualContent }) }); setManualContent(''); await fetchTasks(); };
    const updateStatus = async (id: number, newStatus: string) => { setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t)); await fetch('/api/tasks', { method: 'PATCH', body: JSON.stringify({ id, status: newStatus }) }); };
    const deleteTask = async (id: number) => { setTasks(prev => prev.filter(t => t.id !== id)); await fetch('/api/tasks', { method: 'DELETE', body: JSON.stringify({ id }) }); };
    const saveEdit = async (id: number) => { setTasks(prev => prev.map(t => t.id === id ? { ...t, content: editContent } : t)); await fetch('/api/tasks', { method: 'PATCH', body: JSON.stringify({ id, content: editContent }) }); setEditingId(null); };

    // Filter Tasks
    const poolTasks = tasks.filter(t => t.status === 'pool');
    const approvedTasks = tasks.filter(t => t.status === 'approved');
    const activeTasks = tasks.filter(t => t.status === 'active');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Identity Switcher */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{isAdmin ? <UserCog size={24}/> : <User size={24}/>}</div>
                    <div><h2 className="text-lg font-bold text-slate-800">SME 資深顧問藥方</h2><p className="text-sm text-slate-500">目前視角：{isAdmin ? '顧問後台 (挑選與編輯)' : '客戶前台 (執行改善)'}</p></div>
                </div>
                <button onClick={() => setIsAdmin(!isAdmin)} className="text-sm border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">切換身分 (Demo)</button>
            </div>

            {/* === Admin View === */}
            {isAdmin && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Pool & Manual Add */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-[700px] flex flex-col">
                        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Bot size={18}/> 建議池 ({poolTasks.length})</h3><button onClick={generateAiTasks} disabled={loading} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-500 flex items-center gap-1">{loading ? <Loader2 size={12} className="animate-spin"/> : <><Plus size={12}/> AI 生成</>}</button></div>
                        <div className="bg-white p-3 rounded shadow-sm border border-blue-200 mb-4">
                            <h4 className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1"><UserCog size={12}/> 手動新增</h4>
                            <div className="flex gap-2 mb-2">
                                <select value={manualPulse} onChange={e => setManualPulse(e.target.value)} className="text-xs border rounded p-1">{Object.keys(PULSE_CONFIG).map(p => <option key={p} value={p}>{PULSE_CONFIG[p].label}</option>)}</select>
                                <input type="text" value={manualContent} onChange={e => setManualContent(e.target.value)} placeholder="建議內容..." className="flex-1 text-xs border rounded p-1"/>
                            </div>
                            <button onClick={addManualTask} className="w-full bg-blue-50 text-blue-600 text-xs py-1 rounded hover:bg-blue-100 font-bold">新增</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                            {poolTasks.map(t => (
                                <div key={t.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 text-sm group relative">
                                    <div className="flex justify-between items-start">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label || t.pulse}</span>
                                        <div className="flex gap-1">
                                            {editingId === t.id ? (<><button onClick={() => saveEdit(t.id)} className="text-green-600"><Save size={14}/></button><button onClick={() => setEditingId(null)} className="text-slate-400"><X size={14}/></button></>) : (<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition"><button onClick={() => {setEditingId(t.id); setEditContent(t.content)}} className="text-blue-400"><Edit size={14}/></button><button onClick={() => deleteTask(t.id)} className="text-red-400"><Trash2 size={14}/></button></div>)}
                                        </div>
                                    </div>
                                    {editingId === t.id ? <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full mt-2 text-xs border rounded p-1 h-16"/> : <p className="mt-2 text-slate-700">{t.content}</p>}
                                    {editingId !== t.id && <button onClick={() => updateStatus(t.id, 'approved')} className="mt-3 w-full bg-slate-100 hover:bg-green-50 text-slate-600 hover:text-green-600 py-1.5 rounded text-xs font-bold flex justify-center gap-1"><CheckCircle size={14}/> 核准</button>}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Right: Approved */}
                    <div className="bg-white p-6 rounded-xl border-2 border-purple-100 h-[700px] flex flex-col">
                        <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2"><CheckCircle size={18}/> 顧問已核准 ({approvedTasks.length})</h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                             {approvedTasks.map(t => (
                                <div key={t.id} className={`p-3 rounded shadow-sm border text-sm ${t.source === 'Human' ? 'bg-yellow-50 border-yellow-200' : 'bg-purple-50 border-purple-100'}`}>
                                    <div className="flex justify-between">
                                        <div className="flex gap-2"><span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label || t.pulse}</span>{t.source === 'Human' && <span className="text-[10px] bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded font-bold">顧問手寫</span>}</div>
                                        <button onClick={() => updateStatus(t.id, 'pool')} className="text-slate-400 hover:text-red-500"><RefreshCw size={12}/></button>
                                    </div>
                                    <p className="mt-2 text-slate-800 font-medium">{t.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* === Client View (New Layout) === */}
            {!isAdmin && (
                <div className="space-y-10">
                    
                    {/* 1. Prescriptions (Categorized Boxes) */}
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
                                                <button key={t.id} onClick={() => updateStatus(t.id, 'active')} className="w-full text-left bg-white border border-slate-200 p-3 rounded-lg hover:border-purple-400 hover:ring-1 hover:ring-purple-400 transition group relative">
                                                    <p className="text-sm text-slate-700 mb-1">{t.content}</p>
                                                    <div className="text-[10px] text-purple-500 font-bold opacity-0 group-hover:opacity-100 transition absolute bottom-1 right-2 flex items-center gap-1">加入改善 <ArrowRight size={10}/></div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Active Tasks */}
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-6"><div className="bg-blue-600 text-white p-2 rounded-lg"><Flame size={20}/></div><div><h3 className="text-lg font-bold text-slate-800">本月重點改善任務</h3><p className="text-sm text-slate-500">請專注執行以下項目，完成後勾選。</p></div></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {activeTasks.map(t => (
                                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500 flex flex-col justify-between">
                                    <div><span className={`text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span><p className="text-slate-800 text-sm font-medium mb-3">{t.content}</p></div>
                                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition border border-transparent hover:border-slate-200"><input type="checkbox" className="w-5 h-5 accent-blue-600" onChange={() => updateStatus(t.id, 'done')}/><span className="text-xs text-slate-500 font-bold">標記完成</span></label>
                                </div>
                            ))}
                            {activeTasks.length === 0 && <div className="col-span-full text-center py-8 border-2 border-dashed border-blue-200 rounded-xl text-blue-400">尚無任務，請從上方「六脈建議」中點擊加入</div>}
                        </div>
                    </div>

                    {/* 3. History (at Bottom) */}
                    <div className="opacity-70 grayscale hover:grayscale-0 transition duration-500">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2"><CheckCircle size={18} className="text-slate-400"/><h3 className="font-bold text-slate-500">歷史完成紀錄 ({doneTasks.length})</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             {doneTasks.map(t => (<div key={t.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs"><div className="flex justify-between mb-1"><span className="text-slate-400">{PULSE_CONFIG[t.pulse]?.label}</span><span className="text-green-600 font-bold">Done</span></div><p className="text-slate-500 line-through">{t.content}</p></div>))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub-components (Unchanged) ---
function TabButton({ id, label, icon, active, onClick, isNew }: any) { return <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${active ? 'border-blue-600 text-blue-600 font-bold bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-blue-600'}`}>{icon} {label} {isNew && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}</button>; }
function KpiCard({ title, value, color }: any) { return <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}><p className="text-sm text-gray-500">{title}</p><h3 className="text-2xl font-bold mt-2">{value}</h3></div>; }
function AiDiagnosisPanel({ page, dataSummary }: any) { const [d, setD] = useState(""); const [l, setL] = useState(false); const run = async () => { setL(true); const r = await fetch('/api/diagnose', { method: 'POST', body: JSON.stringify({ page, dataSummary }) }); const j = await r.json(); setD(j.diagnosis); setL(false); }; return <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl"><div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4"><div className="bg-slate-700 p-2 rounded-lg"><Bot className="text-blue-400" /></div><h3 className="text-lg font-bold">SME AI 六脈診斷(未串接，需token)</h3></div><div className="flex-1 space-y-4">{d ? <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed border border-white/10 animate-in fade-in"><p>{d}</p></div> : <div className="text-slate-400 text-sm text-center py-10">{l ? "分析中..." : "點擊按鈕啟動 AI 診斷"}</div>}</div><button onClick={run} disabled={l} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2">{l?'分析中...':<><Sparkles size={16}/> 開始診斷</>}</button></div>; }
function SpecDetail({ title, logic, note, color, isMissing }: any) { const style = {blue:'text-blue-600 bg-blue-50 border-blue-100', green:'text-green-600 bg-green-50 border-green-100', yellow:'text-yellow-600 bg-yellow-50 border-yellow-100', red:'text-red-600 bg-red-50 border-red-100', purple:'text-purple-600 bg-purple-50 border-purple-100', slate:'text-slate-600 bg-slate-50 border-slate-100'}[color as string]||''; return <div className={`p-5 rounded-xl border ${style.split(' ')[2]} bg-white ${isMissing?'opacity-70 grayscale':''}`}><h4 className={`font-bold text-lg mb-2 flex justify-between ${style.split(' ')[0]}`}>{title} {isMissing&&<span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Missing</span>}</h4><div className={`text-sm font-mono p-2 rounded mb-3 border ${style}`}>{logic}</div><p className="text-xs text-gray-500">{note}</p></div>; }
function DataUploader({ onUploadComplete }: any) { const [uploading, setUploading] = useState(false); const [msg, setMsg] = useState(""); const handleFile = (e: any) => { const file = e.target.files[0]; if (!file) return; setUploading(true); setMsg("解析中..."); Papa.parse(file, { header: true, skipEmptyLines: true, complete: async (results) => { setMsg(`上傳中 (共${results.data.length}筆)...`); const cleanRows = results.data.map((row: any) => ({ order_date: new Date(row['Order_Date']), customer_id: row['Customer_ID'], amount: row['Amount'] ? parseFloat(row['Amount'].toString().replace(/,/g, '')) : 0, product_name: row['Product_Service'], channel: row['Channel'], import_batch_id: 'web_upload_' + Date.now() })).filter((r:any) => !isNaN(r.amount)); const BATCH_SIZE = 1000; for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) { await supabase.from('transactions').insert(cleanRows.slice(i, i + BATCH_SIZE)); } setUploading(false); setMsg("🎉 上傳成功！"); onUploadComplete(); } }); }; return <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition"><input type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-upload" disabled={uploading} /><label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2"><FileUp size={40} className="text-blue-500"/><span className="font-bold text-slate-700">點擊上傳 CSV</span></label>{msg && <div className="mt-4 text-sm font-bold text-blue-600">{msg}</div>}</div>; }