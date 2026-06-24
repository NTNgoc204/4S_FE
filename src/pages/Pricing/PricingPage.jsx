import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getPlansRequest } from '../../feature/plan/planSlice'
import useScrollReveal from '../../hooks/useScrollReveal'
import { getStaticPlans } from './util/pricingHelpers'
import PricingCard from './components/PricingCard'
import PricingFaq from './components/PricingFaq'
import SchoolRegisterModal from '../../components/SchoolRegisterModal'

function PricingPage({ isLoggedIn = false, currentPlan = '' }) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const activePlanId = String(currentPlan).toLowerCase()
  const { plans: dbPlans, loading } = useSelector((state) => state.plan)

  useEffect(() => {
    dispatch(getPlansRequest())
  }, [dispatch])

  // Trigger scroll reveals
  useScrollReveal()

  function getFeatures(key) {
    const features = t(key, { returnObjects: true })
    return Array.isArray(features) ? features : []
  }

  const staticPlans = getStaticPlans(t)

  const plans = dbPlans.length > 0
    ? dbPlans.map(dbPlan => {
        const nameLower = dbPlan.name?.toLowerCase() || '';
        let styleConfig = {};
        if (nameLower.includes('free')) {
          styleConfig = {
            id: 'free',
            badge: '',
            iconLabel: 'AI',
            iconClass: 'bg-gradient-to-br from-[#1be6b4] to-[#00bb8f] text-[#e8fff7]',
            borderClass: 'border-white/10 hover:border-white/20',
            cardClass: 'glass-card glass-card-hover',
            checkClass: 'text-[#0fe2a8]',
            buttonClass: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
            cta: t('pricing:plans.free.cta', 'Trải nghiệm ngay'),
            features: getFeatures('pricing:plans.free.features'),
          };
        } else if (nameLower.includes('pro')) {
          styleConfig = {
            id: 'pro',
            badge: t('pricing:plans.pro.badge', 'Khuyên Dùng'),
            iconLabel: 'PRO',
            iconClass: 'bg-gradient-to-br from-[#ffe16d] to-[#deb320] text-[#0f2d4a]',
            borderClass: 'rainbow-glow',
            cardClass: 'glass-card bg-[#0b172a]/60 shadow-[0_20px_50px_rgba(236,199,65,0.12)]',
            checkClass: 'text-[#ecc741]',
            buttonClass: 'bg-gradient-to-r from-[#ffe06e] to-[#ecc741] text-[#0f2d4a] hover:scale-[1.02] shadow-md hover:shadow-[#ecc741]/20',
            cta: t('pricing:plans.pro.cta', 'Nâng cấp PRO'),
            features: getFeatures('pricing:plans.pro.features'),
          };
        } else {
          styleConfig = {
            id: 'edu',
            badge: t('pricing:plans.edu.badge', 'Dành Cho Trường Học'),
            iconLabel: 'EDU',
            iconClass: 'bg-gradient-to-br from-[#7e8cff] to-[#6373f7] text-[#eef2ff]',
            borderClass: 'border-[#7f8cff]/30 hover:border-[#7f8cff]/55',
            cardClass: 'glass-card glass-card-hover',
            checkClass: 'text-[#8b99ff]',
            buttonClass: 'bg-gradient-to-r from-[#6f7bff] to-[#7f8cff] text-white hover:scale-[1.02] shadow-md hover:shadow-[#7f8cff]/20',
            cta: t('pricing:plans.edu.cta', 'Liên hệ Hợp tác'),
            features: getFeatures('pricing:plans.edu.features'),
          };
        }

        const planCode = nameLower.includes('free') ? 'free' : nameLower.includes('pro') ? 'pro' : 'edu';
        return {
          id: dbPlan.id,
          planCode,
          name: dbPlan.name,
          description: dbPlan.description || t(`pricing:plans.${styleConfig.id}.description`),
          rawPrice: dbPlan.price,
          period: planCode === 'free' ? t('pricing:plans.free.period', '/ trọn đời') : (planCode === 'pro' ? t('pricing:plans.pro.period', '/ tháng') : ''),
          ...styleConfig,
        };
      })
    : staticPlans.map(staticPlan => ({ 
        ...staticPlan, 
        planCode: staticPlan.id,
        rawPrice: staticPlan.id === 'pro' ? 99000 : 0
      }));

  // Sort plans: Free -> Pro -> Edu
  const sortOrder = { 'free': 0, 'pro': 1, 'edu': 2 };
  plans.sort((a, b) => (sortOrder[a.planCode] ?? 99) - (sortOrder[b.planCode] ?? 99));

  const isPlansLoading = loading && dbPlans.length === 0;
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s-company.vercel.app';

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handlePlanClick = (plan) => {
    if (plan.planCode === 'edu') {
      setIsRegisterOpen(true);
      return;
    }

    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/pricing' } })
      return
    }
    if (plan.planCode === 'free') {
      return
    }
    navigate(`/checkout?planId=${plan.id}`)
  }

  const faqItems = t('pricing:faq', { returnObjects: true }) || []

  return (
    <>
      <Helmet>
        <title>{t('pricing:meta.title', 'Bảng Giá Dịch Vụ - Định Hướng Nghề Nghiệp 4S')}</title>
        <meta name="description" content={t('pricing:meta.description', 'Xem các gói dịch vụ Pro và Enterprise giúp bạn mở khóa đầy đủ tính năng tư vấn hướng nghiệp AI và tìm trường đại học phù hợp.')} />
        <link rel="canonical" href={`${siteUrl}/pricing`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={t('pricing:meta.title', 'Bảng Giá Dịch Vụ - Định Hướng Nghề Nghiệp 4S')} />
        <meta property="og:description" content={t('pricing:meta.description', 'Xem các gói dịch vụ Pro và Enterprise giúp bạn mở khóa đầy đủ tính năng tư vấn hướng nghiệp AI và tìm trường đại học phù hợp.')} />
        <meta property="og:url" content={`${siteUrl}/pricing`} />
        <meta property="og:image" content={`${siteUrl}/assets/logo-4s.png`} />
      </Helmet>

      <main className="relative overflow-x-hidden text-slate-100 pb-24 pt-24 md:pt-32">
        {/* Liquid Background Blobs */}
        <div className="glow-blob glow-blob-1 -left-20 top-20 h-[350px] w-[350px]" />
        <div className="glow-blob glow-blob-2 right-10 top-40 h-[380px] w-[380px]" />

        <div className="relative z-10 mx-auto w-[min(1200px,92vw)] text-center">
          
          {/* Header section */}
          <header className="max-w-3xl mx-auto mb-16 reveal-on-scroll">
            <span className="inline-flex items-center rounded-full border border-[#ecc741]/30 bg-[#ecc741]/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#ecc741] mb-6">
              {t('pricing:hero.chip', 'BẢNG GIÁ DỊCH VỤ')}
            </span>
            <h1 className="font-display text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[3.8rem] md:text-5xl">
              {t('pricing:hero.title', 'Lựa chọn gói dịch vụ của bạn')}
            </h1>
            <p className="mt-6 text-base md:text-lg text-slate-300 leading-relaxed">
              {t('pricing:hero.subtitle', 'Đầu tư nhỏ cho định hướng tương lai bền vững của bạn hoặc học sinh.')}
            </p>
          </header>

          {/* Pricing cards grid */}
          <section className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
            {plans.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                index={index}
                isPlansLoading={isPlansLoading}
                isLoggedIn={isLoggedIn}
                activePlanId={activePlanId}
                onPlanClick={handlePlanClick}
                t={t}
              />
            ))}
          </section>

          {/* Money-back / Trust note */}
          <p className="mt-12 text-sm text-slate-400 reveal-on-scroll">
            🔒 {t('pricing:note', 'Hệ thống thanh toán bảo mật. Hỗ trợ kích hoạt dịch vụ tự động 24/7.')}
          </p>

          {/* Interactive FAQ Accordion Section */}
          <PricingFaq faqItems={faqItems} t={t} />

        </div>
      </main>

      <SchoolRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </>
  )
}

export default PricingPage
