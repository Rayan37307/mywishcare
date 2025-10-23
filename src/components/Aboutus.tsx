

const Aboutus = () => {
  return (
    <div className='w-full min-h-screen'>
        <img src="/about1.webp" className='w-full h-auto' alt="" />
        <img src="/about6.webp" className='w-full h-auto' alt="" />
        <img src="/about2.webp" className='w-full h-auto' alt="" />
        <img src="/about3.webp" className='w-full h-auto' alt="" />
        <img src="/about4.webp" className='w-full h-auto' alt="" />
        <img src="/about5.webp" className='w-full h-auto' alt="" />
        <div className='w-full bg-[#DBD3FF] flex'>
            <div className='relative  flex justify-center items-center  py-8 w-1/2'>
                <img src="/abouthero1.webp" alt="" className='w-80 h-auto'/>
                <img src="/abouthero2.webp" alt="" className='absolute -right-7 w-64 h-auto' />
            </div>
            <div className='w-1/2 flex justify-center items-start flex-col px-10 pl-20 '>
                <h3 className='text-xl text-black uppercase text-start font-semibold'>founder's note</h3>
                <p className='text-sm text-gray-800 text-start max-w-[300px]'>We run WishCare passionately alongwith a young, enthusiastic team who believes in the ethos of science-forward selfcare solutions. The DNA of the brand is reflected in our culture - innovative, multipurpose and accessible. We are excited about building a one-of-a-kind holistic beauty brand for India that focuses on formulating skinimalism routines for the busy individuals who are in search of effective skincare and haircare products. I would be so thrilled to see you join in the journey of effective & no nonsense selfcare!</p>
            </div>
        </div>
        <img src="/about7.webp" className='w-full h-auto' alt="" />
        <img src="/about8.webp" className='w-full h-auto' alt="" />
    </div>
  )
}

export default Aboutus