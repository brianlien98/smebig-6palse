'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ScatterChart, Scatter, ZAxis, LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  Loader2, PieChart as IconPie, Microscope, ListTodo, FileText, Upload, FileUp, 
  Bot, Flame, CheckCircle, Plus, ArrowRight, Sparkles, Trash2, BookOpen,
  Users, MousePointerClick, Gem, Repeat, MessageSquare, CircleDollarSign, Info, Building2, AlertTriangle, TrendingUp, TrendingDown, Minus, Filter
} from 'lucide-react';
import Papa from 'papaparse';
import { createBrowserClient } from '@supabase/ssr';

// --- Configuration ---
const PULSE_CONFIG: Record<string, { label: string, icon: any, color: string, bg: string, border: string, text: string }> = {
  'Traffic': { label: '流量脈', icon: Users, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Conversion': { label: '轉換脈', icon: MousePointerClick, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'VIP': { label: '金主脈', icon: Gem, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' }, 
  'Retention': { label: '老主脈', icon: Repeat, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }, 
  'Reputation': { label: '擁主脈', icon: MessageSquare, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' }, 
  'Profit': { label: '獲利脈', icon: CircleDollarSign, color: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff6b6b'];

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
  
  // 新增：RFM 分群與 NES 模型資料
  const [rfmSegments, setRfmSegments] = useState<any[]>([]);
  const [nesData, setNesData] = useState<any[]>([]);

  const [pulseMetrics, setPulseMetrics] = useState({
      traffic: { value: null, hasData: false, unit: '人' },      
      conversion: { value: null, hasData: false, unit: '%' },    
      profit: { value: 0, hasData: true, unit: '$' },            
      vip: { value: 0, hasData: true, unit: '$' },               
      retention: { value: 0, hasData: true, unit: '%' },         
      reputation: { value: null, hasData: false, unit: '分' }    
  });

  const [loading, setLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchClients = async () => {
    try {
        const { data } = await supabase.from('monthly_brand_pulse').select('client_name');
        if (data) {
            const uniqueClients = Array.from(new Set(data.map((item: any) => item.client_name))).filter(Boolean);
            setClientList(uniqueClients as string[]);
            if (!selectedClient && uniqueClients.length > 0) setSelectedClient(uniqueClients[0] as string);
        }
    } catch (e) { console.error("Fetch clients error:", e); }
  };
  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    if (selectedClient) refreshData(selectedClient);
  }, [selectedClient]);

  const refreshData = async (clientName: string) => {
    setLoading(true);
    try {
        // 1. Monthly & KPI
        const { data: monthlyRaw } = await supabase.from('monthly_brand_pulse').select('*').eq('client_name', clientName).order('year_month', { ascending: true });
        const mData = monthlyRaw || [];
        setMonthlyData(mData);

        const totalRev = mData.reduce((acc, cur) => acc + (cur.total_revenue || 0), 0);
        const totalOrd = mData.reduce((acc, cur) => acc + (cur.order_count || 0), 0);
        const avgAov = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;

        // 2. Retention Stats
        const { data: retRaw } = await supabase.from('customer_retention_stats').select('*').eq('client_name', clientName);
        const totalCustomers = retRaw?.length || 0;
        const repeatCustomers = retRaw?.filter(c => c.purchase_days > 1).length || 0;
        const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

        setPulseMetrics({
            traffic: { value: null, hasData: false, unit: '人' }, 
            conversion: { value: null, hasData: false, unit: '%' }, 
            profit: { value: totalRev, hasData: true, unit: '$' },
            vip: { value: avgAov, hasData: true, unit: '$' },
            retention: { value: repeatRate, hasData: true, unit: '%' },
            reputation: { value: null, hasData: false, unit: '分' } 
        });

        // 3. Product & Channel
        const { data: prodRaw } = await supabase.from('product_analytics').select('*').eq('client_name', clientName).order('total_revenue', { ascending: false }).limit(10);
        setProductData((prodRaw || []).map(p => ({ name: p.product_name, value: p.total_revenue })));

        const { data: chanRaw } = await supabase.from('channel_analytics').select('*').eq('client_name', clientName).order('total_revenue', { ascending: false });
        setChannelData((chanRaw || []).map(c => ({ name: c.channel, value: c.total_revenue })));

        // 4. RFM & NES 核心運算
        // 移除 limit()，完整抓取該客戶所有 RFM (約幾千筆，前端可負載)
        const { data: rfmRaw } = await supabase.from('rfm_analysis').select('*').eq('client_name', clientName);
        const fullRfm = rfmRaw || [];
        
        // 渲染用的散佈圖資料 (限制 1000 點防卡頓)
        setRfmData(fullRfm.slice(0, 1000).map((r: any) => ({ x: r.recency_days, y: r.frequency, z: r.monetary })));

        // ★★★ 計算 RFM 黃金五大分群 ★★★
        let ambassador = { name: '頂級大使(常客大戶)', count: 0, rev: 0, fill: '#f59e0b' };
        let star = { name: '潛力新星(首購大戶)', count: 0, rev: 0, fill: '#3b82f6' };
        let regular = { name: '穩定常客(回購小資)', count: 0, rev: 0, fill: '#10b981' };
        let sleepingWhale = { name: '沉睡大戶(流失高危)', count: 0, rev: 0, fill: '#ef4444' };
        let lost = { name: '流失過客(單次小資)', count: 0, rev: 0, fill: '#94a3b8' };
        let others = { name: '其他一般客', count: 0, rev: 0, fill: '#cbd5e1' };

        // ★★★ 計算 NES 模型 ★★★
        let nes = {
            N: { name: 'N: 新客 (<120天首購)', count: 0, fill: '#3b82f6' },
            E: { name: 'E: 既有活躍客 (近期回購)', count: 0, fill: '#10b981' },
            S: { name: 'S: 沉睡客 (>200天未見)', count: 0, fill: '#ef4444' }
        };

        fullRfm.forEach((c: any) => {
            const r = c.recency_days;
            const f = c.frequency;
            const m = c.monetary;

            // 分群邏輯 (根據 CUPETIT 特性微調)
            if (r <= 120 && f >= 3 && m > 20000) { ambassador.count++; ambassador.rev += m; }
            else if (r <= 120 && f === 1 && m > 10000) { star.count++; star.rev += m; }
            else if (r <= 200 && f >= 2 && m <= 10000) { regular.count++; regular.rev += m; }
            else if (r > 200 && m > 20000) { sleepingWhale.count++; sleepingWhale.rev += m; }
            else if (r > 200 && f === 1 && m <= 2000) { lost.count++; lost.rev += m; }
            else { others.count++; others.rev += m; }

            // NES 邏輯
            if (r <= 120 && f === 1) nes.N.count++;
            else if (r <= 200 && f >= 2) nes.E.count++;
            else if (r > 200) nes.S.count++;
        });

        setRfmSegments([ambassador, star, regular, sleepingWhale, lost, others].filter(s => s.count > 0));
        setNesData([nes.N, nes.E, nes.S]);

        // 5. Cohort
        const { data: cohortRaw } = await supabase.from('cohort_retention').select('*').eq('client_name', clientName);
        const cohortMap: any = {};
        (cohortRaw || []).forEach((row: any) => {
            if (!cohortMap[row.cohort_month]) cohortMap[row.cohort_month] = { total: 0, months: {} };
            if (row.month_number === 0) cohortMap[row.cohort_month].total = row.total_users;
            cohortMap[row.cohort_month].months[row.month_number] = row.total_users;
        });
        setCohortData(Object.keys(cohortMap).sort().map(month => {
            const d = cohortMap[month];
            return { m: month, v: [0,1,2,3].map(m => m===0?100 : Math.round((d.months[m]/d.total)*100)||0) };
        }));

    } catch (err) { console.error("Data Load Error:", err); }
    setLoading(false);
  };

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
                <TabButton id="page1" label="營運體檢" icon={<IconPie size={16}/>} active={activeTab === 'page1'} onClick={() => setActiveTab('page1')} />
                <TabButton id="page2" label="深度病理" icon={<Microscope size={16}/>} active={activeTab === 'page2'} onClick={() => setActiveTab('page2')} />
                <TabButton id="page3" label="顧問藥方" icon={<ListTodo size={16}/>} active={activeTab === 'page3'} onClick={() => setActiveTab('page3')} />
                <TabButton id="page5" label="數據定義" icon={<BookOpen size={16}/>} active={activeTab === 'page5'} onClick={() => setActiveTab('page5')} />
                <TabButton id="page4" label="資料上傳" icon={<Upload size={16}/>} active={activeTab === 'page4'} onClick={() => setActiveTab('page4')} />
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
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">📊 {selectedClient} - 營運體檢</h2>
                    <p className="text-sm text-slate-500">以六脈指標動態評估品牌健康度</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1 text-sm font-bold bg-white shadow rounded text-slate-800">全部期間</button>
                        <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50" disabled>本年對比</button>
                    </div>
                </div>
            </div>

            {loading ? <LoadingSkeleton /> : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PulseCard title="流量脈 (獲客)" icon={<Users size={20}/>} color="blue" data={pulseMetrics.traffic} missingMsg="缺少網站流量與行銷花費數據" />
                    <PulseCard title="轉換脈 (成交)" icon={<MousePointerClick size={20}/>} color="green" data={pulseMetrics.conversion} missingMsg="缺少網站流量數據" />
                    <PulseCard title="獲利脈 (總營收)" icon={<CircleDollarSign size={20}/>} color="slate" data={pulseMetrics.profit} trend={8.5} />
                    <PulseCard title="金主脈 (客單價)" icon={<Gem size={20}/>} color="yellow" data={pulseMetrics.vip} trend={-2.1} />
                    <PulseCard title="老主脈 (回購率)" icon={<Repeat size={20}/>} color="red" data={pulseMetrics.retention} trend={5.4} />
                    <PulseCard title="擁主脈 (NPS口碑)" icon={<MessageSquare size={20}/>} color="purple" data={pulseMetrics.reputation} missingMsg="缺少 NPS 分數與推薦碼數據" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">獲利脈與金主脈趨勢 (營收 vs 客單價)</h3>
                            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">雙軸分析</span>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year_month" />
                                    <YAxis yAxisId="left" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                                    <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `$${val}`} />
                                    <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="total_revenue" fill="#3b82f6" name="總營收 (左軸)" radius={[4,4,0,0]} />
                                    <Line yAxisId="right" type="monotone" dataKey="aov" stroke="#f59e0b" strokeWidth={3} name="平均客單價 (右軸)" dot={{ r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {/* 真實呼叫 API，並傳入 RFM/NES 分群結果供 AI 參考 */}
                    <AiDiagnosisPanel 
                        clientName={selectedClient} 
                        revenue={pulseMetrics.profit.value} 
                        rfmSegments={rfmSegments}
                        nesData={nesData}
                        topProducts={productData}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-slate-50">
                        <h3 className="text-lg font-bold text-slate-800">六脈跨期比較表 (概覽)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-slate-500 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold">指標 (Pulse)</th>
                                    <th className="p-4 font-semibold">全期累計</th>
                                    <th className="p-4 font-semibold">近期走勢狀態</th>
                                    <th className="p-4 font-semibold">資料狀態</th>
                                </tr>
                            </thead>
                            <tbody>
                                <TableRow title="獲利脈 (總營收)" val={pulseMetrics.profit.value} unit="$" status="good" msg="資料齊全" />
                                <TableRow title="金主脈 (客單價)" val={pulseMetrics.vip.value} unit="$" status="warn" msg="資料齊全" />
                                <TableRow title="老主脈 (>1次購買率)" val={pulseMetrics.retention.value} unit="%" status="good" msg="資料齊全" />
                                <TableRow title="流量脈 (獲客成本)" val={null} unit="" status="none" msg="需補充 Google Analytics 流量數據" />
                                <TableRow title="轉換脈 (轉換率)" val={null} unit="" status="none" msg="需補充網站流量數據" />
                                <TableRow title="擁主脈 (NPS)" val={null} unit="" status="none" msg="需補充問卷調查數據" />
                            </tbody>
                        </table>
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
            
            {/* ★★★ 新增：NES 模型與 RFM 佔比 ★★★ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NES 漏斗/長條圖 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3">NES 顧客生命週期</h3>
                        <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">N=新, E=活, S=睡</span>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer>
                            <BarChart data={nesData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                                <Tooltip formatter={(val:any) => `${val.toLocaleString()} 人`} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {nesData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">診斷：若 S 柱狀圖最長，代表大量過去獲取的客源已流失。</p>
                </div>

                {/* RFM 黃金客群營收佔比 */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-yellow-500 pl-3">RFM 分群營收貢獻</h3>
                        <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">誰是您的金雞母？</span>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={rfmSegments} dataKey="rev" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>
                                    {rfmSegments.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                </Pie>
                                <Tooltip formatter={(val:any) => `$${val.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-center">目標：將【潛力新星】與【穩定常客】轉化為【頂級大使】。</p>
                </div>
            </div>

            {/* 產品與通路 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-green-500 pl-3 mb-4">熱銷品項排行 (Top 10)</h3>
                    <div className="h-[300px]"><ResponsiveContainer><BarChart layout="vertical" data={productData}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" /><YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} /><Tooltip formatter={(val:any) => `$${val.toLocaleString()}`} /><Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="銷售額" /></BarChart></ResponsiveContainer></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-purple-500 pl-3 mb-4">通路成效分析</h3>
                    <div className="h-[300px]"><ResponsiveContainer><PieChart><Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label={({name, percent}: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>{channelData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip formatter={(val:any) => `$${val.toLocaleString()}`} /><Legend /></PieChart></ResponsiveContainer></div>
                </div>
            </div>

            {/* 散佈圖與留存表 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-slate-500 pl-3 mb-4">RFM 原始散佈圖 (取樣 1000 點)</h3>
                    <div className="h-[300px]"><ResponsiveContainer><ScatterChart><CartesianGrid /><XAxis type="number" dataKey="x" name="Recency (天前)" reversed /><YAxis type="number" dataKey="y" name="Frequency (次)" /><ZAxis type="number" dataKey="z" range={[50, 800]} name="Monetary" /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Customers" data={rfmData} fill="#3b82f6" fillOpacity={0.6} /></ScatterChart></ResponsiveContainer></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3 mb-4">同層留存率 (Cohort)</h3>
                    {cohortData.length > 0 ? (
                        <table className="w-full text-center text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-3">月份</th><th>M+0</th><th>M+1</th><th>M+2</th></tr></thead><tbody>{cohortData.map((r:any,i:number)=>(<tr key={i} className="border-b"><td className="p-3 font-mono text-slate-600">{r.m}</td>{r.v.slice(0,3).map((v:any,j:number)=><td key={j} className={v<20?'text-red-500 font-bold bg-red-50':'text-slate-700'}>{v}%</td>)}</tr>))}</tbody></table>
                    ) : <EmptyState message="無 Cohort 資料" />}
                </div>
            </div>
        </div>
        )}

        {/* === Page 3: Consultant Prescription (動態帶入 RFM/NES 數據) === */}
        {selectedClient && activeTab === 'page3' && <ConsultantPrescriptionPage clientName={selectedClient} rfmSegments={rfmSegments} nesData={nesData} />}

        {/* === Page 5: Data Specs === */}
        {activeTab === 'page5' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="text-blue-600"/> 數據定義與計算公式 (V7.0)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-700">六脈指標定義 (跨期比較制)</h3>
                            <ul className="space-y-4">
                                <SpecItem title="流量脈 (Traffic)" logic="總不重複訪客數 / 行銷費用" desc="衡量網站流量與有效獲客成本 (CAC)。(需補充 GA 與廣告數據)" />
                                <SpecItem title="轉換脈 (Conversion)" logic="總訂單數 / 總訪客數" desc="衡量進站後下單的比例。(需補充流量數據)" />
                                <SpecItem title="獲利脈 (Profit)" logic="SUM(Transactions.Amount)" desc="品牌的總營收或總毛利規模。" />
                                <SpecItem title="金主脈 (VIP)" logic="總營收 / 總訂單數" desc="每月的平均客單價 (AOV)。" />
                                <SpecItem title="老主脈 (Retention)" logic="購買 N 次以上人數 / 總會員數" desc="特定期間內的回購狀況與黏著度。" />
                                <SpecItem title="擁主脈 (Reputation)" logic="NPS 分數 / 推薦產生之業績" desc="衡量口碑擴散力。(需補充問卷與推薦碼數據)" />
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-700">RFM & NES 分群邏輯 (CUPETIT 專屬)</h3>
                            <ul className="space-y-4">
                                <SpecItem title="NES: N 新客" logic="R <= 120天 且 F = 1次" desc="近期成功獲取的新面孔。" />
                                <SpecItem title="NES: E 活躍客" logic="R <= 200天 且 F >= 2次" desc="有回購行為且近期有互動的客人。" />
                                <SpecItem title="NES: S 沉睡客" logic="R > 200天" desc="超過大半年未購買，流失風險極高。" />
                                <SpecItem title="RFM: 頂級大使" logic="R <= 120天 且 F >= 3次 且 M > 20,000" desc="極致尊榮服務，不打折，給特權。" />
                                <SpecItem title="RFM: 沉睡大戶" logic="R > 200天 且 M > 20,000" desc="曾經花很多錢但消失了，需專人致電重度挽回。" />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* === Page 4: Upload === */}
        {activeTab === 'page4' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="text-center mb-8">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Upload size={32} className="text-blue-600"/></div>
                        <h2 className="text-2xl font-bold text-slate-800">上傳交易資料</h2>
                        <p className="text-slate-500">目前支援上傳【訂單交易紀錄】。未來將擴充流量與問卷資料匯入。</p>
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

function PulseCard({ title, icon, color, data, missingMsg, trend }: any) {
    const hasData = data.hasData;
    const colors: any = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
        slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
        red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    };
    const c = colors[color];

    return (
        <div className={`relative p-6 rounded-2xl border-2 transition-all ${hasData ? `bg-white ${c.border} shadow-sm hover:shadow-md` : 'bg-slate-50 border-dashed border-slate-200 grayscale opacity-70'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-2 ${c.text}`}>
                    <div className={`p-2 rounded-lg ${c.bg}`}>{icon}</div>
                    <h3 className="font-bold">{title}</h3>
                </div>
                {hasData && trend !== undefined && (
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            
            {hasData ? (
                <div>
                    <div className="text-3xl font-black text-slate-800">
                        {data.unit === '$' ? '$' : ''}
                        {Number(data.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        <span className="text-base text-slate-500 font-normal ml-1">{data.unit !== '$' ? data.unit : ''}</span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>{missingMsg}</span>
                </div>
            )}
        </div>
    );
}

function TableRow({ title, val, unit, status, msg }: any) {
    return (
        <tr className="border-b border-gray-100 hover:bg-slate-50">
            <td className="p-4 font-medium text-slate-700">{title}</td>
            <td className="p-4 font-bold text-slate-900">
                {val !== null ? `${unit === '$' ? '$' : ''}${Number(val).toLocaleString(undefined, {maximumFractionDigits:1})}${unit !== '$' ? unit : ''}` : '-'}
            </td>
            <td className="p-4">
                {status === 'good' && <span className="text-green-600 flex items-center gap-1"><TrendingUp size={16}/> 成長</span>}
                {status === 'warn' && <span className="text-yellow-600 flex items-center gap-1"><Minus size={16}/> 持平</span>}
                {status === 'none' && <span className="text-slate-300">-</span>}
            </td>
            <td className="p-4 text-xs text-slate-500">
                {status === 'none' ? <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> {msg}</span> : msg}
            </td>
        </tr>
    );
}

// ★★★ AI Diagnosis Panel：傳送更精準的 NES 數據給 Gemini ★★★
function AiDiagnosisPanel({ clientName, revenue, rfmSegments, nesData, topProducts }: any) { 
    const [d, setD] = useState(""); 
    const [l, setL] = useState(false); 
    
    const run = async () => { 
        if (!clientName) return;
        setL(true); 
        try {
            const top3 = topProducts?.slice(0, 3).map((p:any) => p.name) || [];
            
            // 整理要餵給 AI 的資料
            const aiPayload = {
                clientName, 
                revenue, 
                rfmSummary: rfmSegments.map((s:any) => `${s.name}: ${s.count}人 (貢獻$${s.rev})`),
                nesSummary: nesData.map((s:any) => `${s.name}: ${s.count}人`),
                topProducts: top3
            };

            const res = await fetch('/api/diagnose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(aiPayload) // 將新的 payload 傳給後端
            });
            
            if (res.ok) {
                const data = await res.json();
                setD(data.diagnosis);
            } else {
                setD("AI 連線失敗，請檢查網路或後端設定。");
            }
        } catch (e) {
            console.error(e);
            setD("連線錯誤，無法取得 AI 診斷。");
        }
        setL(false); 
    }; 
    
    return (
        <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                <Bot className="text-blue-400" />
                <h3 className="text-lg font-bold">AI 營運診斷</h3>
            </div>
            <div className="flex-1 space-y-4">
                {d ? (
                    <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed border border-white/10 animate-in fade-in whitespace-pre-wrap">
                        {d}
                    </div>
                ) : (
                    <div className="text-slate-400 text-sm text-center py-10">
                        {l ? "AI 正在分析 RFM 與 NES 數據..." : `點擊分析 ${clientName || '...'} 的健康狀況`}
                    </div>
                )}
            </div>
            <button onClick={run} disabled={l || !clientName} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 disabled:opacity-50">
                {l ? <Loader2 className="animate-spin" /> : <Sparkles size={16}/>} 
                {l ? '分析中...' : '開始診斷'}
            </button>
        </div>
    ); 
}

// ★★★ Consultant Prescription：動態載入任務 ★★★
function ConsultantPrescriptionPage({ clientName, rfmSegments, nesData }: any) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [newPulse, setNewPulse] = useState('Traffic');

    // 當傳入的 RFM 資料改變時，自動生成建議任務！
    useEffect(() => {
        if (!rfmSegments || rfmSegments.length === 0) return;
        
        const generatedTasks: Task[] = [];
        
        // 尋找沉睡大戶
        const sleepingWhales = rfmSegments.find((s:any) => s.name.includes('沉睡大戶'));
        if (sleepingWhales && sleepingWhales.count > 0) {
            generatedTasks.push({ id: 1, pulse: 'Retention', content: `【緊急挽回】致電關心 ${sleepingWhales.count} 位沉睡大戶，發送高單價尊榮回歸禮。`, source: 'System', status: 'pool' });
        }

        // 尋找潛力新星
        const stars = rfmSegments.find((s:any) => s.name.includes('潛力新星'));
        if (stars && stars.count > 0) {
            generatedTasks.push({ id: 2, pulse: 'VIP', content: `【回購誘發】發送日常甜點體驗券給 ${stars.count} 位潛力新星，將其轉化為常客。`, source: 'System', status: 'approved' });
        }

        // 尋找頂級大使
        const ambassadors = rfmSegments.find((s:any) => s.name.includes('頂級大使'));
        if (ambassadors && ambassadors.count > 0) {
            generatedTasks.push({ id: 3, pulse: 'Reputation', content: `【口碑擴散】邀請 ${ambassadors.count} 位頂級大使填寫 NPS 問卷並提供轉介紹獎勵。`, source: 'System', status: 'active' });
        }

        // 加入預設任務
        generatedTasks.push({ id: 4, pulse: 'Traffic', content: `針對 ${clientName} 的新客投放 Google 再行銷廣告`, source: 'Human', status: 'pool' });

        setTasks(generatedTasks);
    }, [clientName, rfmSegments]);

    const addTask = () => {
        if (!newTaskContent.trim()) return;
        setTasks([...tasks, { id: Date.now(), pulse: newPulse, content: newTaskContent, source: 'Human', status: 'pool' }]);
        setNewTaskContent('');
    };

    const moveTask = (id: number, status: any) => { setTasks(tasks.map(t => t.id === id ? { ...t, status } : t)); };
    const deleteTask = (id: number) => { setTasks(tasks.filter(t => t.id !== id)); };

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
                <input type="text" value={newTaskContent} onChange={(e) => setNewTaskContent(e.target.value)} placeholder="輸入新的改善對策..." className="flex-1 border rounded px-3 text-sm"/>
                <button onClick={addTask} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 font-bold flex items-center gap-1"><Plus size={16}/> 新增</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[500px]">
                    <h3 className="font-bold text-slate-600 mb-4 flex items-center gap-2"><Bot size={18}/> 建議池 (System & Pool)</h3>
                    <div className="space-y-2">{poolTasks.map(t => (<div key={t.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 group"><div className="flex justify-between mb-1"><span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span><div className="opacity-0 group-hover:opacity-100 flex gap-1"><button onClick={() => moveTask(t.id, 'approved')} className="text-green-500"><CheckCircle size={16}/></button><button onClick={() => deleteTask(t.id)} className="text-red-400"><Trash2 size={16}/></button></div></div><p className="text-sm text-slate-700">{t.content}</p></div>))}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 min-h-[500px]">
                    <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2"><CheckCircle size={18}/> 已核准 (Approved)</h3>
                    <div className="space-y-2">{approvedTasks.map(t => (<div key={t.id} className="bg-white p-3 rounded shadow-sm border border-purple-200 group"><div className="flex justify-between mb-1"><span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span><button onClick={() => moveTask(t.id, 'active')} className="text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-50 p-1 rounded"><ArrowRight size={16}/></button></div><p className="text-sm text-slate-700">{t.content}</p></div>))}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 min-h-[500px]">
                    <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2"><Flame size={18}/> 執行中 (Active)</h3>
                    <div className="space-y-2">{activeTasks.map(t => (<div key={t.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500"><div className="flex justify-between mb-1"><span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span><button onClick={() => moveTask(t.id, 'done')} className="text-slate-400 hover:text-green-600"><CheckCircle size={16}/></button></div><p className="text-sm text-slate-700 font-bold">{t.content}</p></div>))}</div>
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
function EmptyState({ message = "目前無資料" }: any) { return <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-200"><Info className="mb-2"/><p>{message}</p></div>; }
function LoadingSkeleton() { return <div className="space-y-4 animate-pulse"><div className="h-32 bg-slate-200 rounded-xl"></div><div className="grid grid-cols-2 gap-4"><div className="h-64 bg-slate-200 rounded-xl"></div><div className="h-64 bg-slate-200 rounded-xl"></div></div></div>; }
function SpecItem({ title, logic, desc }: any) { return <li className="border-b border-slate-100 pb-2"><div className="flex justify-between font-bold text-slate-800 mb-1"><span>{title}</span><span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{logic}</span></div><p className="text-xs text-slate-500">{desc}</p></li>; }