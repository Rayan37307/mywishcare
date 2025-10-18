import React from 'react';
import type { WishCareProductData, WishCareFAQ } from '../../types/product';

interface FAQSectionProps {
  wishCare?: WishCareProductData;
}

const FAQSection: React.FC<FAQSectionProps> = ({ wishCare }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  if (!wishCare?.faqs || wishCare.faqs.length === 0) {
    return null;
  }

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-8 p-6 bg-cyan-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {wishCare.faqs.map((faq: WishCareFAQ, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full px-4 py-3 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
              onClick={() => toggleFAQ(index)}
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-gray-800">{faq.q}</span>
              <span className="ml-4 text-gray-500">
                {openIndex === index ? '−' : '+'}
              </span>
            </button>
            {openIndex === index && (
              <div className="px-4 py-3 bg-white border-t border-gray-200">
                <p className="text-gray-700">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;