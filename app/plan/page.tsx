'use client';

import React, { useState } from 'react';
import { 
  Briefcase, Users, Award, ShieldAlert, CheckCircle2, Calendar, Database,
  TrendingUp, Code2, ExternalLink, ChevronRight, Play, Coins, Building2, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PlanPage() {
  const [activeTab, setActiveTab] = useState<'vision' | 'trackA' | 'trackB' | 'frontend' | 'ddl'>('vision');

  // --- 軌道 A：導入師審查模擬器狀態 ---
  const [expYears, setExpYears] = useState<number>(1);
  const [hasMaster, setHasMaster] = useState<boolean>(false);
  const isCertified = expYears >= 2 || hasMaster;

  // --- 軌道 B：PM 專案利潤與獎金動態計算器狀態 ---
  const [revenue, setRevenue] = useState<number>(1000000); // 合約金額
  const [outsource, setOutsource] = useState<number>(150000); // 外包採購費
  const [timesheetHours, setTimesheetHours] = useState<number>(80); // 投入工時
  const hourRate = 1500; // 顧問標準時薪

  const consultantCost = timesheetHours * hourRate;
  const netProfit = revenue - outsource - consultantCost;
  const marginRate = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;
  
  // PM 獎金分成係數：毛利率 >= 50% 為 5%，40%~49% 為 3%，低於 40% 則無獎金
  const bonusRate = marginRate >= 50 ? 0.05 : marginRate >= 40 ? 0.03 : 0;
  const pmBonus = Math.max(0, Math.round(netProfit * bonusRate));

  // --- 共享場域預約狀態模擬 ---
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
              智策慧官網重構與雙軌系統運營規格書
            </h1>
            <p className="text-xs text-slate-500">本頁面為架構師與專案管理團隊會議專用之互動規格書，用以確認前後端數據與分潤指標。</p>
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
          <TabButton active={activeTab === 'trackA'} label="2. 軌道 A：經銷商與認證培訓" onClick={() => setActiveTab('trackA')} />
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
                  官網將捨棄傳統「公司名片式」陳述，全面塑造創辦人陳茂鴻 (Holmes) 作為「系統化品牌作業系統宗師」之 IP 形象。
                  「鴻思論 (Holmes Theory)」將作為前台學術智庫，將過往之「典範轉移、主權歸位、價值運算」等理論集結，奠定智策慧在亞太區品牌數位轉型的領袖地位。
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: 軌道 A：經銷商與認證培訓系統 */}
          {activeTab === 'trackA' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 導入師資格審查模擬器 */}
                <div className="lg:col-span-1 p-6 rounded-xl border border-slate-900 bg-slate-900/20 space-y-6">
                  <div>
                    <h3 className="font-bold text-base text-orange-400 flex items-center gap-2">
                      <Award size={18} /> 導入師資質模擬器
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">模擬智策慧對經銷夥伴推薦之導入師進行的門檻審查系統。</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-2">
                      <label className="text-slate-400 font-bold block">1. 實際品牌操作經驗 (年)： {expYears} 年</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={expYears} 
                        onChange={(e) => setExpYears(Number(e.target.value))}
                        className="w-full accent-orange-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-950 rounded border border-slate-900">
                      <input 
                        type="checkbox" 
                        id="master" 
                        checked={hasMaster} 
                        onChange={(e) => setHasMaster(e.target.checked)}
                        className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                      />
                      <label htmlFor="master" className="text-slate-400 cursor-pointer select-none">
                        2. 具備行銷/大眾傳播相關碩士學位
                      </label>
                    </div>

                    {/* 資格判定指示燈 */}
                    <div className={`p-4 rounded-lg border flex items-center gap-3 transition-all ${isCertified ? 'bg-orange-500/5 border-orange-500/20 text-orange-400' : 'bg-slate-950 border-slate-900 text-slate-500'}`}>
                      <CheckCircle2 size={24} className={isCertified ? 'text-orange-500' : 'text-slate-600'} />
                      <div>
                        <div className="font-bold">{isCertified ? ' Swem Certified 合格 ' : ' ⚠️ 資質審查未達門檻 '}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          {isCertified ? '符合「2年操作經驗」或「碩士學位」標準，核發導入師證照，允許部署 brandbase 並抽取 B% 服務執行費。' : '未達標準。導入師必須通過考核才能協助經銷商實地部署系統與專案運營。'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 後台經銷分潤與時間明細 */}
                <div className="lg:col-span-2 p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h3 className="font-bold text-base text-white">/admin/distributors (經銷渠道與分潤看板)</h3>
                    <span className="text-[10px] font-mono text-slate-500">SHARED LEDGER</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono text-slate-400">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500">
                          <th className="py-2">夥伴名稱</th>
                          <th className="py-2">關係角色</th>
                          <th className="py-2">認證狀態</th>
                          <th className="py-2 text-right">經銷儲值金</th>
                          <th className="py-2 text-right">預設分潤比例</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        <tr>
                          <td className="py-3 text-white">台北經銷商 A</td>
                          <td>渠道夥伴</td>
                          <td className="text-orange-400 font-bold">SWEM Certified</td>
                          <td className="text-right">$150,000</td>
                          <td className="text-right">15.00%</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-white">導入師王小明</td>
                          <td>個人導入師</td>
                          <td className={isCertified ? 'text-orange-400 font-bold' : 'text-slate-600'}>
                            {isCertified ? 'SWEM Certified' : 'Pending'}
                          </td>
                          <td className="text-right">-</td>
                          <td className="text-right">8.00% (執行費)</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-white">台中經銷商 B</td>
                          <td>經銷兼導入</td>
                          <td className="text-orange-400 font-bold">SWEM Certified</td>
                          <td className="text-right">$80,000</td>
                          <td className="text-right">18.00% (雙軌)</td>
                        </tr>
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
                      <label className="text-slate-400 font-bold block">1. 專案合約總額： ${revenue.toLocaleString()}</label>
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
                    <h3 className="font-bold text-base text-white">/admin/projects (大專案控制系統 ── 財務與獎金結算面版)</h3>
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
                      大專案控制規則說明
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      大專案管理系統獨立於經銷管理，專為客製化大型顧問案設計。系統設定「目標毛利率 50%」：
                      實際毛利率高於 50% 時，PM 與顧問團隊享受 5% 的淨利分成；低於 50% 且高於 40% 時為 3%；
                      低於 40% 則扣除獎金，藉此倒逼專案經理在 Timesheet 與里程碑時程上進行精準控制。
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
                    <li>• <span className="font-mono text-slate-300">/</span> —— 簡報式首頁 (整合最新公告與鴻思論)</li>
                    <li>• <span className="font-mono text-slate-300">/about</span> —— 關於我們 (團隊背景與資質認證架構師)</li>
                    <li>• <span className="font-mono text-slate-300">/services/brandbase</span> —— brandbase™ 中小企業品牌建置計畫</li>
                    <li>• <span className="font-mono text-slate-300">/services/patronOS</span> —— 六脈診斷 PatronOS 客戶查看專區 (憑密碼)</li>
                    <li>• <span className="font-mono text-slate-300">/cases</span> —— 客戶實績 (整合可搜尋下拉選單篩選)</li>
                    <li>• <span className="font-mono text-slate-300">/insights</span> —— 鴻思論文章智庫 (文章上架分流至首頁)</li>
                    <li>• <span className="font-mono text-slate-300">/consultant</span> —— 顧問與架構師登錄檔</li>
                    <li>• <span className="font-mono text-slate-300">/contact</span> —— 線上預約自測 (整合 5 題 brandbase 自測問卷)</li>
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
                <pre>{`-- [1. 升級 consultants 資料表，防禦性注入導入師/架構師專屬審查欄位]
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'specialist';
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS brand_exp_years INT DEFAULT 0;
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS has_marketing_master BOOLEAN DEFAULT FALSE;
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS is_swem_certified BOOLEAN DEFAULT FALSE;
ALTER TABLE consultants ADD COLUMN IF NOT EXISTS belongs_to_distributor UUID;

-- [2. 防禦性建立經銷商資料表 (軌道 A)]
CREATE TABLE IF NOT EXISTS distributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT UNIQUE NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT UNIQUE NOT NULL,
    commission_rate NUMERIC DEFAULT 15.00,
    deposit_amount NUMERIC DEFAULT 0,
    contract_start_date DATE,
    contract_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [3. 為 consultants 資料表之外鍵進行安全關聯綁定]
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_belongs_to_distributor'
    ) THEN
        ALTER TABLE consultants 
        ADD CONSTRAINT fk_belongs_to_distributor 
        FOREIGN KEY (belongs_to_distributor) REFERENCES distributors(id) ON DELETE SET NULL;
    END IF;
END $$;

-- [4. 升級 clients 資料表，防禦性注入經銷商歸屬]
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referred_by_distributor UUID REFERENCES distributors(id) ON DELETE SET NULL;

-- [5. 防禦性建立獨立大專案管理表 (軌道 B)]
CREATE TABLE IF NOT EXISTS consulting_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    project_manager_id UUID REFERENCES consultants(id) ON DELETE SET NULL, -- 指派 PM
    lead_consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL, -- 首席架構師
    status TEXT DEFAULT 'scoping',
    
    -- 財務與預算控制數據
    contract_revenue NUMERIC NOT NULL DEFAULT 0,
    outsourcing_budget NUMERIC DEFAULT 0,
    actual_outsourcing_spend NUMERIC DEFAULT 0,
    consultant_hour_rate NUMERIC DEFAULT 1500,
    target_margin_rate NUMERIC DEFAULT 50.00,
    
    -- 利潤與 PM 獎金自動核算
    project_net_profit NUMERIC DEFAULT 0,
    actual_margin_rate NUMERIC DEFAULT 0,
    pm_bonus_amount NUMERIC DEFAULT 0,
    
    start_date DATE,
    end_date DATE,
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