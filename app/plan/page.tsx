'use client';

import React, { useState } from 'react';
import { 
  Briefcase, Users, Award, ShieldAlert, CheckCircle2, Calendar, Database,
  TrendingUp, Code2, ExternalLink, ChevronRight, Coins, Building2, HelpCircle,
  UserPlus, FolderKanban, Plus, Trash2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

// --- 資料型態定義 ---
interface Distributor {
  id: string;
  name: string;
  contact: string;
  deposit: number;
  commissionRate: number;
}

interface DistLead {
  id: string;
  distributorId: string;
  clientName: string;
  stage: '開發中' | '談約中' | '已結案';
  amount: number;
}

interface Guide {
  id: string;
  name: string;
  expYears: number;
  hasMaster: boolean;
  status: 'Swem Certified' | 'Pending';
}

interface CounselingRecord {
  id: string;
  guideId: string;
  clientName: string;
  targetArchitect: string; // 對口的建構師
  stage: '導入中' | '已交付';
  fee: number; // 輔導金額
}

export default function PlanPage() {
  const [activeTab, setActiveTab] = useState<'vision' | 'trackA' | 'trackB' | 'frontend' | 'ddl'>('trackA');

  // --- [1. 經銷商管理狀態與模擬數據] ---
  const [distributors, setDistributors] = useState<Distributor[]>([
    { id: 'dist-1', name: '台北經銷商 A', contact: '張經理', deposit: 150000, commissionRate: 15 },
    { id: 'dist-2', name: '台中經銷商 B', contact: '李協理', deposit: 80000, commissionRate: 12 }
  ]);
  const [newDistName, setNewDistName] = useState('');
  const [newDistContact, setNewDistContact] = useState('');

  const handleAddDistributor = () => {
    if (!newDistName.trim()) return;
    const newDist: Distributor = {
      id: `dist-${Date.now()}`,
      name: newDistName,
      contact: newDistContact || '未填寫',
      deposit: 50000,
      commissionRate: 15
    };
    setDistributors([...distributors, newDist]);
    setNewDistName('');
    setNewDistContact('');
  };

  // --- [2. 經銷商潛在客戶開發與金額狀態] ---
  const [leads, setLeads] = useState<DistLead[]>(
    [
      { id: 'lead-1', distributorId: 'dist-1', clientName: '奇美食品烘焙屋', stage: '開發中', amount: 100000 },
      { id: 'lead-2', distributorId: 'dist-1', clientName: '進典控制閥廠', stage: '談約中', amount: 350000 },
      { id: 'lead-3', distributorId: 'dist-2', clientName: '媽媽餵台中旗艦店', stage: '已結案', amount: 200000 }
    ]
  );
  const [newLeadName, setNewLeadName] = useState('');
  const [selectedDistId, setSelectedDistId] = useState('dist-1');
  const [newLeadAmount, setNewLeadAmount] = useState<number>(100000);

  const handleAddLead = () => {
    if (!newLeadName.trim()) return;
    const newLead: DistLead = {
      id: `lead-${Date.now()}`,
      distributorId: selectedDistId,
      clientName: newLeadName,
      stage: '開發中',
      amount: newLeadAmount
    };
    setLeads([...leads, newLead]);
    setNewLeadName('');
  };

  const updateLeadStage = (id: string, stage: '開發中' | '談約中' | '已結案') => {
    setLeads(leads.map(l => l.id === id ? { ...l, stage } : l));
  };

  // --- [3. 引導師管理狀態與認證數據] ---
  const [guides, setGuides] = useState<Guide[]>([
    { id: 'guide-1', name: '王小明', expYears: 3, hasMaster: true, status: 'Swem Certified' },
    { id: 'guide-2', name: '陳大同', expYears: 1, hasMaster: false, status: 'Pending' }
  ]);
  const [newGuideName, setNewGuideName] = useState('');
  const [newGuideExp, setNewGuideExp] = useState<number>(2);
  const [newGuideMaster, setNewGuideMaster] = useState<boolean>(false);

  const handleAddGuide = () => {
    if (!newGuideName.trim()) return;
    const isSwemCertified = newGuideExp >= 2 || newGuideMaster;
    const newGuide: Guide = {
      id: `guide-${Date.now()}`,
      name: newGuideName,
      expYears: newGuideExp,
      hasMaster: newGuideMaster,
      status: isSwemCertified ? 'Swem Certified' : 'Pending'
    };
    setGuides([...guides, newGuide]);
    setNewGuideName('');
    setNewGuideExp(2);
    setNewGuideMaster(false);
  };

  // --- [4. 引導師輔導名單、對口建構師與輔導金額] ---
  const [counselings, setCounselings] = useState<CounselingRecord[]>([
    { id: 'c-1', guideId: 'guide-1', clientName: '進典控制閥', targetArchitect: '范總經理 (建構師)', stage: '導入中', fee: 80000 },
    { id: 'c-2', guideId: 'guide-1', clientName: '奇美家電', targetArchitect: '莊總監 (建構師)', stage: '已交付', fee: 150000 }
  ]);
  const [newCounClient, setNewCounClient] = useState('');
  const [newCounArchitect, setNewCounArchitect] = useState(''); // 對口的建構師
  const [selectedGuideId, setSelectedGuideId] = useState('guide-1');
  const [newCounFee, setNewCounFee] = useState<number>(50000);

  const handleAddCounseling = () => {
    if (!newCounClient.trim() || !newCounArchitect.trim()) return;
    const newRecord: CounselingRecord = {
      id: `c-${Date.now()}`,
      guideId: selectedGuideId,
      clientName: newCounClient,
      targetArchitect: `${newCounArchitect} (建構師)`,
      stage: '導入中',
      fee: newCounFee
    };
    setCounselings([...counselings, newRecord]);
    setNewCounClient('');
    setNewCounArchitect('');
  };

  const updateCounStage = (id: string, stage: '導入中' | '已交付') => {
    setCounselings(counselings.map(c => c.id === id ? { ...c, stage } : c));
  };

  // --- 軌道 B：PM 專案利潤與獎金動態計算器狀態 ---
  const [revenue, setRevenue] = useState<number>(1000000); // 合約金額
  const [outsource, setOutsource] = useState<number>(150000); // 外包採購費
  const [timesheetHours, setTimesheetHours] = useState<number>(80); // 投入工時
  const hourRate = 1500; // 顧問標準時薪

  const consultantCost = timesheetHours * hourRate;
  const netProfit = revenue - outsource - consultantCost;
  const marginRate = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;
  
  const bonusRate = marginRate >= 50 ? 0.05 : marginRate >= 40 ? 0.03 : 0;
  const pmBonus = Math.max(0, Math.round(netProfit * bonusRate));

  const [bookingApproved, setBookingApproved] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#0B0E12] text-slate-100 font-sans p-6 md:p-12 relative select-none">
      
      {/* 背景微網格線裝飾 (Labsology Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E222B_1px,transparent_1px),linear-gradient(to_bottom,#1E222B_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 頂部控制面板 */}
      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-orange-500 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-lg shadow-orange-500/25">
                INTERNAL CONTEXT SPEC
              </span>
              <span className="text-slate-500 text-xs font-mono">NEXT.js APP ROUTER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
              智策慧雙軌運營系統規劃規格書 (經銷與培訓體系調整)
            </h1>
            <p className="text-xs text-slate-500">本頁面為智策慧內部開發與對帳專用，包含經銷商、引導師、對口建構師三維度的資料結構設計。</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition">
              ← 返回前台首頁
            </Link>
            <a href="https://labsology.com/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-xs font-bold text-white shadow-lg shadow-orange-500/10 flex items-center gap-1.5 transition">
              視覺標桿 Labsology.com <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* 雙軌索引標籤切換 */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
          <TabButton active={activeTab === 'vision'} label="1. 系統定位與 5W 解讀" onClick={() => setActiveTab('vision')} />
          <TabButton active={activeTab === 'trackA'} label="2. 軌道 A：經銷商與認證培訓系統" onClick={() => setActiveTab('trackA')} />
          <TabButton active={activeTab === 'trackB'} label="3. 軌道 B：大專案管理系統 (PM OS)" onClick={() => setActiveTab('trackB')} />
          <TabButton active={activeTab === 'frontend'} label="4. 未來官網完整架構與 Cases 篩選" onClick={() => setActiveTab('frontend')} />
          <TabButton active={activeTab === 'ddl'} label="5. 安全 DDL 遷移腳本" onClick={() => setActiveTab('ddl')} />
        </div>

        {/* 內容區塊 */}
        <div className="grid grid-cols-1 gap-8 relative">
          
          {/* TAB 1: 系統定位與 5W 解讀 */}
          {activeTab === 'vision' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <VisionCard 
                  title="什麼是 PatronOS™ (What)" 
                  desc="智策慧 20 年品牌實戰結晶「主顧客品牌作業系統 (6脈18掌)」，將行銷工具整合為一套可持續增值的品牌 OS。" 
                />
                <VisionCard 
                  title="為什麼要用 (Why)" 
                  desc="解決中小企業「有流量無回購」、「資料散落、流程斷裂」之痛點，拿回數據主權，將租來的流量改造為留下來的品牌資產。" 
                />
                <VisionCard 
                  title="如何運作 (How)" 
                  desc="基於 Kotler 的 G-STIG-STIC 框架，從品牌定義、導入需求、推進成交等六個維度，在接觸點上完美實踐品牌價值。" 
                />
              </div>

              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4">
                <h3 className="font-bold text-base text-orange-400 flex items-center gap-2">
                  <Briefcase size={18} /> 創辦人 Holmes 定位：Guru of Systematic Tech Branding
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  官網將全面塑造創辦人陳茂鴻 (Holmes) 作為「系統化科技品牌大師」之 IP 形象。
                  「鴻思論 (Holmes Theory)」將作為前台學術智庫，將過往之「典範轉移、主權歸位、價值運算」等理論集結，奠定智策慧在亞太區品牌數位轉型的領袖地位。
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 軌道 A：經銷商與認證培訓系統 (全交互控制區) */}
          {activeTab === 'trackA' && (
            <div className="space-y-8 animate-in fade-in text-xs text-left">
              
              {/* 1. 經銷商管理面版 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 新增經銷商 */}
                <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-4">
                  <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2">
                    <UserPlus size={16} /> 新增經銷商成員
                  </h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="經銷商公司名稱 (如: 台北經銷商 C)" 
                      value={newDistName}
                      onChange={(e) => setNewDistName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="主要聯絡人姓名 (如: 陳總經理)" 
                      value={newDistContact}
                      onChange={(e) => setNewDistContact(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleAddDistributor}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transition"
                    >
                      新增經銷商 ──➔
                    </button>
                  </div>
                </div>

                {/* 經銷商名單列表 */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                  <h3 className="font-bold text-sm text-white">經銷商名單與儲值金 (Distributors Network)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[11px] text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="py-2">經銷商 ID</th>
                          <th className="py-2">公司名稱</th>
                          <th className="py-2">聯絡人</th>
                          <th className="py-2 text-right">經銷儲值金</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {distributors.map(d => (
                          <tr key={d.id}>
                            <td className="py-2.5 text-slate-500">{d.id}</td>
                            <td className="py-2.5 text-white font-bold">{d.name}</td>
                            <td className="py-2.5">{d.contact}</td>
                            <td className="py-2.5 text-right text-orange-400 font-bold">${d.deposit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 2. 經銷商潛在客戶名單與開發階段、經銷金額 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 新增潛在客戶 */}
                <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-4">
                  <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2">
                    <FolderKanban size={16} /> 登錄經銷潛在客戶
                  </h3>
                  <div className="space-y-3">
                    <select 
                      value={selectedDistId} 
                      onChange={(e) => setSelectedDistId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-slate-300 outline-none"
                    >
                      {distributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <input 
                      type="text" 
                      placeholder="潛在客戶/企業名稱" 
                      value={newLeadName}
                      onChange={(e) => setNewLeadName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="預估經銷金額" 
                      value={newLeadAmount}
                      onChange={(e) => setNewLeadAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleAddLead}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transition"
                    >
                      建立潛在客戶 ──➔
                    </button>
                  </div>
                </div>

                {/* 潛在客戶開發階段與經銷金額名單 */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                  <h3 className="font-bold text-sm text-white">經銷商開發看板與經銷金額</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[11px] text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="py-2">歸屬經銷商</th>
                          <th className="py-2">潛在客戶</th>
                          <th className="py-2">開發階段 (動態切換)</th>
                          <th className="py-2 text-right">經銷金額</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {leads.map(l => {
                          const dist = distributors.find(d => d.id === l.distributorId);
                          return (
                            <tr key={l.id}>
                              <td className="py-2.5 text-slate-300">{dist ? dist.name : '未知經銷商'}</td>
                              <td className="py-2.5 text-white font-bold">{l.clientName}</td>
                              <td className="py-2.5">
                                <div className="flex gap-1">
                                  {['開發中', '談約中', '已結案'].map((st: any) => (
                                    <button 
                                      key={st}
                                      onClick={() => updateLeadStage(l.id, st)}
                                      className={`px-2 py-0.5 rounded text-[9px] transition-all ${l.stage === st ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-slate-950 text-slate-600 border border-slate-900 hover:text-slate-400'}`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 text-right font-bold text-slate-200">${l.amount.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 3. 引導師管理 (新增與名單) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 新增引導師 */}
                <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-4">
                  <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2">
                    <UserPlus size={16} /> 登錄與培訓新引導師
                  </h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="引導師姓名" 
                      value={newGuideName}
                      onChange={(e) => setNewGuideName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 block">實際品牌操作經驗： {newGuideExp} 年</label>
                      <input 
                        type="range" min="0" max="10" value={newGuideExp} 
                        onChange={(e) => setNewGuideExp(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-900">
                      <input 
                        type="checkbox" id="guide_master" checked={newGuideMaster}
                        onChange={(e) => setNewGuideMaster(e.target.checked)}
                        className="accent-orange-500"
                      />
                      <label htmlFor="guide_master" className="text-slate-400 cursor-pointer">具備行銷相關碩士學位</label>
                    </div>
                    <button 
                      onClick={handleAddGuide}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transition"
                    >
                      新增並執行資格審查 ──➔
                    </button>
                  </div>
                </div>

                {/* 引導師認證狀態名單 */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                  <h3 className="font-bold text-sm text-white">SWEM 官方培訓認證引導師名單</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[11px] text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="py-2">引導師姓名</th>
                          <th className="py-2">品牌經驗年資</th>
                          <th className="py-2">碩士資質</th>
                          <th className="py-2 text-right">培訓審查狀態</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {guides.map(g => (
                          <tr key={g.id}>
                            <td className="py-2.5 text-white font-bold">{g.name}</td>
                            <td className="py-2.5">{g.expYears} 年實際經驗</td>
                            <td className="py-2.5">{g.hasMaster ? '🟢 具備碩士學位' : '✕ 無'}</td>
                            <td className="py-2.5 text-right font-bold">
                              <span className={g.status === 'Swem Certified' ? 'text-orange-400' : 'text-slate-600'}>
                                {g.status === 'Swem Certified' ? '● SWEM Certified 合格' : '● 審核中/資格不符'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 4. 引導師輔導名單與建構師對口、輔導金額 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 登錄輔導專案 */}
                <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-4">
                  <h3 className="font-bold text-sm text-orange-400 flex items-center gap-2">
                    <Plus size={16} /> 登錄引導師輔導專案
                  </h3>
                  <div className="space-y-3">
                    <select 
                      value={selectedGuideId} 
                      onChange={(e) => setSelectedGuideId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded text-slate-300 outline-none"
                    >
                      {guides.filter(g => g.status === 'Swem Certified').map(g => (
                        <option key={g.id} value={g.id}>{g.name} (認證引導師)</option>
                      ))}
                    </select>
                    <input 
                      type="text" 
                      placeholder="輔導客戶/企業" 
                      value={newCounClient}
                      onChange={(e) => setNewCounClient(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <input 
                      type="text" 
                      placeholder="對口建構師姓名 (如: 范總經理)" 
                      value={newCounArchitect}
                      onChange={(e) => setNewCounArchitect(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <input 
                      type="number" 
                      placeholder="輔導金額" 
                      value={newCounFee}
                      onChange={(e) => setNewCounFee(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded focus:border-orange-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleAddCounseling}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded transition"
                    >
                      建立輔導專案 ──➔
                    </button>
                  </div>
                </div>

                {/* 輔導名單與建構師對口列表 */}
                <div className="lg:col-span-2 p-5 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                  <h3 className="font-bold text-sm text-white">引導師輔導階段、對口建構師與輔導金額名單</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full font-mono text-[11px] text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="py-2">認證引導師</th>
                          <th className="py-2">輔導客戶</th>
                          <th className="py-2">對口建構師</th>
                          <th className="py-2">輔導階段 (動態切換)</th>
                          <th className="py-2 text-right">輔導金額</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {counselings.map(c => {
                          const guide = guides.find(g => g.id === c.guideId);
                          return (
                            <tr key={c.id}>
                              <td className="py-2.5 text-slate-300 font-bold">{guide ? guide.name : '未知引導師'}</td>
                              <td className="py-2.5 text-white">{c.clientName}</td>
                              <td className="py-2.5 text-orange-400 font-bold">{c.targetArchitect}</td>
                              <td className="py-2.5">
                                <div className="flex gap-1">
                                  {['導入中', '已交付'].map((st: any) => (
                                    <button 
                                      key={st}
                                      onClick={() => updateCounStage(c.id, st)}
                                      className={`px-2 py-0.5 rounded text-[9px] transition-all ${c.stage === st ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' : 'bg-slate-950 text-slate-600 border border-slate-900 hover:text-slate-400'}`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 text-right font-bold text-slate-200">${c.fee.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: 軌道 B：大專案管理系統 (PM OS) */}
          {activeTab === 'trackB' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* PM 專案利潤與獎金動態計算器 */}
                <div className="lg:col-span-1 p-6 rounded-xl border border-slate-900 bg-slate-900/20 space-y-6">
                  <div>
                    <h3 className="font-bold text-base text-orange-400 flex items-center gap-2">
                      <Coins size={18} /> PM 專案利潤與獎金核算器
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">調整參數以試算大型顧問專案實際利潤與專案經理績效獎金。</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">1. 大專案合約總金額： ${revenue.toLocaleString()}</label>
                      <input 
                        type="range" 
                        min="200000" 
                        max="3000000" 
                        step="50000"
                        value={revenue} 
                        onChange={(e) => setRevenue(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">2. 實際外包採購費： ${outsource.toLocaleString()}</label>
                      <input 
                        type="range" 
                        min="50000" 
                        max="1000000" 
                        step="10000"
                        value={outsource} 
                        onChange={(e) => setOutsource(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-400 font-bold block">3. 顧問投入總時耗： {timesheetHours} 小時</label>
                      <input 
                        type="range" 
                        min="10" 
                        max="300" 
                        step="5"
                        value={timesheetHours} 
                        onChange={(e) => setTimesheetHours(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                      <div className="text-[10px] text-slate-500">標準時薪成本： $1,500 / 小時 (系統折算：${consultantCost.toLocaleString()})</div>
                    </div>
                  </div>
                </div>

                {/* 軌道 B 運營實體看板 */}
                <div className="lg:col-span-2 p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-6 text-xs text-left">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-white">/admin/projects (大專案時程與預算/利潤/PM獎金控制系統)</h3>
                    <span className="text-[10px] font-mono text-orange-500">PM OS MODULE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-900 text-center">
                      <span className="text-slate-500 text-[10px] font-mono block">專案淨利潤 (Net Profit)</span>
                      <span className="text-2xl font-black text-white mt-1 block">${netProfit.toLocaleString()}</span>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-900 text-center">
                      <span className="text-slate-500 text-[10px] font-mono block">實際毛利率 (Margin Rate)</span>
                      <span className={`text-2xl font-black mt-1 block ${marginRate >= 50 ? 'text-orange-500' : 'text-slate-400'}`}>
                        {marginRate}%
                      </span>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-950 border border-slate-900 text-center">
                      <span className="text-slate-500 text-[10px] font-mono block">PM 績效獎金 (PM Bonus)</span>
                      <span className="text-2xl font-black text-white mt-1 block">${pmBonus.toLocaleString()}</span>
                      <span className="text-[9px] text-slate-500 block">分成係數: {(bonusRate * 100)}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-900 space-y-2">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-orange-500" />
                      大專案控制系統與 PM 獎金設計規則
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      本系統並非經銷體系管理項目，而是另外的工作管理，專門用來執行大型品牌顧問大專案。
                      核心目的在於精準控制資源（投入人天）、掌控時程里程碑、結算毛利，並依毛利率自動算出 PM 的績效獎金。
                      目標毛利率設為 50%：毛利率 $\ge$ 50% 撥付 5% 淨利作為獎金；40% ──➔ 49% 撥付 3%；低於 40% 則不撥付。
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: 前台八大頁面與 Labsology 標桿 */}
          {activeTab === 'frontend' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-3">
                  <h3 className="font-bold text-base text-orange-400">未來官網完整資料夾與頁面架構規劃</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li>• <span className="font-mono text-slate-300">/</span> ──➔ 簡報式首頁 (動態載入最新消息與鴻思論)</li>
                    <li>• <span className="font-mono text-slate-300">/about</span> ──➔ 關於我們 (團隊背景與認證建構師)</li>
                    <li>• <span className="font-mono text-slate-300">/services/brandbase</span> ──➔ brandbase™ 中小企業品牌建置計畫</li>
                    <li>• <span className="font-mono text-slate-300">/services/patronOS</span> ──➔ 六脈診斷 PatronOS 客戶查看專區 (憑密碼)</li>
                    <li>• <span className="font-mono text-slate-300">/cases</span> ──➔ 客戶實績 (整合可搜尋下拉選單篩選)</li>
                    <li>• <span className="font-mono text-slate-300">/insights</span> ──➔ 鴻思論文章智庫 (文章上架分流至首頁)</li>
                    <li>• <span className="font-mono text-slate-300">/consultant</span> ──➔ 顧問與建構師登錄檔</li>
                    <li>• <span className="font-mono text-slate-300">/contact</span> ──➔ 線上預約自測 (整合 5 題 brandbase 自測問卷)</li>
                  </ul>
                </div>

                <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4">
                  <h3 className="font-bold text-base text-orange-400 flex items-center gap-2">
                    <Calendar size={18} /> 共享場域出租與預約系統 (模擬審核)
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    前台可視化 Calendar 預約狀態。當客戶送出申請時，後台一鍵核發，前台該時段立即顯示已租用狀態。
                  </p>
                  
                  {/* 模擬按鈕 */}
                  <div className="p-4 bg-slate-950 rounded border border-slate-900 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 font-mono">2026-07-22 (14:00-17:00) 預約</div>
                      <div className="text-xs font-bold text-white">
                        狀態：{bookingApproved ? ' 🟢 已核發鎖定 (前台轉活力橘) ' : ' 🟡 待審核 (前台顯示預約中) '}
                      </div>
                    </div>
                    <button 
                      onClick={() => setBookingApproved(!bookingApproved)}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded text-xs transition"
                    >
                      {bookingApproved ? '重設為待審核' : '一鍵核准空間'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 安全 DDL 遷移腳本 */}
          {activeTab === 'ddl' && (
            <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 text-xs text-left space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-orange-400 flex items-center gap-2">
                  <Database size={18} /> 安全 SQL 升級遷移腳本 (Migration SQL)
                </h3>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-mono">
                  PREVENTS 42P07 ERROR
                </span>
              </div>
              <p className="text-slate-400">
                針對您遇到的 `relation consultants already exists` 錯誤，當資料表已存在時，必須改用 `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` 防禦性語法：
              </p>
              
              <div className="bg-slate-950 p-4 rounded border border-slate-900 font-mono text-[11px] text-slate-400 max-h-[350px] overflow-y-auto">
                <pre>{`-- [1. 升級 consultants 資料表，防禦性注入導入師/建構師專屬審查與職能欄位]
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'specialist'; -- specialist(導入師), architect(建構師), advisor(顧問)
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS brand_exp_years INT DEFAULT 0; -- 導入師年資
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS has_marketing_master BOOLEAN DEFAULT FALSE; -- 導入師碩士學位
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS is_swem_certified BOOLEAN DEFAULT FALSE; -- 培訓狀態
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS belongs_to_distributor UUID; -- 經銷商歸屬

-- [2. 防禦性建立經銷商資料表 (軌道 A)]
CREATE TABLE IF NOT EXISTS distributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT UNIQUE NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC DEFAULT 15.00,
    deposit_amount NUMERIC DEFAULT 0, -- 經銷儲值金
    contract_start_date DATE,
    contract_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [3. 防禦性建立經銷商潛在客戶名單表 (軌道 A)]
CREATE TABLE IF NOT EXISTS distributor_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    distributor_id UUID REFERENCES distributors(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    stage TEXT DEFAULT '開發中', -- 開發中, 談約中, 已結案
    amount NUMERIC DEFAULT 0, -- 經銷金額
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [4. 防禦性建立引導師輔導名單與對口建構師表 (軌道 A)]
CREATE TABLE IF NOT EXISTS guide_counseling (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID REFERENCES consultants(id) ON DELETE SET NULL, -- 認證引導師
    client_name TEXT NOT NULL,
    target_architect_name TEXT NOT NULL, -- 對口企業的「建構師」名稱
    stage TEXT DEFAULT '導入中', -- 導入中, 已交付
    fee NUMERIC DEFAULT 0, -- 輔導金額
    created_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// --- Sub-Components (Interactive proposal layout) ---

function TabButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-300 ${active ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25' : 'bg-slate-950 text-slate-400 border-slate-900 hover:text-white'}`}
    >
      {label}
    </button>
  );
}

function VisionCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/10 text-left space-y-2">
      <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
        <ChevronRight size={16} className="text-orange-500" />
        {title}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}