'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Loader2, PieChart as IconPie, Microscope, ListTodo, FileText, Upload, FileUp, 
  Bot, Flame, CheckCircle, UserCog, Plus, ArrowRight, RefreshCw, Sparkles, Edit, Save, X, Trash2,
  Users, MousePointerClick, Gem, Repeat, MessageSquare, CircleDollarSign, Info, Building2
} from 'lucide-react';
import Papa from 'papaparse';
import { createBrowserClient } from '@supabase/ssr';

// --- Configuration ---
const PULSE_CONFIG: Record<string, { label: string, icon: any, color: string, bg: string, border: string, text: string }> = {
  'Traffic': { label: '流量脈', icon: Users, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Conversion': { label: '轉換脈', icon: MousePointerClick, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'VIP': { label: '主顧脈', icon: Gem, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  'Retention': { label: '回購脈', icon: Repeat, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  'Reputation': { label: '口碑脈', icon: MessageSquare, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  'Profit': { label: '獲利脈', icon: CircleDollarSign, color: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b'];

// --- Types ---
interface Task {
  id: number;
  pulse: string;
  content: string;
  source: string;
  status: 'pool' | 'approved' | 'active' | 'done';
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('page1');
  const [selectedClient, setSelectedClient] = useState<string>(''); 
  const [clientList, setClientList] = useState<string[]>([]); 
  
  // Data States
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [channelData, setChannelData] = useState<any[]>([]);
  const [rfmData, setRfmData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  
  const [pulseScores, setPulseScores] = useState<any[]>([
    { subject: '流量', A: 0, full: 5 }, { subject: '轉換', A: 0, full: 5 },
    { subject: '獲利', A: 0, full: 5 }, { subject: '主顧', A: 0, full: 5 },
    { subject: '回購', A: 0, full: 5 }, { subject: '口碑', A: 0, full: 5 }
  ]);

  const [loading, setLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Fetch Clients
  const fetchClients = async () => {
    try {
        const { data } = await supabase.from('transactions').select('client_name');
        if (data) {
            const uniqueClients = Array.from(new Set(data.map((item: any) => item.client_name))).filter(Boolean);
            setClientList(uniqueClients as string[]);
            if (!selectedClient && uniqueClients.length > 0) setSelectedClient(uniqueClients[0] as string);
        }
    } catch (e) { console.error("Fetch clients error:", e); }
  };
  useEffect(() => { fetchClients(); }, []);

  // 2. Fetch & Analyze Data
  useEffect(() => {
    if (selectedClient) refreshData(selectedClient);
  }, [selectedClient]);

  const refreshData = async (clientName: string) => {
    setLoading(true);
    const { data: rawTx } = await supabase.from('transactions').select('*').eq('client_name', clientName).order('order_date', { ascending: true });
    
    if (rawTx && rawTx.length > 0) {
        analyzeData(rawTx);
    } else {
        setMonthlyData([]); setPulseScores([]); setProductData([]); setChannelData([]); setRfmData([]); setCohortData([]);
    }
    setLoading(false);
  };

  // ★★★ 核心分析引擎 ★★★
  const analyzeData = (txs: any[]) => {
    // 1. 基礎統計與六脈運算
    const totalCount = txs.length;
    const totalAmount = txs.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const validOrders = txs.filter(t => t.amount > 0).length;
    const conversionRate = totalCount > 0 ? (validOrders / totalCount) : 0;
    
    const customerMap: Record<string, { count: number, amount: number, firstDate: Date, dates: Set<string> }> = {};
    txs.forEach(t => {
        if (!t.customer_id) return;
        if (!customerMap[t.customer_id]) {
            customerMap[t.customer_id] = { count: 0, amount: 0, firstDate: new Date(t.order_date), dates: new Set() };
        }
        const c = customerMap[t.customer_id];
        c.count += 1;
        c.amount += t.amount;
        c.dates.add(new Date(t.order_date).toISOString().split('T')[0]); 
    });

    const customers = Object.values(customerMap);
    const uniqueCustomersCount = customers.length;
    
    const repeatCustomers = customers.filter(c => c.dates.size > 1).length;
    const repeatRate = uniqueCustomersCount > 0 ? (repeatCustomers / uniqueCustomersCount) : 0;

    // VIP (80/20 Rule)
    const sortedCustomers = [...customers].sort((a, b) => b.amount - a.amount);
    const top20Count = Math.ceil(uniqueCustomersCount * 0.2);
    const top20Customers = sortedCustomers.slice(0, top20Count);
    const top20Revenue = top20Customers.reduce((sum, c) => sum + c.amount, 0);
    const vipConcentration = totalAmount > 0 ? (top20Revenue / totalAmount) : 0;
    const vipScore = Math.min(5, (vipConcentration / 0.8) * 5);

    const trafficScore = Math.min(5, Math.log10(uniqueCustomersCount) * 1.5);
    const profitScore = Math.min(5, Math.log10(totalAmount) - 3);
    const reputationScore = 2.5;

    setPulseScores([
        { subject: '流量', A: parseFloat(trafficScore.toFixed(1)), full: 5 },
        { subject: '轉換', A: parseFloat((conversionRate * 5).toFixed(1)), full: 5 },
        { subject: '獲利', A: parseFloat(profitScore.toFixed(1)), full: 5 },
        { subject: '主顧', A: parseFloat(vipScore.toFixed(1)), full: 5 },
        { subject: '回購', A: parseFloat((repeatRate * 10).toFixed(1)), full: 5 },
        { subject: '口碑', A: reputationScore, full: 5 }
    ]);

    // 2. Monthly Trend
    const monthlyMap: Record<string, { revenue: number, orders: number, newRev: number, oldRev: number }> = {};
    txs.forEach(t => {
        const dateObj = new Date(t.order_date);
        if (isNaN(dateObj.getTime())) return;
        const month = dateObj.toISOString().substring(0, 7);
        
        if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, orders: 0, newRev: 0, oldRev: 0 };
        const m = monthlyMap[month];
        m.revenue += t.amount;
        m.orders += 1;

        const firstDateStr = customerMap[t.customer_id].firstDate.toISOString().split('T')[0];
        const orderDateStr = dateObj.toISOString().split('T')[0];
        
        if (orderDateStr === firstDateStr) {
            m.newRev += t.amount;
        } else {
            m.oldRev += t.amount;
        }
    });

    const monthlyChartData = Object.keys(monthlyMap).sort().map(m => ({
        year_month: m,
        total_revenue: monthlyMap[m].revenue,
        new_customer_revenue: monthlyMap[m].newRev,
        old_customer_revenue: monthlyMap[m].oldRev,
        order_count: monthlyMap[m].orders,
        aov: Math.round(monthlyMap[m].revenue / monthlyMap[m].orders)
    }));
    setMonthlyData(monthlyChartData);

    // 3. Product Analysis
    const prodMap: Record<string, { count: number, revenue: number }> = {};
    txs.forEach(t => {
        const pName = t.product_name || '未分類';
        if (!prodMap[pName]) prodMap[pName] = { count: 0, revenue: 0 };
        prodMap[pName].count += 1;
        prodMap[pName].revenue += t.amount;
    });
    const productChartData = Object.entries(prodMap)
        .map(([name, d]) => ({ name, value: d.revenue, count: d.count }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
    setProductData(productChartData);

    // 4. Channel Analysis
    const chanMap: Record<string, number> = {};
    txs.forEach(t => {
        const ch = t.channel || 'Unknown';
        chanMap[ch] = (chanMap[ch] || 0) + t.amount;
    });
    const channelChartData = Object.entries(chanMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    setChannelData(channelChartData);

    // 5. RFM Scatter Data
    const rfmChartData = customers.map(c => {
        const today = new Date();
        const dateArray = Array.from(c.dates).sort();
        const lastDateStr = dateArray[dateArray.length - 1] || today.toISOString();
        const lastDate = new Date(lastDateStr);
        const recencyDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        
        return {
            x: Math.max(0, recencyDays),
            y: c.count,
            z: c.amount
        };
    }).filter(d => d.z > 0).slice(0, 800);
    setRfmData(rfmChartData);

    // 6. Cohort (Simplified)
    const cohortMap: Record<string, number> = {};
    customers.forEach(c => {
        const m = c.firstDate.toISOString().substring(0, 7);
        cohortMap[m] = (cohortMap[m] || 0) + 1;
    });
    const simpleCohort = Object.entries(cohortMap).sort().map(([m, count]) => ({
        m, v: [100, Math.floor(Math.random()*30), Math.floor(Math.random()*10)] 
    }));
    setCohortData(simpleCohort);
  };

  const handleUploadSuccess = (newClientName: string) => {
      fetchClients();
      setSelectedClient(newClientName);
      setActiveTab('page1');
  };

  const totalRev = monthlyData.reduce((acc, cur) => acc + cur.total_revenue, 0);
  const totalOrd = monthlyData.reduce((acc, cur) => acc + cur.order_count, 0);

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
                <TabButton id="page1" label="營運體檢" icon={<IconPie size={16}/>} active={activeTab === 'page1'} onClick={() => setActiveTab('page1')} />
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

        {/* === Page 1: Overview === */}
        {selectedClient && activeTab === 'page1' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
                <h2 className="text-2xl font-bold text-slate-800">📊 {selectedClient} - 營運總覽</h2>
            </div>
            {loading ? <LoadingSkeleton /> : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KpiCard title="總營收" value={`$${totalRev.toLocaleString()}`} color="border-l-blue-500" />
                    <KpiCard title="訂單量" value={totalOrd.toLocaleString()} color="border-l-purple-500" />
                    <KpiCard title="客單價 (AOV)" value={`$${totalOrd > 0 ? Math.round(totalRev/totalOrd).toLocaleString() : 0}`} color="border-l-yellow-500" />
                    <KpiCard title="有效轉換率" value={`${(pulseScores[1].A * 20).toFixed(1)}%`} color="border-l-green-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold mb-4">品牌六脈診斷 (V5.3)</h2>
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
                    <AiDiagnosisPanel clientName={selectedClient} revenue={totalRev} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">總營收趨勢 (新舊客分析)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="year_month" />
                                <YAxis />
                                <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="old_customer_revenue" stackId="a" fill="#8b5cf6" name="舊客營收" />
                                <Bar dataKey="new_customer_revenue" stackId="a" fill="#22c55e" name="新客營收" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </>
            )}
          </div>
        )}

        {/* === Page 2: Deep Analysis === */}
        {selectedClient && activeTab === 'page2' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-800">🔬 深度病理分析</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Product Sales (Top 10) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-green-500 pl-3 mb-4">熱銷品項排行 (Top 10)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer>
                            <BarChart layout="vertical" data={productData}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                                <Tooltip formatter={(val:any) => `$${val.toLocaleString()}`} />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="銷售額" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Channel Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-purple-500 pl-3 mb-4">通路成效分析</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer>
                            <PieChart>
                                {/* ★★★ 修復重點：加上 { percent: any } 型別宣告與防呆 ★★★ */}
                                <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({name, percent}: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                                    {channelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val:any) => `$${val.toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3 mb-4">RFM 顧客價值分佈</h3>
                <div className="h-[400px]">
                    <ResponsiveContainer>
                        <ScatterChart>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="x" name="最近購買天數 (Recency)" unit="天" reversed />
                            <YAxis type="number" dataKey="y" name="購買次數 (Frequency)" unit="次" />
                            <ZAxis type="number" dataKey="z" range={[50, 1000]} name="消費金額 (Monetary)" />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Customers" data={rfmData} fill="#3b82f6" fillOpacity={0.6} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>
        )}

        {/* === Page 3: Consultant Prescription === */}
        {selectedClient && activeTab === 'page3' && <ConsultantPrescriptionPage clientName={selectedClient} />}

        {/* === Page 4: Upload === */}
        {activeTab === 'page4' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="text-center mb-8">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Upload size={32} className="text-blue-600"/></div>
                        <h2 className="text-2xl font-bold text-slate-800">上傳交易資料</h2>
                        <p className="text-slate-500">支援 CSV 格式。系統將自動去除空格與千分位逗號，確保金額準確。</p>
                    </div>
                    <DataUploader supabase={supabase} onSuccess={handleUploadSuccess} />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

// --- Sub-Components ---

function ConsultantPrescriptionPage({ clientName }: any) {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, pulse: 'Traffic', content: `針對 ${clientName} 新客投放 Google Ads`, source: 'AI', status: 'pool' },
        { id: 2, pulse: 'Retention', content: '設計老客回歸 8 折券', source: 'Human', status: 'approved' },
        { id: 3, pulse: 'VIP', content: '篩選年度 Top 20 寄送禮品', source: 'Human', status: 'active' }
    ]);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [newPulse, setNewPulse] = useState('Traffic');

    const addTask = () => {
        if (!newTaskContent.trim()) return;
        setTasks([...tasks, { id: Date.now(), pulse: newPulse, content: newTaskContent, source: 'Human', status: 'pool' }]);
        setNewTaskContent('');
    };

    const moveTask = (id: number, status: any) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const poolTasks = tasks.filter(t => t.status === 'pool');
    const approvedTasks = tasks.filter(t => t.status === 'approved');
    const activeTasks = tasks.filter(t => t.status === 'active');

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">💊 {clientName} - 顧問藥方管理</h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-2">
                <select value={newPulse} onChange={(e) => setNewPulse(e.target.value)} className="border rounded px-2 text-sm bg-slate-50">
                    {Object.keys(PULSE_CONFIG).map(k => <option key={k} value={k}>{PULSE_CONFIG[k].label}</option>)}
                </select>
                <input 
                    type="text" 
                    value={newTaskContent} 
                    onChange={(e) => setNewTaskContent(e.target.value)} 
                    placeholder="輸入新的改善對策..." 
                    className="flex-1 border rounded px-3 text-sm"
                />
                <button onClick={addTask} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 font-bold flex items-center gap-1"><Plus size={16}/> 新增</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[500px]">
                    <h3 className="font-bold text-slate-600 mb-4 flex items-center gap-2"><Bot size={18}/> 建議池 (Pool)</h3>
                    <div className="space-y-2">
                        {poolTasks.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 group">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span>
                                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                                        <button onClick={() => moveTask(t.id, 'approved')} className="text-green-500"><CheckCircle size={16}/></button>
                                        <button onClick={() => deleteTask(t.id)} className="text-red-400"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700">{t.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 min-h-[500px]">
                    <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2"><CheckCircle size={18}/> 已核准 (Approved)</h3>
                    <div className="space-y-2">
                        {approvedTasks.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded shadow-sm border border-purple-200 group">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span>
                                    <button onClick={() => moveTask(t.id, 'active')} className="text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-50 p-1 rounded"><ArrowRight size={16}/></button>
                                </div>
                                <p className="text-sm text-slate-700">{t.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 min-h-[500px]">
                    <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2"><Flame size={18}/> 執行中 (Active)</h3>
                    <div className="space-y-2">
                        {activeTasks.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span>
                                    <button onClick={() => moveTask(t.id, 'done')} className="text-slate-400 hover:text-green-600"><CheckCircle size={16}/></button>
                                </div>
                                <p className="text-sm text-slate-700 font-bold">{t.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DataUploader({ supabase, onSuccess }: any) { 
    const [uploading, setUploading] = useState(false); 
    const [clientName, setClientName] = useState("");
    const [msg, setMsg] = useState(""); 
    
    const handleFile = (e: any) => { 
        if (!clientName.trim()) { alert("請先輸入客戶名稱！"); e.target.value = ''; return; }
        const file = e.target.files[0]; 
        if (!file) return; 
        
        setUploading(true); setMsg("正在解析 CSV (去除空格與清洗)..."); 
        
        Papa.parse(file, { 
            header: true, 
            skipEmptyLines: true, 
            complete: async (results) => { 
                const cleanRows = results.data.map((row: any) => {
                    const rawAmount = row['金額'] || row['amount'] || '0';
                    const cleanAmountStr = rawAmount.toString().replace(/[\s,]/g, ''); 
                    const amount = parseFloat(cleanAmountStr);
                    
                    let dateStr = row['購買日期'] || row['order_date'];
                    const orderDate = new Date(dateStr);

                    return { 
                        order_date: isNaN(orderDate.getTime()) ? new Date() : orderDate, 
                        customer_id: row['客戶編號'] || row['customer_id'], 
                        amount: isNaN(amount) ? 0 : amount, 
                        product_name: row['購買品項'] || row['product_name'], 
                        channel: row['通路'] || row['channel'] || 'EC',
                        client_name: clientName,
                        user_id: null 
                    };
                }).filter((r:any) => !isNaN(r.amount) && r.customer_id); 
                
                setMsg(`清洗完成，準備寫入 ${cleanRows.length} 筆資料...`);
                const BATCH_SIZE = 1000; 
                try {
                    for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) { 
                        const { error } = await supabase.from('transactions').insert(cleanRows.slice(i, i + BATCH_SIZE)); 
                        if(error) throw error;
                        setMsg(`已寫入 ${Math.min((i + BATCH_SIZE), cleanRows.length)} / ${cleanRows.length} 筆...`);
                    } 
                    setUploading(false); onSuccess(clientName);
                } catch (error: any) {
                    console.error(error); setMsg("上傳失敗: " + error.message); setUploading(false);
                }
            } 
        }); 
    }; 
    return (
        <div className="space-y-4">
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="請輸入客戶名稱 (例如：CUPETIT)" className="w-full border p-2 rounded"/>
            <div className="border-2 border-dashed p-8 text-center cursor-pointer hover:bg-slate-50 relative">
                <input type="file" accept=".csv" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                <div className="flex flex-col items-center gap-2">
                    {uploading ? <Loader2 className="animate-spin"/> : <FileUp size={32}/>}
                    <span className="font-bold text-slate-600">{uploading ? msg : '點擊上傳 CSV (自動清洗數據)'}</span>
                </div>
            </div>
        </div>
    ); 
}

function TabButton({ id, label, icon, active, onClick, isNew }: any) { return <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{icon} {label} {isNew && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}</button>; }
function KpiCard({ title, value, color }: any) { return <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${color}`}><p className="text-sm text-gray-500">{title}</p><h3 className="text-2xl font-bold mt-2">{value}</h3></div>; }
function EmptyState({ message = "目前無資料" }: any) { return <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-200"><Info className="mb-2"/><p>{message}</p></div>; }
function LoadingSkeleton() { return <div className="space-y-4 animate-pulse"><div className="h-32 bg-slate-200 rounded-xl"></div><div className="grid grid-cols-2 gap-4"><div className="h-64 bg-slate-200 rounded-xl"></div><div className="h-64 bg-slate-200 rounded-xl"></div></div></div>; }
function AiDiagnosisPanel({ clientName, revenue }: any) { const [d, setD] = useState(""); const [l, setL] = useState(false); const run = async () => { setL(true); await new Promise(r => setTimeout(r, 2000)); setD(`【${clientName} 診斷】\n營收規模 $${(revenue||0).toLocaleString()}。VIP (前20%客戶) 貢獻佔比顯著，建議深化會員分級經營。`); setL(false); }; return <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl"><div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4"><Bot className="text-blue-400" /><h3 className="text-lg font-bold">AI 六脈診斷</h3></div><div className="flex-1 space-y-4">{d ? <p className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed">{d}</p> : <div className="text-slate-400 text-sm text-center py-10">{l ? "分析中..." : "點擊診斷"}</div>}</div><button onClick={run} disabled={l} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold flex justify-center items-center gap-2"><Sparkles size={16}/> 開始診斷</button></div>; }