import React, { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import useScrollReveal from '../../hooks/useScrollReveal'

function InteractiveDashboard({ locale }) {
  const [activeTab, setActiveTab] = useState('I') // Investigative is default
  
  const traits = [
    { id: 'R', label: locale === 'vi' ? 'Kỹ thuật (Realistic)' : 'Realistic', color: '#3b82f6', desc: locale === 'vi' ? 'Thích làm việc với máy móc, dụng cụ, kỹ thuật, thực tế và vận động thể chất.' : 'Likes working with machines, tools, engineering, hands-on tasks, and physical activity.' },
    { id: 'I', label: locale === 'vi' ? 'Nghiên cứu (Investigative)' : 'Investigative', color: '#0ed8ab', desc: locale === 'vi' ? 'Thích quan sát, học hỏi, điều tra, phân tích khoa học và giải quyết các bài toán hóc búa.' : 'Likes to observe, learn, investigate, perform scientific analysis, and solve complex puzzles.' },
    { id: 'A', label: locale === 'vi' ? 'Nghệ thuật (Artistic)' : 'Artistic', color: '#ecc741', desc: locale === 'vi' ? 'Giàu sức sáng tạo, trực giác tốt, yêu thích cái đẹp và làm việc tự do không khuôn mẫu.' : 'Highly creative, intuitive, loves aesthetics, and prefers working in unstructured environments.' },
    { id: 'S', label: locale === 'vi' ? 'Xã hội (Social)' : 'Social', color: '#ec4899', desc: locale === 'vi' ? 'Thích giúp đỡ, chia sẻ, giảng dạy, chăm sóc người khác và hoạt động cộng đồng.' : 'Likes to help, share, teach, counsel, care for others, and engage in community work.' },
    { id: 'E', label: locale === 'vi' ? 'Quản lý (Enterprising)' : 'Enterprising', color: '#f97316', desc: locale === 'vi' ? 'Thích giao tiếp, gây ảnh hưởng, thuyết phục, lãnh đạo và hiện thực hóa mục tiêu kinh doanh.' : 'Likes to communicate, influence, persuade, lead, and realize business or organizational goals.' },
    { id: 'C', label: locale === 'vi' ? 'Nghiệp vụ (Conventional)' : 'Conventional', color: '#a855f7', desc: locale === 'vi' ? 'Cẩn thận, chi tiết, thích làm việc với dữ liệu, số liệu và tuân thủ các quy trình rõ ràng.' : 'Detail-oriented, systematic, likes working with data, numbers, and following clear procedures.' }
  ]

  const activeTrait = traits.find(t => t.id === activeTab)

  return (
    <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20">
      {/* Dynamic background glow based on active trait */}
      <div 
        className="absolute -right-20 -top-20 h-44 w-44 rounded-full blur-[70px] opacity-20 transition-all duration-700" 
        style={{ backgroundColor: activeTrait.color }}
      />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-rose-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
          Holland_Model.json
        </span>
      </div>

      <h3 className="font-display text-base font-bold text-white mb-1 flex items-center gap-2">
        <span>{locale === 'vi' ? 'Mô hình Holland RIASEC' : 'Holland RIASEC Model'}</span>
        <span className="text-[#0ed8ab] text-[10px] font-semibold bg-[#0ed8ab]/10 px-2 py-0.5 rounded-full border border-[#0ed8ab]/20">
          {locale === 'vi' ? 'Tương tác' : 'Interactive'}
        </span>
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        {locale === 'vi' ? 'Nhấp chọn để khám phá các nhóm tính cách nghề nghiệp:' : 'Click to discover career personality groups:'}
      </p>

      {/* Grid of RIASEC tabs */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 mb-6">
        {traits.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            type="button"
            className={`flex flex-col items-center justify-center py-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
              activeTab === t.id 
                ? 'bg-white/10 border-white/20 text-white font-bold scale-[1.05]' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/8 hover:text-slate-200'
            }`}
            style={{
              boxShadow: activeTab === t.id ? `0 0 15px -3px ${t.color}30` : 'none',
              borderTopColor: activeTab === t.id ? t.color : undefined,
              borderTopWidth: activeTab === t.id ? '2px' : '1px'
            }}
          >
            <span className="text-xl font-display mb-0.5" style={{ color: activeTab === t.id ? t.color : undefined }}>
              {t.id}
            </span>
            <span className="text-[9px] tracking-tight uppercase font-medium">
              {t.id === 'R' ? 'Real' : t.id === 'I' ? 'Invest' : t.id === 'A' ? 'Art' : t.id === 'S' ? 'Social' : t.id === 'E' ? 'Enterp' : 'Conv'}
            </span>
          </button>
        ))}
      </div>

      {/* Display Active Trait Info */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/5 transition-all duration-300 min-h-[145px] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: activeTrait.color }} />
            <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              {activeTrait.label}
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeTrait.desc}
          </p>
        </div>

        {/* Suggest Career Fields */}
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-1 text-[11px]">
          <span className="text-slate-400">{locale === 'vi' ? 'Ngành học & nghề nghiệp tiêu biểu:' : 'Key matching fields:'}</span>
          <span className="font-semibold font-mono text-right" style={{ color: activeTrait.color }}>
            {activeTab === 'R' && (locale === 'vi' ? 'CNTT, Kỹ thuật cơ khí, Điện tử, IoT' : 'IT, Mechanical Eng, Electronics, IoT')}
            {activeTab === 'I' && (locale === 'vi' ? 'AI Researcher, Y khoa, Khoa học dữ liệu' : 'AI Researcher, Medicine, Data Science')}
            {activeTab === 'A' && (locale === 'vi' ? 'Thiết kế đồ họa, Kiến trúc, Sáng tạo nội dung' : 'Graphic Design, Architecture, Content Creation')}
            {activeTab === 'S' && (locale === 'vi' ? 'Sư phạm, Tâm lý học học đường, Quản trị nhân sự' : 'Education, School Psychology, HR')}
            {activeTab === 'E' && (locale === 'vi' ? 'Marketing, QTKD, Quản lý dự án, Fintech' : 'Marketing, Biz Admin, Project Mgmt, Fintech')}
            {activeTab === 'C' && (locale === 'vi' ? 'Tài chính, Phân tích dữ liệu, Logistics' : 'Finance, Data Analyst, Logistics')}
          </span>
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'
  const navigate = useNavigate()
  const outletContext = useOutletContext()
  const isLoggedIn = outletContext?.isLoggedIn ?? false
  const currentPlan = String(outletContext?.currentPlan ?? '').toLowerCase()
  const isProAccount = currentPlan !== 'free' && currentPlan !== ''

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s-company.vercel.app'

  // Trigger custom scroll reveal animations
  useScrollReveal()

  const featureCards = [
    {
      icon: 'AI',
      title: t('home:features.chatbot.title'),
      description: t('home:features.chatbot.description'),
    },
    {
      icon: '$',
      title: t('home:features.tuition.title'),
      description: t('home:features.tuition.description'),
    },
    {
      icon: 'MS',
      title: t('home:features.match.title'),
      description: t('home:features.match.description'),
    },
  ]

  const journeySteps = [
    {
      id: '01',
      title: t('home:steps.step1.title'),
      description: t('home:steps.step1.description'),
    },
    {
      id: '02',
      title: t('home:steps.step2.title'),
      description: t('home:steps.step2.description'),
    },
    {
      id: '03',
      title: t('home:steps.step3.title'),
      description: t('home:steps.step3.description'),
    },
  ]

  const statItems = [
    { value: '10,000+', label: t('home:stats.students') },
    { value: '200+', label: t('home:stats.universities') },
    { value: '98%', label: t('home:stats.satisfaction') },
    { value: '4.9/5', label: t('home:stats.averageRating') },
  ]

  function handleStartConsultationClick() {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    navigate(isProAccount ? '/consultation' : '/chat')
  }

  return (
    <>
      <Helmet>
        <title>{locale === 'vi' ? '4S - Hướng Nghiệp & Định Hướng Trường Đại Học Thông Minh' : '4S - Smart Career Guidance & University Matching'}</title>
        <meta name="description" content={locale === 'vi' ? 'Khám phá trường đại học và lộ trình nghề nghiệp phù hợp với năng lực, sở thích và tài chính của bạn bằng công nghệ AI và dữ liệu thực tế.' : 'Discover universities and career paths matching your abilities, interests, and budget using advanced AI and real student data.'} />
        <link rel="canonical" href={siteUrl} />
        <meta name="keywords" content="hướng nghiệp, trắc nghiệm holland, chọn trường đại học, chọn ngành học, tư vấn học đường, career guidance, university matching, holland test" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="4S - Hướng Nghiệp & Định Hướng Trường Đại Học Thông Minh" />
        <meta property="og:description" content="Khám phá trường đại học và lộ trình nghề nghiệp phù hợp với năng lực, sở thích và tài chính của bạn bằng công nghệ AI và dữ liệu thực tế." />
        <meta property="og:image" content={`${siteUrl}/assets/logo-4s.png`} />
        <meta property="og:url" content={siteUrl} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="4S - Hướng Nghiệp & Định Hướng Trường Đại Học Thông Minh" />
        <meta property="twitter:description" content="Khám phá trường đại học và lộ trình nghề nghiệp phù hợp với năng lực, sở thích và tài chính của bạn bằng công nghệ AI và dữ liệu thực tế." />
        <meta property="twitter:image" content={`${siteUrl}/assets/logo-4s.png`} />

        {/* Schema JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "4S Career Guidance",
            "url": siteUrl,
            "logo": `${siteUrl}/assets/logo-4s.png`,
            "description": "Nền tảng hướng nghiệp thông minh giúp học sinh tìm kiếm ngành học và trường đại học phù hợp qua trắc nghiệm Holland và AI.",
            "sameAs": []
          })}
        </script>
      </Helmet>
      
      <main className="overflow-x-hidden text-slate-100">
        
        {/* Section 1: Hero Section */}
        <section className="relative pb-24 pt-28 md:pb-32 md:pt-36 flex items-center justify-center min-h-[85vh]">
          {/* Liquid Background Glowing Blobs */}
          <div className="glow-blob glow-blob-1 -left-20 top-20 h-[350px] w-[350px]" />
          <div className="glow-blob glow-blob-2 right-10 top-40 h-[400px] w-[400px]" />
          <div className="glow-blob glow-blob-3 left-1/3 bottom-10 h-[300px] w-[300px]" />
          
          <div className="relative z-10 mx-auto w-[min(1200px,92vw)]">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Typography & Actions */}
              <div className="text-left lg:col-span-7 reveal-on-scroll">
                <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-[#0ed8ab]/30 bg-[#0ed8ab]/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#0ed8ab]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0ed8ab] animate-pulse" />
                  {t('home:hero.chip')}
                </div>
                <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[3.5rem] md:text-[4.2rem] lg:text-[4.5rem]">
                  {t('home:hero.titleLine1')} <br />
                  <span className="bg-gradient-to-r from-[#ffe06e] via-[#ecc741] to-[#0ed8ab] bg-clip-text text-transparent">
                    {t('home:hero.titleLine2')}
                  </span>
                </h1>
                <p className="mt-8 text-base leading-relaxed text-slate-300 sm:text-lg max-w-[620px]">
                  {t('home:hero.description')}
                </p>
                
                <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
                  <button 
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#ecc741] px-8 py-4 font-bold text-[#0c1e36] shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] cursor-pointer"
                    onClick={handleStartConsultationClick} 
                    type="button"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {t('common:actions.startConsultation')}
                      <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </button>
                  
                  <button 
                    className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] cursor-pointer"
                    onClick={() => navigate('/pricing')}
                    type="button"
                  >
                    {locale === 'vi' ? 'Xem các gói VIP' : 'View VIP Pricing'}
                  </button>
                </div>

                {/* Stats Summary under CTA */}
                <div className="mt-12 flex flex-wrap items-center gap-8 border-t border-white/5 pt-8">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5">
                      {['AL', 'TH', 'HN', 'PV'].map((name, index) => (
                        <span
                          key={name}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#09152b] bg-[#1d3350] text-[0.65rem] font-bold text-[#ecc741]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      <span className="text-white font-semibold block">{t('home:hero.studentsGuided')}</span>
                      <span>{locale === 'vi' ? 'Đã tìm được trường học như ý' : 'Successfully matched with universities'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 border-l border-white/10 pl-8">
                    <span className="text-yellow-400 text-base">★★★★★</span>
                    <span>{t('home:hero.rating')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Premium Interactive Mock Holland Widget */}
              <div className="lg:col-span-5 reveal-on-scroll delay-200">
                <InteractiveDashboard locale={locale} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Stats Banner */}
        <section className="relative border-y border-white/5 bg-[#0a1424]/60 backdrop-blur-md">
          <div className="mx-auto grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/5 py-10 max-w-7xl">
            {statItems.map((item, index) => (
              <article key={item.label} className="text-center p-6 reveal-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
                <h3
                  className={`font-display text-4xl font-extrabold tracking-tight md:text-5xl bg-clip-text text-transparent ${
                    index % 2 === 1 
                      ? 'bg-gradient-to-r from-[#0fe2a8] to-[#04c2ef]' 
                      : 'bg-gradient-to-r from-[#f4d040] to-[#e4b41f]'
                  }`}
                >
                  {item.value}
                </h3>
                <p className="mt-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Section 3: Why Choose 4S (Feature Cards) */}
        <section className="py-24 md:py-32 relative">
          <div className="glow-blob glow-blob-2 -left-20 top-1/3 h-[300px] w-[300px]" />
          <div className="mx-auto w-[min(1200px,92vw)] relative z-10">
            <header className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0ed8ab] bg-[#0ed8ab]/10 px-3 py-1 rounded-full border border-[#0ed8ab]/20">
                {locale === 'vi' ? 'Giá trị vượt trội' : 'Core values'}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight mt-4 sm:text-4xl md:text-5xl text-white">
                {t('home:why.title')}
              </h2>
              <div className="h-1.5 w-16 bg-[#ecc741] mx-auto mt-6 rounded-full" />
              <p className="mt-6 text-slate-300 text-sm md:text-base leading-relaxed">
                {t('home:why.subtitle')}
              </p>
            </header>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {featureCards.map((feature, index) => (
                <article
                  key={feature.title}
                  className="glass-card glass-card-hover rounded-3xl p-8 border border-white/5 shadow-xl reveal-on-scroll flex flex-col justify-between"
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <div>
                    <div
                      className={`inline-flex h-[56px] w-[56px] items-center justify-center rounded-2xl text-base font-extrabold tracking-wide shadow-md ${
                        index === 1
                          ? 'bg-gradient-to-br from-[#1be6b4] to-[#00bb8f] text-[#e8fff7]'
                          : 'bg-gradient-to-br from-[#ffe06e] to-[#e2bb28] text-[#09213f]'
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="mt-6 font-display text-xl font-bold text-white tracking-tight">{feature.title}</h3>
                    <p className="mt-4 text-xs md:text-sm text-slate-300 leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#0ed8ab] font-semibold">
                    <span>{locale === 'vi' ? 'Tìm hiểu thêm' : 'Learn more'}</span>
                    <svg className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 4: How It Works (Journey Steps) */}
        <section className="relative py-24 md:py-32 bg-[#091424]/40 border-y border-white/5">
          <div className="glow-blob glow-blob-3 right-10 top-1/4 h-[350px] w-[350px]" />
          <div className="mx-auto w-[min(1200px,92vw)] relative z-10">
            <header className="text-center max-w-3xl mx-auto mb-20 reveal-on-scroll">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ecc741] bg-[#ecc741]/10 px-3 py-1 rounded-full border border-[#ecc741]/20">
                {locale === 'vi' ? 'Quy trình đơn giản' : 'Simple steps'}
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight mt-4 sm:text-4xl md:text-5xl text-white">
                {t('home:how.title')}
              </h2>
              <p className="mt-6 text-slate-300 text-sm md:text-base leading-relaxed">
                {t('home:how.subtitle')}
              </p>
            </header>

            {/* Asymmetrical / Alternating staggered journey steps */}
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {journeySteps.map((step, index) => (
                <article 
                  key={step.id} 
                  className="relative p-8 rounded-3xl border border-white/5 bg-[#122238]/40 hover:bg-[#122238]/60 transition-all duration-300 reveal-on-scroll"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="absolute -top-7 left-8">
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl font-display text-xl font-black tracking-wider shadow-lg ${
                        index === 1
                          ? 'bg-gradient-to-br from-[#13e6ba] to-[#03b88f] text-[#e9fffb]'
                          : 'bg-gradient-to-br from-[#ffe26f] to-[#e4be2d] text-[#06223e]'
                      }`}
                    >
                      {step.id}
                    </span>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-display text-lg font-bold text-white mb-3 tracking-tight">{step.title}</h3>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Testimonials */}
        <section className="relative py-24 md:py-32">
          <div className="glow-blob glow-blob-1 left-20 bottom-10 h-[300px] w-[300px]" />
          <div className="relative z-10 mx-auto w-[min(1120px,92vw)]">
            <header className="text-center max-w-3xl mx-auto mb-16 reveal-on-scroll">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0ed8ab] bg-[#0ed8ab]/10 px-3 py-1 rounded-full border border-[#0ed8ab]/20">
                {locale === 'vi' ? 'Chia sẻ thực tế' : 'Success stories'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-4 md:text-4xl text-white">
                {t('home:testimonial.title')}
              </h2>
              <p className="mt-4 text-slate-400 text-xs sm:text-sm">{t('home:testimonial.subtitle')}</p>
            </header>

            <article className="glass-card rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden max-w-4xl mx-auto reveal-on-scroll">
              {/* Huge stylized quote mark */}
              <span className="absolute -right-6 -bottom-10 font-display text-[15rem] leading-none font-bold text-white/3 pointer-events-none select-none">
                ”
              </span>
              
              <div className="mb-6 flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3">
                  <p aria-label={t('home:testimonial.ratingAria')} className="flex items-center gap-1 leading-none text-[#ecc741]">
                    {[0, 1, 2, 3, 4].map((starIndex) => (
                      <span key={starIndex} className="text-xl md:text-2xl">
                        {'\u2605'}
                      </span>
                    ))}
                  </p>
                  <p className="text-xs font-semibold text-amber-200">{t('home:testimonial.ratingText')}</p>
                </div>
                
                <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  Verified Scholar
                </span>
              </div>

              <blockquote className="my-6 text-base md:text-lg italic leading-relaxed text-slate-200">
                "{t('home:testimonial.quote')}"
              </blockquote>

              <div className="flex items-center gap-4 mt-8">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#ffde63] to-[#e2b824] text-sm font-bold text-[#0c2440] shadow-md border border-white/10">
                  TH
                </span>
                <div>
                  <h3 className="font-display text-sm md:text-base font-bold text-white">{t('home:testimonial.name')}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{t('home:testimonial.role')}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* Section 6: CTA (Call to Action) */}
        <section className="relative py-24 md:py-32 bg-gradient-to-b from-[#0e1c2e]/60 to-[#070f1a] border-t border-white/5 overflow-hidden">
          {/* Animated Background blobs */}
          <div className="glow-blob glow-blob-2 left-1/4 top-1/4 h-[350px] w-[350px] opacity-15" />
          <div className="glow-blob glow-blob-3 right-1/4 bottom-1/4 h-[350px] w-[350px] opacity-15" />

          <div className="relative z-10 mx-auto w-[min(1120px,92vw)] text-center reveal-on-scroll">
            <div className="mx-auto mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ffe16d] to-[#deb320] text-lg font-extrabold tracking-widest text-[#0f2d4a] shadow-lg shadow-[#deb320]/15">
              4S
            </div>
            
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl text-white max-w-4xl mx-auto leading-tight">
              {t('home:cta.title')}
            </h2>
            
            <p className="mx-auto mt-6 w-[min(750px,96%)] text-slate-300 text-sm sm:text-base leading-relaxed">
              {t('home:cta.subtitle')}
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <button 
                className="w-full sm:w-auto group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#ffe06e] to-[#ecc741] px-10 py-4 font-bold text-[#0c1e36] shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] cursor-pointer" 
                onClick={handleStartConsultationClick} 
                type="button"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t('common:actions.startConsultation')}
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

export default HomePage
