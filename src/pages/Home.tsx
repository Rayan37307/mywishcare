import Hero from '../components/Hero'
import BannerSlider from '../components/BannerSlider'
import WhatsNew from '../components/WhatsNew'
import BestSellers from '../components/BestSellers'
import Science from '../components/Science'
import Features from '../components/Features'
import DisSlider from '../components/DisSlider'
import DisSlider1 from '../components/DisSlider1'
import CategoryHome from '../components/CategoryHome'

const Home = () => {
  return (
    <div className='container mx-auto max-w-7xl'>
      <Hero />
      <BestSellers />
      <BannerSlider />
      <WhatsNew />
      <Science/>
      <Features />
      <DisSlider />
      <DisSlider1 />
      <CategoryHome />
    </div>
  )
}

export default Home