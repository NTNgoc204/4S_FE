export const isOptionActuallyOther = (option) => {
  if (!option) return false;

  if (option.label) {
    const vi = (option.label.vi || '').trim().toLowerCase();
    const en = (option.label.en || '').trim().toLowerCase();
    const otherKeywords = [
      'khác', 'other', 'khác...', 'other...',
      'ý kiến khác', 'lựa chọn khác', 'câu trả lời khác',
      'khác (vui lòng ghi rõ)', 'other (please specify)',
      'vui lòng ghi rõ', 'please specify'
    ];
    if (otherKeywords.includes(vi) || otherKeywords.includes(en) || vi.startsWith('vui lòng nhập') || en.startsWith('please enter')) {
      return true;
    }
  }

  const content = (option.content || '').trim().toLowerCase();
  const contentKeywords = [
    'khác', 'other', 'khác...', 'other...',
    'ý kiến khác', 'lựa chọn khác', 'câu trả lời khác',
    'khác (vui lòng ghi rõ)', 'other (please specify)',
    'vui lòng ghi rõ', 'please specify'
  ];
  if (contentKeywords.includes(content) || content.startsWith('vui lòng nhập') || content.startsWith('please enter')) {
    return true;
  }

  const optId = (option.id || '').toLowerCase();
  if (optId.startsWith('custom_other_') || optId === 'other' || optId === 'khác') {
    return true;
  }

  return false;
};

export const mapBackendRecommendations = (data) => {
  if (!data) return []
  const top3 = data.top3Universities || data.Top3Universities || []
  const next5 = data.next5Universities || data.Next5Universities || []

  const mapUni = (uni, tier) => {
    if (!uni) return null
    const uniId = uni.universityId || uni.UniversityId
    const uniName = uni.name || uni.Name
    const uniShortName = uni.shortName || uni.ShortName || uniName
    const uniLocation = uni.location || uni.Location
    const uniRanking = uni.ranking ?? uni.Ranking ?? null
    const uniAvatar = uni.avatar || uni.Avatar || null
    const suitableMajors = uni.suitableMajors || uni.SuitableMajors || []

    const majorVi = suitableMajors.map((m) => m.name || m.Name).join(', ') || ''
    const majorEn = suitableMajors.map((m) => m.name || m.Name).join(', ') || ''

    return {
      id: uniId,
      name: { vi: uniName, en: uniShortName },
      major: { vi: majorVi, en: majorEn },
      ranking: uniRanking,
      tier,            // 'top3' | 'next5'
      place: { vi: uniLocation, en: uniLocation },
      avatar: uniAvatar,
    }
  }

  const mappedTop3 = top3.map((uni) => mapUni(uni, 'top3')).filter(Boolean)
  const mappedNext5 = next5.map((uni) => mapUni(uni, 'next5')).filter(Boolean)

  return [...mappedTop3, ...mappedNext5]
}
