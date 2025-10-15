import React from 'react'
import Hero from '../components/Hero'
import BannerSlider from '../components/BannerSlider'
import WhatsNew from '../components/WhatsNew'
import BestSellers from '../components/BestSellers'
import Science from '../components/Science'
import Features from '../components/Features'
import DisSlider from '../components/DisSlider'
import DisSlider1 from '../components/DisSlider1'

const Home = () => {
  return (
    <div>
      <Hero />
      <BestSellers />
      <BannerSlider />
      <WhatsNew />
      <Science/>
      <Features />
      <DisSlider />
      <DisSlider1 />
    </div>
  )
}

export default Home