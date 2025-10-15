import React from 'react'

const Hero = () => {
  const problems = [
    { id: 1, name: 'Dandruff', image: '/dandruff.webp' },
    { id: 2, name: 'De-tan', image: '/detan.webp' },
    { id: 3, name: 'Hair Fall', image: '/hairfall.webp' },
    { id: 4, name: 'Lip Care', image: '/lipcare.webp' },
    { id: 5, name: 'Sculp Care', image: '/sculpcare.webp' },
    { id: 6, name: 'Skin Care', image: '/skincare.webp' },
  ]

  return (
    <div className='w-full'>
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
        <img 
          src={problem.image} 
          alt={problem.name} 
          className='w-full h-auto object-cover rounded-xl mb-2'
        />
        <span className='text-sm md:text-base font-medium'>{problem.name}</span>
      </div>
    ))}
  </div>
</div>


    </div>
  )
}

export default Hero