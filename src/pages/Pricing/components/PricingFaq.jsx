import { useState } from 'react'

function PricingFaq({ faqItems, t }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  return (
    <section className="mt-24 max-w-4xl mx-auto reveal-on-scroll">
      <h2 className="font-display text-2xl font-extrabold text-white tracking-tight mb-8">
        {t('pricing:faqTitle', 'Câu hỏi thường gặp')}
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
                  isOpen ? 'max-h-45 border-t border-white/5' : 'max-h-0'
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
  )
}

export default PricingFaq
