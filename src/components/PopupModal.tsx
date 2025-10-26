// src/components/PopupModal.tsx
import React from 'react';

interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PopupModal: React.FC<PopupModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md w-10 h-10 flex items-center justify-center backdrop-blur-md border border-gray-200 transition"
      >
        ✕
      </button>

      {/* Modal Box */}
      <div className="bg-[#F8F4FF] p-6 backdrop-blur-[50px] rounded-lg w-full max-w-[400px] overflow-hidden flex flex-col">
        {/* Content Area */}
        <div className="flex-1 flex justify-center">
          <div className="w-full h-full rounded-lg flex justify-start items-center flex-col">
            <div>
              <p className="text-center font-black text-gray-600 text-4xl mt-5">
                Super Sunday Sale
              </p>
              <p className="text-center font-black text-black uppercase text-5xl mt-3 mb-5">
                flat 50% off
              </p>
            </div>

            {/* Phone Input Section */}
            <div className="flex items-center w-full bg-white border border-black rounded-md overflow-hidden shadow-sm">
              {/* Flag + Code */}
              <div className="flex items-center px-3 gap-2">
                <img
                  src="https://flagcdn.com/w20/in.png"
                  alt="India Flag"
                  className="w-5 h-5 object-cover rounded-sm"
                />
                <span className="text-gray-700 font-medium">+91</span>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-black mx-2"></div>

              {/* Input */}
              <input
                type="tel"
                className="flex-1 px-3 py-2 bg-transparent outline-none text-black placeholder-gray-400"
                placeholder="Enter Mobile Number"
                maxLength={10}
              />
            </div>
            <button className='w-full text-center text-2xl text-black font-bold bg-[#D4F871] py-2 rounded-md mt-4 border-1 border-black'>Use Code:FLAT50</button>
            <p className='text-center mt-10 text-semibold text-xl mb-5 font-bold cursor-pointer' onClick={onClose}>No, Thanks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
