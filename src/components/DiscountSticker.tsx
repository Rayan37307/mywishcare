

import { useState } from 'react';
import PopupModal from './PopupModal';
import { BsWhatsapp } from 'react-icons/bs';
// import { useNavigate } from 'react-router-dom';

const DiscountSticker = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // const navigate = useNavigate()

  // const handleOpenModal = () => {
  //   setIsModalOpen(true);
  // };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleWhatsappClick = () => {
    window.open('https://api.whatsapp.com/send?phone=8801921521717', '_blank');
  }

  return (
    <>
      <div 
        className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 cursor-pointer"
        style={{ 
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
        }}
        // onClick={handleOpenModal}
        onClick={handleWhatsappClick}
      >
        <div className="bg-white rounded-tr-[10px] rounded-br-[10px] text-lg max-md:text-sm font-bold py-4 max-md:py-2 max-md:px-4 px-6 rotate-180 text-center whitespace-nowrap">
          <div className="transform rotate-180 flex items-center justify-center gap-2"><span className='rotate-90'><BsWhatsapp /></span>Whatsapp</div>
        </div>
      </div>
      <PopupModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default DiscountSticker;
