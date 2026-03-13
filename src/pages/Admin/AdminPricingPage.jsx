import { useMemo, useState } from "react";

const INITIAL_PACKAGES = [
  {
    id: "pkg-free",
    name: "Free",
    audience: "Individual Students",
    price: 0,
    currency: "VND",
    billingCycle: "month",
    trialDays: 0,
    status: "published",
    features: ["Basic profile", "University search", "Limited AI chat"],
  },
  {
    id: "pkg-pro",
    name: "Pro",
    audience: "Students Need Full Support",
    price: 99000,
    currency: "VND",
    billingCycle: "month",
    trialDays: 7,
    status: "published",
    features: ["Unlimited AI chat", "Guided quiz", "Priority consultation"],
  },
  {
    id: "pkg-edu",
    name: "Edu",
    audience: "Schools & Institutions",
    price: 2490000,
    currency: "VND",
    billingCycle: "year",
    trialDays: 14,
    status: "draft",
    features: ["Institution admin panel", "Bulk student analytics", "Dedicated support"],
  },
];

function AdminPricingPage() {
  const [packages, setPackages] = useState(INITIAL_PACKAGES);
  const [selectedPackageId, setSelectedPackageId] = useState(INITIAL_PACKAGES[0].id);
  const [featureDraft, setFeatureDraft] = useState("");
  const [globalTaxRate, setGlobalTaxRate] = useState(8);
  const [discountDraft, setDiscountDraft] = useState(15);

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId) ?? packages[0],
    [packages, selectedPackageId],
  );

  const publishedCount = useMemo(
    () => packages.filter((item) => item.status === "published").length,
    [packages],
  );

  function updateSelectedPackage(key, value) {
    setPackages((prev) =>
      prev.map((item) =>
        item.id === selectedPackageId
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  }

  function handleAddFeature() {
    const content = featureDraft.trim();
    if (!content) {
      return;
    }

    setPackages((prev) =>
      prev.map((item) =>
        item.id === selectedPackageId
          ? {
              ...item,
              features: [...item.features, content],
            }
          : item,
      ),
    );
    setFeatureDraft("");
  }

  function removeFeature(indexToRemove) {
    setPackages((prev) =>
      prev.map((item) =>
        item.id === selectedPackageId
          ? {
              ...item,
              features: item.features.filter((_, index) => index !== indexToRemove),
            }
          : item,
      ),
    );
  }

  function createPackage() {
    const id = `pkg-${String(Date.now()).slice(-6)}`;
    const newPackage = {
      id,
      name: "New Package",
      audience: "Custom Audience",
      price: 0,
      currency: "VND",
      billingCycle: "month",
      trialDays: 0,
      status: "draft",
      features: ["New feature"],
    };

    setPackages((prev) => [newPackage, ...prev]);
    setSelectedPackageId(id);
  }

  function duplicatePackage() {
    if (!selectedPackage) {
      return;
    }

    const id = `pkg-${String(Date.now()).slice(-6)}`;
    setPackages((prev) => [
      {
        ...selectedPackage,
        id,
        name: `${selectedPackage.name} Copy`,
        status: "draft",
      },
      ...prev,
    ]);
    setSelectedPackageId(id);
  }

  function deleteSelectedPackage() {
    if (!selectedPackage || packages.length <= 1) {
      return;
    }

    const isConfirmed = window.confirm(
      `Delete package "${selectedPackage.name}"? This action is UI-only and cannot be undone.`,
    );

    if (!isConfirmed) {
      return;
    }

    const remainingPackages = packages.filter((item) => item.id !== selectedPackage.id);
    setPackages(remainingPackages);
    setSelectedPackageId(remainingPackages[0]?.id ?? "");
    setFeatureDraft("");
  }

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-[#153251]/82 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-['Sora'] text-2xl font-semibold md:text-3xl">Pricing Management</h2>
            <p className="mt-2 text-sm text-slate-300 md:text-base">
              UI for editing package price, billing cycle, trial days, and feature list.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/12"
              onClick={duplicatePackage}
              type="button"
            >
              Duplicate Package
            </button>
            <button
              className="rounded-xl bg-gradient-to-r from-[#19d2ad] to-[#0fbc98] px-4 py-2 text-sm font-bold text-[#082339] transition hover:brightness-110"
              onClick={createPackage}
              type="button"
            >
              + New Package
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Packages" value={String(packages.length)} valueClass="text-[#e8f2ff]" />
        <StatCard label="Published" value={String(publishedCount)} valueClass="text-[#0ed8ab]" />
        <StatCard label="Draft" value={String(packages.length - publishedCount)} valueClass="text-[#f3d459]" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[350px_minmax(0,1fr)]">
        <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-['Sora'] text-lg font-semibold">Packages</h3>
            <span className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-xs text-slate-300">
              UI local state
            </span>
          </div>

          <div className="space-y-3">
            {packages.map((item) => {
              const selected = item.id === selectedPackageId;
              return (
                <button
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-[#0ed8ab]/45 bg-[#0ed8ab]/14"
                      : "border-white/10 bg-[#10253e]/72 hover:bg-[#10253e]"
                  }`}
                  key={item.id}
                  onClick={() => setSelectedPackageId(item.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.audience}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                        item.status === "published"
                          ? "border border-[#0ed8ab]/45 bg-[#0ed8ab]/16 text-[#0ed8ab]"
                          : "border border-[#ecc741]/45 bg-[#ecc741]/16 text-[#f3d459]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">
                    {formatPrice(item.price, item.currency)} / {item.billingCycle}
                  </p>
                </button>
              );
            })}
          </div>
        </article>

        {selectedPackage ? (
          <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-['Sora'] text-xl font-semibold">Edit Package</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Changes are local in UI, no backend call.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                    selectedPackage.status === "published"
                      ? "border-[#ecc741]/45 bg-[#ecc741]/14 text-[#f3d459] hover:bg-[#ecc741]/24"
                      : "border-[#0ed8ab]/40 bg-[#0ed8ab]/14 text-[#0ed8ab] hover:bg-[#0ed8ab]/22"
                  }`}
                  onClick={() =>
                    updateSelectedPackage(
                      "status",
                      selectedPackage.status === "published" ? "draft" : "published",
                    )
                  }
                  type="button"
                >
                  {selectedPackage.status === "published" ? "Unpublish" : "Publish"}
                </button>
                <button
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                    packages.length <= 1
                      ? "cursor-not-allowed border-white/12 bg-white/5 text-slate-500"
                      : "border-rose-400/45 bg-rose-500/14 text-rose-300 hover:bg-rose-500/24"
                  }`}
                  disabled={packages.length <= 1}
                  onClick={deleteSelectedPackage}
                  type="button"
                >
                  Delete Package
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Keep at least one package in the list.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <TextField
                label="Package Name"
                onChange={(value) => updateSelectedPackage("name", value)}
                value={selectedPackage.name}
              />
              <TextField
                label="Audience"
                onChange={(value) => updateSelectedPackage("audience", value)}
                value={selectedPackage.audience}
              />
              <TextField
                label="Price"
                onChange={(value) => updateSelectedPackage("price", Number(value))}
                type="number"
                value={selectedPackage.price}
              />
              <SelectField
                label="Currency"
                onChange={(value) => updateSelectedPackage("currency", value)}
                options={[
                  { label: "VND", value: "VND" },
                  { label: "USD", value: "USD" },
                ]}
                value={selectedPackage.currency}
              />
              <SelectField
                label="Billing Cycle"
                onChange={(value) => updateSelectedPackage("billingCycle", value)}
                options={[
                  { label: "Monthly", value: "month" },
                  { label: "Quarterly", value: "quarter" },
                  { label: "Yearly", value: "year" },
                ]}
                value={selectedPackage.billingCycle}
              />
              <TextField
                label="Trial Days"
                onChange={(value) => updateSelectedPackage("trialDays", Number(value))}
                type="number"
                value={selectedPackage.trialDays}
              />
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-[#10253e]/72 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-semibold text-slate-100">Features</h4>
                <p className="text-xs text-slate-400">
                  {selectedPackage.features.length} feature(s)
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
                  onChange={(event) => setFeatureDraft(event.target.value)}
                  placeholder="Add feature..."
                  type="text"
                  value={featureDraft}
                />
                <button
                  className="rounded-xl border border-[#0ed8ab]/40 bg-[#0ed8ab]/14 px-3 py-2 text-sm font-semibold text-[#0ed8ab] transition hover:bg-[#0ed8ab]/22"
                  onClick={handleAddFeature}
                  type="button"
                >
                  Add
                </button>
              </div>

              <ul className="mt-3 space-y-2">
                {selectedPackage.features.map((feature, index) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                    key={`${feature}-${index}`}
                  >
                    <span className="text-sm text-slate-200">{feature}</span>
                    <button
                      className="rounded-md border border-[#ecc741]/45 bg-[#ecc741]/14 px-2 py-1 text-xs font-semibold text-[#f3d459] transition hover:bg-[#ecc741]/24"
                      onClick={() => removeFeature(index)}
                      type="button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <TextField
                label="Global Tax Rate (%)"
                onChange={(value) => setGlobalTaxRate(Number(value))}
                type="number"
                value={globalTaxRate}
              />
              <TextField
                label="Promo Discount (%)"
                onChange={(value) => setDiscountDraft(Number(value))}
                type="number"
                value={discountDraft}
              />
            </div>

            <div className="mt-5 rounded-xl border border-[#7f8cff]/30 bg-[#7f8cff]/12 p-4">
              <p className="text-sm text-[#c7ceff]">
                Preview final monthly charge (tax + discount):
              </p>
              <p className="mt-1 font-['Sora'] text-2xl font-semibold text-white">
                {formatPrice(
                  getPreviewPrice(selectedPackage.price, globalTaxRate, discountDraft),
                  selectedPackage.currency,
                )}
              </p>
            </div>
          </article>
        ) : null}
      </section>
    </section>
  );
}

function StatCard({ label, value, valueClass }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#183452]/82 p-4 md:p-5">
      <p className="text-sm text-slate-300">{label}</p>
      <p className={`mt-2 font-['Sora'] text-3xl font-semibold ${valueClass}`}>{value}</p>
    </article>
  );
}

function TextField({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-slate-300">{label}</p>
      <input
        className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#ecc741] focus:outline-none"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-slate-300">{label}</p>
      <select
        className="w-full rounded-xl border border-white/12 bg-white/6 px-3 py-2.5 text-sm text-slate-100 focus:border-[#ecc741] focus:outline-none"
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

function getPreviewPrice(basePrice, taxRate, discountRate) {
  const safeBase = Number.isFinite(basePrice) ? Math.max(basePrice, 0) : 0;
  const safeTax = Number.isFinite(taxRate) ? Math.max(taxRate, 0) : 0;
  const safeDiscount = Number.isFinite(discountRate) ? Math.max(discountRate, 0) : 0;

  const withTax = safeBase + (safeBase * safeTax) / 100;
  const withDiscount = withTax - (withTax * safeDiscount) / 100;
  return Math.round(withDiscount);
}

function formatPrice(value, currency) {
  const safeValue = Number.isFinite(value) ? value : 0;
  if (currency === "USD") {
    return `$${safeValue.toLocaleString("en-US")}`;
  }
  return `${safeValue.toLocaleString("vi-VN")} ${currency}`;
}

export default AdminPricingPage;
