'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ScatterChart, Scatter, ZAxis, LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  Loader2, PieChart as IconPie, Microscope, ListTodo, FileText, Upload, FileUp, 
  Bot, Flame, CheckCircle, Plus, ArrowRight, Sparkles, Trash2, BookOpen,
  Users, MousePointerClick, Gem, Repeat, MessageSquare, CircleDollarSign, Info, Building2, AlertTriangle, TrendingUp, TrendingDown, Minus
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
  const [gaData, setGaData] = useState<any[]>([]); // 存放 GA 流量數據
  const [productData, setProductData] = useState<any[]>([]);
  const [channelData, setChannelData] = useState<any[]>([]);
  const [rfmData, setRfmData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  
  const [rfmSegments, setRfmSegments] = useState<any[]>([]);
  const [nesData, setNesData] = useState<any[]>([]);

  // 六脈實際數值狀態
  const [pulseMetrics, setPulseMetrics] = useState({
      traffic: { value: null as number | null, hasData: false, unit: '人' },      
      conversion: { value: null as number | null, hasData: false, unit: '%' },    
      profit: { value: 0, hasData: true, unit: '$' },            
      vip: { value: 0, hasData: true, unit: '$' },               
      retention: { value: 0, hasData: true, unit: '%' },         
      reputation: { value: null as number | null, hasData: false, unit: '分' }    
  });

  const [loading, setLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchClients = async () => {
    try {
        // 同時從交易表和 GA 表抓取客戶名稱，聯集起來
        const [{ data: txData }, { data: gaDataRes }] = await Promise.all([
            supabase.from('monthly_brand_pulse').select('client_name'),
            supabase.from('monthly_ga_metrics').select('client_name')
        ]);
        
        const allNames = [...(txData || []), ...(gaDataRes || [])].map(item => item.client_name).filter(Boolean);
        const uniqueClients = Array.from(new Set(allNames));
        
        setClientList(uniqueClients as string[]);
        if (!selectedClient && uniqueClients.length > 0) setSelectedClient(uniqueClients[0] as string);
    } catch (e) { console.error("Fetch clients error:", e); }
  };
  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    if (selectedClient) refreshData(selectedClient);
  }, [selectedClient]);

  const refreshData = async (clientName: string) => {
    setLoading(true);
    try {
        // 1. Monthly TX & KPI
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

        // 3. GA Metrics (New!)
        const { data: gaRaw } = await supabase.from('monthly_ga_metrics').select('*').eq('client_name', clientName).order('year_month', { ascending: true });
        setGaData(gaRaw || []);
        
        const totalActiveUsers = (gaRaw || []).reduce((acc, cur) => acc + (cur.total_active_users || 0), 0);
        const totalAppointments = (gaRaw || []).reduce((acc, cur) => acc + (cur.total_appointments || 0), 0);
        const totalLeads = (gaRaw || []).reduce((acc, cur) => acc + (cur.total_leads || 0), 0);
        const totalConversions = totalAppointments + totalLeads;
        const overallConversionRate = totalActiveUsers > 0 ? (totalConversions / totalActiveUsers) * 100 : null;

        // 統整 六脈 KPI (結合 TX 與 GA)
        setPulseMetrics({
            traffic: { value: totalActiveUsers > 0 ? totalActiveUsers : null, hasData: totalActiveUsers > 0, unit: '人' }, 
            conversion: { value: overallConversionRate, hasData: overallConversionRate !== null, unit: '%' }, 
            profit: { value: totalRev, hasData: totalRev > 0, unit: '$' },
            vip: { value: avgAov, hasData: avgAov > 0, unit: '$' },
            retention: { value: repeatRate, hasData: totalCustomers > 0, unit: '%' },
            reputation: { value: null, hasData: false, unit: '分' } // 暫缺 NPS
        });

        // 4. Product & Channel
        const { data: prodRaw } = await supabase.from('product_analytics').select('*').eq('client_name', clientName).order('total_revenue', { ascending: false }).limit(10);
        setProductData((prodRaw || []).map(p => ({ name: p.product_name, value: p.total_revenue })));

        const { data: chanRaw } = await supabase.from('channel_analytics').select('*').eq('client_name', clientName).order('total_revenue', { ascending: false });
        setChannelData((chanRaw || []).map(c => ({ name: c.channel, value: c.total_revenue })));

        // 5. RFM & NES 運算
        const { data: rfmRaw } = await supabase.from('rfm_analysis').select('*').eq('client_name', clientName);
        const fullRfm = rfmRaw || [];
        setRfmData(fullRfm.slice(0, 1000).map((r: any) => ({ x: r.recency_days, y: r.frequency, z: r.monetary })));

        let ambassador = { name: '頂級大使(常客大戶)', count: 0, rev: 0, fill: '#f59e0b' };
        let star = { name: '潛力新星(首購大戶)', count: 0, rev: 0, fill: '#3b82f6' };
        let regular = { name: '穩定常客(回購小資)', count: 0, rev: 0, fill: '#10b981' };
        let sleepingWhale = { name: '沉睡大戶(流失高危)', count: 0, rev: 0, fill: '#ef4444' };
        let lost = { name: '流失過客(單次小資)', count: 0, rev: 0, fill: '#94a3b8' };
        let others = { name: '其他一般客', count: 0, rev: 0, fill: '#cbd5e1' };

        let nes = {
            N: { name: 'N: 新客 (<120天首購)', count: 0, fill: '#3b82f6' },
            E: { name: 'E: 既有活躍客 (近期回購)', count: 0, fill: '#10b981' },
            S: { name: 'S: 沉睡客 (>200天未見)', count: 0, fill: '#ef4444' }
        };

        fullRfm.forEach((c: any) => {
            const r = c.recency_days;
            const f = c.frequency;
            const m = c.monetary;

            if (r <= 120 && f >= 3 && m > 20000) { ambassador.count++; ambassador.rev += m; }
            else if (r <= 120 && f === 1 && m > 10000) { star.count++; star.rev += m; }
            else if (r <= 200 && f >= 2 && m <= 10000) { regular.count++; regular.rev += m; }
            else if (r > 200 && m > 20000) { sleepingWhale.count++; sleepingWhale.rev += m; }
            else if (r > 200 && f === 1 && m <= 2000) { lost.count++; lost.rev += m; }
            else { others.count++; others.rev += m; }

            if (r <= 120 && f === 1) nes.N.count++;
            else if (r <= 200 && f >= 2) nes.E.count++;
            else if (r > 200) nes.S.count++;
        });

        setRfmSegments([ambassador, star, regular, sleepingWhale, lost, others].filter(s => s.count > 0));
        setNesData([nes.N, nes.E, nes.S]);

        // 6. Cohort
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
                    <PulseCard title="流量脈 (總訪客)" icon={<Users size={20}/>} color="blue" data={pulseMetrics.traffic} missingMsg="缺少網站流量數據 (GA)" trend={null} />
                    <PulseCard title="轉換脈 (成交率)" icon={<MousePointerClick size={20}/>} color="green" data={pulseMetrics.conversion} missingMsg="缺少網站流量數據 (GA)" trend={null} />
                    <PulseCard title="獲利脈 (總營收)" icon={<CircleDollarSign size={20}/>} color="slate" data={pulseMetrics.profit} trend={null} />
                    <PulseCard title="金主脈 (客單價)" icon={<Gem size={20}/>} color="yellow" data={pulseMetrics.vip} trend={null} />
                    <PulseCard title="老主脈 (回購率)" icon={<Repeat size={20}/>} color="red" data={pulseMetrics.retention} trend={null} />
                    <PulseCard title="擁主脈 (NPS口碑)" icon={<MessageSquare size={20}/>} color="purple" data={pulseMetrics.reputation} missingMsg="缺少 NPS 分數與推薦碼數據" trend={null} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">營收趨勢分析 (本期累積)</h3>
                            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">堆疊圖</span>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year_month" />
                                    <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="old_customer_revenue" stackId="a" fill="#8b5cf6" name="舊客營收" radius={[0,0,0,0]} />
                                    <Bar dataKey="new_customer_revenue" stackId="a" fill="#22c55e" name="新客營收" radius={[4,4,0,0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
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
                        <h3 className="text-lg font-bold text-slate-800">六脈狀態概覽</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-slate-500 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 font-semibold">指標 (Pulse)</th>
                                    <th className="p-4 font-semibold">全期累計</th>
                                    <th className="p-4 font-semibold">資料狀態</th>
                                </tr>
                            </thead>
                            <tbody>
                                <TableRow title="獲利脈 (總營收)" val={pulseMetrics.profit.value} unit="$" status={pulseMetrics.profit.hasData ? 'good' : 'none'} msg="資料齊全" />
                                <TableRow title="金主脈 (客單價)" val={pulseMetrics.vip.value} unit="$" status={pulseMetrics.vip.hasData ? 'good' : 'none'} msg="資料齊全" />
                                <TableRow title="老主脈 (>1次購買率)" val={pulseMetrics.retention.value} unit="%" status={pulseMetrics.retention.hasData ? 'good' : 'none'} msg="資料齊全" />
                                <TableRow title="流量脈 (活躍使用者)" val={pulseMetrics.traffic.value} unit="人" status={pulseMetrics.traffic.hasData ? 'good' : 'none'} msg={pulseMetrics.traffic.hasData ? "資料齊全" : "需補充 GA 流量數據"} />
                                <TableRow title="轉換脈 (預約/留單轉換率)" val={pulseMetrics.conversion.value} unit="%" status={pulseMetrics.conversion.hasData ? 'good' : 'none'} msg={pulseMetrics.conversion.hasData ? "資料齊全" : "需補充 GA 流量數據"} />
                                <TableRow title="擁主脈 (NPS)" val={null} unit="" status="none" msg="需補充問卷調查數據" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
            )}
          </div>
        )}

        {/* === Page 2 & 3 & 5 (省略部分以符合長度，內容與 V7 一致) === */}
        {selectedClient && activeTab === 'page2' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-800">🔬 深度病理分析</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3">NES 顧客生命週期</h3><span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">N=新, E=活, S=睡</span></div>
                    <div className="h-[250px]"><ResponsiveContainer><BarChart data={nesData} layout="vertical" margin={{ left: 40 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" /><YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} /><Tooltip formatter={(val:any) => `${val.toLocaleString()} 人`} /><Bar dataKey="count" radius={[0, 4, 4, 0]}>{nesData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Bar></BarChart></ResponsiveContainer></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-800 border-l-4 border-yellow-500 pl-3">RFM 分群營收貢獻</h3><span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">誰是您的金雞母？</span></div>
                    <div className="h-[250px]"><ResponsiveContainer><PieChart><Pie data={rfmSegments} dataKey="rev" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}>{rfmSegments.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Pie><Tooltip formatter={(val:any) => `$${val.toLocaleString()}`} /></PieChart></ResponsiveContainer></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-slate-800 border-l-4 border-slate-500 pl-3 mb-4">RFM 原始散佈圖 (取樣 1000 點)</h3>
                <div className="h-[300px]"><ResponsiveContainer><ScatterChart><CartesianGrid /><XAxis type="number" dataKey="x" name="Recency (天前)" reversed /><YAxis type="number" dataKey="y" name="Frequency (次)" /><ZAxis type="number" dataKey="z" range={[50, 800]} name="Monetary" /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Customers" data={rfmData} fill="#3b82f6" fillOpacity={0.6} /></ScatterChart></ResponsiveContainer></div>
            </div>
          </div>
        )}

        {selectedClient && activeTab === 'page3' && <ConsultantPrescriptionPage clientName={selectedClient} rfmSegments={rfmSegments} nesData={nesData} />}

        {activeTab === 'page5' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="text-blue-600"/> 數據定義與計算公式 (V8.0 行銷擴充版)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-700">六脈指標定義</h3>
                            <ul className="space-y-4">
                                <SpecItem title="流量脈 (Traffic)" logic="總活躍使用者 / 總行銷費用" desc="衡量網站流量與獲客成本。 🚩 註：請在上傳 GA 數據時，於未來加入行銷費用(Marketing Spend)以優化此指標。" />
                                <SpecItem title="轉換脈 (Conversion)" logic="(預約數 + 名單數) / 總活躍使用者" desc="衡量進站後成功留單的比率。" />
                                <SpecItem title="獲利脈 (Profit)" logic="SUM(Transactions.Amount)" desc="品牌的總營收。" />
                                <SpecItem title="金主脈 (VIP)" logic="總營收 / 總訂單數" desc="每月的平均客單價 (AOV)。" />
                                <SpecItem title="老主脈 (Retention)" logic="購買 2 次以上人數 / 總客戶數" desc="歷史區間內的回購黏著度。" />
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* === Page 4: Upload (V8.0 支援雙模模式) === */}
        {activeTab === 'page4' && (
             <div className="space-y-8 animate-in fade-in">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="text-center mb-8">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Upload size={32} className="text-blue-600"/></div>
                        <h2 className="text-2xl font-bold text-slate-800">上傳資料庫</h2>
                        <p className="text-slate-500">支援上傳【交易紀錄】與【GA 流量數據】。</p>
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
                {hasData && trend !== null && trend !== undefined && (
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
                        {Number(data.value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
                {val !== null ? `${unit === '$' ? '$' : ''}${Number(val).toLocaleString(undefined, {maximumFractionDigits:2})}${unit !== '$' ? unit : ''}` : '-'}
            </td>
            <td className="p-4">
                {status === 'good' && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16}/> 齊全</span>}
                {status === 'none' && <span className="text-slate-300">-</span>}
            </td>
            <td className="p-4 text-xs text-slate-500">
                {status === 'none' ? <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> {msg}</span> : msg}
            </td>
        </tr>
    );
}

function AiDiagnosisPanel({ clientName, revenue, rfmSegments, nesData, topProducts }: any) { 
    const [d, setD] = useState(""); 
    const [l, setL] = useState(false); 
    const run = async () => { 
        if (!clientName) return;
        setL(true); 
        try {
            const top3 = topProducts?.slice(0, 3).map((p:any) => p.name) || [];
            const aiPayload = { clientName, revenue, rfmSummary: rfmSegments.map((s:any) => `${s.name}: ${s.count}人 (貢獻$${s.rev})`), nesSummary: nesData.map((s:any) => `${s.name}: ${s.count}人`), topProducts: top3 };
            const res = await fetch('/api/diagnose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aiPayload) });
            if (res.ok) { const data = await res.json(); setD(data.diagnosis); } else { setD("AI 連線失敗。"); }
        } catch (e) { setD("連線錯誤。"); }
        setL(false); 
    }; 
    return (
        <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4"><Bot className="text-blue-400" /><h3 className="text-lg font-bold">AI 營運診斷</h3></div>
            <div className="flex-1 space-y-4">{d ? <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed border border-white/10 animate-in fade-in whitespace-pre-wrap">{d}</div> : <div className="text-slate-400 text-sm text-center py-10">{l ? "AI 正在分析 RFM 與 NES 數據..." : `點擊分析 ${clientName || '...'} 的健康狀況`}</div>}</div>
            <button onClick={run} disabled={l || !clientName} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 disabled:opacity-50">{l ? <Loader2 className="animate-spin" /> : <Sparkles size={16}/>} {l ? '分析中...' : '開始診斷'}</button>
        </div>
    ); 
}

function ConsultantPrescriptionPage({ clientName, rfmSegments, nesData }: any) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [newPulse, setNewPulse] = useState('Traffic');
    useEffect(() => {
        if (!rfmSegments || rfmSegments.length === 0) return;
        const generatedTasks: Task[] = [];
        const sleepingWhales = rfmSegments.find((s:any) => s.name.includes('沉睡大戶'));
        if (sleepingWhales && sleepingWhales.count > 0) generatedTasks.push({ id: 1, pulse: 'Retention', content: `【緊急挽回】致電關心 ${sleepingWhales.count} 位沉睡大戶，發送高單價尊榮回歸禮。`, source: 'System', status: 'pool' });
        const stars = rfmSegments.find((s:any) => s.name.includes('潛力新星'));
        if (stars && stars.count > 0) generatedTasks.push({ id: 2, pulse: 'VIP', content: `【回購誘發】發送體驗券給 ${stars.count} 位潛力新星。`, source: 'System', status: 'approved' });
        setTasks(generatedTasks);
    }, [clientName, rfmSegments]);
    const addTask = () => { if (!newTaskContent.trim()) return; setTasks([...tasks, { id: Date.now(), pulse: newPulse, content: newTaskContent, source: 'Human', status: 'pool' }]); setNewTaskContent(''); };
    const moveTask = (id: number, status: any) => { setTasks(tasks.map(t => t.id === id ? { ...t, status } : t)); };
    const deleteTask = (id: number) => { setTasks(tasks.filter(t => t.id !== id)); };
    const poolTasks = tasks.filter(t => t.status === 'pool');
    const approvedTasks = tasks.filter(t => t.status === 'approved');
    const activeTasks = tasks.filter(t => t.status === 'active');
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">💊 {clientName} - 顧問藥方管理</h2></div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-2"><select value={newPulse} onChange={(e) => setNewPulse(e.target.value)} className="border rounded px-2 text-sm bg-slate-50">{Object.keys(PULSE_CONFIG).map(k => <option key={k} value={k}>{PULSE_CONFIG[k].label}</option>)}</select><input type="text" value={newTaskContent} onChange={(e) => setNewTaskContent(e.target.value)} placeholder="輸入新的改善對策..." className="flex-1 border rounded px-3 text-sm"/><button onClick={addTask} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 font-bold flex items-center gap-1"><Plus size={16}/> 新增</button></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[500px]"><h3 className="font-bold text-slate-600 mb-4 flex items-center gap-2"><Bot size={18}/> 建議池 (System & Pool)</h3><div className="space-y-2">{poolTasks.map(t => (<div key={t.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 group"><div className="flex justify-between mb-1"><span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span><div className="opacity-0 group-hover:opacity-100 flex gap-1"><button onClick={() => moveTask(t.id, 'approved')} className="text-green-500"><CheckCircle size={16}/></button><button onClick={() => deleteTask(t.id)} className="text-red-400"><Trash2 size={16}/></button></div></div><p className="text-sm text-slate-700">{t.content}</p></div>))}</div></div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 min-h-[500px]"><h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2"><CheckCircle size={18}/> 已核准 (Approved)</h3><div className="space-y-2">{approvedTasks.map(t => (<div key={t.id} className="bg-white p-3 rounded shadow-sm border border-purple-200 group"><div className="flex justify-between mb-1"><span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span><button onClick={() => moveTask(t.id, 'active')} className="text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-50 p-1 rounded"><ArrowRight size={16}/></button></div><p className="text-sm text-slate-700">{t.content}</p></div>))}</div></div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 min-h-[500px]"><h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2"><Flame size={18}/> 執行中 (Active)</h3><div className="space-y-2">{activeTasks.map(t => (<div key={t.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500"><div className="flex justify-between mb-1"><span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>{PULSE_CONFIG[t.pulse]?.label}</span><button onClick={() => moveTask(t.id, 'done')} className="text-slate-400 hover:text-green-600"><CheckCircle size={16}/></button></div><p className="text-sm text-slate-700 font-bold">{t.content}</p></div>))}</div></div>
            </div>
        </div>
    );
}

// ★★★ 核心修改：DataUploader 支援兩種上傳模式 (TX 與 GA) ★★★
function DataUploader({ supabase, onSuccess }: any) { 
    const [uploading, setUploading] = useState(false); 
    const [clientName, setClientName] = useState("");
    const [uploadType, setUploadType] = useState('tx'); // 'tx' | 'ga'
    const [msg, setMsg] = useState(""); 
    
    const handleFile = (e: any) => { 
        if (!clientName.trim()) { alert("請先輸入客戶名稱！"); e.target.value = ''; return; }
        const file = e.target.files[0]; 
        if (!file) return; 
        
        setUploading(true); 
        setMsg(`正在解析 ${uploadType === 'tx' ? '交易' : 'GA'} 資料...`); 
        
        Papa.parse(file, { 
            header: true, 
            skipEmptyLines: true, 
            complete: async (results) => { 
                
                if (uploadType === 'tx') {
                    // --- 處理交易紀錄 ---
                    const cleanRows = results.data.map((row: any) => {
                        const rawAmount = row['金額'] || row['amount'] || '0';
                        const amount = parseFloat(rawAmount.toString().replace(/[\s,]/g, ''));
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
                    
                    setMsg(`清洗完成，寫入 ${cleanRows.length} 筆交易資料...`);
                    const BATCH_SIZE = 1000; 
                    try {
                        for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) { 
                            const { error } = await supabase.from('transactions').insert(cleanRows.slice(i, i + BATCH_SIZE)); 
                            if(error) throw error;
                        } 
                        setUploading(false); onSuccess(clientName);
                    } catch (error: any) { console.error(error); setMsg("上傳失敗: " + error.message); setUploading(false); }

                } else if (uploadType === 'ga') {
                    // --- 處理 GA 流量紀錄 ---
                    const cleanRows = results.data.map((row: any) => {
                        // 解析 "2025.1月_婚禮喜餅" -> "2025-01"
                        const periodRaw = row['期間'] || '';
                        let yearMonth = '';
                        let category = 'Uncategorized';
                        
                        const match = periodRaw.match(/(\d{4})\.(\d{1,2})月_(.*)/);
                        if (match) {
                            const y = match[1];
                            const m = match[2].padStart(2, '0');
                            yearMonth = `${y}-${m}`;
                            category = match[3];
                        }
                        
                        // 清洗千分位逗號
                        const cleanNum = (val: string) => parseInt((val || '0').toString().replace(/,/g, ''), 10) || 0;

                        return {
                            client_name: clientName,
                            year_month: yearMonth,
                            category: category,
                            sessions: cleanNum(row['工作階段(互動數)']),
                            active_users: cleanNum(row['活躍使用者']),
                            new_users: cleanNum(row['新使用者']),
                            appointments: cleanNum(row['當月預約數_婚禮/彌月']),
                            leads: cleanNum(row['當月名單數_節慶']),
                            marketing_spend: 0 // 預留欄位
                        };
                    }).filter((r:any) => r.year_month !== '');

                    setMsg(`清洗完成，寫入 ${cleanRows.length} 筆 GA 數據...`);
                    try {
                        // 寫入 ga_analytics 表
                        const { error } = await supabase.from('ga_analytics').insert(cleanRows);
                        if(error) throw error;
                        setUploading(false); onSuccess(clientName);
                    } catch (error: any) { console.error(error); setMsg("GA上傳失敗: " + error.message); setUploading(false); }
                }
            } 
        }); 
    }; 
    return (
        <div className="space-y-6">
            <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="請輸入客戶名稱 (例如：CUPETIT)" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"/>
            
            <div className="flex gap-4">
                <button onClick={() => setUploadType('tx')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'tx' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>1. 交易訂單資料 (CSV)</button>
                <button onClick={() => setUploadType('ga')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'ga' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>2. GA 流量資料 (CSV)</button>
            </div>

            <div className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all rounded-2xl relative ${uploadType === 'tx' ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-50' : 'border-green-300 bg-green-50/50 hover:bg-green-50'}`}>
                <input type="file" accept=".csv" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                <div className="flex flex-col items-center gap-3">
                    {uploading ? <Loader2 className="animate-spin w-10 h-10 text-slate-400"/> : <FileUp size={48} className={uploadType === 'tx' ? 'text-blue-500' : 'text-green-500'}/>}
                    <span className="font-bold text-slate-700 text-lg">{uploading ? msg : `點擊上傳 ${uploadType === 'tx' ? '交易' : 'GA'} CSV`}</span>
                    {uploadType === 'ga' && <p className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full mt-2">🚩 未來版本支援：請確保檔案含有「行銷花費」以計算 ROI</p>}
                </div>
            </div>
        </div>
    ); 
}

function TabButton({ id, label, icon, active, onClick, isNew }: any) { return <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{icon} {label} {isNew && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}</button>; }
function EmptyState({ message = "目前無資料" }: any) { return <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-200"><Info className="mb-2"/><p>{message}</p></div>; }
function LoadingSkeleton() { return <div className="space-y-4 animate-pulse"><div className="h-32 bg-slate-200 rounded-xl"></div><div className="grid grid-cols-2 gap-4"><div className="h-64 bg-slate-200 rounded-xl"></div><div className="h-64 bg-slate-200 rounded-xl"></div></div></div>; }
function SpecItem({ title, logic, desc }: any) { return <li className="border-b border-slate-100 pb-2"><div className="flex justify-between font-bold text-slate-800 mb-1"><span>{title}</span><span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{logic}</span></div><p className="text-xs text-slate-500">{desc}</p></li>; }