const Aboutus = () => {
  return (
    <div className="w-full min-h-screen">
      {/* Fullwidth images */}
      <img src="/about1.webp" className="w-full h-auto" alt="" />
      <img src="/about6.webp" className="w-full h-auto" alt="" />
      <img src="/about2.webp" className="w-full h-auto" alt="" />
      <img src="/about3.webp" className="w-full h-auto" alt="" />
      <img src="/about4.webp" className="w-full h-auto" alt="" />
      <img src="/about5.webp" className="w-full h-auto" alt="" />

      {/* Founder's note section */}
      <div className="w-full bg-[#DBD3FF] flex flex-col md:flex-row items-center md:items-start py-8 px-6 md:px-16 gap-6">
        {/* Images */}
        <div className="relative flex justify-center items-center w-full md:w-1/2">
          <img src="/abouthero1.webp" alt="" className="w-60 sm:w-72 md:w-80 h-auto" />
          <img
            src="/abouthero2.webp"
            alt=""
            className="absolute -right-4 sm:-right-6 md:-right-7 w-48 sm:w-56 md:w-64 h-auto"
          />
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2 flex flex-col justify-start px-4 sm:px-8 md:px-10">
          <h3 className="text-lg sm:text-xl md:text-2xl text-black uppercase font-semibold mb-4">
            Founder's Note
          </h3>
          <p className="text-sm sm:text-base md:text-base text-gray-800 max-w-full sm:max-w-[300px]">
            We run WishCare passionately along with a young, enthusiastic team who believes in
            the ethos of science-forward selfcare solutions. The DNA of the brand is reflected
            in our culture - innovative, multipurpose and accessible. We are excited about
            building a one-of-a-kind holistic beauty brand for India that focuses on formulating
            skinimalism routines for the busy individuals who are in search of effective
            skincare and haircare products. I would be so thrilled to see you join in the
            journey of effective & no nonsense selfcare!
          </p>
        </div>
      </div>

      {/* Remaining fullwidth images */}
      <img src="/about7.webp" className="w-full h-auto" alt="" />
      <img src="/about8.webp" className="w-full h-auto" alt="" />
    </div>
  );
};

export default Aboutus;
