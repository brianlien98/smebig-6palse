'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronUp, ChevronDown, ArrowRight, CircleDollarSign, Users, 
  MousePointerClick, Gem, Repeat, MessageSquare, Award, Sparkles, 
  Building2, ArrowUpRight, CheckCircle2, ShieldCheck, 
  Layers, Code2, Database, Activity, AlertTriangle, ExternalLink, HelpCircle
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

  const slides: Slide[] = [
    { id: 0, badge: "BRAND EVOLUTION", title: "智策慧品牌顧問", subtitle: "建構隨商務演進動態調整的品牌與營運系統" },
    { id: 1, badge: "METHODOLOGY", title: "品牌六脈診斷模組", subtitle: "打破黑箱！以數據流向動態解構企業健康度" },
    { id: 2, badge: "SERVICE SOLUTIONS", title: "模組化整合解決方案", subtitle: "從 brandbase 品牌建置到 PitronOS 診斷執行顧問" },
    { id: 3, badge: "ELITE ARCHITECTS", title: "品牌架構師與專家顧問團隊", subtitle: "以嚴謹的企管架構，為中小企業精準配對專案解方" },
    { id: 4, badge: "DECISION PORTAL", title: "啟動您的品牌轉型", subtitle: "立即與智策慧攜手，將混亂的經營流程轉化為數位營運資產" },
    { id: 5, badge: "DEV SPECIFICATION", title: "系統開發與企劃溝通專區", subtitle: "（本頁為智策慧內部開發規格書，包含 5W 深度系統解讀與 DDL）" }
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
      
      {/* 頂部導覽列 (企業橘色調微縮版) */}
      <header className="fixed top-0 left-0 w-full z-40 px-8 h-20 flex justify-between items-center bg-gradient-to-b from-slate-950/90 to-transparent backdrop-blur-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-orange-500/20">S</div>
          <span className="text-lg font-bold tracking-wider text-white">智策慧 SWEM</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/about" className="hover:text-white transition">關於我們</Link>
          <button onClick={() => scrollToSlide(1)} className="hover:text-white transition text-orange-400 font-bold flex items-center gap-1">
            六脈診斷 PatronOS <ArrowUpRight size={14} />
          </button>
          <Link href="/cases" className="hover:text-white transition">客戶實績</Link>
          <Link href="/insights" className="hover:text-white transition">智庫觀點</Link>
          <button onClick={() => scrollToSlide(5)} className="text-xs bg-slate-900 text-orange-400 px-3 py-1.5 rounded border border-orange-500/35 hover:bg-slate-800 transition font-mono">
            DEV後台企劃書
          </button>
          <Link href="/contact" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg transition shadow-md shadow-orange-500/10">預約諮詢</Link>
        </nav>
      </header>

      {/* 左側：簡報頁碼指示器 (01 / 06) */}
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
        {/* Slide 1: Brand Proposition */}
        <section 
          id="slide-0"
          data-slide-id="0"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
        >
          <div className="max-w-4xl text-center space-y-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
              {slides[0].badge}
            </span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white leading-tight">
              智策建構戰略 <br className="md:hidden"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">
                慧能啟動轉型
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              智策慧不提供空泛的報告。我們專門服務 10~50 人中小企業，將混亂的經營現場，轉化為「隨業務演進而動態調整」的品牌數位管理系統。
            </p>
            <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button 
                onClick={() => scrollToSlide(1)}
                className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group"
              >
                解構品牌六脈 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-850 transition text-center"
              >
                免費預約診斷
              </Link>
            </div>
          </div>
        </section>

        {/* Slide 2: Methodology (Six Pulses) */}
        <section 
          id="slide-1"
          data-slide-id="1"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-6xl w-full space-y-8">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[1].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[1].title}</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                打破傳統行銷顧問的盲猜！以「品牌、流量、轉換、金主、老主、擁主」六脈營運數據動態整合，找出企業真實流失節點。
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

        {/* Slide 3: Service Solutions */}
        <section 
          id="slide-2"
          data-slide-id="2"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        >
          <div className="max-w-5xl w-full space-y-12">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[2].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[2].title}</h2>
              <p className="text-slate-400 text-sm md:text-base">
                提供模組化、高落地性的 B2B 顧問交付流程，不讓流程與規格成為經營者負擔。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SolutionCard 
                title="brandbase™ 品牌建置計畫" 
                desc="專為中小企業設計的精裝版品牌體系建置，確立品牌基因、CI視覺與核心論述，並快速部署高轉化的數位行銷陣地。"
                actionLabel="查看建置計畫"
                link="/services/brandbase"
              />
              <SolutionCard 
                title="PatronOS™ 六脈診斷系統" 
                desc="整合 GA4 與門市 POS/ERP 數據進行交叉解讀，提供動態 PR、Momentum 與目標達成指標，徹底排除行銷斷點。"
                actionLabel="進入六脈後台"
                link="/services/patronOS"
              />
              <SolutionCard 
                title="永續經營與 ESG 轉型" 
                desc="協助新創與中小企業將綠色理念灌注至品牌核心中，不僅契合國際供應鏈門檻，更提升綠色消費者黏著度。"
                actionLabel="暸解轉型方案"
                link="/services/esg"
              />
            </div>
          </div>
        </section>

        {/* Slide 4: Consultants & Architects */}
        <section 
          id="slide-3"
          data-slide-id="3"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-slate-950"
        >
          <div className="max-w-5xl w-full space-y-10">
            <div className="text-center space-y-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
                {slides[3].badge}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white">{slides[3].title}</h2>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
                智策慧的專家顧問群皆深耕業界 15 年以上。我們拒絕套模板，而是派遣專業品牌架構師實地蹲點，提供客製化專案配對機制。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TeamTrustItem 
                icon={<ShieldCheck className="text-orange-400" size={32} />} 
                title="專業架構師機制" 
                desc="每位配對專案的顧問皆通過 3 階段審核，具備商業財務與大數據洞察雙重背景，兼顧策略高度與底層執行力。"
              />
              <TeamTrustItem 
                icon={<Award className="text-orange-400" size={32} />} 
                title="50+ 知名品牌輔導實績" 
                desc="覆蓋跨零售食品、綠色科技、連鎖餐飲等各產業別。實績皆可透過動態數據進行驗證。"
              />
              <TeamTrustItem 
                icon={<CheckCircle2 className="text-orange-400" size={32} />} 
                title="100% 敏捷交付機制" 
                desc="後台專案管理模組完全透明。企業主可一鍵追蹤顧問配案與回報時限，排除一切資訊斷點。"
              />
            </div>

            <div className="text-center pt-4">
              <Link href="/consultant" className="text-slate-300 hover:text-white text-sm font-bold border-b border-slate-600 hover:border-white pb-1 transition">
                探索顧問團隊與專業架構師實績
              </Link>
            </div>
          </div>
        </section>

        {/* Slide 5: Lead Conversion CTA */}
        <section 
          id="slide-4"
          data-slide-id="4"
          className="w-full h-screen snap-start flex flex-col justify-center items-center relative px-6 md:px-24 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950"
        >
          <div className="max-w-3xl text-center space-y-6">
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest uppercase">
              {slides[4].badge}
            </span>
            <h2 className="text-3xl md:text-6xl font-extrabold text-white leading-tight">
              開始釐清您的 <br className="md:hidden"/> 企業營運體質
            </h2>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              填寫智策慧「5 題智能自測問卷」，系統將立刻連線數據大腦，透過 Resend 自動為您派發初步診斷建議書。
            </p>
            <div className="pt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 group text-center"
              >
                啟動線上品牌自測 <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
              </Link>
              <button 
                onClick={() => scrollToSlide(5)}
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-xl border border-slate-850 transition text-center animate-pulse"
              >
                進入官網建置大綱與 DDL 控制台
              </button>
            </div>
          </div>
        </section>

        {/* Slide 6: 系統開發與企劃溝通專區 (整合 5W 脈絡化深度說明 & DDL 規劃) */}
        <section 
          id="slide-5"
          data-slide-id="5"
          className="w-full h-screen snap-start relative px-6 md:px-16 py-24 bg-slate-950 overflow-y-auto"
          style={{ scrollSnapAlign: 'start' }}
        >
          <div className="max-w-6xl mx-auto space-y-10 text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
              <div>
                <span className="px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-mono font-bold tracking-wider">
                  {slides[5].badge}
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mt-2">智策慧新官網建構及數位運營系統規劃書</h2>
                <p className="text-xs text-slate-500 mt-1">本頁面為智策慧開發期會議專用，包含 5W 系統診斷解析、專案預算管理模型與系統底層 DDL 規劃。</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded text-xs font-mono">STATUS: DRAFT</span>
                <span className="bg-slate-900 text-slate-400 border border-slate-800 px-2 py-1 rounded text-xs font-mono">VER: 1.1.2</span>
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
                極致暗黑 (#0B0C10) | 細微格實線 (#1F242E)
              </span>
            </div>

            {/* 1. 未來官網完整架構規劃 */}
            <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-4">
              <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                <Building2 size={18} /> A. 未來官網完整資料夾與頁面架構
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded border border-slate-900 space-y-2">
                  <div className="font-bold text-white border-b border-slate-800 pb-1">/ (前台獲客入口)</div>
                  <ul className="space-y-1.5 text-slate-400">
                    <li>• <span className="text-slate-200 font-mono">/</span>: 首頁 (企業定位、三幕劇、精選實績)</li>
                    <li>• <span className="text-slate-200 font-mono">/about</span>: 關於我們 (理念、認證架構師簡介)</li>
                    <li>• <span className="text-slate-200 font-mono">/services</span>: 服務方案首頁</li>
                    <li>• <span className="text-slate-200 font-mono">/services/brandbase</span>: brandbase™ 建置專區</li>
                    <li>• <span className="text-slate-200 font-mono">/services/patronOS</span>: 品牌六脈診斷專區</li>
                  </ul>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-900 space-y-2">
                  <div className="font-bold text-white border-b border-slate-800 pb-1">/ (動態實績與觀點)</div>
                  <ul className="space-y-1.5 text-slate-400">
                    <li>• <span className="text-slate-200 font-mono">/cases</span>: 客戶實績 (Searchable Select 篩選)</li>
                    <li>• <span className="text-slate-200 font-mono">/insights</span>: 智庫觀點 (專家專欄、白皮書)</li>
                    <li>• <span className="text-slate-200 font-mono">/insights/[id]</span>: 觀點詳情 (SEO與Schema.org)</li>
                    <li>• <span className="text-slate-200 font-mono">/consultant</span>: 顧問與專業架構師登錄資料</li>
                    <li>• <span className="text-slate-200 font-mono">/contact</span>: 自測與諮詢預約表單</li>
                  </ul>
                </div>
                <div className="bg-slate-950 p-4 rounded border border-slate-900 space-y-2">
                  <div className="font-bold text-white border-b border-slate-800 pb-1">/admin (內部運營後台)</div>
                  <ul className="space-y-1.5 text-slate-400">
                    <li>• <span className="text-slate-200 font-mono">/admin/posts</span>: 觀點文章發布 (R2圖床)</li>
                    <li>• <span className="text-slate-200 font-mono">/admin/consultants</span>: 顧問與配案管理</li>
                    <li>• <span className="text-slate-200 font-mono">/admin/projects</span>: 預算核算專案追蹤系統</li>
                    <li>• <span className="text-slate-200 font-mono">/admin/clients</span>: 案源 CRM 資料庫</li>
                    <li>• <span className="text-slate-200 font-mono">/admin/pitronos</span>: 客戶六脈數據上傳(TX, GA)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. PatronOS 脈絡化深度系統解讀 */}
            <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-6">
              <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                <HelpCircle size={18} /> B. PatronOS™ 品牌作業系統之 5W 脈絡化解析
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

            {/* 3. 專案控制流與 Brandbase 經銷管理系統 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
              
              {/* 專案控制 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-4">
                <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                  <Layers size={18} /> C. 專案控制流 (預算 ──➔ Milestones ──➔ 核算)
                </h3>
                <div className="space-y-3 text-slate-400">
                  <div className="bg-slate-950 p-3 rounded border border-slate-900">
                    <span className="font-bold text-white">1. 預算編列：</span> 指派「品牌首席架構師」、分配顧問預估工時 (FTE)，確立外包專案可動用成本。
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900">
                    <span className="font-bold text-white">2. 里程碑檢核：</span> 交付物直接關聯「六脈十八掌」。如完成「01主張掌、02觸點掌」，自動將交付報告備份至 Cloudflare R2。
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900">
                    <span className="font-bold text-white">3. 毛利核算：</span> 結合顧問 Timesheet 底薪折算。當專案實際毛利率低於預警線，後台系統發出紅/黃色警戒。
                  </div>
                </div>
              </div>

              {/* Brandbase 經銷管理 SOP 系統化路徑 */}
              <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-4">
                <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                  <Code2 size={18} /> D. Brandbase 代理/經銷商「實作 SOP ──➔ 系統化」路徑
                </h3>
                <div className="space-y-3 text-slate-400 leading-relaxed">
                  <p>智策慧採用漸進式系統化開發邏輯，防止資源盲目投放：</p>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900 font-mono space-y-1">
                    <div className="text-orange-400 font-bold">Phase 1. 先有案執行 (實作)</div>
                    <div>由智策慧專家為客戶/夥伴進行實作 (品牌故事三部曲、一句話定位、社群貼文規劃)，確保累積真實數據。</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900 font-mono space-y-1">
                    <div className="text-orange-400 font-bold">Phase 2. 提煉標準化範本 (SOP)</div>
                    <div>歸納最佳實踐 (Best Practice)，提煉出品牌故事架構、AI 最佳提示詞 (Prompts) 標準流。</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-900 font-mono space-y-1">
                    <div className="text-orange-400 font-bold">Phase 3. 系統工具化部署 (Systematize)</div>
                    <div>將 SOP 程式化為 BrandBase 的「一句話定位生成器」、「AI 腳本提示器」與「CRM 聲量整合模組」。</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. 底層資料庫 DDL 規劃 */}
            <div className="p-6 rounded-xl border border-slate-900 bg-slate-900/25 space-y-4">
              <h3 className="font-bold text-lg text-orange-400 flex items-center gap-2">
                <Database size={18} /> E. 底層資料庫 DDL 規劃 (Supabase Client Safe)
              </h3>
              <p className="text-xs text-slate-400">專案管理、顧問、回報紀錄、觀點發布之核心 Postgres 結構：</p>
              <div className="bg-slate-950 p-4 rounded border border-slate-900 font-mono text-xs text-slate-400 max-h-[250px] overflow-y-auto">
                <pre>{`-- 1. 顧問與架構師登錄檔
CREATE TABLE consultants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    title TEXT, -- 如：資深品牌架構師
    specialty TEXT[], -- 專業領域標籤
    avatar_url TEXT, -- 儲存於 Cloudflare R2
    status TEXT DEFAULT 'pending', -- pending, active, suspended
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 客戶與案源 CRM 表
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT UNIQUE NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    industry TEXT, 
    brand_score_raw JSONB, -- 前台自測問卷原始回答
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 預算核算專案管理表
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    lead_consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'scoping', -- active, completed, paused
    budget NUMERIC,
    start_date DATE,
    end_date DATE,
    deliverables TEXT, -- 十八掌對應之交付標的
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 專案工作回報紀錄表
CREATE TABLE project_reports (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES consultants(id) ON DELETE SET NULL,
    report_content TEXT NOT NULL,
    attachment_urls TEXT[], -- R2 附件報告連結
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
        <Link 
          href={link} 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition uppercase tracking-widest"
        >
          {actionLabel} <ArrowRight size={14} />
        </Link>
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