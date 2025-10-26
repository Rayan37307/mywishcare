import Hero from '../components/Hero'
import BannerSlider from '../components/BannerSlider'
import WhatsNew from '../components/WhatsNew'
import RoutineBuilder from '../components/RoutineBuilder'
import BestSellers from '../components/BestSellers'
import Science from '../components/Science'
import Features from '../components/Features'
import DisSlider from '../components/DisSlider'
import DisSlider1 from '../components/DisSlider1'
import CategoryHome from '../components/CategoryHome'
import DiscountSticker from '../components/DiscountSticker'

const Home = () => {
  return (
    <div className='container mx-auto max-w-7xl max-lg:px-10'>
      <Hero />
      <BestSellers />
      <BannerSlider />
      <WhatsNew />
      <RoutineBuilder />
      <Science/>
      <Features />
      <DisSlider />
      <DisSlider1 />
      <CategoryHome />
      <DiscountSticker />
    </div>
  )
}

export default Home