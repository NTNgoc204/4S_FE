export const SCORE_KEYS = ["tech", "business", "engineering", "creative", "social"];

export const UNIVERSITIES = [
  {
    id: "hcmut",
    name: { en: "HCMC University of Technology", vi: "ĐH Bách Khoa TP.HCM" },
    major: { en: "Technology - Engineering", vi: "Khối ngành Công nghệ - Kỹ thuật" },
    place: { en: "Ho Chi Minh City", vi: "TP. Hồ Chí Minh" },
    tuition: { en: "15-25M VND/semester", vi: "15-25M VNĐ/học kỳ" },
    affinity: { tech: 4, engineering: 4, business: 1, creative: 1, social: 1 },
    stats: {
      students: { en: "25,000+ students", vi: "25,000+ sinh viên" },
      rank: { en: "Top 5 in Vietnam", vi: "Top 5 tại Việt Nam" },
      match: 92,
    },
  },
  {
    id: "hust",
    name: { en: "Hanoi University of Science and Technology", vi: "ĐH Bách Khoa Hà Nội" },
    major: { en: "Engineering & Applied Science", vi: "Kỹ thuật và Công nghệ ứng dụng" },
    place: { en: "Ha Noi", vi: "Hà Nội" },
    tuition: { en: "18-28M VNĐ/semester", vi: "18-28M VNĐ/học kỳ" },
    affinity: { tech: 3, engineering: 4, business: 1, creative: 1, social: 1 },
    stats: {
      students: { en: "35,000+ students", vi: "35,000+ sinh viên" },
      rank: { en: "Top 3 in Vietnam", vi: "Top 3 tại Việt Nam" },
      match: 88,
    },
  },
  {
    id: "ftu",
    name: { en: "Foreign Trade University", vi: "ĐH Ngoại Thương" },
    major: { en: "International Business", vi: "Kinh tế đối ngoại" },
    place: { en: "Ha Noi", vi: "Hà Nội" },
    tuition: { en: "14-22M VNĐ/semester", vi: "14-22M VNĐ/học kỳ" },
    affinity: { tech: 1, engineering: 1, business: 4, creative: 2, social: 3 },
    stats: {
      students: { en: "20,000+ students", vi: "20,000+ sinh viên" },
      rank: { en: "Top Business School", vi: "Top trường khối kinh tế" },
      match: 85,
    },
  },
  {
    id: "rmit",
    name: { en: "RMIT Vietnam", vi: "RMIT Việt Nam" },
    major: { en: "Business, Media & Design", vi: "Kinh doanh, Truyền thông, Thiết kế" },
    place: { en: "HCMC & Ha Noi", vi: "TP.HCM & Hà Nội" },
    tuition: { en: "70-95M VNĐ/semester", vi: "70-95M VNĐ/học kỳ" },
    affinity: { tech: 2, engineering: 1, business: 3, creative: 4, social: 3 },
    stats: {
      students: { en: "12,000+ students", vi: "12,000+ sinh viên" },
      rank: { en: "Top International Program", vi: "Top chương trình quốc tế" },
      match: 79,
    },
  },
];

export function getUniversityById(id) {
  return UNIVERSITIES.find((item) => item.id === id);
}

export function rankUniversities(profile) {
  return UNIVERSITIES.map((school) => {
    const weighted = SCORE_KEYS.reduce((sum, key) => {
      return sum + (profile[key] ?? 0) * (school.affinity[key] ?? 0);
    }, 0);
    const score = Math.max(68, Math.min(97, Math.round(68 + weighted / 2.4)));
    return {
      ...school,
      score,
    };
  }).sort((a, b) => b.score - a.score);
}

