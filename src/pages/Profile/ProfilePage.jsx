import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import fourSLogo from "../../assets/logo-4s.png";
import globeIcon from "../../assets/Globe.svg";

const SKILL_KEYS = [
  { id: "creativity", value: 75 },
  { id: "logic", value: 90 },
  { id: "communication", value: 80 },
  { id: "leadership", value: 70 },
  { id: "problemSolving", value: 95 },
  { id: "teamwork", value: 85 },
];

const INTEREST_KEYS = [
  "software",
  "dataScience",
  "ai",
  "businessAnalytics",
  "finance",
  "marketing",
  "medicine",
  "law",
  "education",
  "engineering",
  "design",
  "arts",
];

function ProfilePage() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.resolvedLanguage === "vi" ? "vi" : "en";

  const [form, setForm] = useState({
    fullName: "Nguyen Van A",
    email: "nguyenvana@email.com",
    phone: "+84 912 345 678",
    birthYear: "2005",
    currentGrade: "grade12",
    gpa: "8.5",
    mathScore: "85",
    englishScore: "80",
    scienceScore: "90",
    preferredLocation: "Ho Chi Minh City",
    maxTuition: "50",
    studyMode: "fullTime",
    language: "vietnamese",
  });
  const [selectedInterests, setSelectedInterests] = useState(["software", "ai"]);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredSkillId, setHoveredSkillId] = useState("");
  const [skillScores, setSkillScores] = useState(
    () =>
      SKILL_KEYS.reduce((acc, item) => {
        acc[item.id] = item.value;
        return acc;
      }, {}),
  );

  const skillRows = useMemo(
    () =>
      SKILL_KEYS.map((item) => ({
        id: item.id,
        value: skillScores[item.id] ?? 0,
        label: t(`profile:edit.skills.${item.id}`),
      })),
    [skillScores, t],
  );

  const currentGradeOptions = useMemo(
    () =>
      locale === "vi"
        ? [
            { value: "grade10", label: "Lớp 10" },
            { value: "grade11", label: "Lớp 11" },
            { value: "grade12", label: "Lớp 12" },
            { value: "gapYear", label: "Gap year" },
          ]
        : [
            { value: "grade10", label: "Grade 10" },
            { value: "grade11", label: "Grade 11" },
            { value: "grade12", label: "Grade 12" },
            { value: "gapYear", label: "Gap year" },
          ],
    [locale],
  );

  const studyModeOptions = useMemo(
    () =>
      locale === "vi"
        ? [
            { value: "fullTime", label: "Toàn thời gian" },
            { value: "partTime", label: "Bán thời gian" },
            { value: "online", label: "Trực tuyến" },
            { value: "hybrid", label: "Kết hợp" },
          ]
        : [
            { value: "fullTime", label: "Full-time" },
            { value: "partTime", label: "Part-time" },
            { value: "online", label: "Online" },
            { value: "hybrid", label: "Hybrid" },
          ],
    [locale],
  );

  const instructionLanguageOptions = useMemo(
    () =>
      locale === "vi"
        ? [
            { value: "vietnamese", label: "Tiếng Việt" },
            { value: "english", label: "Tiếng Anh" },
            { value: "bilingual", label: "Song ngữ" },
            { value: "japanese", label: "Tiếng Nhật" },
          ]
        : [
            { value: "vietnamese", label: "Vietnamese" },
            { value: "english", label: "English" },
            { value: "bilingual", label: "Bilingual" },
            { value: "japanese", label: "Japanese" },
          ],
    [locale],
  );

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(id) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function updateSkillScore(id, value) {
    setSkillScores((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  }

  function handleSave() {
    setHoveredSkillId("");
    setIsEditing(false);
    toast.success(t("profile:edit.saveSuccess"));
  }

  function handleLanguageChange(language) {
    i18n.changeLanguage(language);
  }

  function handleStartEdit() {
    setHoveredSkillId("");
    setIsEditing(true);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_22%_16%,rgba(255,201,58,0.09),transparent_34%),radial-gradient(circle_at_75%_28%,rgba(15,226,168,0.1),transparent_35%),linear-gradient(160deg,#031124_0%,#071a35_40%,#041224_100%)] text-[#eaf2ff]">
      <header className="border-b border-white/10 bg-[#1d3551]/95">
        <div className="mx-auto flex w-[min(1360px,96vw)] items-center justify-between gap-4 px-1 py-3">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
              onClick={() => navigate(-1)}
              type="button"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path d="M15 5 8 12l7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <img alt="4S logo" className="h-18 w-18 object-contain" src={fourSLogo} />
            <div>
              <h1 className="font-['Sora'] text-xl font-semibold">{t("profile:edit.title")}</h1>
              <p className="text-sm text-slate-300">{t("profile:edit.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
              <img alt="" aria-hidden="true" className="ml-2 mr-1 h-4 w-4 opacity-70" src={globeIcon} />
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${locale === "en" ? "bg-white/15 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                onClick={() => handleLanguageChange("en")}
                type="button"
              >
                EN
              </button>
              <button
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${locale === "vi" ? "bg-white/15 text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
                onClick={() => handleLanguageChange("vi")}
                type="button"
              >
                VI
              </button>
            </div>
            <button
              className="rounded-xl border border-[#0ed8ab]/35 bg-[#0ed8ab]/15 px-4 py-2 text-sm font-semibold text-[#0ed8ab] transition hover:bg-[#0ed8ab]/25"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              {t("profile:edit.openDashboard")}
            </button>
            {isEditing ? (
              <button
                className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2 text-sm font-bold text-[#082339] transition hover:brightness-110"
                onClick={handleSave}
                type="button"
              >
                {t("profile:edit.saveChanges")}
              </button>
            ) : (
              <button
                className="rounded-xl border border-[#ecc741]/45 bg-[#ecc741]/14 px-4 py-2 text-sm font-semibold text-[#f3d459] transition hover:bg-[#ecc741]/24"
                onClick={handleStartEdit}
                type="button"
              >
                {t("profile:edit.editProfile")}
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto w-[min(1120px,94vw)] py-7">
        <div className="space-y-5">
          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <h2 className="mb-4 font-['Sora'] text-xl font-semibold">{t("profile:edit.sections.personal")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.fullName")} onChange={(value) => updateField("fullName", value)} value={form.fullName} />
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.email")} onChange={(value) => updateField("email", value)} type="email" value={form.email} />
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.phone")} onChange={(value) => updateField("phone", value)} value={form.phone} />
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.birthYear")} onChange={(value) => updateField("birthYear", value)} value={form.birthYear} />
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <h2 className="mb-4 font-['Sora'] text-xl font-semibold">{t("profile:edit.sections.academic")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldSelect
                disabled={!isEditing}
                label={t("profile:edit.fields.currentGrade")}
                onChange={(value) => updateField("currentGrade", value)}
                options={currentGradeOptions}
                value={form.currentGrade}
              />
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.gpa")} onChange={(value) => updateField("gpa", value)} value={form.gpa} />
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.mathScore")} onChange={(value) => updateField("mathScore", value)} value={form.mathScore} />
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.englishScore")} onChange={(value) => updateField("englishScore", value)} value={form.englishScore} />
              <div className="md:col-span-1">
                <FieldInput disabled={!isEditing} label={t("profile:edit.fields.scienceScore")} onChange={(value) => updateField("scienceScore", value)} value={form.scienceScore} />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <h2 className="mb-4 font-['Sora'] text-xl font-semibold">{t("profile:edit.sections.skills")}</h2>
            <div className="space-y-4">
              {skillRows.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold text-[#0ed8ab]">{item.value}/100</span>
                  </div>
                  {isEditing ? (
                    <input
                      className={`mt-2 h-2 w-full cursor-pointer appearance-none rounded-full 
                      [&::-webkit-slider-runnable-track]:h-2
                      [&::-webkit-slider-runnable-track]:rounded-full
                      [&::-webkit-slider-runnable-track]:bg-transparent
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:duration-150
                      [&::-moz-range-track]:h-2
                      [&::-moz-range-track]:rounded-full
                      [&::-moz-range-track]:bg-transparent
                      [&::-moz-range-thumb]:transition-all
                      [&::-moz-range-thumb]:duration-150
                      ${
                        hoveredSkillId === item.id
                          ? "[&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#15d4b0] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#0f9e87] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_rgba(21,212,176,0.18)] [&::-webkit-slider-thumb]:opacity-100 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#15d4b0] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:opacity-100"
                          : "[&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-transparent [&::-webkit-slider-thumb]:shadow-none [&::-webkit-slider-thumb]:opacity-0 [&::-moz-range-thumb]:h-0 [&::-moz-range-thumb]:w-0 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-moz-range-thumb]:opacity-0"
                      }`}
                      onMouseEnter={() => setHoveredSkillId(item.id)}
                      onMouseLeave={() => setHoveredSkillId("")}
                      onFocus={() => setHoveredSkillId(item.id)}
                      onBlur={() => setHoveredSkillId("")}
                      max={100}
                      min={0}
                      onChange={(event) => updateSkillScore(item.id, event.target.value)}
                      step={1}
                      style={{
                        background: `linear-gradient(to right, #15d4b0 0%, #15d4b0 ${item.value}%, rgba(255,255,255,0.12) ${item.value}%, rgba(255,255,255,0.12) 100%)`,
                      }}
                      type="range"
                      value={item.value}
                    />
                  ) : (
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/12">
                      <span
                        className="block h-full rounded-full bg-[#15d4b0]"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <h2 className="font-['Sora'] text-xl font-semibold">{t("profile:edit.sections.interests")}</h2>
            <p className="mt-2 text-sm text-slate-300">{t("profile:edit.interestHint")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INTEREST_KEYS.map((id) => {
                const active = selectedInterests.includes(id);
                return (
                  <button
                    disabled={!isEditing}
                    key={id}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/16 text-[#0ed8ab]"
                        : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    } ${!isEditing ? "cursor-not-allowed opacity-70" : ""}`}
                    onClick={() => toggleInterest(id)}
                    type="button"
                  >
                    {t(`profile:edit.interests.${id}`)}
                  </button>
                );
              })}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[#203a59]/88 p-5 md:p-6">
            <h2 className="mb-4 font-['Sora'] text-xl font-semibold">{t("profile:edit.sections.preferences")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldInput
                disabled={!isEditing}
                label={t("profile:edit.fields.preferredLocation")}
                onChange={(value) => updateField("preferredLocation", value)}
                value={form.preferredLocation}
              />
              <FieldInput disabled={!isEditing} label={t("profile:edit.fields.maxTuition")} onChange={(value) => updateField("maxTuition", value)} value={form.maxTuition} />
              <FieldSelect
                disabled={!isEditing}
                label={t("profile:edit.fields.studyMode")}
                onChange={(value) => updateField("studyMode", value)}
                options={studyModeOptions}
                value={form.studyMode}
              />
              <FieldSelect
                disabled={!isEditing}
                label={t("profile:edit.fields.language")}
                onChange={(value) => updateField("language", value)}
                options={instructionLanguageOptions}
                value={form.language}
              />
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

function FieldInput({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        className={`w-full rounded-xl border border-white/12 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 ${
          disabled
            ? "cursor-default bg-white/4"
            : "bg-white/6 focus:border-[#ecc741] focus:outline-none"
        }`}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        readOnly={disabled}
        type={type}
        value={value}
      />
    </div>
  );
}

function FieldSelect({ label, value, onChange, options, disabled = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <select
        className={`w-full rounded-xl border border-white/12 px-3 py-2.5 text-sm text-slate-100 ${
          disabled
            ? "cursor-default bg-white/4"
            : "bg-white/6 focus:border-[#ecc741] focus:outline-none"
        }`}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option
            className="bg-[#203a59] text-slate-100"
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProfilePage;
