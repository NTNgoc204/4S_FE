export const getStaticPlans = (t) => {
  const getFeatures = (key) => {
    const features = t(key, { returnObjects: true });
    return Array.isArray(features) ? features : [];
  };

  return [
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
      price: 0,
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
  ];
};

export const getFormattedPriceParts = (plan, t) => {
  if (plan.planCode === 'free') {
    return { value: '0', currency: 'VND' };
  }
  if (plan.planCode === 'edu' || plan.rawPrice === 0) {
    return { value: t('pricing:plans.edu.price', 'Liên hệ'), currency: '' };
  }
  return {
    value: plan.rawPrice.toLocaleString('vi-VN'),
    currency: 'VND',
  };
};
