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
