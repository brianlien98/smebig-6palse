'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  ChevronUp, ChevronDown, ArrowRight, CircleDollarSign, Users, 
  MousePointerClick, Gem, Repeat, MessageSquare, Award, Sparkles, 
  Building2, ArrowUpRight, CheckCircle2, ShieldCheck, Calendar,
  HelpCircle, BookOpen, Briefcase, MapPin, TrendingUp, Activity, Terminal
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

  // 模擬資料：最新消息
  const mockNews = [
    { id: 1, date: "2026-07-20", cat: "公告", title: "SWEM 創辦人 Holmes 受邀二代學堂主講「主顧客品牌作業系統六脈18掌」" },
    { id: 2, date: "2026-07-15", cat: "活動", title: "2026 brandbase 中小企業品牌數位轉型年會開放報名" },
    { id: 3, date: "2026-07-01", cat: "案例", title: "賀！輔導客戶進典工業 JDV 榮獲台灣精品品牌與控制閥龍頭地位" }
  ];

  // 模擬資料：精選鴻思論
  const mockInsights = [
    { id: '1', canon: "CANON 01", title: "品牌傳播的典範轉移", desc: "探討數位科技如何解構大眾類比媒體。企業必須產製優質內容，拿回搜尋引擎與官網的數位主權。" },
    { id: '2', canon: "CANON 02", title: "主權歸位：從租流量到私域資產", desc: "MarTech 盲目堆疊只會造成資料散落。建立企業私域數據中心 (CDP)，讓每一次互動都可以真正利潤複利。" }
  ];

  const slides: Slide[] = [
    { id: 0, badge: "BRAND GRANDMASTER GURU", title: "Guru of Systematic Tech Branding", subtitle: "陳茂鴻 Holmes ── 台灣行銷科技與品牌轉型的靈魂人物" },
    { id: 1, badge: "LATEST NEWS & INSIGHTS", title: "最新消息與精選鴻思論", subtitle: "即時掌握宗師觀點與最新品牌數位轉型動態" },
    { id: 2, badge: "METHODOLOGY", title: "品牌六脈診斷模組", subtitle: "打破黑箱！以數據流向動態解構企業健康度 (PatronOS™)" },
    { id: 3, badge: "SME PLATFORM", title: "brandbase 智商戰平台", subtitle: "中小企業品牌成長加速器：資源、工具、AI 代理一次備齊" },
    { id: 4, badge: "CONSULTING SERVICES", title: "智策服務行業項目", subtitle: "代工轉品牌、全通路整合、地方與國家品牌生態系建構" },
    { id: 5, badge: "SUCCESSFUL CASES", title: "服務案例與實績紀錄", subtitle: "深耕控制閥、母嬰、餐飲與地方特色產業，以數據實證品牌成長" },
    { id: 6, badge: "VENUE RENTAL", title: "共享場域預約系統", subtitle: "實體空間與活動場地線上行事曆即時預約與審核控制" },
    { id: 7, badge: "TRAINING CERTIFICATION", title: "品牌架構師與導入師培訓", subtitle: "經銷商與認證導入師專屬培訓，掌握品牌系統實地部署與分潤" }
  ];

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
      
      {/* 頂部全域導覽列 */}
      <header className="fixed top-0 left-0 w-full z-40 px-8 h-20 flex justify-between items-center bg-gradient-to-b from-slate-950/90 to-transparent backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/20">S</div>
          <span className="text-lg font-bold tracking-wider text-white">智策慧 SWEM</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button onClick={() => scrollToSlide(0)} className="hover:text-white transition">關於我們</button>
          <button onClick={() => scrollToSlide(2)} className="hover:text-white transition text-orange-400 font-bold flex items-center gap-1">
            品牌六脈 PatronOS <ArrowUpRight size={14} />
          </button>
          <button onClick={() => scrollToSlide(5)} className="hover:text-white transition">客戶實績</button>
          <button onClick={() => scrollToSlide(1)} className="hover:text-white transition">最新觀點</button>
          <Link href="/plan" className="text-xs bg-slate-900 text-orange-400 px-3 py-1.5 rounded border border-orange-500/35 hover:bg-slate-800 transition font-mono">
            DEV 會議規格書
          </Link>
          <Link href="/contact" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition shadow-md shadow-orange-500/10">預約諮詢</Link>
        </nav>
      </header>

      {/* 左側：簡報頁碼指示器 (01 / 08) */}
      <div className="fixed left-8 bottom-12 z-40 hidden md:flex items-baseline gap-2 font-mono text-slate-500 print:hidden">
        <span className="text-3xl font-black text-orange-500">{(currentSlide + 1).toString().padStart(2, '0')}</span>
        <span className="text-lg">/</span>
        <span className="text-sm">{(slides.length).toString().padStart(2, '0')}</span>
      </div>

      {/* 右側：簡報導航點 */}
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
        {/* Slide 1: 品牌宗師 IP 塑造 (Holmes Chen 實力全展現) */}
        <section 
          id="slide-0"
          data-slide-id="0"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
        >
          <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-10">
            {/* 左側：極具張力之宗師實力背景說明 */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-mono font-bold tracking-wider">
                  {slides[0].badge}
                </span>
                <span className="text-slate-500 text-xs font-mono">GURU CHIEF CONSULTANT</span>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  Guru of Systematic <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">
                    Tech Branding ── 陳茂鴻
                  </span>
                </h1>
                <p className="text-xs text-orange-400 font-bold tracking-widest font-mono">
                  工學 x 商學 x 傳播跨界大師 / 全台首份 MarTech 行銷科技版圖製作人 / 國家品牌計畫資深顧問
                </p>
              </div>

              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                陳茂鴻 (Holmes Chen) 執行長是台灣將「品牌策略」與「行銷科技 (MarTech)」完美系統化整合的先驅靈魂人物。他歷經資訊科技（逢甲資工）與品牌行銷（政大 MBA）跨界洗禮，現任智策慧品牌顧問公司執行長、AMT 亞太行銷數位轉型聯盟協會智識長。他將虛無飄渺的品牌公關，落地成用大數據、AI 系統化管理的「企業獲利作業系統」。
              </p>

              {/* 三大核心貢獻 (極高資訊密度網格) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-400">
                <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-lg space-y-1">
                  <div className="font-bold text-white flex items-center gap-1"><Activity size={12} className="text-orange-500" /> 1. 全台首創 PatronOS™</div>
                  <p className="text-[10px] leading-relaxed">以「六脈十八掌」融合 AI 決策大腦，讓品牌經營走向可控速增長。</p>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-lg space-y-1">
                  <div className="font-bold text-white flex items-center gap-1"><Terminal size={12} className="text-orange-500" /> 2. 發布行銷科技版圖</div>
                  <p className="text-[10px] leading-relaxed">主導發布台灣第一份 MarTech 地圖，成為企業進行數位轉型指引羅盤。</p>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-900 rounded-lg space-y-1">
                  <div className="font-bold text-white flex items-center gap-1"><ShieldCheck size={12} className="text-orange-500" /> 3. 奪回企業「數位主權」</div>
                  <p className="text-[10px] leading-relaxed">積極協助中小企業與企二代轉型，以數位工具建立可持續成長品牌資產。</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSlide(2)}
                  className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-xs tracking-wider transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 animate-pulse"
                >
                  與宗師 1-on-1 深度對談 ──➔
                </button>
                <button 
                  onClick={() => scrollToSlide(1)}
                  className="px-6 py-3.5 bg-slate-900 text-slate-300 font-bold rounded-lg text-xs border border-slate-850 hover:bg-slate-800 transition"
                >
                  閱讀鴻思論著作 (Holmes Theory)
                </button>
              </div>
            </div>

            {/* 右側：純 CSS/SVG 繪製之極具衝擊力「品牌大腦戰情數據矩陣 (PatronOS Matrix)」 */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-80 h-96 rounded-2xl border border-slate-800 bg-[#0c0f16] p-6 flex flex-col justify-between overflow-hidden group hover:border-orange-500/40 transition-all duration-500">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)]" />
                
                {/* 數據雷達掃描與脈衝同心圓 */}
                <div className="w-full h-44 flex items-center justify-center relative">
                  <div className="absolute w-36 h-34 rounded-full border border-dashed border-orange-500/20 animate-ping duration-1000" />
                  <div className="absolute w-28 h-28 rounded-full border border-orange-500/10 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-orange-500/25 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-orange-500 animate-pulse shadow-xl shadow-orange-500/50" />
                    </div>
                  </div>
                  {/* 動態雷達掃描線 */}
                  <div className="absolute w-40 h-[1px] bg-gradient-to-r from-transparent to-orange-500/40 rotate-45 transform origin-center animate-spin duration-[4000ms]" />
                </div>

                {/* 模擬常態分配圖與數據分析 */}
                <div className="z-10 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-b border-slate-900 pb-2">
                    <span>SYSTEM CORE STATUS</span>
                    <span className="text-orange-400 animate-pulse font-bold">● ACTIVE</span>
                  </div>
                  <div className="space-y-1.5 text-left font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">PATRON SCORE:</span>
                      <span className="text-white font-bold">98.4 (PR99)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">DECISION ENGINE:</span>
                      <span className="text-orange-400 font-bold">AGENTIC AI v1.5</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 text-left leading-relaxed">
                    精準整合企業內部交易(TX)與網站流量(GA)數據，解構六脈18個接觸點。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2: Latest News & Insights (最新消息與精選鴻思論) */}
        <section 
          id="slide-1"
          data-slide-id="1"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-5xl w-full space-y-10">
            <div className="text-left space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[1].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[1].title}</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                動態分流後台上架文章，第一時間向市場傳遞品牌宗師 Holmes 最新動態與經典學術。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 最新消息板塊 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4">
                <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Building2 size={18} className="text-orange-500" /> 最新消息 (News)
                </h3>
                <div className="space-y-4">
                  {mockNews.map(item => (
                    <div key={item.id} className="text-xs space-y-1 hover:bg-slate-900/30 p-2 rounded transition-all">
                      <div className="flex gap-2 text-[10px] font-mono text-slate-500">
                        <span>{item.date}</span>
                        <span className="text-orange-400">[{item.cat}]</span>
                      </div>
                      <p className="text-slate-300 font-medium line-clamp-1">{item.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 鴻思論板塊 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/10 space-y-4">
                <h3 className="font-bold text-lg text-white border-b border-slate-800 pb-2 flex items-center gap-2">
                  <BookOpen size={18} className="text-orange-500" /> 精選鴻思論 (Holmes Theory)
                </h3>
                <div className="space-y-4">
                  {mockInsights.map(item => (
                    <div key={item.id} className="text-xs space-y-1.5 hover:bg-slate-900/30 p-2 rounded transition-all">
                      <div className="text-[10px] font-mono text-orange-400 font-bold">{item.canon}</div>
                      <h4 className="font-bold text-slate-200">{item.title}</h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 3: Methodology (品牌六脈診斷 PatronOS™) */}
        <section 
          id="slide-2"
          data-slide-id="2"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="max-w-5xl w-full space-y-8">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[2].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[2].title}</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                貫穿服務核心！以「品牌、流量、轉換、金主、老主、擁主」六脈營運數據進行動態交叉解讀。
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <PulseCard title="品牌脈" icon={<CircleDollarSign size={20} />} desc="主張一致性與淨增長" />
              <PulseCard title="流量脈" icon={<Users size={20} />} desc="全通路導入需求規模" />
              <PulseCard title="轉換脈" icon={<MousePointerClick size={20} />} desc="留單率與推進成交" />
              <PulseCard title="金主脈" icon={<Gem size={20} />} desc="客單價與大金主分級" />
              <PulseCard title="老主脈" icon={<Repeat size={20} />} desc="會員權益與粉絲留存" />
              <PulseCard title="擁主脈" icon={<MessageSquare size={20} />} desc="聲譽飛輪與口碑推薦" />
            </div>

            <div className="text-center pt-4">
              <Link 
                href="/services/patronOS"
                className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-bold text-sm bg-orange-950/20 px-5 py-3 rounded-lg border border-orange-900/40 hover:border-orange-800 transition"
              >
                進入主顧客品牌六脈診斷執行顧問專區 ──➔
              </Link>
            </div>
          </div>
        </section>

        {/* Slide 4: brandbase Toolkit (智創平台) */}
        <section 
          id="slide-3"
          data-slide-id="3"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-5xl w-full space-y-10">
            <div className="text-left space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[3].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[3].title}</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                專為中小企業與經銷夥伴研發的「智創平台」，將品牌建構、AI 代理工具與社群交流一次備齊。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ToolCard 
                title="01 會員客服 (AI顧問)" 
                desc="24小時無間斷 AI 品牌解答服務，隨時解析中小企業在購前、購中、購後的營運痛點。" 
              />
              <ToolCard 
                title="02 會員智庫 (品牌資源)" 
                desc="提供 12 套實戰教具、12 套影音教材、品牌成功手冊，協助企業建立內部人才庫。" 
              />
              <ToolCard 
                title="03 會員福利購 (AI工具)" 
                desc="整合 QSearch 聲量、Okmega CRM、一句話定位等獨家 AI 代理小工具與社群交流。" 
              />
            </div>
          </div>
        </section>

        {/* Slide 5: SWEM Services (智策服務) */}
        <section 
          id="slide-4"
          data-slide-id="4"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="max-w-5xl w-full space-y-12">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[4].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[4].title}</h2>
              <p className="text-slate-400 text-sm md:text-base">
                智策慧提供的三大核心服務範疇，以硬核技術支撐，提升企業溢價。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ServiceCard 
                title="B2B 企業品牌轉型" 
                desc="專攻代工轉品牌、隱形冠軍（如閥門、零件、電子）的「要素品牌（Ingredient Branding）」差異化建構與行銷。" 
              />
              <ServiceCard 
                title="服務業全通路整合" 
                desc="打通線上與線下（O2O）的會員、商品、庫存。如貼身為媽媽餵、王品集團規劃的一千天顧客體驗旅程。" 
              />
              <ServiceCard 
                title="地方品牌與國家治理" 
                desc="協助政府與區域進行集體品牌打造、招商推廣與大型會展事件。包含台東好物、林口新創園區等知名專案實績。" 
              />
            </div>
          </div>
        </section>

        {/* Slide 6: Case Studies (服務案例) */}
        <section 
          id="slide-5"
          data-slide-id="5"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-5xl w-full space-y-8">
            <div className="text-left space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[5].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[5].title}</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                精選合作實績：利用可搜尋下拉選單（Searchable Select）依產業別與服務項目交叉過濾。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CaseCard 
                title="進典工業 JDV 控制閥" 
                industry="B2B 製造業" 
                desc="成功重塑金屬密封控制閥專業形象，打入歐美高階石化市場，建立台灣精品品牌地位。" 
              />
              <CaseCard 
                title="Mamaway 媽媽餵" 
                industry="連鎖零售服務業" 
                desc="建立產後哺乳媽媽社群，優化 O2O 全通路顧客旅程，社群引流與會員轉換率高增長。" 
              />
              <CaseCard 
                title="台東好物集體品牌" 
                industry="政府與地方特產" 
                desc="建立認證標章，群體合作打品牌。推動通路、社群與會展整合行銷，創造破億銷售績效。" 
              />
            </div>
          </div>
        </section>

        {/* Slide 7: Venue Rental (場域出租) */}
        <section 
          id="slide-6"
          data-slide-id="6"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 space-y-6 text-left">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[6].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[6].title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                智策慧提供極具科技智識氛圍的共享場域、活動空間出租。
                後台預訂行事曆完全串聯前台 Calendar 鎖定機制，提供高效率、全自動化的線上預約審核。
              </p>
              <div className="flex gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2"><MapPin size={16} className="text-orange-500" /> 台北市信義區核心商圈</div>
                <div className="flex items-center gap-2"><Calendar size={16} className="text-orange-500" /> 線上 24H 即時審退</div>
              </div>
            </div>

            {/* 可視化行事曆模擬 */}
            <div className="md:col-span-6 bg-slate-900/30 p-6 rounded-2xl border border-slate-900 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar size={18} className="text-orange-500" /> 空間預約時段看板 (2026/07)
              </h3>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-slate-400">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="font-bold text-slate-500 py-1">{d}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const isBooked = day === 22 || day === 23;
                  return (
                    <div 
                      key={day} 
                      className={`p-2 rounded transition-all ${isBooked ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400 font-bold' : 'hover:bg-slate-800/40 text-slate-300'}`}
                    >
                      {day.toString().padStart(2, '0')}
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>橘色標示：已被大專案會議租用</span>
                <span>[ 立即線上預訂 ──➔ ]</span>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 8: Training Certification (認證與培訓) */}
        <section 
          id="slide-7"
          data-slide-id="7"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-4xl text-center space-y-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
              {slides[7].badge}
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              品牌架構師與認證導入師 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">
                資格培訓認證
              </span>
            </h2>
            <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              培育經銷體系專屬「專業系統導入師（Specialist）」，於經銷商開發客戶後，主導 brandbase 系統實地部署與 PatronOS 落地。
            </p>
            
            {/* 資格限制卡片 */}
            <div className="p-6 bg-slate-900/20 border border-slate-900 rounded-2xl max-w-xl mx-auto text-left space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-orange-500" /> 認證資質門檻 (SWEM Specialist Requirements)
              </h3>
              <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
                <li className="flex items-baseline gap-2">• <span className="text-slate-200">品牌實務經歷：</span> 必須具備 2 年以上實際品牌操作經營經驗。</li>
                <li className="flex items-baseline gap-2">• <span className="text-slate-200">學術資質門檻：</span> 具備品牌行銷、大眾傳播相關之碩士學位（擇一符合）。</li>
                <li className="flex items-baseline gap-2">• <span className="text-slate-200">經銷分潤權益：</span> 經銷商成員若通過本資質考核，亦可直接兼任導入師。</li>
              </ul>
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link 
                href="/contact" 
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition flex items-center gap-2"
              >
                線上報名與資格審查 <Sparkles size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// --- Sub-Components (Labsology Minimalist Templates) ---

function PulseCard({ title, icon, desc }: { title: string, icon: any, desc: string }) {
  return (
    <div className="p-5 rounded-xl border border-slate-900 bg-slate-900/30 flex flex-col justify-between h-40 transition-all duration-300 hover:border-orange-500/35 hover:shadow-2xl hover:shadow-orange-500/5 text-left">
      <div className="w-10 h-10 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-850 text-orange-500">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-200">{title}</h4>
        <p className="text-[10px] text-slate-500 mt-1 leading-snug">{desc}</p>
      </div>
    </div>
  );
}

function ToolCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 hover:border-orange-500/20 transition duration-300 flex flex-col justify-between h-[220px] text-left">
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
      <div className="text-[10px] font-mono text-orange-400 tracking-wider">
        ACTIVE TOOLKIT ──➔
      </div>
    </div>
  );
}

function ServiceCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/10 hover:border-orange-500/20 transition duration-300 flex flex-col justify-between h-[250px] text-left">
      <div className="space-y-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
          <Briefcase size={16} />
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
      <div className="text-[10px] font-mono text-slate-500 hover:text-white transition">
        LEARN MORE ──➔
      </div>
    </div>
  );
}

function CaseCard({ title, industry, desc }: { title: string, industry: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 hover:border-orange-500/20 transition duration-300 flex flex-col justify-between h-[240px] text-left">
      <div className="space-y-2">
        <span className="text-[9px] font-mono bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded">
          {industry}
        </span>
        <h3 className="text-lg font-bold text-white pt-1">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
      <div className="text-[10px] font-mono text-orange-400 hover:text-white transition cursor-pointer">
        VIEW CASE ANALYSIS ──➔
      </div>
    </div>
  );
}