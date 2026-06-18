import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getPlansRequest } from '../../feature/plan/planSlice'
import Skeleton from '../../components/Skeleton'
import useScrollReveal from '../../hooks/useScrollReveal'

function PricingPage({ isLoggedIn = false, currentPlan = '' }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const activePlanId = String(currentPlan).toLowerCase()
  const { plans: dbPlans, loading } = useSelector((state) => state.plan)

  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  useEffect(() => {
    dispatch(getPlansRequest())
  }, [dispatch])

  // Trigger scroll reveals
  useScrollReveal()

  function getFeatures(key) {
    const features = t(key, { returnObjects: true })
    return Array.isArray(features) ? features : []
  }

  const staticPlans = [
    {
      id: 'free',
      badge: '',
      name: t('pricing:plans.free.name', 'Gói Free'),
      description: t('pricing:plans.free.description', 'Khám phá các bước cơ bản'),
      price: 0,
      period: t('pricing:plans.free.period', '/ trọn đời'),
      cta: t('pricing:plans.free.cta', 'Trải nghiệm ngay'),
      features: getFeatures('pricing:plans.free.features'),
      iconLabel: 'AI',
      iconClass: 'bg-gradient-to-br from-[#1be6b4] to-[#00bb8f] text-[#e8fff7]',
      borderClass: 'border-white/10 hover:border-white/20',
      cardClass: 'glass-card glass-card-hover',
      checkClass: 'text-[#0fe2a8]',
      buttonClass: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
    },
    {
      id: 'pro',
      badge: t('pricing:plans.pro.badge', 'Được Chọn Nhiều Nhất'),
      name: t('pricing:plans.pro.name', 'Gói PRO'),
      description: t('pricing:plans.pro.description', 'Tối ưu hóa hành trình hướng nghiệp'),
      price: 99000,
      period: t('pricing:plans.pro.period', '/ tháng'),
      cta: t('pricing:plans.pro.cta', 'Nâng cấp PRO'),
      features: getFeatures('pricing:plans.pro.features'),
      iconLabel: 'PRO',
      iconClass: 'bg-gradient-to-br from-[#ffe16d] to-[#deb320] text-[#0f2d4a]',
      borderClass: 'rainbow-glow',
      cardClass: 'glass-card bg-[#0b172a]/60 shadow-[0_20px_50px_rgba(236,199,65,0.12)]',
      checkClass: 'text-[#ecc741]',
      buttonClass: 'bg-gradient-to-r from-[#ffe06e] to-[#ecc741] text-[#0f2d4a] hover:scale-[1.02] shadow-md hover:shadow-[#ecc741]/20',
    },
    {
      id: 'edu',
      badge: t('pricing:plans.edu.badge', 'Dành Cho Trường Học'),
      name: t('pricing:plans.edu.name', 'Gói EDU'),
      description: t('pricing:plans.edu.description', 'Giải pháp trọn gói cho nhà trường'),
      price: 0, // Contact
      period: '',
      cta: t('pricing:plans.edu.cta', 'Liên hệ Hợp tác'),
      features: getFeatures('pricing:plans.edu.features'),
      iconLabel: 'EDU',
      iconClass: 'bg-gradient-to-br from-[#7e8cff] to-[#6373f7] text-[#eef2ff]',
      borderClass: 'border-[#7f8cff]/30 hover:border-[#7f8cff]/55',
      cardClass: 'glass-card glass-card-hover',
      checkClass: 'text-[#8b99ff]',
      buttonClass: 'bg-gradient-to-r from-[#6f7bff] to-[#7f8cff] text-white hover:scale-[1.02] shadow-md hover:shadow-[#7f8cff]/20',
    },
  ]

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
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://4s.vercel.app';

  const handlePlanClick = (plan) => {
    if (plan.planCode === 'edu') {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
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

  // Calculate formatted price parts
  const getFormattedPriceParts = (plan) => {
    if (plan.planCode === 'free') {
      return { value: '0', currency: 'VND' }
    }
    if (plan.planCode === 'edu' || plan.rawPrice === 0) {
      return { value: t('pricing:plans.edu.price', 'Liên hệ'), currency: '' }
    }
    return {
      value: plan.rawPrice.toLocaleString('vi-VN'),
      currency: 'VND'
    }
  }

  const faqItems = [
    {
      q: locale === 'vi' ? 'Gói PRO có giới hạn số lượt kiểm tra không?' : 'Does the PRO plan limit the number of quiz attempts?',
      a: locale === 'vi' ? 'Không. Khi đăng ký gói PRO, bạn được thực hiện không giới hạn số lượt trắc nghiệm Holland và nhận đánh giá AI đầy đủ.' : 'No. With a PRO subscription, you can take the Holland test and receive detailed AI analytics an unlimited number of times.'
    },
    {
      q: locale === 'vi' ? 'Phương thức thanh toán được hỗ trợ là gì?' : 'What payment methods are supported?',
      a: locale === 'vi' ? 'Chúng tôi hỗ trợ chuyển khoản ngân hàng nhanh qua mã QR (VietQR) và cổng thanh toán. Kích hoạt tài khoản lập tức sau khi giao dịch thành công.' : 'We support bank transfers via QR code (VietQR) and major payment gateways. Your account is upgraded instantly after payment succeeds.'
    },
    {
      q: locale === 'vi' ? 'Quy trình dành cho đối tác Trường học (Gói EDU) như thế nào?' : 'How does school partnership (EDU Plan) work?',
      a: locale === 'vi' ? 'Nhà trường vui lòng nhấn nút "Liên hệ hợp tác", đội ngũ 4S sẽ liên hệ trực tiếp để cung cấp tài khoản và dashboard phân tích cho học sinh toàn trường.' : 'Schools can click "Contact for Schools". Our team will reach out directly to set up individual logins and custom analytics dashboards for all students.'
    }
  ]

  return (
    <>
      <Helmet>
        <title>{locale === 'vi' ? 'Bảng Giá Dịch Vụ - Định Hướng Nghề Nghiệp 4S' : 'Pricing Plans - 4S Career Guidance'}</title>
        <meta name="description" content={locale === 'vi' ? 'Xem các gói dịch vụ Pro và Enterprise giúp bạn mở khóa đầy đủ tính năng tư vấn hướng nghiệp AI và tìm trường đại học phù hợp.' : 'View our pricing plans and unlock the full potential of AI career guidance and personalized university matching.'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content={locale === 'vi' ? 'Bảng Giá Dịch Vụ - Định Hướng Nghề Nghiệp 4S' : 'Pricing Plans - 4S Career Guidance'} />
        <meta property="og:description" content={locale === 'vi' ? 'Xem các gói dịch vụ Pro và Enterprise giúp bạn mở khóa đầy đủ tính năng tư vấn hướng nghiệp AI và tìm trường đại học phù hợp.' : 'View our pricing plans and unlock the full potential of AI career guidance and personalized university matching.'} />
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
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-[32px] border p-8 transition-all duration-500 hover:scale-[1.02] ${plan.borderClass} ${plan.cardClass} reveal-on-scroll`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Popular / Focus badge */}
                {plan.badge ? (
                  <span
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-5 py-1.5 text-xs font-extrabold uppercase tracking-wider shadow-md ${
                      plan.planCode === 'pro'
                        ? 'bg-gradient-to-r from-[#ffe06e] to-[#ecc741] text-[#17314b]'
                        : 'bg-gradient-to-r from-[#6f7bff] to-[#7f8cff] text-[#ecf0ff]'
                    }`}
                  >
                    {plan.badge}
                  </span>
                ) : null}

                {/* Plan Icon */}
                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl text-base font-extrabold shadow-inner ${plan.iconClass}`}>
                  {plan.iconLabel}
                </div>

                {/* Plan Name */}
                {isPlansLoading ? (
                  <div className="mt-6 mb-2">
                    <Skeleton height="1.8rem" width="120px" />
                  </div>
                ) : (
                  <h2 className="mt-6 font-display text-2xl font-extrabold text-white tracking-tight text-left">{plan.name}</h2>
                )}

                {/* Plan Description */}
                <p className="mt-2 text-xs text-slate-400 text-left leading-relaxed">{plan.description}</p>

                {/* Plan Price */}
                <div className="mt-6 flex items-baseline flex-wrap gap-1.5 border-b border-white/5 pb-6">
                  {isPlansLoading ? (
                    <Skeleton height="3.2rem" width="160px" />
                  ) : (
                    (() => {
                      const { value, currency } = getFormattedPriceParts(plan)
                      return (
                        <>
                          <span className="font-display text-4xl md:text-[2.6rem] font-extrabold leading-none tracking-tight text-white whitespace-nowrap">
                            {value}
                          </span>
                          {currency && (
                            <span className="text-lg md:text-xl font-bold text-slate-300">
                              {currency}
                            </span>
                          )}
                          {plan.period && (
                            <span className="text-xs text-slate-400 font-medium ml-1">
                              {plan.period}
                            </span>
                          )}
                        </>
                      )
                    })()
                  )}
                </div>

                {/* Plan Features */}
                <ul className="mt-8 space-y-4 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 text-left leading-snug">
                      <span className={`mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-white/5 ${plan.checkClass}`}>
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Action Button */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  {isPlansLoading ? (
                    <button
                      className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold text-slate-400 flex items-center justify-center"
                      disabled
                      type="button"
                    >
                      <Skeleton height="1.2rem" width="100px" />
                    </button>
                  ) : isLoggedIn && activePlanId === plan.planCode ? (
                    <button
                      className="w-full cursor-default rounded-2xl bg-emerald-500/10 border border-emerald-500/20 py-4 text-sm font-bold text-[#0fe2a8]"
                      disabled
                      type="button"
                    >
                      {t('pricing:currentPlanCta', 'Gói hiện tại của bạn')}
                    </button>
                  ) : isLoggedIn && (
                    (activePlanId === 'pro' && plan.planCode === 'free') ||
                    (activePlanId === 'edu' && (plan.planCode === 'free' || plan.planCode === 'pro'))
                  ) ? (
                    <button
                      className="w-full cursor-not-allowed rounded-2xl border border-white/5 bg-white/2 py-4 text-sm font-bold text-slate-500"
                      disabled
                      type="button"
                    >
                      {plan.cta}
                    </button>
                  ) : (
                    <button
                      className={`w-full rounded-2xl py-4 text-sm font-bold transition-all duration-300 cursor-pointer ${plan.buttonClass}`}
                      type="button"
                      onClick={() => handlePlanClick(plan)}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>

          {/* Money-back / Trust note */}
          <p className="mt-12 text-sm text-slate-400 reveal-on-scroll">
            🔒 {t('pricing:note', 'Hệ thống thanh toán bảo mật. Hỗ trợ kích hoạt dịch vụ tự động 24/7.')}
          </p>

          {/* Interactive FAQ Accordion Section */}
          <section className="mt-24 max-w-4xl mx-auto reveal-on-scroll">
            <h2 className="font-display text-2xl font-extrabold text-white tracking-tight mb-8">
              {locale === 'vi' ? 'Câu hỏi thường gặp' : 'Frequently Asked Questions'}
            </h2>
            
            <div className="space-y-4 text-left">
              {faqItems.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <article 
                    key={idx}
                    className="glass-card rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      type="button"
                      className="w-full px-6 py-5 flex items-center justify-between text-left font-bold text-sm sm:text-base text-white hover:bg-white/2 transition cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`}>
                        ▼
                      </span>
                    </button>
                    
                    <div 
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-40 border-t border-white/5' : 'max-h-0'
                      }`}
                    >
                      <p className="p-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#0a1424]/30">
                        {faq.a}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Custom School Cooperation / Partnership Section */}
          <section id="contact-section" className="mt-20 rounded-[32px] border border-white/10 bg-gradient-to-r from-[#172c44]/80 to-[#122238]/90 px-8 py-12 text-center md:px-12 relative overflow-hidden reveal-on-scroll shadow-2xl">
            <div className="glow-blob glow-blob-3 right-0 bottom-0 h-48 w-48 opacity-20" />
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{t('pricing:questions.title')}</h2>
            <p className="mt-3 text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">{t('pricing:questions.subtitle')}</p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:support@4s.edu.vn?subject=Cooperation%20Inquiry%20-%204S%20Career%20Guidance"
                className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-8 py-3.5 text-sm font-bold text-white transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02] inline-block"
              >
                {t('pricing:questions.contact')}
              </a>
              <button
                className="rounded-xl border border-[#7f8cff]/30 bg-[#7f8cff]/10 hover:bg-[#7f8cff]/20 px-8 py-3.5 text-sm font-bold text-[#b9c1ff] transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02]"
                type="button"
              >
                {t('pricing:questions.partnership')}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default PricingPage
