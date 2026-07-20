'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronUp, ChevronDown, ArrowRight, CircleDollarSign, Users, 
  MousePointerClick, Gem, Repeat, MessageSquare, Award, Sparkles, 
  Building2, ArrowUpRight, CheckCircle2, ShieldCheck, 
  Layers, Code2, Database, Activity, AlertTriangle, ExternalLink,
  Calendar, FileText, Percent, MapPin
} from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 前台 Searchable Select 的 mock 狀態
  const [selectedIndustry, setSelectedIndustry] = useState('B2B製造業');
  const [selectedService, setSelectedService] = useState('PatronOS六脈診斷');
  const [industryDropdownOpen, setIndustryIndustryDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  // 後台專案管理預算核算之動態模擬狀態
  const [contractRevenue, setContractRevenue] = useState(1000000);
  const [outsourcingSpend, setOutsourcingSpend] = useState(150000);
  const [loggedHours, setLoggedHours] = useState(80);
  const consultantRate = 1500;

  // 動態計算專案利潤與 PM 獎金 (軌道 B 工作流實時公式)
  const consultantCost = loggedHours * consultantRate;
  const projectNetProfit = contractRevenue - outsourcingSpend - consultantCost;
  const actualMarginRate = contractRevenue > 0 ? (projectNetProfit / contractRevenue) * 100 : 0;
  const pmBonusAmount = actualMarginRate >= 50 ? Math.round(projectNetProfit * 0.05) : Math.round(projectNetProfit * 0.02);

  const slides: Slide[] = [
    { id: 0, badge: "GURU CONCEPT", title: "智策慧品牌顧問", subtitle: "建構隨商務演進動態調整的品牌與營運系統" },
    { id: 1, badge: "NEWS & CANONS", title: "最新消息與精選鴻思論", subtitle: "品牌宗師 Holmes 的最新動態與學術教條" },
    { id: 2, badge: "METHODOLOGY", title: "品牌六脈診斷模組", subtitle: "打破黑箱！以數據流向動態解構企業健康度" },
    { id: 3, badge: "AI ECOSYSTEM", title: "brandbase 智商戰平台", subtitle: "專為中小企業研發的「智創平台」與 AI 代理工具" },
    { id: 4, badge: "SWEM SERVICES", title: "智策核心行業方案", subtitle: "B2B要素品牌、全通路體驗與地方集體品牌治理" },
    { id: 5, badge: "CASE STUDIES", title: "客戶實績與活動記錄", subtitle: "依「產業別」與「服務類型」交叉篩選的動態實績庫" },
    { id: 6, badge: "VENUE & TRAINING", title: "空間預約與顧問培訓", subtitle: "共享場域租用行事曆與 certified 專業導入師計畫" },
    { id: 7, badge: "DEV SPECIFICATION", title: "系統開發與企劃規格專區", subtitle: "（本頁為智策慧內部開發規格書，包含 5W 深度系統解讀與 DDL）" }
  ];

  // 滾動偵測：使用 IntersectionObserver 自動更新當前 Slide 狀態
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observerOptions = {
      root: container,
      threshold: 0.5,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = Number(entry.target.getAttribute('data-slide-id'));
          setCurrentSlide(id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const targets = container.querySelectorAll('[data-slide-id]');
    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
    };
  }, []);

  const scrollToSlide = (idx: number) => {
    if (idx < 0 || idx >= slides.length) return;
    const targetElement = document.getElementById(`slide-${idx}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCurrentSlide(idx);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      
      {/* 頂部導覽列 (活力橘點綴) */}
      <header className="fixed top-0 left-0 w-full z-40 px-8 h-20 flex justify-between items-center bg-gradient-to-b from-slate-950/90 to-transparent backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/20">S</div>
          <span className="text-lg font-bold tracking-wider text-white">智策慧 SWEM</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="hover:text-white transition">關於我們</Link>
          <button onClick={() => scrollToSlide(2)} className="hover:text-white transition text-orange-400 font-bold flex items-center gap-1">
            六脈診斷 PatronOS <ArrowUpRight size={14} />
          </button>
          <button onClick={() => scrollToSlide(5)} className="hover:text-white transition">客戶實績</button>
          <button onClick={() => scrollToSlide(1)} className="hover:text-white transition">最新消息</button>
          <button onClick={() => scrollToSlide(7)} className="text-xs bg-slate-900 text-orange-400 px-3 py-1.5 rounded border border-orange-500/35 hover:bg-slate-800 transition font-mono">
            DEV後台企劃書
          </button>
          <Link href="/contact" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition shadow-md shadow-orange-500/10">預約諮詢</Link>
        </nav>
      </header>

      {/* 左側：簡報頁碼指示器 */}
      <div className="fixed left-8 bottom-12 z-40 hidden md:flex items-baseline gap-2 font-mono text-slate-500 print:hidden">
        <span className="text-3xl font-black text-orange-500">{(currentSlide + 1).toString().padStart(2, '0')}</span>
        <span className="text-lg">/</span>
        <span className="text-sm">{(slides.length).toString().padStart(2, '0')}</span>
      </div>

      {/* 右側：簡報懸浮導航點 (橘色啟動) */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4 print:hidden">
        {slides.map((slide) => (
          <button
            key={slide.id}
            onClick={() => scrollToSlide(slide.id)}
            className="group flex items-center justify-end gap-3 focus:outline-none"
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-mono font-bold tracking-widest text-orange-400 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
              {slide.badge}
            </span>
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${currentSlide === slide.id ? 'bg-orange-500 border-orange-500 scale-125 shadow-lg shadow-orange-500/40' : 'bg-transparent border-slate-600 group-hover:border-slate-400'}`} />
          </button>
        ))}
      </div>

      {/* 右下角：上下簡報跳頁鍵 */}
      <div className="fixed right-8 bottom-8 z-40 flex flex-col gap-2 bg-slate-950/85 p-2 rounded-xl border border-slate-800 shadow-2xl backdrop-blur print:hidden">
        <button
          onClick={() => scrollToSlide(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronUp size={24} />
        </button>
        <div className="h-px bg-slate-800 w-full" />
        <button
          onClick={() => scrollToSlide(currentSlide + 1)}
          disabled={currentSlide === slides.length - 1}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* 簡報滾動主容器 */}
      <div 
        ref={containerRef}
        className="w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Slide 1: Brand Proposition (IP 化造神起點) */}
        <section 
          id="slide-0"
          data-slide-id="0"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
        >
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 space-y-6 text-left">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[0].badge}
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                Guru of Systematic <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">
                  Tech Branding
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed">
                陳茂鴻 Holmes ── 系統化品牌作業系統宗師。
                <br />
                創立「鴻思論 (Holmes Theory)」，將混亂的經營流程，轉化為「隨業務演進而動態調整」的品牌數位管理系統。
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSlide(1)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 group"
                >
                  探索鴻思論 ──➔
                </button>
                <button 
                  onClick={() => scrollToSlide(7)}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-lg border border-slate-850 transition text-center"
                >
                  審查後台 DDL 與架構
                </button>
              </div>
            </div>
            <div className="md:col-span-5 flex justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125" style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG280gftVARUTY-Ce59UySp23jJDuuItjqKFN7iIASgHuuZtncfiqpk2c&s=10')" }} />
                <div className="absolute bottom-6 left-6 z-20 text-left">
                  <div className="text-xs font-mono text-orange-400">FOUNDER & CHAIRMAN</div>
                  <div className="text-xl font-bold text-white">陳茂鴻 Holmes</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2: Latest News & Holmes Theory Articles (上架動態分流模擬) */}
        <section 
          id="slide-1"
          data-slide-id="1"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-5xl w-full space-y-8 text-left">
            <div className="space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[1].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">最新消息與精選鴻思論</h2>
              <p className="text-slate-400 text-sm md:text-base">
                本單元由後台前端管理系統（CMS）自動分流。上架新聞即時同步至左側，學術教條同步至右側。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 最新消息 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4">
                <h3 className="text-lg font-bold text-orange-400 border-b border-slate-900 pb-2 flex justify-between items-center">
                  <span>📢 最新消息 (最新公告)</span>
                  <span className="text-xs text-slate-500 font-mono">NEWS & ANNOUNCEMENTS</span>
                </h3>
                <ul className="space-y-4 text-xs">
                  <li className="space-y-1">
                    <div className="flex gap-2 items-center"><span className="bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded text-[10px]">公告</span><span className="text-slate-500 font-mono">2026-07-20</span></div>
                    <p className="text-slate-300 font-medium">SWEM 董事長 Holmes 受邀二代學堂主講「主顧客品牌作業系統六脈18掌」</p>
                  </li>
                  <li className="space-y-1">
                    <div className="flex gap-2 items-center"><span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">新聞</span><span className="text-slate-500 font-mono">2026-07-15</span></div>
                    <p className="text-slate-300 font-medium">品牌六脈診斷執行顧問系統 PatronOS™ 於 sinext 平台完成正式部署</p>
                  </li>
                </ul>
              </div>

              {/* 鴻思論精選 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4">
                <h3 className="text-lg font-bold text-orange-400 border-b border-slate-900 pb-2 flex justify-between items-center">
                  <span>📖 鴻思論專區 (Holmes Theory)</span>
                  <span className="text-xs text-slate-500 font-mono">THE GURU CANONS</span>
                </h3>
                <ul className="space-y-4 text-xs">
                  <li className="space-y-1">
                    <div className="text-orange-400 font-mono font-bold">CANON 01 | 品牌傳播的典範轉移</div>
                    <p className="text-slate-400">大眾媒體逐漸式微，自媒體興起，消費者購買行為改變，推動全通路新顧客體驗路徑。</p>
                  </li>
                  <li className="space-y-1">
                    <div className="text-orange-400 font-mono font-bold">CANON 02 | 品牌價值與品牌權益</div>
                    <p className="text-slate-400">探討以顧客為基礎的品牌權益（CBBE）與 AATB 品牌權益模型，品牌溢價是成功的量化指標。</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Methodology (Six Pulses) */}
        <section 
          id="slide-2"
          data-slide-id="2"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-6xl w-full space-y-8">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[2].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[2].title}</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                打通數據孤島！整合「品牌脈、流量脈、轉換脈、金主脈、老主脈、擁主脈」六大營運脈絡。
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <PulseOverviewCard title="品牌脈" desc="淨額營收增長" icon={<CircleDollarSign className="text-orange-400" />} color="orange" />
              <PulseOverviewCard title="流量脈" desc="獲客漏斗規模" icon={<Users className="text-orange-400" />} color="orange" />
              <PulseOverviewCard title="轉換脈" desc="留單與意向率" icon={<MousePointerClick className="text-orange-400" />} color="orange" />
              <PulseOverviewCard title="金主脈" desc="客單價與回購客" icon={<Gem className="text-orange-400" />} color="orange" />
              <PulseOverviewCard title="老主脈" desc="終身價值與留存" icon={<Repeat className="text-orange-400" />} color="orange" />
              <PulseOverviewCard title="擁主脈" desc="NPS 口碑擴散" icon={<MessageSquare className="text-orange-400" />} color="orange" />
            </div>

            <div className="text-center pt-4">
              <Link 
                href="/services/patronOS"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold text-sm bg-orange-950/20 px-5 py-3 rounded-lg border border-orange-900/40 hover:border-orange-800 transition"
              >
                前往 PatronOS 品牌六脈診斷執行顧問專區 <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Slide 4: SMEbig BrandBase (智商戰) */}
        <section 
          id="slide-3"
          data-slide-id="3"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="max-w-5xl w-full space-y-12">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[3].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[3].title}</h2>
              <p className="text-slate-400 text-sm md:text-base">
                專為中小企業與經銷夥伴研發的「智創平台」，AI 代理工具、資源、教材一應俱全。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-left">
              <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-3">
                <div className="text-orange-400 font-mono font-bold">01 | AI 品牌顧問</div>
                <p className="text-slate-400 leading-relaxed">24 小時無間斷 AI 品牌與行銷對策解答服務，隨時提供線上諮詢。</p>
              </div>
              <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-3">
                <div className="text-orange-400 font-mono font-bold">02 | AI 品牌資源庫</div>
                <p className="text-slate-400 leading-relaxed">包含 12 套實戰教具、12 套影音教材，與全套品牌成功手冊。</p>
              </div>
              <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-3">
                <div className="text-orange-400 font-mono font-bold">03 | 獨家 AI 代理工具</div>
                <p className="text-slate-400 leading-relaxed">一句話自動定位、社群貼文生成、QSearch 渠道聲量追蹤整合。</p>
              </div>
              <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/20 space-y-3">
                <div className="text-orange-400 font-mono font-bold">04 | 國際品牌交流</div>
                <p className="text-slate-400 leading-relaxed">定期舉辦線上與線下國際品牌主沙龍活動，拓展跨國人脈網路。</p>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 5: SWEM Services (智策服務五大範疇) */}
        <section 
          id="slide-4"
          data-slide-id="4"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-5xl w-full space-y-12">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[4].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[4].title}</h2>
              <p className="text-slate-400 text-sm md:text-base">
                系統化品牌輔導，覆蓋 B2B、消費零售與政府新創生态。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <SolutionCard 
                title="B2B 製造業要素品牌顧問" 
                desc="協助代工廠（OEM/ODM）轉型自有品牌（OBM），主打要素品牌（Ingredient Branding）策略，擺脫價格戰與抽單風險。"
                actionLabel="查看服務項目"
                link="/services/b2b"
              />
              <SolutionCard 
                title="服務業與零售全通路顧問" 
                desc="打通線上線下（O2O）會員、庫存、物流系統。建立如媽媽餵（Mamaway）、王品集團般的長效顧客旅程與 CRM 黏著體系。"
                actionLabel="查看服務項目"
                link="/services/retail"
              />
              <SolutionCard 
                title="地方集體品牌與國家創新生態" 
                desc="協助地方特色產業建立集體標章（如台東好物）與國家新創聚落經營（如林口新創園），擴展國際經銷通路。"
                actionLabel="查看服務項目"
                link="/services/place"
              />
            </div>
          </div>
        </section>

        {/* Slide 6: Service Cases (實績案例篩選模擬 - 整合 Searchable Select) */}
        <section 
          id="slide-5"
          data-slide-id="5"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="max-w-5xl w-full space-y-8 text-left">
            <div className="space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[5].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[5].title}</h2>
              <p className="text-slate-400 text-sm">
                點擊下方可搜尋下拉選單（Searchable Select / Combobox）模擬真實篩選交互：
              </p>
            </div>

            {/* 篩選控制器 */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-900 bg-slate-900/20">
              <div className="flex-1 relative">
                <label className="block text-[11px] font-mono text-slate-500 mb-1">🔍 產業別搜尋篩選</label>
                <button 
                  onClick={() => { setIndustryIndustryDropdownOpen(!industryDropdownOpen); setServiceDropdownOpen(false); }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded text-xs flex justify-between items-center"
                >
                  <span>{selectedIndustry}</span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>
                {industryDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-slate-800 rounded shadow-2xl z-30 font-mono text-xs">
                    {['B2B製造業', '母嬰與連鎖零售', '地方與國家專案'].map((ind) => (
                      <div 
                        key={ind} 
                        onClick={() => { setSelectedIndustry(ind); setIndustryIndustryDropdownOpen(false); }}
                        className="px-3 py-2 hover:bg-orange-500 hover:text-white cursor-pointer"
                      >
                        {ind}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <label className="block text-[11px] font-mono text-slate-500 mb-1">🔍 服務項目搜尋篩選</label>
                <button 
                  onClick={() => { setServiceDropdownOpen(!serviceDropdownOpen); setIndustryIndustryDropdownOpen(false); }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded text-xs flex justify-between items-center"
                >
                  <span>{selectedService}</span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>
                {serviceDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-slate-800 rounded shadow-2xl z-30 font-mono text-xs">
                    {['PatronOS六脈診斷', 'brandbase品牌建置', '永續與社會責任'].map((srv) => (
                      <div 
                        key={srv} 
                        onClick={() => { setSelectedService(srv); setServiceDropdownOpen(false); }}
                        className="px-3 py-2 hover:bg-orange-500 hover:text-white cursor-pointer"
                      >
                        {srv}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 動態渲染卡片模擬 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedIndustry === 'B2B製造業' && (
                <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2">
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono">B2B 製造 ──➔ 控制閥領導品牌</span>
                  <h3 className="text-lg font-bold text-white">JDV 進典工業控制閥</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">克服歐美日品牌迷思，以「高品質、高畫質、安全信賴」為核心建立要素品牌定位，運用公關報導、官網優化與國際展會整合行銷，帶動業績成長與國際接軌。</p>
                </div>
              )}
              {selectedIndustry === '母嬰與連鎖零售' && (
                <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2">
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono">母嬰零售 ──➔ 全通路整合與CRM</span>
                  <h3 className="text-lg font-bold text-white">Mamaway 媽媽餵</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">重新定義品牌識別，優化官網並深度建立 Line / FB 社群導師。透過免費芬蘭箱兌換線上線下整合活動，將兌換率推升至 67%，實現顧客终身價值的增長。</p>
                </div>
              )}
              {selectedIndustry === '地方與國家專案' && (
                <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/40 space-y-2">
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono">政府專案 ──➔ 地區標章與新創生態</span>
                  <h3 className="text-lg font-bold text-white">台東好物 / GEC+Taipei 國家新創基地</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">整合 87 家業者、287 件在地伴手禮，推動「台東好物」集體品牌認證。GEC+ 則成功促成林口新創園接軌全球最大加速器 MassChallenge 亞太健康科技群聚。</p>
                </div>
              )}
              <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-transparent flex flex-col justify-center items-center text-center">
                <p className="text-xs text-slate-500">（選擇不同的篩選器項目，卡片將即時動態更換呈現）</p>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 7: Venue Rental & Consultant Training (場域出租行事曆與 certified 專業導入師計畫) */}
        <section 
          id="slide-6"
          data-slide-id="6"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 text-left">
            {/* 左側：空間出租 */}
            <div className="md:col-span-6 space-y-4">
              <span className="px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-mono font-bold tracking-wider">
                VENUE RENTAL SYSTEM
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">場域出租預約日曆模擬</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                客戶在前台日曆點選時段後，後台審核核發。預約確認後，前台日曆該時段即呈現橘色鎖定。
              </p>

              {/* 日曆 CSS Grid 模擬 */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-300">2026 / 07 (JULY)</span>
                  <span className="text-[10px] text-slate-500">選取時段送出申請</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] border-b border-slate-800 pb-2 mb-2 text-slate-500">
                  <div>SU</div><div>MO</div><div>TU</div><div>WE</div><div>TH</div><div>FR</div><div>SA</div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-slate-300">
                  <div className="py-1 text-slate-600">01</div><div className="py-1 text-slate-600">02</div><div className="py-1">03</div><div className="py-1">04</div><div className="py-1">05</div><div className="py-1">06</div><div className="py-1">07</div>
                  <div className="py-1">08</div><div className="py-1">09</div><div className="py-1">10</div><div className="py-1">11</div><div className="py-1">12</div><div className="py-1">13</div><div className="py-1">14</div>
                  <div className="py-1">15</div><div className="py-1">16</div><div className="py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded font-bold" title="已被預約: 二代學堂">17</div><div className="py-1">18</div><div className="py-1">19</div><div className="py-1">20</div><div className="py-1">21</div>
                  <div className="py-1">22</div><div className="py-1">23</div><div className="py-1">24</div><div className="py-1">25</div><div className="py-1">26</div><div className="py-1">27</div><div className="py-1">28</div>
                </div>
              </div>
            </div>

            {/* 右側：專業導入師培訓 */}
            <div className="md:col-span-6 space-y-4 flex flex-col justify-center">
              <span className="px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-mono font-bold tracking-wider w-fit">
                CERTIFICATE PROGRAM
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">專業系統導入師 (Specialist) 培訓計畫</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                經銷商開發出案源後，由 SWEM 官方培訓認證的「導入師」進行 brandbase 系統及 PatronOS 的實地部署。
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                <div className="flex gap-2.5 items-start">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">導入師認證資格：</strong>
                    <span className="text-slate-400 block text-[11px] mt-0.5">必須擁有 2 年以上實際品牌操作經驗；或具備行銷、傳播相關科系碩士學位。</span>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <CheckCircle2 size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">系統協同與分潤：</strong>
                    <span className="text-slate-400 block text-[11px] mt-0.5">現場完全使用 brandbase 智創系統，並與總部的品牌行銷顧問協同作業，按部署里程碑分潤。</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 8: 系統開發與企劃規格專區 (整合 5W 深度說明 & DDL 規劃) */}
        <section 
          id="slide-7"
          data-slide-id="7"
          className="w-full h-screen snap-start relative px-6 md:px-16 py-24 bg-slate-950 overflow-y-auto"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="max-w-6xl mx-auto space-y-10 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-mono font-bold tracking-wider">
                  {slides[7].badge}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mt-2">智策慧新官網建構及數位運營系統規劃書</h2>
                <p className="text-xs text-slate-500 mt-1">本頁面為智策慧開發期規劃大綱，包含 5W 系統診斷解析、雙軌管理模組與資料庫 DDL 遷移升級指令。</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-xs font-mono">STATUS: DRAFT</span>
                <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded text-xs font-mono">VER: 1.1.5</span>
              </div>
            </div>

            {/* 標桿參考區 */}
            <div className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-orange-400 flex items-center gap-1.5">
                  <ExternalLink size={16} /> 視覺設計與排版標桿標記 (Labsology Benchmark)
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  本系統前端視覺之排版、微動態延遲、無襯線高字體密度排版，完全對標知名數位智識設計團隊：
                  <a href="https://labsology.com/" target="_blank" rel="noopener noreferrer" className="text-orange-400 font-bold underline hover:text-orange-300 ml-1 inline-flex items-center gap-1">
                    labsology.com <ExternalLink size={12} />
                  </a>
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
                極致暗黑 (#0B0E12) | 細微格實線 (#1F242E)
              </span>
            </div>

            {/* 2. PatronOS 脈絡化深度系統解讀 */}
            <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-6">
              <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                <FileText size={18} /> A. PatronOS™ 品牌作業系統之 5W 脈絡化解析
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                <div className="space-y-3 bg-slate-950 p-5 rounded border border-slate-900">
                  <h4 className="text-sm font-bold text-white border-l-2 border-orange-500 pl-2">1. 什麼是 PatronOS™ (What)</h4>
                  <p className="text-slate-400">
                    PatronOS™ 是智策慧將 **20年品牌顧問實戰驗證** 提煉出的「主顧客品牌作業系統 (6脈18掌)」。它不只是一個行銷工具 (MarTech)，而是一套從底層串接 **「品牌主張 ──➔ 觸點觸及 ──➔ 顧客獲客 ──➔ 轉換 ──➔ 回購 ──➔ 推薦與聲譽」** 的長期系統。
                  </p>
                </div>

                <div className="space-y-3 bg-slate-950 p-5 rounded border border-slate-900">
                  <h4 className="text-sm font-bold text-white border-l-2 border-orange-500 pl-2">2. 為什麼要用 PatronOS™ (Why)</h4>
                  <p className="text-slate-400">
                    多數中小企業面臨以下痛點：做很多 Campaign 卻無法累積資產、資料散落流程斷裂、團隊靠人工拼接。PatronOS™ 將行銷成果從「租來的流量」轉為「留下來的品牌資產」，實現數據主權 (Digital Sovereignty) 回到企業手上。
                  </p>
                </div>

                <div className="space-y-3 bg-slate-950 p-5 rounded border border-slate-900">
                  <h4 className="text-sm font-bold text-white border-l-2 border-orange-500 pl-2">3. 如何使用 PatronOS™ (How)</h4>
                  <p className="text-slate-400">
                    依循 Kotler 經典行銷組合 (G-STIG-STIC) 模型，利用「六脈十八掌」將品牌定義、導入需求、推進成交、放大客值、養成熟客、推薦擁護這 6 個維度分別對應 3 個執行對策。透過系統後台，將每一步行銷沉澱為可複利的資產。
                  </p>
                </div>

                <div className="space-y-3 bg-slate-950 p-5 rounded border border-slate-900">
                  <h4 className="text-sm font-bold text-white border-l-2 border-orange-500 pl-2">4. 何時用與哪裡用 (When & Where)</h4>
                  <p className="text-slate-400">
                    <strong className="text-orange-400">何時用：</strong> 品牌重劃期 (統一主張觸點)、成長瓶頸期 (解決成交痛點) 與數位轉型期。
                    <br />
                    <strong className="text-orange-400">哪裡用：</strong> 前台預約 (/contact) 可供客戶進行「品牌健康度線上自測」；內部則是在後台數據儀表板，將 transactions 交易與 GA 資料實時生成對應的分析指標。
                  </p>
                </div>
              </div>
            </div>

            {/* 3. 雙軌運營系統核心工作流說明 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs text-left">
              
              {/* 軌道 A: brandbase 經銷商與認證培訓系統 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-4">
                <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                  <Code2 size={18} /> B. 軌道 A ── brandbase 經銷商與認證培訓系統
                </h3>
                <p className="text-xs text-slate-400">
                  將渠道夥伴開發（經銷商）與現場系統落地（導入師）結合，確立專業門檻與利潤分成。
                </p>
                <div className="space-y-3 text-slate-400">
                  <div className="bg-slate-950 p-3 rounded border border-slate-900">
                    <span className="font-bold text-white">1. 經銷拓展與認證：</span> 經銷商負責開發中小企業，智策慧官方對導入師進行嚴格培訓（門檻：2年實際操作經驗或碩士學位）。
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900">
                    <span className="font-bold text-white">2. brandbase 實地部署：</span> 導入師現場協同品牌行銷顧問，100% 部署 brandbase 智創系統於客戶場域。
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900">
                    <span className="font-bold text-white">3. 自動渠道分潤：</span> 當經銷客戶續約或加購工具，後台依據比例自動向經銷商、導入師進行利潤發放結算。
                  </div>
                </div>
              </div>

              {/* 軌道 B: 智策品牌顧問大專案管理系統 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-4">
                <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                  <Layers size={18} /> C. 軌道 B ── 智策品牌顧問大專案管理系統 (PM OS)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  這是一個完全獨立的工作管理系統，用於大型客製化品牌顧問專案的進度與利潤管控。
                </p>
                <div className="space-y-3 text-slate-400 font-mono text-[11px]">
                  <div className="bg-slate-950 p-3 rounded border border-slate-900 space-y-1">
                    <div className="text-white font-bold">1. 預算及時程控制 (Project Milestone)</div>
                    <div>指派首席架構師並分配預估工時。建立時程里程碑，顧問必須於系統中上傳專案成果物，方可推進下一階段。</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900 space-y-1">
                    <div className="text-white font-bold">2. Timesheet 時耗與利潤計算 (Gross Margin)</div>
                    <div>顧問按週提交 Timesheet 實際工時，折算顧問標準成本。系統動態以公式計算出專案實際毛利率。</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900 space-y-1">
                    <div className="text-white font-bold">3. PM 績效獎金自動結算 (PM Bonus)</div>
                    <div>若實際毛利率大於等於 50%，PM 獎金係數加成至 5%，直接撥發分成，以此倒逼時耗控制。</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. 底層資料庫 DDL 規劃 (防禦性與升級腳本) */}
            <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-4">
              <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                <Database size={18} /> D. 底層資料庫 DDL 防禦性升級遷移指令 (Migration SQL)
              </h3>
              <p className="text-xs text-slate-400">專案管理、經銷商、導入師培訓、文章發布之核心 Postgres DDL 結構（採用 ALTER 防禦防止 relation exists 錯誤）：</p>
              <div className="bg-slate-950 p-4 rounded border border-slate-900 font-mono text-[11px] text-slate-400 max-h-[250px] overflow-y-auto">
                <pre>{`-- [1. 升級 consultants 資料表，注入導入師/架構師專屬資質審查欄位]
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

-- [3. 為 consultants 資料表之外鍵進行關聯綁定]
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

-- [4. 升級 clients 資料表，注入經銷歸屬]
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referred_by_distributor UUID REFERENCES distributors(id) ON DELETE SET NULL;

-- [5. 防禦性建立大專案管理表 (軌道 B - 獨立 PM OS)]
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
);

-- [6. 防禦性建立里程碑與 Timesheet 資料表 (軌道 B)]
CREATE TABLE IF NOT EXISTS project_milestones (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    project_id UUID REFERENCES consulting_projects(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    delivered_file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_timesheets (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    project_id UUID REFERENCES consulting_projects(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
    logged_hours NUMERIC NOT NULL,
    work_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`}</pre>
              </div>
            </div>

            <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/20 text-xs flex gap-3 items-center text-slate-400">
              <AlertTriangle className="text-orange-500 shrink-0 animate-pulse" size={18} />
              <span>本區塊為智策慧開發期規劃與 DDL 控制規格，點擊右下角 <strong className="text-white">上箭頭 </strong> 即可返回前台簡報 presentation 模式，或使用鼠標滾輪正常瀏覽。</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// --- Sub-Components ---

function PulseOverviewCard({ title, desc, icon, color }: { title: string, desc: string, icon: any, color: 'orange' }) {
  return (
    <div className={`p-5 rounded-xl border border-slate-900 bg-slate-900/30 flex flex-col justify-between h-40 transition-all duration-300 hover:border-orange-500/35 hover:shadow-2xl hover:shadow-orange-500/5`}>
      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function SolutionCard({ title, desc, actionLabel, link }: { title: string, desc: string, actionLabel: string, link: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 hover:border-orange-500/30 transition duration-300 flex flex-col justify-between h-[300px]">
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
      </div>
      <div className="pt-4">
        <span 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition uppercase tracking-widest cursor-pointer"
        >
          {actionLabel} <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}

function TeamTrustItem({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 space-y-4">
      <div className="w-14 h-14 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-850 shadow-md">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-200">{title}</h3>
      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
    </div>
  );
}