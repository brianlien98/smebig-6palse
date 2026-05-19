'use client';

import React, { useEffect, useState, useMemo, createContext, useContext } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';
import { 
  Loader2, PieChart as IconPie, Microscope, ListTodo, Upload, FileUp, 
  Bot, Flame, CheckCircle, Plus, ArrowRight, Sparkles, Trash2, BookOpen,
  Users, MousePointerClick, Gem, Repeat, MessageSquare, CircleDollarSign, Info, Building2, AlertTriangle, TrendingUp, TrendingDown, Minus, Award
} from 'lucide-react';
import Papa from 'papaparse';
import { createBrowserClient } from '@supabase/ssr';

// --- i18n Translation Dictionary ---
const EN_DICT: Record<string, string> = {
  '營運體檢': 'Overview',
  'Patron Score': 'Patron Score',
  '深度病理': 'Deep Analysis',
  '顧問藥方': 'Prescriptions',
  '數據定義': 'Data Dict.',
  '資料上傳': 'Upload',
  '請選擇客戶...': 'Select Client...',
  '請先選擇一位客戶': 'Please select a client first',
  '左上角下拉選單選擇現有客戶，或至「資料上傳」建立新客戶。': 'Select an existing client from the top-left dropdown, or go to "Upload" to create a new one.',
  '上傳新資料': 'Upload New Data',
  '品牌脈': 'Profit Pulse',
  '流量脈': 'Traffic Pulse',
  '轉換脈': 'Conversion Pulse',
  '金主脈': 'VIP Pulse',
  '老主脈': 'Retention Pulse',
  '擁主脈': 'Reputation Pulse',
  '以六脈指標動態評估品牌健康度': 'Dynamic assessment of brand health via 6 Pulse Metrics',
  '全部期間': 'All Time',
  '本年對比': 'YoY Compare',
  '品牌脈 (總營收)': 'Profit (Total Rev)',
  '流量脈 (總訪客)': 'Traffic (Visitors)',
  '轉換脈 (留單率)': 'Conversion (Lead Rate)',
  '金主脈 (客單價)': 'VIP (AOV)',
  '老主脈 (回購率)': 'Retention (Repeat Rate)',
  '擁主脈 (NPS口碑)': 'Reputation (NPS)',
  '缺少網站流量數據 (GA)': 'Missing GA Traffic Data',
  '缺少 NPS 分數與推薦碼數據': 'Missing NPS & Referral Data',
  '雙軌營收與流量趨勢 (Cross-Analysis)': 'Dual-Track Rev & Traffic (Cross-Analysis)',
  '全通路': 'All Channels',
  'O2O實體': 'O2O Offline',
  'EC電商': 'EC Online',
  '產生營收 (左軸)': 'Revenue (Left)',
  '活躍流量 (右軸)': 'Active Users (Right)',
  '預約數 (趨勢比例)': 'Appts (Trend)',
  '名單數 (趨勢比例)': 'Leads (Trend)',
  '流量與營收交叉對照表': 'Traffic & Revenue Cross Table',
  '單位流量產值 (RPV) 分析': 'Revenue Per Visitor (RPV)',
  '月份': 'Month',
  '活躍流量 (A)': 'Active Traffic (A)',
  '預約數 (B)': 'Appts (B)',
  '名單數 (B)': 'Leads (B)',
  '產生營收 (C)': 'Revenue (C)',
  '流量產值 RPV (C/A)': 'RPV (C/A)',
  '留單率 (B/A)': 'Conv. Rate (B/A)',
  '人': 'Users',
  '組': 'Leads',
  '綜合營運指標': 'Overall Metrics',
  '基於歷史數據自我競賽，快速掌握營運水位與成長動能。': 'Self-compete with history to quickly grasp operational level & momentum.',
  'Patron Score - 歷史排位': 'Patron Score - Percentile',
  '本月表現在歷史長河中的綜合 PR 值': 'Comprehensive PR value of this month in history',
  'Patron Score - 成長動能': 'Patron Score - Momentum',
  '相較於過去半年的均值成長幅度 (基準100)': 'Growth vs past 6-month average (Base 100)',
  'Patron Score - 目標達成': 'Patron Score - Target',
  '距離歷史最高峰 (滿分100) 還有多遠': 'Distance to historical peak (Max 100)',
  'Patron Score 歷史趨勢追蹤': 'Patron Score Historical Trend',
  'Patron Score 指標解讀指南': 'Patron Score Guide',
  '歷史排位': 'Percentile Rank',
  '成長動能': 'Momentum',
  '目標達成': 'Target Achieved',
  '將六脈指標與過去所有月份進行排序。若分數為 85，代表本月綜合表現擊敗了歷史上 85% 的月份。適合用來評估「當前營運水位是否在顛峰狀態」。': 'Ranks the 6 metrics against all past months. A score of 85 means it beat 85% of history. Evaluates if current operations are at peak.',
  '將本月表現與「過去 6 個月的平均值」對比。100 分代表持平，120 分代表超標 20%。適合用來觀察「行銷活動是否成功帶起新一波的成長爆發力」。': 'Compares this month with the 6-month average. 100 is flat, 120 is 20% over. Good for observing momentum from marketing.',
  '找出品牌歷史上表現最完美的月份視為滿分 100。適合企業訂定 KPI 時，評估「我們距離曾經達到的最理想狀態還有多少差距」。': 'Takes the best historical month as 100. Ideal for KPI setting to evaluate the distance to the optimal state.',
  '流量變現漏斗 (Funnel)': 'Traffic Monetization Funnel',
  '診斷：檢視漏水率最高的階層，對症下藥優化轉換率。': 'Diagnosis: Target high drop-off stages to optimize conversion.',
  'GA 流量來源屬性': 'GA Traffic Sources',
  '婚禮 vs 節慶': 'Wedding vs Festival',
  'NES 顧客生命週期': 'NES Customer Lifecycle',
  'N=新, E=活, S=睡': 'N=New, E=Exist, S=Sleep',
  'RFM 分群營收貢獻': 'RFM Segment Revenue Contribution',
  '誰是您的金雞母？': 'Who are your cash cows?',
  '熱銷品項排行 (Top 10)': 'Top 10 Best Sellers',
  '銷售額': 'Sales',
  '同層留存率 (Cohort)': 'Cohort Retention Rate',
  '1. 活躍流量(GA)': '1. Active Traffic(GA)',
  '2. 門市預約(GA)': '2. Offline Appt(GA)',
  '3. 實體成交客(TX)': '3. Offline Buyers(TX)',
  '4. 實體回購客(TX)': '4. Offline Repeat(TX)',
  '2. 節慶名單(GA)': '2. Festival Leads(GA)',
  '3. 電商成交客(TX)': '3. EC Buyers(TX)',
  '4. 電商回購客(TX)': '4. EC Repeat(TX)',
  '頂級大使(常客大戶)': 'Top Ambassador',
  '潛力新星(首購大戶)': 'Rising Star',
  '穩定常客(回購小資)': 'Regular',
  '沉睡大戶(流失高危)': 'Sleeping Whale',
  '流失過客(單次小資)': 'Lost Customer',
  '其他一般客': 'Others',
  'N: 新客 (<120天)': 'N: New (<120d)',
  'E: 活躍客 (回購)': 'E: Existing (Repeat)',
  'S: 沉睡客 (>200天)': 'S: Sleeping (>200d)',
  '輸入新的改善對策...': 'Enter new strategy...',
  '新增': 'Add',
  '建議池 (System & Pool)': 'Idea Pool',
  '已核准 (Approved)': 'Approved',
  '執行中 (Active)': 'Active',
  '數據大辭典與計算公式': 'Data Dictionary & Formulas',
  '【基礎六脈指標】': '[Base Pulse Metrics]',
  '【進階交叉分析與模型】': '[Advanced Models]',
  '品牌的總營收。過濾掉退貨與零元訂單的淨額。': 'Total brand revenue. Net amount filtering out returns and zero-dollar orders.',
  '衡量網站流量與獲客成本。 🚩 註：請在上傳 GA 數據時，於未來加入行銷費用(Marketing Spend)以計算 ROI。': 'Measures website traffic and CAC. 🚩 Note: Add Marketing Spend when uploading GA data in the future to calculate ROI.',
  '衡量進站後成功留單的比率。': 'Measures the ratio of successful leads after entering the site.',
  '每月的平均客單價 (AOV)。': 'Monthly Average Order Value (AOV).',
  '歷史區間內的回購黏著度。': 'Repurchase stickiness within the historical period.',
  '衡量口碑擴散力。(需補充問卷與推薦碼數據)': 'Measures word-of-mouth diffusion. (Requires survey & referral data)',
  '分析從線上瀏覽到線下門市試吃的轉換損耗。': 'Analyzes conversion loss from online browsing to offline store tasting.',
  '分析直接在網路上獲取名單並轉換電商下單的效率。': 'Analyzes efficiency of capturing online leads to EC orders.',
  '在漏斗圖中可視化，精確找出客戶在哪個行銷節點流失。': 'Visualized in funnel to pinpoint drop-off nodes.',
  'Revenue Per Visitor。反映每一個進站的顧客，平均能為品牌創造多少真實營收。': 'Revenue Per Visitor. Reflects avg real revenue generated by each visitor.',
  '計算出歷史排位(PR)、成長動能(MoM)與目標達成(Target)三大綜合評估分數。': 'Calculates PR, Momentum, and Target achievement scores.',
  '定義五大黃金客群：頂級大使、潛力新星、穩定常客、沉睡大戶、流失過客。': 'Defines 5 golden segments: Ambassador, Rising Star, Regular, Sleeping Whale, Lost.',
  '宏觀檢視品牌目前的獲客健康度與流失危機。': 'Macroscopic view of current acquisition health and churn crisis.',
  '上傳資料庫': 'Upload Database',
  '支援上傳【交易紀錄】與【GA 流量數據】。': 'Supports uploading [Transactions] and [GA Data].',
  '請輸入客戶名稱 (例如：CUPETIT)': 'Enter Client Name (e.g. CUPETIT)',
  '請先輸入客戶名稱！': 'Please enter a client name first!',
  '1. 交易訂單資料 (CSV)': '1. TX Data (CSV)',
  '2. GA 流量資料 (CSV)': '2. GA Traffic Data (CSV)',
  '📂 檔案編碼 (若出現亂碼請切換)': '📂 File Encoding (Switch if garbled)',
  'UTF-8 (系統預設)': 'UTF-8 (Default)',
  'Big5 (台灣 Excel 常見)': 'Big5 (Taiwan Excel)',
  '點擊上傳': 'Click to upload',
  '哎呀，上傳失敗了！(可複製給工程師)': 'Oops, upload failed! (Copy for engineer)',
  '目前無資料': 'No Data Available',
  '無此模式資料': 'No data for this mode',
  '無 GA 流量來源分類資料': 'No GA Traffic Source Data',
  '無 Cohort 資料': 'No Cohort Data',
  '轉化': 'Conv.',
  '流失': 'Drop',
  '總轉換率: ': 'Total Conv: ',
  '齊全': 'Complete',
  'AI 營運診斷': 'AI Diagnosis',
  '開始診斷': 'Start Diagnosis',
  '分析中...': 'Analyzing...',
  'AI 連線失敗。': 'AI Connection Failed.',
  '連線錯誤。': 'Connection Error.',
  'AI 顧問正在深度剖析六脈數據...': 'AI Advisor is analyzing data...',
  '點擊開始分析': 'Click to analyze',
  '的健康狀況': 'health status',
  '指標 (Pulse)': 'Metric (Pulse)',
  '全期累計': 'Total Acc.',
  '資料狀態': 'Status',
};

