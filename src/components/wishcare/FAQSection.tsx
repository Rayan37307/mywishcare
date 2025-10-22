import React from 'react';
import type { WishCareProductData, WishCareFAQ } from '../../types/product';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQSectionProps {
  wishCare?: WishCareProductData;
}

const FAQSection: React.FC<FAQSectionProps> = ({ wishCare }) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  if (!wishCare?.faqs || wishCare.faqs.length === 0) return null;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mb-8 w-full max-w-3xl mx-auto flex flex-col gap-3">
      {wishCare.faqs.map((faq: WishCareFAQ, index: number) => (
        <div
          key={index}
          className="border-3 border-[#EBE4FD] rounded-lg overflow-hidden"
        >
          <button
            className="w-full flex justify-between items-center px-4 py-3 text-left bg-gradient-to-r from-[#EAE5FD] to-[#E5ECFD] hover:from-[#E9E3FD] hover:to-[#E3EBFD] transition-colors"
            onClick={() => toggleFAQ(index)}
            aria-expanded={openIndex === index}
          >
            <span className="font-medium text-gray-800">{faq.q}</span>
            <span className="flex items-center justify-center w-8 h-8 bg-black rounded-full text-white">
              {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          {openIndex === index && (
            <div className="px-4 py-3 border-t border-[#EBE4FD] bg-gradient-to-r from-[#EAE5FD] to-[#E5ECFD]">
              <p className="text-gray-700">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
