import { Link } from "react-router-dom"


const Hero = () => {
   const problems = [
    { id: 3, name: 'Hair Fall', image: '/hairfall.webp', link: '/product-category/hairfall' },
    { id: 6, name: 'Sun Care', image: '/skincare.webp', link: '/product-category/sun-care' },
    { id: 5, name: 'Sculp Care', image: '/sculpcare.webp', link: "/product-category/hair-care-1" },
    { id: 2, name: 'De-tan', image: '/detan.webp' , link: '/product-category/detan' },
    { id: 1, name: 'Dandruff', image: '/dandruff.webp', link: '/product-category/dandruff' },
    { id: 4, name: 'Lip Care', image: '/lipcare.webp',  link: '/product-category/lip-balm' },
  ]

  return (
    <div className='w-full -mt-24 max-md:-mt-6'>
      {/* Video Section */}
      <div className='w-full flex justify-center items-center mb-8'>
        <div className='w-full'>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            src="/videos/hero.mp4" 
            className='w-full h-auto object-cover'
          />
        </div>
      </div>

      {/* Problems Grid */}
      <div className="w-full overflow-x-auto py-4 scroll-smooth scrollbar-hidden">
  <div className="flex gap-4">
    {problems.map((problem) => (
      <div 
        key={problem.id} 
        className="flex-1 min-w-[120px] max-w-[200px] flex flex-col items-center text-center"
      >
        <Link to={problem.link}>
        <img 
          src={problem.image} 
          alt={problem.name} 
          className='w-full h-auto object-cover rounded-xl mb-2'
        />
        </Link>
        <span className='text-sm md:text-base font-medium'>{problem.name}</span>
      </div>
    ))}
  </div>
</div>


    </div>
  )
}

export default Hero