const I18nContext = createContext({ lang: 'zh', t: (k: string) => k });
export const useI18n = () => useContext(I18nContext);

// --- Configuration ---
const PULSE_CONFIG: Record<string, { label: string, icon: any, color: string, bg: string, border: string, text: string }> = {
  'Profit': { label: '品牌脈', icon: CircleDollarSign, color: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700' },
  'Traffic': { label: '流量脈', icon: Users, color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  'Conversion': { label: '轉換脈', icon: MousePointerClick, color: 'green', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  'VIP': { label: '金主脈', icon: Gem, color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' }, 
  'Retention': { label: '老主脈', icon: Repeat, color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' }, 
  'Reputation': { label: '擁主脈', icon: MessageSquare, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' }, 
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
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = (k: string) => lang === 'en' ? (EN_DICT[k] || k) : k;

  const [activeTab, setActiveTab] = useState('page1');
  const [selectedClient, setSelectedClient] = useState<string>(''); 
  const [clientList, setClientList] = useState<string[]>([]); 
  
  // Data States
  const [gaRawData, setGaRawData] = useState<any[]>([]);
  const [txChanData, setTxChanData] = useState<any[]>([]);
  const [monthlyTxTotal, setMonthlyTxTotal] = useState<any[]>([]);
  
  const [productData, setProductData] = useState<any[]>([]);
  const [channelData, setChannelData] = useState<any[]>([]);
  const [rfmData, setRfmData] = useState<any[]>([]);
  const [cohortData, setCohortData] = useState<any[]>([]);
  
  // 漏斗狀態
  const [funnelMode, setFunnelMode] = useState<'wedding' | 'festival'>('wedding');
  const [funnelDataWedding, setFunnelDataWedding] = useState<any[]>([]); 
  const [funnelDataFestival, setFunnelDataFestival] = useState<any[]>([]); 
  const [gaCategoryData, setGaCategoryData] = useState<any[]>([]); 
  
  // 雙軌交叉分析模式
  const [crossMode, setCrossMode] = useState<'all' | 'offline' | 'ec'>('all');
  
  const [rfmSegments, setRfmSegments] = useState<any[]>([]);
  const [nesData, setNesData] = useState<any[]>([]);

  // Patron Score 狀態
  const [patronScores, setPatronScores] = useState<any[]>([]);

  const [pulseMetrics, setPulseMetrics] = useState({
      profit: { value: 0, hasData: true, unit: '$' },            
      traffic: { value: null as number | null, hasData: false, unit: '人' },      
      conversion: { value: null as number | null, hasData: false, unit: '%' },    
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
        const [{ data: txData }, { data: gaDataRes }] = await Promise.all([
            supabase.from('monthly_brand_pulse').select('client_name'),
            supabase.from('ga_analytics').select('client_name')
        ]);
        const allNames = [...(txData || []), ...(gaDataRes || [])].map(item => item.client_name).filter(Boolean);
        const uniqueClients = Array.from(new Set(allNames));
        setClientList(uniqueClients as string[]);
        if (!selectedClient && uniqueClients.length > 0) setSelectedClient(uniqueClients[0] as string);
    } catch (e) { 
        console.error("Fetch clients error:", e); 
    }
  };

  useEffect(() => { 
      fetchClients(); 
  }, []);

  useEffect(() => {
    if (selectedClient) refreshData(selectedClient);
  }, [selectedClient]);

  // 動態構建交叉分析資料
  const crossAnalysisData = useMemo(() => {
      const gaMonthMap: any = {};
      
      gaRawData.forEach(g => {
          const isWedding = (g.category || '').includes('婚禮') || (g.category || '').includes('彌月');
          const isFestival = !isWedding; 
          
          if (!gaMonthMap[g.year_month]) gaMonthMap[g.year_month] = { active_users: 0, conversions: 0 };
          
          if (crossMode === 'all' || (crossMode === 'offline' && isWedding) || (crossMode === 'ec' && isFestival)) {
              gaMonthMap[g.year_month].active_users += (Number(g.active_users) || 0);
              if (crossMode === 'ec' || isFestival) {
                  gaMonthMap[g.year_month].conversions += (Number(g.leads) || 0);
              } 
              if (crossMode === 'offline' || isWedding) {
                  gaMonthMap[g.year_month].conversions += (Number(g.appointments) || 0);
              }
          }
      });

      const txMonthMap: any = {};
      txChanData.forEach(t => {
          if (!txMonthMap[t.year_month]) txMonthMap[t.year_month] = { revenue: 0, aov: 0 };
          if (crossMode === 'all' || (crossMode === 'offline' && t.channel_group === 'Offline') || (crossMode === 'ec' && t.channel_group === 'EC')) {
              txMonthMap[t.year_month].revenue += (Number(t.total_revenue) || 0);
              txMonthMap[t.year_month].aov = (Number(t.total_revenue) || 0) / (Number(t.order_count) || 1);
          }
      });

      const allMonths = Array.from(new Set([...Object.keys(txMonthMap), ...Object.keys(gaMonthMap)])).sort();
      
      return allMonths.map(month => {
          const rev = txMonthMap[month]?.revenue || 0;
          const aov = txMonthMap[month]?.aov || 0;
          const users = gaMonthMap[month]?.active_users || 0;
          const convs = gaMonthMap[month]?.conversions || 0;
          return {
              year_month: month,
              revenue: rev,
              aov: aov,
              active_users: users,
              conversions: convs,
              rpv: users > 0 ? (rev / users) : 0,
              conv_rate: users > 0 ? (convs / users * 100) : 0
          };
      }).filter(d => d.revenue > 0 || d.active_users > 0);

  }, [gaRawData, txChanData, crossMode]);

  // ★ 核心功能：計算 Patron Score 三大分數
  useEffect(() => {
      if (crossAnalysisData.length === 0) return;

      const arr = crossAnalysisData;
      
      const getPr = (val: number, key: string) => {
          const sorted = arr.map(a => (a as any)[key]).sort((a,b) => a - b);
          const rank = sorted.findIndex(v => v >= val) + 1;
          return (rank / sorted.length) * 100;
      };
      
      const getMom = (val: number, key: string, idx: number) => {
          if (idx === 0) return 100;
          const past = arr.slice(Math.max(0, idx - 6), idx).map(a => (a as any)[key]);
          const avg = past.reduce((a,b) => a + b, 0) / past.length;
          if (avg === 0) return val > 0 ? 150 : 100;
          return Math.min(150, (val / avg) * 100);
      };

      const getTar = (val: number, key: string) => {
          const max = Math.max(...arr.map(a => (a as any)[key]));
          if (max === 0) return 0;
          return (val / max) * 100;
      };

      const w = { rev: 0.35, traffic: 0.15, conv: 0.25, aov: 0.15, rpv: 0.10 };

      const scores = arr.map((d, index) => {
          const rankScore = (getPr(d.revenue, 'revenue') * w.rev + getPr(d.active_users, 'active_users') * w.traffic + getPr(d.conv_rate, 'conv_rate') * w.conv + getPr(d.aov, 'aov') * w.aov + getPr(d.rpv, 'rpv') * w.rpv);
          const momScore = (getMom(d.revenue, 'revenue', index) * w.rev + getMom(d.active_users, 'active_users', index) * w.traffic + getMom(d.conv_rate, 'conv_rate', index) * w.conv + getMom(d.aov, 'aov', index) * w.aov + getMom(d.rpv, 'rpv', index) * w.rpv);
          const tarScore = (getTar(d.revenue, 'revenue') * w.rev + getTar(d.active_users, 'active_users') * w.traffic + getTar(d.conv_rate, 'conv_rate') * w.conv + getTar(d.aov, 'aov') * w.aov + getTar(d.rpv, 'rpv') * w.rpv);

          return {
              year_month: d.year_month,
              [t('歷史排位')]: Math.round(rankScore),
              [t('成長動能')]: Math.round(momScore),
              [t('目標達成')]: Math.round(tarScore)
          };
      });

      setPatronScores(scores);
  }, [crossAnalysisData, lang]);

  // ★ 智慧洞察文字
  const autoInsightText = useMemo(() => {
      const data = crossAnalysisData;
      if(data.length < 2) return lang === 'en' ? "Insufficient data for cross-analysis insights." : "資料不足，無法產生交叉分析洞察。";

      let maxTraffic = data[0], maxConv = data[0], maxRev = data[0], maxDrop = data[0]; 
      let maxDropVal = -1;

      data.forEach(d => {
          if(d.active_users > maxTraffic.active_users) maxTraffic = d;
          if(d.conversions > maxConv.conversions) maxConv = d;
          if(d.revenue > maxRev.revenue) maxRev = d;

          if(d.active_users > 500) {
              const dropRatio = 1 - (d.conversions / d.active_users);
              if(dropRatio > maxDropVal) {
                  maxDropVal = dropRatio;
                  maxDrop = d; 
              }
          }
      });

      const modeName = crossMode === 'all' ? t('全通路') : (crossMode === 'offline' ? t('O2O實體') : t('EC電商'));
      const convLabel = crossMode === 'ec' ? (lang === 'en' ? 'Leads' : '名單') : (lang === 'en' ? 'Appts' : '預約');

      if (lang === 'en') {
        return `[${modeName} Smart Insight]
🎯 Peak traffic was in ${maxTraffic?.year_month || 'N/A'} (${(maxTraffic?.active_users || 0).toLocaleString()} users); max ${convLabel} conversion was in ${maxConv?.year_month || 'N/A'} (${maxConv?.conversions || 0}).
💰 Revenue peak was in ${maxRev?.year_month || 'N/A'} ($${((maxRev?.revenue || 0) / 10000).toFixed(0)}w).
⚠️ Note that in ${maxDrop?.year_month || 'N/A'}, despite ${(maxDrop?.active_users || 0).toLocaleString()} visitors, it only generated ${maxDrop?.conversions || 0} ${convLabel} (RPV $${maxDrop?.rpv?.toFixed(0) || 0}), showing a massive drop-off. Recommend reviewing audience targeting.`;
      }

      return `【${modeName} 智慧數據洞察】
🎯 流量巔峰落在 ${maxTraffic?.year_month || '未知'} (${(maxTraffic?.active_users || 0).toLocaleString()}人)；${convLabel}轉換最高落在 ${maxConv?.year_month || '未知'} (${maxConv?.conversions || 0}組)。
💰 營收高點為 ${maxRev?.year_month || '未知'} ($${((maxRev?.revenue || 0) / 10000).toFixed(0)}萬)。
⚠️ 需注意「${maxDrop?.year_month || '未知'}」，該月有 ${(maxDrop?.active_users || 0).toLocaleString()} 人造訪，卻僅帶來 ${maxDrop?.conversions || 0} 筆${convLabel} (單位流量產值僅 $${maxDrop?.rpv?.toFixed(0) || 0})，形成巨大反差，建議檢視該月行銷受眾精準度。`;

  }, [crossAnalysisData, crossMode, lang]);

  const refreshData = async (clientName: string) => {
    setLoading(true);
    try {
        const [
            { data: monthlyTxRaw }, { data: retRaw }, { data: gaCatRaw }, { data: chanFunnelRaw }, { data: monthlyChanRaw }
        ] = await Promise.all([
            supabase.from('monthly_brand_pulse').select('*').eq('client_name', clientName).order('year_month', { ascending: true }),
            supabase.from('customer_retention_stats').select('*').eq('client_name', clientName),
            supabase.from('ga_analytics').select('*').eq('client_name', clientName).order('year_month', { ascending: true }),
            supabase.from('channel_funnel_stats').select('*').eq('client_name', clientName),
            supabase.from('monthly_channel_metrics').select('*').eq('client_name', clientName)
        ]);

        const mData = monthlyTxRaw || [];
        const gaRawItems = gaCatRaw || [];
        const chanFunnel = chanFunnelRaw || [];
        
        setMonthlyTxTotal(mData);
        setGaRawData(gaRawItems);
        setTxChanData(monthlyChanRaw || []);

        let w_traffic = 0, w_appt = 0;
        let f_traffic = 0, f_leads = 0;
        let w_sales = 0, w_repeat = 0;
        let f_sales = 0, f_repeat = 0;

        gaRawItems.forEach(item => {
            const cat = item.category || '';
            const users = Number(item.active_users) || 0;
            if(cat.includes('婚禮') || cat.includes('彌月')) {
                w_traffic += users;
                w_appt += Number(item.appointments) || 0;
            } else {
                f_traffic += users;
                f_leads += Number(item.leads) || 0;
            }
        });

        chanFunnel.forEach(r => {
            if(r.channel_group === 'EC') {
                f_sales += Number(r.total_customers) || 0;
                f_repeat += Number(r.repeat_customers) || 0;
            } else {
                w_sales += Number(r.total_customers) || 0;
                w_repeat += Number(r.repeat_customers) || 0;
            }
        });

        setFunnelDataWedding([
            { name: '1. 活躍流量(GA)', value: Math.round(w_traffic), fill: '#3b82f6' },
            { name: '2. 門市預約(GA)', value: w_appt, fill: '#10b981' },
            { name: '3. 實體成交客(TX)', value: w_sales, fill: '#f59e0b' },
            { name: '4. 實體回購客(TX)', value: w_repeat, fill: '#ef4444' }
        ].filter(v => v.value > 0));

        setFunnelDataFestival([
            { name: '1. 活躍流量(GA)', value: Math.round(f_traffic), fill: '#8b5cf6' },
            { name: '2. 節慶名單(GA)', value: f_leads, fill: '#14b8a6' },
            { name: '3. 電商成交客(TX)', value: f_sales, fill: '#eab308' },
            { name: '4. 電商回購客(TX)', value: f_repeat, fill: '#f43f5e' }
        ].filter(v => v.value > 0));

        const totalRev = mData.reduce((acc, cur) => acc + (cur.total_revenue || 0), 0);
        const totalOrd = mData.reduce((acc, cur) => acc + (cur.order_count || 0), 0);
        const avgAov = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;
        
        const totalCustomers = retRaw?.length || 0;
        const repeatCustomers = retRaw?.filter(c => c.purchase_days > 1).length || 0;
        const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

        const totalActiveUsers = gaRawItems.reduce((acc, cur) => acc + (Number(cur.active_users) || 0), 0);
        const totalConversions = w_appt + f_leads;
        const overallConversionRate = totalActiveUsers > 0 ? (totalConversions / totalActiveUsers) * 100 : null;

        setPulseMetrics({
            profit: { value: totalRev, hasData: totalRev > 0, unit: '$' },
            traffic: { value: totalActiveUsers > 0 ? totalActiveUsers : null, hasData: totalActiveUsers > 0, unit: '人' }, 
            conversion: { value: overallConversionRate, hasData: overallConversionRate !== null, unit: '%' }, 
            vip: { value: avgAov, hasData: avgAov > 0, unit: '$' },
            retention: { value: repeatRate, hasData: totalCustomers > 0, unit: '%' },
            reputation: { value: null, hasData: false, unit: '分' } 
        });

        const catMap: any = {};
        gaRawItems.forEach(c => {
            const cat = c.category || '未分類';
            catMap[cat] = (catMap[cat] || 0) + (Number(c.active_users) || 0);
        });
        setGaCategoryData(Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a:any, b:any) => b.value - a.value));

        const { data: prodRaw } = await supabase.from('product_analytics').select('*').eq('client_name', clientName).order('total_revenue', { ascending: false }).limit(10);
        setProductData((prodRaw || []).map(p => ({ name: p.product_name, value: p.total_revenue })));

        const { data: chanRaw } = await supabase.from('channel_analytics').select('*').eq('client_name', clientName).order('total_revenue', { ascending: false });
        setChannelData((chanRaw || []).map(c => ({ name: c.channel, value: c.total_revenue })));

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
            N: { name: 'N: 新客 (<120天)', count: 0, fill: '#3b82f6' },
            E: { name: 'E: 活躍客 (回購)', count: 0, fill: '#10b981' },
            S: { name: 'S: 沉睡客 (>200天)', count: 0, fill: '#ef4444' }
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

    } catch (err) { 
        console.error("Data Load Error:", err); 
    }
    setLoading(false);
  };

  const handleUploadSuccess = (newClientName: string) => {
      fetchClients();
      setSelectedClient(newClientName);
      setActiveTab('page1');
  };

  return (
    <I18nContext.Provider value={{ lang, t }}>
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <nav className="bg-white shadow-md sticky top-0 z-50 px-6">
        <div className="max-w-7xl mx-auto h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold shadow-lg">S</div>
                    <span className="text-lg font-bold text-slate-800 hidden md:block">SMEbig PatronOS™</span>
                </div>
                <div className="relative flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                        <Building2 size={16} className="text-slate-500"/>
                        <select 
                            value={selectedClient} 
                            onChange={(e) => setSelectedClient(e.target.value)}
                            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer min-w-[120px]"
                        >
                            <option value="" disabled>{t('請選擇客戶...')}</option>
                            {clientList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} 
                        className="bg-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-600 hover:bg-slate-300 transition-colors"
                    >
                        {lang === 'zh' ? 'EN' : '中文'}
                    </button>
                </div>
            </div>
            <div className="flex space-x-1 md:space-x-4 h-full overflow-x-auto">
                <TabButton id="page1" label={t('營運體檢')} icon={<IconPie size={16}/>} active={activeTab === 'page1'} onClick={() => setActiveTab('page1')} />
                <TabButton id="page6" label={t('Patron Score')} icon={<Award size={16}/>} active={activeTab === 'page6'} onClick={() => setActiveTab('page6')} />
                <TabButton id="page2" label={t('深度病理')} icon={<Microscope size={16}/>} active={activeTab === 'page2'} onClick={() => setActiveTab('page2')} />
                <TabButton id="page3" label={t('顧問藥方')} icon={<ListTodo size={16}/>} active={activeTab === 'page3'} onClick={() => setActiveTab('page3')} />
                <TabButton id="page5" label={t('數據定義')} icon={<BookOpen size={16}/>} active={activeTab === 'page5'} onClick={() => setActiveTab('page5')} />
                <TabButton id="page4" label={t('資料上傳')} icon={<Upload size={16}/>} active={activeTab === 'page4'} onClick={() => setActiveTab('page4')} />
            </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {!selectedClient && activeTab !== 'page4' && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl shadow-sm border border-dashed border-slate-300">
                <Building2 size={64} className="mb-4 text-slate-200"/>
                <h3 className="text-xl font-bold text-slate-600">{t('請先選擇一位客戶')}</h3>
                <p className="mb-6">{t('左上角下拉選單選擇現有客戶，或至「資料上傳」建立新客戶。')}</p>
                <button onClick={() => setActiveTab('page4')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={18}/> {t('上傳新資料')}
                </button>
            </div>
        )}

        {/* === Page 1: Overview === */}
        {selectedClient && activeTab === 'page1' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">📊 {selectedClient} - {t('營運體檢')}</h2>
                    <p className="text-sm text-slate-500">{t('以六脈指標動態評估品牌健康度')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button className="px-3 py-1 text-sm font-bold bg-white shadow rounded text-slate-800">{t('全部期間')}</button>
                        <button className="px-3 py-1 text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50" disabled>{t('本年對比')}</button>
                    </div>
                </div>
            </div>

            {loading ? <LoadingSkeleton /> : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PulseCard title={t("品牌脈 (總營收)")} icon={<CircleDollarSign size={20}/>} color="slate" data={pulseMetrics.profit} trend={null} />
                    <PulseCard title={t("流量脈 (總訪客)")} icon={<Users size={20}/>} color="blue" data={pulseMetrics.traffic} missingMsg={t("缺少網站流量數據 (GA)")} trend={null} />
                    <PulseCard title={t("轉換脈 (留單率)")} icon={<MousePointerClick size={20}/>} color="green" data={pulseMetrics.conversion} missingMsg={t("缺少網站流量數據 (GA)")} trend={null} />
                    <PulseCard title={t("金主脈 (客單價)")} icon={<Gem size={20}/>} color="yellow" data={pulseMetrics.vip} trend={null} />
                    <PulseCard title={t("老主脈 (回購率)")} icon={<Repeat size={20}/>} color="red" data={pulseMetrics.retention} trend={null} />
                    <PulseCard title={t("擁主脈 (NPS口碑)")} icon={<MessageSquare size={20}/>} color="purple" data={pulseMetrics.reputation} missingMsg={t("缺少 NPS 分數與推薦碼數據")} trend={null} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{t('雙軌營收與流量趨勢 (Cross-Analysis)')}</h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button onClick={()=>setCrossMode('all')} className={`px-3 py-1 text-xs font-bold rounded ${crossMode==='all'?'bg-white shadow text-slate-800':'text-slate-500'}`}>{t('全通路')}</button>
                                <button onClick={()=>setCrossMode('offline')} className={`px-3 py-1 text-xs font-bold rounded ${crossMode==='offline'?'bg-white shadow text-slate-800':'text-slate-500'}`}>{t('O2O實體')}</button>
                                <button onClick={()=>setCrossMode('ec')} className={`px-3 py-1 text-xs font-bold rounded ${crossMode==='ec'?'bg-white shadow text-slate-800':'text-slate-500'}`}>{t('EC電商')}</button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <ComposedChart data={crossAnalysisData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year_month" />
                                    
                                    <YAxis yAxisId="left" tickFormatter={(val) => `$${(val/10000).toFixed(0)}w`} />
                                    <YAxis yAxisId="right_traffic" orientation="right" tickFormatter={(val) => `${(val/1000).toFixed(1)}k`} />
                                    <YAxis yAxisId="right_conv" orientation="right" hide={true} domain={['auto', 'auto']} />
                                    
                                    <Tooltip formatter={(val: any, name: any) => (name||'').includes('營收') || (name||'').includes('Revenue') ? `$${Number(val).toLocaleString()}` : `${Number(val).toLocaleString()} ${t('人')}/${t('組')}`} />
                                    <Legend />
                                    
                                    <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name={t("產生營收 (左軸)")} radius={[4,4,0,0]} barSize={30} />
                                    <Line yAxisId="right_traffic" type="monotone" dataKey="active_users" stroke="#8b5cf6" strokeWidth={3} name={t("活躍流量 (右軸)")} dot={{ r: 4 }} />
                                    <Line yAxisId="right_conv" type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" name={crossMode==='ec'?t('名單數 (趨勢比例)'):t('預約數 (趨勢比例)')} dot={{ r: 4 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        {autoInsightText && (
                            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {autoInsightText}
                            </div>
                        )}
                    </div>
                    
                    <AiDiagnosisPanel clientName={selectedClient} />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800">
                            {t('流量與營收交叉對照表')} ({crossMode === 'all' ? t('全通路') : crossMode === 'offline' ? t('O2O實體') : t('EC電商')})
                        </h3>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">{t('單位流量產值 (RPV) 分析')}</span>
                    </div>
                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                        <table className="w-full text-center text-sm">
                            <thead className="bg-white text-slate-500 border-b border-gray-200 sticky top-0 shadow-sm z-10">
                                <tr>
                                    <th className="p-3 font-semibold text-left pl-6">{t('月份')}</th>
                                    <th className="p-3 font-semibold text-right">{t('活躍流量 (A)')}</th>
                                    <th className="p-3 font-semibold text-right">{crossMode==='ec'?t('名單數 (B)'):t('預約數 (B)')}</th>
                                    <th className="p-3 font-semibold text-right">{t('產生營收 (C)')}</th>
                                    <th className="p-3 font-semibold text-right text-indigo-600 bg-indigo-50/50">{t('流量產值 RPV (C/A)')}</th>
                                    <th className="p-3 font-semibold text-right text-teal-600">{t('留單率 (B/A)')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {crossAnalysisData.map((d, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 text-left pl-6 font-mono text-slate-600">{d.year_month}</td>
                                        <td className="p-3 text-right">{d.active_users.toLocaleString()} {t('人')}</td>
                                        <td className="p-3 text-right">{d.conversions.toLocaleString()} {t('組')}</td>
                                        <td className="p-3 text-right">${d.revenue.toLocaleString()}</td>
                                        <td className="p-3 text-right font-bold text-indigo-600 bg-indigo-50/30">
                                            ${(d.rpv || 0).toFixed(0)} <span className="text-xs text-slate-400 font-normal">/ {t('人')}</span>
                                        </td>
                                        <td className="p-3 text-right font-bold text-teal-600">{d.conv_rate.toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
            )}
          </div>
        )}

        {/* === Page 6: Patron Score (全新戰情分頁) === */}
        {selectedClient && activeTab === 'page6' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{t('🏆 Patron Score 綜合營運指標')}</h2>
                        <p className="text-sm text-slate-500">{t('基於歷史數據自我競賽，快速掌握營運水位與成長動能。')}</p>
                    </div>
                </div>

                {patronScores.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ScoreCard 
                                title={t("Patron Score - 歷史排位")} 
                                score={patronScores[patronScores.length - 1][t('歷史排位')]} 
                                desc={t("本月表現在歷史長河中的綜合 PR 值")}
                                color="blue"
                            />
                            <ScoreCard 
                                title={t("Patron Score - 成長動能")} 
                                score={patronScores[patronScores.length - 1][t('成長動能')]} 
                                desc={t("相較於過去半年的均值成長幅度 (基準100)")}
                                color="green"
                            />
                            <ScoreCard 
                                title={t("Patron Score - 目標達成")} 
                                score={patronScores[patronScores.length - 1][t('目標達成')]} 
                                desc={t("距離歷史最高峰 (滿分100) 還有多遠")}
                                color="purple"
                            />
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">{t('Patron Score 歷史趨勢追蹤')}</h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <LineChart data={patronScores} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="year_month" />
                                        <YAxis domain={[0, 'auto']} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey={t("歷史排位")} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey={t("成長動能")} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey={t("目標達成")} stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen size={18} className="text-slate-600"/> {t('Patron Score 指標解讀指南')}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
                                <div>
                                    <strong className="text-blue-700 block mb-1">{t('歷史排位 (Percentile Rank)')}</strong>
                                    <p>{t('將六脈指標與過去所有月份進行排序。若分數為 85，代表本月綜合表現擊敗了歷史上 85% 的月份。適合用來評估「當前營運水位是否在顛峰狀態」。')}</p>
                                </div>
                                <div>
                                    <strong className="text-green-700 block mb-1">{t('成長動能 (Momentum)')}</strong>
                                    <p>{t('將本月表現與「過去 6 個月的平均值」對比。100 分代表持平，120 分代表超標 20%。適合用來觀察「行銷活動是否成功帶起新一波的成長爆發力」。')}</p>
                                </div>
                                <div>
                                    <strong className="text-purple-700 block mb-1">{t('目標達成 (Target)')}</strong>
                                    <p>{t('找出品牌歷史上表現最完美的月份視為滿分 100。適合企業訂定 KPI 時，評估「我們距離曾經達到的最理想狀態還有多少差距」。')}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <EmptyState message={t("目前無資料")} />
                )}
            </div>
        )}

        {/* === Page 2: Deep Analysis === */}
        {selectedClient && activeTab === 'page2' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-800">🔬 {t('深度病理')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-500 pl-3">{t('流量變現漏斗 (Funnel)')}</h3>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button onClick={()=>setFunnelMode('wedding')} className={`px-3 py-1 text-sm font-bold rounded transition-all ${funnelMode==='wedding'?'bg-white shadow text-slate-800':'text-slate-500'}`}>{t('O2O實體')}</button>
                            <button onClick={()=>setFunnelMode('festival')} className={`px-3 py-1 text-sm font-bold rounded transition-all ${funnelMode==='festival'?'bg-white shadow text-slate-800':'text-slate-500'}`}>{t('EC電商')}</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center overflow-x-auto">
                        <CustomFunnel data={funnelMode === 'wedding' ? funnelDataWedding : funnelDataFestival} />
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center border-t border-slate-100 pt-3">
                        {t('診斷：檢視漏水率最高的階層，對症下藥優化轉換率。')}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-teal-500 pl-3">{t('GA 流量來源屬性')}</h3>
                        <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">{t('婚禮 vs 節慶')}</span>
                    </div>
                    <div className="h-[300px]">
                        {gaCategoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <PieChart>
                                    <Pie data={gaCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name, percent}: any) => `${t(name)} ${((percent || 0) * 100).toFixed(0)}%`}>
                                        {gaCategoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(val:any) => `${val.toLocaleString()} ${t('人')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <EmptyState message={t("無 GA 流量來源分類資料")} />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-blue-500 pl-3">{t('NES 顧客生命週期')}</h3>
                        <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">{t('N=新, E=活, S=睡')}</span>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <BarChart data={nesData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={120} tickFormatter={(val) => t(val)} tick={{fontSize: 11}} />
                                <Tooltip formatter={(val:any, name: any) => [`${val.toLocaleString()} ${t('人')}`, t(name)]} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {nesData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-800 border-l-4 border-yellow-500 pl-3">{t('RFM 分群營收貢獻')}</h3>
                        <span className="text-xs text-gray-500 bg-slate-100 px-2 py-1 rounded">{t('誰是您的金雞母？')}</span>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <PieChart>
                                <Pie data={rfmSegments} dataKey="rev" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}: any) => `${t(name)} ${((percent || 0) * 100).toFixed(0)}%`}>
                                    {rfmSegments.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                </Pie>
                                <Tooltip formatter={(val:any, name: any) => [`$${val.toLocaleString()}`, t(name)]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-green-500 pl-3 mb-4">{t('熱銷品項排行 (Top 10)')}</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <BarChart layout="vertical" data={productData}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10}} />
                                <Tooltip formatter={(val:any) => [`$${val.toLocaleString()}`, t('銷售額')]} />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name={t("銷售額")} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm overflow-x-auto border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3 mb-4">{t('同層留存率 (Cohort)')}</h3>
                    {cohortData.length > 0 ? (
                        <table className="w-full text-center text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50"><th className="p-3">{t('月份')}</th><th>M+0</th><th>M+1</th><th>M+2</th></tr>
                            </thead>
                            <tbody>
                                {cohortData.map((r:any,i:number)=>(
                                    <tr key={i} className="border-b">
                                        <td className="p-3 font-mono text-slate-600">{r.m}</td>
                                        {r.v.slice(0,3).map((v:any,j:number)=>(
                                            <td key={j} className={v<20?'text-red-500 font-bold bg-red-50':'text-slate-700'}>{v}%</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <EmptyState message={t("無 Cohort 資料")} />}
                </div>
            </div>
          </div>
        )}

        {selectedClient && activeTab === 'page3' && <ConsultantPrescriptionPage clientName={selectedClient} rfmSegments={rfmSegments} />}

        {/* === Page 5: Data Definitions === */}
        {activeTab === 'page5' && (
            <div className="space-y-8 animate-in fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><BookOpen className="text-blue-600"/> {t('數據大辭典與計算公式')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-indigo-700 border-b border-indigo-100 pb-2">{t('【基礎六脈指標】')}</h3>
                            <ul className="space-y-4">
                                <SpecItem title={t("品牌脈")} logic="SUM(Transactions.Amount)" desc={t("品牌的總營收。過濾掉退貨與零元訂單的淨額。")} />
                                <SpecItem title={t("流量脈")} logic="總活躍使用者 / 總行銷費用" desc={t("衡量網站流量與獲客成本。 🚩 註：請在上傳 GA 數據時，於未來加入行銷費用(Marketing Spend)以計算 ROI。")} />
                                <SpecItem title={t("轉換脈")} logic="(預約數 + 名單數) / 總活躍使用者" desc={t("衡量進站後成功留單的比率。")} />
                                <SpecItem title={t("金主脈")} logic="總營收 / 總訂單數" desc={t("每月的平均客單價 (AOV)。")} />
                                <SpecItem title={t("老主脈")} logic="購買 2 次以上人數 / 總客戶數" desc={t("歷史區間內的回購黏著度。")} />
                                <SpecItem title={t("擁主脈")} logic="NPS 分數 / 推薦產生之業績" desc={t("衡量口碑擴散力。(需補充問卷與推薦碼數據)")} />
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-teal-700 border-b border-teal-100 pb-2">{t('【進階交叉分析與模型】')}</h3>
                            <ul className="space-y-4">
                                <SpecItem title={t("O2O實體")} logic="GA婚禮彌月流量 ➡️ 門市預約 ➡️ 實體成交客(TX) ➡️ 實體回購客" desc={t("分析從線上瀏覽到線下門市試吃的轉換損耗。")} />
                                <SpecItem title={t("EC電商")} logic="GA節慶名單流量 ➡️ 節慶名單 ➡️ EC成交客(TX) ➡️ EC回購客" desc={t("分析直接在網路上獲取名單並轉換電商下單的效率。")} />
                                <SpecItem title={t("流失")} logic="1 - (本層數量 / 上一層數量)" desc={t("在漏斗圖中可視化，精確找出客戶在哪個行銷節點流失。")} />
                                <SpecItem title={t("單位流量產值 (RPV) 分析")} logic="對應通路總營收 / 對應通路活躍流量" desc={t("Revenue Per Visitor。反映每一個進站的顧客，平均能為品牌創造多少真實營收。")} />
                                <SpecItem title="Patron Score" logic="以六脈動態加權運算" desc={t("計算出歷史排位(PR)、成長動能(MoM)與目標達成(Target)三大綜合評估分數。")} />
                                <SpecItem title="RFM 模型分群" logic="Recency x Frequency x Monetary" desc={t("定義五大黃金客群：頂級大使、潛力新星、穩定常客、沉睡大戶、流失過客。")} />
                                <SpecItem title={t("NES 顧客生命週期")} logic="N: 新客(<120天) / E: 活躍客(回購) / S: 沉睡客(>200天)" desc={t("宏觀檢視品牌目前的獲客健康度與流失危機。")} />
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
                        <h2 className="text-2xl font-bold text-slate-800">{t('上傳資料庫')}</h2>
                        <p className="text-slate-500">{t('支援上傳【交易紀錄】與【GA 流量數據】。')}</p>
                    </div>
                    <DataUploader supabase={supabase} onSuccess={handleUploadSuccess} />
                </div>
            </div>
        )}
      </main>
    </div>
    </I18nContext.Provider>
  );
}

// --- Sub-Components ---

function ScoreCard({ title, score, desc, color }: { title: string, score: number, desc: string, color: 'blue'|'green'|'purple' }) {
    const colorStyles = {
        blue: 'text-blue-600 bg-blue-50 border-blue-200',
        green: 'text-green-600 bg-green-50 border-green-200',
        purple: 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return (
        <div className={`p-6 rounded-2xl border-2 shadow-sm flex flex-col items-center justify-center text-center ${colorStyles[color]}`}>
            <h3 className="font-bold mb-2 opacity-80">{title}</h3>
            <div className="text-5xl font-black mb-2">{score}</div>
            <p className="text-xs opacity-70 px-4">{desc}</p>
        </div>
    );
}

function CustomFunnel({ data }: { data: any[] }) {
    const { t } = useI18n();
    if (!data || data.length === 0) return <EmptyState message={t("無此模式資料")} />;
    const topValue = data[0].value;

    return (
        <div className="w-full flex flex-col items-center justify-center space-y-1 py-4">
            {data.map((step: any, index: number) => {
                const prevValue = index > 0 ? data[index - 1].value : null;
                const stepConv = prevValue ? ((step.value / prevValue) * 100).toFixed(1) : '100.0';
                const totalConv = topValue ? ((step.value / topValue) * 100).toFixed(1) : '100.0';
                const trueRatio = step.value / topValue;
                const visualWidth = Math.max(30, trueRatio * 100); 

                return (
                    <div key={index} className="w-full flex flex-col items-center">
                        {index > 0 && (
                            <div className="flex flex-col items-center justify-center my-1 z-10">
                                <div className="bg-white border border-slate-200 text-slate-500 text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
                                    <span>{t('轉化')} <strong className="text-green-600">{stepConv}%</strong></span>
                                    <span className="text-slate-300">|</span>
                                    <span>{t('流失')} <strong className="text-red-400">-{ (100 - Number(stepConv)).toFixed(1) }%</strong></span>
                                </div>
                                <div className="h-4 w-px bg-slate-300"></div>
                                <div className="w-2 h-2 border-b-2 border-r-2 border-slate-300 transform rotate-45 -mt-1 mb-1"></div>
                            </div>
                        )}
                        <div 
                            className="flex justify-between items-center px-4 py-3 rounded-lg shadow-md text-white transition-all duration-500 hover:brightness-110"
                            style={{ width: `${visualWidth}%`, minWidth: '260px', backgroundColor: step.fill }}
                        >
                            <span className="font-bold text-sm sm:text-base mr-2 flex items-center gap-2">
                                <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">{index + 1}</span>
                                {t(step.name)}
                            </span>
                            <div className="text-right">
                                <div className="text-xl sm:text-2xl font-black tracking-tight">
                                    {step.value.toLocaleString()}
                                </div>
                                {index > 0 && (
                                    <div className="text-[10px] sm:text-xs opacity-90 font-medium">
                                        {t('總轉換率: ')}{totalConv}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function PulseCard({ title, icon, color, data, missingMsg, trend }: any) {
    const { t } = useI18n();
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
                    <h3 className="font-bold">{t(title)}</h3>
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
                        <span className="text-base text-slate-500 font-normal ml-1">{data.unit !== '$' ? t(data.unit) : ''}</span>
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
    const { t } = useI18n();
    return (
        <tr className="border-b border-gray-100 hover:bg-slate-50">
            <td className="p-4 font-medium text-slate-700">{t(title)}</td>
            <td className="p-4 font-bold text-slate-900">
                {val !== null ? `${unit === '$' ? '$' : ''}${Number(val).toLocaleString(undefined, {maximumFractionDigits:2})}${unit !== '$' ? t(unit) : ''}` : '-'}
            </td>
            <td className="p-4">
                {status === 'good' && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={16}/> {t('齊全')}</span>}
                {status === 'none' && <span className="text-slate-300">-</span>}
            </td>
            <td className="p-4 text-xs text-slate-500">
                {status === 'none' ? <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> {t(msg)}</span> : t(msg)}
            </td>
        </tr>
    );
}

function AiDiagnosisPanel({ clientName }: any) { 
    const { t, lang } = useI18n();
    const [d, setD] = useState(""); 
    const [l, setL] = useState(false); 
    
    const MOCK_DIAGNOSIS_ZH = [
        "【成長動能強勁】\n本月流量與轉換雙雙達標，Patron Score 成長動能突破 110 分。建議本月可額外加碼 15% 預算於表現最佳的導流渠道，趁勢放大品牌脈。",
        "【客單價提升警訊】\n雖然網站活躍流量大，但「金主脈(AOV)」較歷史平均下滑 12%。建議針對購物車結帳頁面增加「滿額贈」或「加購優惠」模組以拉抬客單價。",
        "【沉睡客喚醒時機】\n系統的 NES 模型偵測到高達 30% 的歷史 VVIP 已進入「S: 睡眠期」(超過200天未購買)。建議立即啟動客服專人致電或高單價回歸禮發送計畫。",
        "【轉換漏水嚴重】\n本期 O2O 漏斗流失率達 85%！大量的流量卡在「門市預約」階段。建議檢視落地頁的預約表單欄位是否過於繁瑣，或提供更明確的預約誘因。",
        "【營收結構健康】\n本月新舊客營收貢獻比例達 4:6 黃金比例。老客回購力道穩健，建議邀請「頂級大使」客群填寫 NPS 問卷，並啟動裂變行銷 (MGM) 獲取更多優質新客。",
        "【VVIP 貢獻高度集中】\n前 10% 的忠誠客貢獻了本月高達 45% 的營收。請務必針對這群「潛力新星」與「頂級大使」規劃專屬的封館活動或優先體驗權，深化品牌忠誠度。"
    ];

    const MOCK_DIAGNOSIS_EN = [
        "[Strong Momentum]\nTraffic and conversions hit targets. Patron Momentum > 110. Recommend +15% budget to top channels to expand Profit Pulse.",
        "[AOV Warning]\nHigh traffic, but VIP Pulse (AOV) dropped 12% vs avg. Recommend adding 'Gift with Purchase' or 'Add-on' modules at checkout.",
        "[Awaken Sleepers]\nNES model detects 30% of historical VVIPs in 'S: Sleeping' (>200 days). Recommend immediate VIP calls or premium return gifts.",
        "[Severe Funnel Leak]\nO2O drop-off is 85%! Heavy traffic stuck at 'Offline Appt'. Simplify landing page forms or add stronger booking incentives.",
        "[Healthy Revenue Mix]\nNew vs Old customer revenue is at 4:6 golden ratio. Recommend NPS surveys for 'Top Ambassadors' and MGM referral campaigns.",
        "[VVIP Concentration]\nTop 10% loyalists contribute 45% of revenue. Plan exclusive VIP events or early-access perks for 'Rising Stars' & 'Ambassadors'."
    ];

    const run = () => { 
        if (!clientName) return; 
        setL(true); 
        setTimeout(() => {
            const arr = lang === 'en' ? MOCK_DIAGNOSIS_EN : MOCK_DIAGNOSIS_ZH;
            const randomMock = arr[Math.floor(Math.random() * arr.length)];
            setD(randomMock);
            setL(false);
        }, 1500);
    }; 
    
    return (
        <div className="lg:col-span-1 bg-[#1e293b] text-white rounded-2xl p-6 flex flex-col shadow-xl">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-700 pb-4">
                <Bot className="text-blue-400" />
                <h3 className="text-lg font-bold">{t('AI 營運診斷')}</h3>
            </div>
            <div className="flex-1 space-y-4">
                {d ? (
                    <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed border border-white/10 animate-in fade-in whitespace-pre-wrap">
                        {d}
                    </div>
                ) : (
                    <div className="text-slate-400 text-sm text-center py-10">
                        {l ? t("AI 顧問正在深度剖析六脈數據...") : `${t('點擊開始分析')} ${clientName || '...'} ${t('的健康狀況')}`}
                    </div>
                )}
            </div>
            <button 
                onClick={run} 
                disabled={l || !clientName} 
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
                {l ? <Loader2 className="animate-spin" /> : <Sparkles size={16}/>} 
                {l ? t('分析中...') : t('開始診斷')}
            </button>
        </div>
    ); 
}

function ConsultantPrescriptionPage({ clientName, rfmSegments }: any) {
    const { t, lang } = useI18n();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [newPulse, setNewPulse] = useState('Profit'); 
    
    useEffect(() => {
        if (!rfmSegments || rfmSegments.length === 0) return;
        const generatedTasks: Task[] = [];
        
        const sleepingWhales = rfmSegments.find((s:any) => s.name.includes('沉睡大戶'));
        if (sleepingWhales && sleepingWhales.count > 0) {
            generatedTasks.push({ 
                id: 1, pulse: 'Retention', 
                content: lang === 'en' ? `[Urgent] Call ${sleepingWhales.count} Sleeping Whales to send VIP return gifts.` : `【緊急挽回】致電關心 ${sleepingWhales.count} 位沉睡大戶，發送高單價尊榮回歸禮。`, 
                source: 'System', status: 'pool' 
            });
        }
        
        const stars = rfmSegments.find((s:any) => s.name.includes('潛力新星'));
        if (stars && stars.count > 0) {
            generatedTasks.push({ 
                id: 2, pulse: 'VIP', 
                content: lang === 'en' ? `[Retention] Send vouchers to ${stars.count} Rising Stars.` : `【回購誘發】發送體驗券給 ${stars.count} 位潛力新星。`, 
                source: 'System', status: 'approved' 
            });
        }
        
        setTasks(generatedTasks);
    }, [clientName, rfmSegments, lang]);
    
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
                <h2 className="text-2xl font-bold text-slate-800">💊 {clientName} - {t('顧問藥方')}</h2>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-2">
                <select value={newPulse} onChange={(e) => setNewPulse(e.target.value)} className="border rounded px-2 text-sm bg-slate-50">
                    {Object.keys(PULSE_CONFIG).map(k => <option key={k} value={k}>{t(PULSE_CONFIG[k].label)}</option>)}
                </select>
                <input type="text" value={newTaskContent} onChange={(e) => setNewTaskContent(e.target.value)} placeholder={t("輸入新的改善對策...")} className="flex-1 border rounded px-3 text-sm"/>
                <button onClick={addTask} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 font-bold flex items-center gap-1">
                    <Plus size={16}/> {t('新增')}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[500px]">
                    <h3 className="font-bold text-slate-600 mb-4 flex items-center gap-2"><Bot size={18}/> {t('建議池 (System & Pool)')}</h3>
                    <div className="space-y-2">
                        {poolTasks.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded shadow-sm border border-slate-200 group">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>
                                        {t(PULSE_CONFIG[t.pulse]?.label)}
                                    </span>
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
                    <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2"><CheckCircle size={18}/> {t('已核准 (Approved)')}</h3>
                    <div className="space-y-2">
                        {approvedTasks.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded shadow-sm border border-purple-200 group">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>
                                        {t(PULSE_CONFIG[t.pulse]?.label)}
                                    </span>
                                    <button onClick={() => moveTask(t.id, 'active')} className="text-blue-500 opacity-0 group-hover:opacity-100 hover:bg-blue-50 p-1 rounded"><ArrowRight size={16}/></button>
                                </div>
                                <p className="text-sm text-slate-700">{t.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 min-h-[500px]">
                    <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2"><Flame size={18}/> {t('執行中 (Active)')}</h3>
                    <div className="space-y-2">
                        {activeTasks.map(t => (
                            <div key={t.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500">
                                <div className="flex justify-between mb-1">
                                    <span className={`text-[10px] px-1.5 rounded ${PULSE_CONFIG[t.pulse]?.bg} ${PULSE_CONFIG[t.pulse]?.text}`}>
                                        {t(PULSE_CONFIG[t.pulse]?.label)}
                                    </span>
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
    const { t } = useI18n();
    const [uploading, setUploading] = useState(false); 
    const [clientName, setClientName] = useState(""); 
    const [uploadType, setUploadType] = useState('tx'); 
    const [encoding, setEncoding] = useState('UTF-8'); 
    const [msg, setMsg] = useState(""); 
    const [errorDetails, setErrorDetails] = useState(""); 
    
    const handleFile = (e: any) => { 
        setErrorDetails(""); 
        if (!clientName.trim()) { 
            alert(t("請先輸入客戶名稱！")); 
            e.target.value = ''; 
            return; 
        }
        const file = e.target.files[0]; 
        if (!file) return; 
        
        setUploading(true); 
        setMsg(`Parsing with ${encoding}...`); 
        
        Papa.parse(file, { 
            header: true, 
            skipEmptyLines: true, 
            encoding: encoding, 
            transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(), 
            complete: async (results) => { 
                let cleanRows: any[] = [];
                
                if (uploadType === 'tx') {
                    cleanRows = results.data.map((row: any) => {
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
                            client_name: clientName,
                            user_id: null 
                        };
                    }).filter((r:any) => !isNaN(r.amount) && r.customer_id); 
                } else if (uploadType === 'ga') {
                    cleanRows = results.data.map((row: any) => {
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
                            marketing_spend: 0
                        };
                    }).filter((r:any) => r.year_month !== '');
                }

                if (cleanRows.length === 0) {
                    const sampleHeader = Object.keys(results.data[0] || {}).join(', ');
                    const isGarbled = sampleHeader.includes('');
                    const debugInfo = `Error! \n\nHeaders: \n${sampleHeader}\n\nFirst Row:\n${JSON.stringify(results.data[0], null, 2)}`;
                    
                    setErrorDetails(debugInfo);
                    setUploading(false);
                    setMsg("");
                    e.target.value = '';
                    return;
                }
                
                setMsg(`Uploading ${cleanRows.length} rows...`);
                const BATCH_SIZE = 1000; 
                try {
                    const targetTable = uploadType === 'tx' ? 'transactions' : 'ga_analytics';
                    for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) { 
                        const { error } = await supabase.from(targetTable).insert(cleanRows.slice(i, i + BATCH_SIZE)); 
                        if(error) throw error;
                    } 
                    setMsg("🎉 Upload Success!");
                    setUploading(false); 
                    e.target.value = '';
                    onSuccess(clientName);
                } catch (error: any) { 
                    console.error(error); 
                    setErrorDetails(`DB Error:\n${error.message}`);
                    setUploading(false); 
                    setMsg("");
                    e.target.value = '';
                }
            } 
        }); 
    }; 

    return (
        <div className="space-y-6">
            <input 
                type="text" 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                placeholder={t("請輸入客戶名稱 (例如：CUPETIT)")} 
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            
            <div className="flex gap-4">
                <button 
                    onClick={() => {setUploadType('tx'); setErrorDetails("");}} 
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'tx' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    {t('1. 交易訂單資料 (CSV)')}
                </button>
                <button 
                    onClick={() => {setUploadType('ga'); setErrorDetails("");}} 
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${uploadType === 'ga' ? 'bg-green-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                    {t('2. GA 流量資料 (CSV)')}
                </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-600">{t('📂 檔案編碼 (若出現亂碼請切換)')}</span>
                <select 
                    value={encoding} 
                    onChange={(e) => setEncoding(e.target.value)} 
                    className="border border-slate-300 rounded px-3 py-1 text-sm bg-white outline-none" 
                    disabled={uploading}
                >
                    <option value="UTF-8">{t('UTF-8 (系統預設)')}</option>
                    <option value="Big5">{t('Big5 (台灣 Excel 常見)')}</option>
                </select>
            </div>

            <div className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all rounded-2xl relative ${uploadType === 'tx' ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-50' : 'border-green-300 bg-green-50/50 hover:bg-green-50'}`}>
                <input type="file" accept=".csv" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                <div className="flex flex-col items-center gap-3">
                    {uploading ? <Loader2 className="animate-spin w-10 h-10 text-slate-400"/> : <FileUp size={48} className={uploadType === 'tx' ? 'text-blue-500' : 'text-green-500'}/>}
                    <span className="font-bold text-slate-700 text-lg">
                        {uploading ? msg : t('點擊上傳')}
                    </span>
                </div>
            </div>

            {errorDetails && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-left animate-in fade-in">
                    <div className="flex items-center gap-2 text-red-700 font-bold mb-3">
                        <AlertTriangle size={18} /> {t('哎呀，上傳失敗了！(可複製給工程師)')}
                    </div>
                    <textarea 
                        readOnly 
                        className="w-full h-48 p-3 text-sm text-red-600 bg-white border border-red-200 rounded-lg outline-none font-mono" 
                        value={errorDetails} 
                    />
                </div>
            )}
        </div>
    ); 
}

function TabButton({ id, label, icon, active, onClick, isNew }: any) { 
    return (
        <button 
            onClick={onClick} 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
        >
            {icon} {label} {isNew && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>}
        </button>
    ); 
}

function EmptyState({ message = "目前無資料" }: any) { 
    const { t } = useI18n();
    return (
        <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 min-h-[200px] bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <Info className="mb-2"/>
            <p>{t(message)}</p>
        </div>
    ); 
}

function LoadingSkeleton() { 
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-slate-200 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-64 bg-slate-200 rounded-xl"></div>
                <div className="h-64 bg-slate-200 rounded-xl"></div>
            </div>
        </div>
    ); 
}

function SpecItem({ title, logic, desc }: any) { 
    return (
        <li className="border-b border-slate-100 pb-2">
            <div className="flex justify-between font-bold text-slate-800 mb-1">
                <span>{title}</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{logic}</span>
            </div>
            <p className="text-xs text-slate-500">{desc}</p>
        </li>
    ); 
}