'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';
import { 
  Loader2, PieChart, Microscope, ListTodo, FileText, ArrowUp, Plus, 
  Bot, Flame, CheckCircle, UserCog, User, ArrowRight, RefreshCw, Sparkles, Upload, FileUp, Edit, Save, X,
  Users, MousePointerClick, Gem, Repeat, MessageSquare, CircleDollarSign, Info, Building2
} from 'lucide-react';
import Papa from 'papaparse';
// ★★★ 關鍵修正 1：改用新的 @supabase/ssr 套件 ★★★
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

// --- Interface Definitions ---
interface Task {
  id: number;
  pulse: string;
  content: string;
  source: string;
  status: 'pool' | 'approved' | 'active' | 'done';
  client_name?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('page1');
  const [selectedClient, setSelectedClient] = useState<string>(''); 
  const [clientList, setClientList] = useState<string[]>([]); 
  
  const [data, setData] = useState<any[]>([]);
  const [rfmData, setRfmData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [pulseScores, setPulseScores] = useState<any[]>([
    { subject: '流量', A: 0, full: 5 }, { subject: '轉換', A: 0, full: 5 },
    { subject: '獲利', A: 0, full: 5 }, { subject: '主顧', A: 0, full: 5 },
    { subject: '回購', A: 0, full: 5 }, { subject: '口碑', A: 0, full: 5 }
  ]);

  // ★★★ 關鍵修正 2：使用 createBrowserClient 初始化 ★★★
  // 請確保您的 .env.local 檔案中有這兩個變數
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. 初始載入：抓取所有客戶列表
  const fetchClients = async () => {
    try {
        const { data } = await supabase.from('transactions').select('client_name');
        if (data) {
            const uniqueClients = Array.from(new Set(data.map((item: any) => item.client_name))).filter(Boolean);
            setClientList(uniqueClients as string[]);
            if (!selectedClient && uniqueClients.length > 0) {
                setSelectedClient(uniqueClients[0] as string);
            }
        }
    } catch (e) { console.error("Fetch clients error:", e); }
  };

  useEffect(() => { fetchClients(); }, []);

  // 2. 當選擇客戶改變時，重新抓取該客戶的數據
  useEffect(() => {
    if (selectedClient) {
        refreshData(selectedClient);
    } else {
        setData([]); setRfmData([]); setCohortData([]);
        setPulseScores(pulseScores.map(p => ({ ...p, A: 0 })));
    }
  }, [selectedClient]);

  const refreshData = async (clientName: string) => {
    try {
        setLoading(true);
        
        const [dashRes, rfmRes, cohortRes] = await Promise.all([
            supabase.from('monthly_brand_pulse').select('*').eq('client_name', clientName).order('year_month', { ascending: true }),
            supabase.from('rfm_analysis').select('*').eq('client_name', clientName).limit(100),
            supabase.from('cohort_retention').select('*').eq('client_name', clientName)
        ]);

        const dashData = dashRes.data || [];
        const rfmDataRaw = rfmRes.data || [];
        const cohortDataRaw = cohortRes.data || [];

        setData(dashData);
        setRfmData(rfmDataRaw);
        processCohortData(cohortDataRaw);
        
        calculatePulseScores(dashData);
        
        setLoading(false);
    } catch (err) { 
        console.error(err); 
        setLoading(false); 
    }
  };

  const calculatePulseScores = (dashData: any[]) => {
    if (!dashData || dashData.length === 0) {
        setPulseScores(pulseScores.map(p => ({ ...p, A: 0 })));
        return;
    }
    const latest = dashData[dashData.length - 1];
    const totalRev = latest.total_revenue || 1;
    
    const trafficScore = Math.min(5, Math.ceil((latest.new_customer_revenue / totalRev) * 10));
    const retentionScore = Math.min(5, Math.ceil((latest.old_customer_revenue / totalRev) * 12.5));
    const aovScore = Math.min(5, (latest.aov / 2000) * 5);
    const profitScore = Math.min(5, Math.log10(totalRev) - 3);

    setPulseScores([
      { subject: '流量', A: parseFloat(trafficScore.toFixed(1)), full: 5 },
      { subject: '轉換', A: 3.0, full: 5 },
      { subject: '獲利', A: parseFloat(profitScore.toFixed(1)), full: 5 },
      { subject: '主顧', A: parseFloat(aovScore.toFixed(1)), full: 5 },
      { subject: '回購', A: parseFloat(retentionScore.toFixed(1)), full: 5 },
      { subject: '口碑', A: 2.5, full: 5 }
    ]);
  };

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

  const handleUploadSuccess = (newClientName: string) => {
      fetchClients();
      setSelectedClient(newClientName);
      setActiveTab('page1');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white shadow-md sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-lg">S</div>
                    <span className="text-lg font-bold text-slate-800 hidden md:block">SMEbig War Room</span>
                </div>
                
                <div className="relative">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                        <Building2 size={16} className="text-slate-500"/>
                        <select 
                            value={selectedClient} 
                            onChange={(e) => setSelectedClient(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer min-w-[120px]"
                        >
                            <option value="" disabled>請選擇客戶...</option>
                            {clientList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex space-x-1 md:space-x-4 h-full overflow-x-auto">
                <TabButton id="page1" label="營運體檢" icon={<PieChart size={16}/>} active={activeTab === 'page1'} onClick={() => setActiveTab('page1')} />
                <TabButton id="page2" label="深度病理" icon={<Microscope size={16}/>} active={activeTab === 'page2'} onClick={() => setActiveTab('page2')} />
                <TabButton id="page3" label="顧問藥方" icon={<ListTodo size={16}/>} active={activeTab === 'page3'} onClick={() => setActiveTab('page3')} />
                <TabButton id="page4" label="資料上傳" icon={<Upload size={16}/>} active={activeTab === 'page4'} onClick={() => setActiveTab('page4')} isNew />
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        
        {!selectedClient && activeTab !== 'page4' && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                <Building2 size={64} className="mb-4 text-slate-200"/>
                <h3 className="text-xl font-bold text-slate-600">請先選擇一位客戶</h3>
                <p className="mb-6">左上角下拉選單選擇現有客戶，或至「資料上傳」建立新客戶。</p>
                <button onClick={() => setActiveTab('page4')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={18}/> 上傳新資料
                </button>
            </div>
        )}

        {selectedClient && activeTab === 'page1' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold text-slate-800">📊 {selectedClient} - 營運總覽</h2>
                <span className="text-xs text-slate-400">最後更新: {new Date().toLocaleDateString()}</span>
            </div>

            {loading ? <LoadingSkeleton /> : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KpiCard title="總營收" value={`$${(latest.total_revenue||0).toLocaleString()}`} color="border-l-blue-500" />
                    <KpiCard title="訂單量" value={latest.order_count||0} color="border-l-purple-500" />
                    <KpiCard title="客單價 (AOV)" value={`$${latest.aov||0}`} color="border-l-yellow-500" />
                    <KpiCard title="新客營收" value={`$${(latest.new_customer_revenue||0).toLocaleString()}`} color="border-l-green-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">品牌六脈診斷</h2>
                        <div className="h-[300px]">
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={pulseScores}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} />
                            <Radar name={selectedClient} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                            <Legend />
                            <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                        </div>
                    </div>
                    <AiDiagnosisPanel clientName={selectedClient} revenue={latest.total_revenue} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">營收結構 (新舊客)</h3>
                        <div className="h-[250px]"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year_month" /><YAxis /><Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} /><Legend /><Bar dataKey="old_customer_revenue" stackId="a" fill="#8b5cf6" name="舊客" /><Bar dataKey="new_customer_revenue" stackId="a" fill="#22c55e" name="新客" /></BarChart></ResponsiveContainer></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">總營收趨勢</h3>
                        <div className="h-[250px]"><ResponsiveContainer><AreaChart data={data}><defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="year_month" /><YAxis /><CartesianGrid strokeDasharray="3 3" vertical={false} /><Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} /><Area type="monotone" dataKey="total_revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" name="總營收" /></AreaChart></ResponsiveContainer></div>
                    </div>
                </div>
            </>
            )}
          </div>
        )}

        {selectedClient && activeTab === 'page2' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-slate-800">🔬 {selectedClient} - 深度病理分析</h2>
            {loading ? <LoadingSkeleton /> : (
            <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-purple-500 pl-3">RFM 顧客價值矩陣</h3>
                        <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">樣本數: {rfmData.length}</span>
                    </div>
                    {rfmData.length > 0 ? (
                        <div className="h-96 w-full"><ResponsiveContainer><ScatterChart><CartesianGrid /><XAxis type="number" dataKey="recency_days" name="Recency" unit="天前" reversed /><YAxis type="number" dataKey="frequency" name="Frequency" unit="次" /><ZAxis type="number" dataKey="monetary" range={[50, 800]} name="Monetary" /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Customers" data={rfmData} fill="#8884d8" /></ScatterChart></ResponsiveContainer></div>
                    ) : <EmptyState message="無 RFM 資料" />}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3 mb-4">同層留存率 (Cohort)</h3>
                    {cohortData.length > 0 ? (
                        <table className="w-full text-center text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-3">月份</th><th>M+0</th><th>M+1</th><th>M+2</th></tr></thead><tbody>{cohortData.map((r:any,i:number)=>(<tr key={i} className="border-b"><td className="p-3 font-mono text-slate-600">{r.m}</td>{r.v.slice(0,3).map((v:any,j:number)=><td key={j} className={v<20?'text-red-500 font-bold bg-red-50':'text-slate-700'}>{v}%</td>)}</tr>))}</tbody></table>
                    ) : <EmptyState message="無 Cohort 資料" />}
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-green-500 pl-3 mb-4">LTV 價值趨勢</h3>
                        {data.length > 0 ? (<div className="h-[250px]"><ResponsiveContainer><LineChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="year_month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="aov" stroke="#10b981" strokeWidth={3} name="平均客單價" /></LineChart></ResponsiveContainer></div>) : <EmptyState />}
                    </div>
                </div>
            </>
            )}
          </div>
        )}

        {selectedClient && activeTab === 'page3' && <ConsultantPrescriptionPage clientName={selectedClient} />}
        
        {activeTab === 'page4' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                        <div className="text-center mb-8">
                            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Upload size={32} className="text-blue-600"/></div>
                            <h2 className="text-2xl font-bold text-slate-800">上傳交易資料</h2>
                            <p className="text-slate-500">支援 CUPETIT 格式 CSV，上傳後系統將自動建立客戶檔案並分析。</p>
                        </div>
                        <DataUploader supabase={supabase} onSuccess={handleUploadSuccess} />
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}

// --- Components ---

function DataUploader({ supabase, onSuccess }: any) { 
    const [uploading, setUploading] = useState(false); 
    const [clientName, setClientName] = useState("");
    const [msg, setMsg] = useState(""); 
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    
    const handleFile = (e: any) => { 
        if (!clientName.trim()) {
            alert("請先輸入客戶名稱！");
            e.target.value = '';
            return;
        }

        const file = e.target.files[0]; 
        if (!file) return; 
        
        setUploading(true); 
        setStatus('processing');
        setMsg("正在解析 CSV..."); 
        
        Papa.parse(file, { 
            header: true, 
            skipEmptyLines: true, 
            complete: async (results) => { 
                setMsg(`解析成功 (${results.data.length}筆)，正在寫入資料庫...`); 
                
                const cleanRows = results.data.map((row: any) => {
                    const rawAmount = row['金額'] || row['amount'] || '0';
                    const amount = parseFloat(rawAmount.toString().replace(/,/g, ''));
                    let dateStr = row['購買日期'] || row['order_date'];
                    const orderDate = new Date(dateStr);

                    return { 
                        order_date: isNaN(orderDate.getTime()) ? new Date() : orderDate, 
                        customer_id: row['客戶編號'] || row['customer_id'], 
                        amount: isNaN(amount) ? 0 : amount, 
                        product_name: row['購買品項'] || row['product_name'], 
                        channel: row['通路'] || row['channel'] || 'EC',
                        client_name: clientName
                    };
                }).filter((r:any) => !isNaN(r.amount) && r.customer_id); 
                
                const BATCH_SIZE = 1000; 
                try {
                    for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) { 
                        const { error } = await supabase.from('transactions').insert(cleanRows.slice(i, i + BATCH_SIZE)); 
                        if(error) throw error;
                        setMsg(`已寫入 ${Math.min((i + BATCH_SIZE), cleanRows.length)} / ${cleanRows.length} 筆...`);
                    } 
                    
                    setUploading(false); 
                    setStatus('success');
                    setMsg("🎉 上傳成功！系統正在生成分析報告...");
                    
                    setTimeout(() => {
                        onSuccess(clientName);
                    }, 1500);

                } catch (error: any) {
                    console.error(error);
                    setStatus('error');
                    setMsg("上傳失敗: " + error.message);
                    setUploading(false);
                }
            } 
        }); 
    }; 

    if (status === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-in zoom-in">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-700">資料匯入完成！</h3>
                <p className="text-green-600">正在為您跳轉至 {clientName} 的儀表板...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">客戶名稱 (Client Name)</label>
                <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                    placeholder="例如：CUPETIT, 某某品牌..." 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    disabled={uploading}
                />
            </div>

            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition ${uploading ? 'bg-slate-50 border-slate-300' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                <input type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-upload" disabled={uploading || !clientName} />
                <label htmlFor="csv-upload" className={`cursor-pointer flex flex-col items-center gap-2 ${!clientName ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploading ? <Loader2 className="animate-spin text-blue-500 w-10 h-10"/> : <FileUp size={40} className="text-blue-500"/>}
                    <span className="font-bold text-slate-700">{uploading ? '資料處理中，請勿關閉視窗...' : '點擊上傳 CSV 檔案'}</span>
                    <span className="text-xs text-slate-400">支援中文欄位 (客戶編號, 金額, 購買日期...)</span>
                </label>
            </div>
            
            {msg && <div className={`text-center text-sm font-bold ${status === 'error' ? 'text-red-500' : 'text-blue-600'}`}>{msg}</div>}
        </div>
    ); 
}

function TabButton({ id, label, icon, active, onClick, isNew }: any) { return <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{icon} {label} {isNew && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}</button>; }
function KpiCard({ title, value, color }: any) { return <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}><p className="text-sm text-gray-500">{title}</p><h3 className="text-2xl font-bold mt-2">{value}</h3></div>; }
function EmptyState({ message = "目前無資料" }: any) { return <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-200"><Info className="mb-2"/><p>{message}</p></div>; }
function LoadingSkeleton() { return <div className="space-y-4 animate-pulse"><div className="h-32 bg-slate-200 rounded-xl"></div><div className="grid grid-cols-2 gap-4"><div className="h-64 bg-slate-200 rounded-xl"></div><div className="h-64 bg-slate-200 rounded-xl"></div></div></div>; }

function AiDiagnosisPanel({ clientName, revenue }: any) { 
    const [d, setD] = useState(""); 
    const [l, setL] = useState(false); 
    const run = async () => { 
        setL(true); 
        await new Promise(r => setTimeout(r, 2000));
        setD(`【${clientName} 專屬診斷】\n根據年度營收 $${(revenue||0).toLocaleString()} 分析，您的主顧力表現優異，但新客轉換成本偏高。建議透過「Page 3 顧問藥方」啟動 MGM 舊客帶新客計畫。`); 
        setL(false); 
    }; 
    return <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl"><div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4"><div className="bg-slate-700 p-2 rounded-lg"><Bot className="text-blue-400" /></div><h3 className="text-lg font-bold">AI 六脈診斷</h3></div><div className="flex-1 space-y-4">{d ? <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed border border-white/10 animate-in fade-in whitespace-pre-wrap"><p>{d}</p></div> : <div className="text-slate-400 text-sm text-center py-10">{l ? "AI 正在分析大數據..." : `點擊開始分析 ${clientName || '...'} `}</div>}</div><button onClick={run} disabled={l || !clientName} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 disabled:opacity-50">{l?'分析中...':<><Sparkles size={16}/> 開始診斷</>}</button></div>; 
}

function ConsultantPrescriptionPage({ clientName }: any) {
    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-800">💊 {clientName} - 顧問藥方與任務看板</h2>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 mb-6"><div className="bg-blue-600 text-white p-2 rounded-lg"><Flame size={20}/></div><div><h3 className="text-lg font-bold text-slate-800">本月重點改善任務</h3></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500"><div><span className="text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block bg-blue-50 text-blue-700">流量脈</span><p className="text-slate-800 text-sm font-medium">針對 {clientName} 的新客啟動 Google Ads 再行銷</p></div></div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-red-500"><div><span className="text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block bg-red-50 text-red-700">回購脈</span><p className="text-slate-800 text-sm font-medium">發送 VIP 專屬折扣碼</p></div></div>
                </div>
            </div>
        </div>
    );
}