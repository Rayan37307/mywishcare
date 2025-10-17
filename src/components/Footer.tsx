import { Link } from 'react-router-dom'
import { BsYoutube } from 'react-icons/bs'
import { FaFacebook } from 'react-icons/fa'
import { ImInstagram } from 'react-icons/im'

const Footer = () => {
  return (
    <div className='bg-[#373737] text-white py-8 rounded-t-2xl'>
      <div className='lg:px-10 md:px-8 sm:px-6 px-4'>
        <div className='flex items-start justify-between flex-wrap max-lg:px-4'>
          
          <div>
            <h3 className='text-sm font-semibold mb-5'>Shop</h3>
            <ul className='text-[14px] space-y-2 text-gray-300'>
              <li><Link to="/collections/bestsellers">Bestsellers</Link></li>
              <li><Link to="/collections/sun-care">Sun Care</Link></li>
              <li><Link to="/hairfall">Hairfall</Link></li>
              <li><Link to="/acne">Acne & Acne Marks</Link></li>
              <li><Link to="/pigmentation">Pigmentation</Link></li>
              <li><Link to="/dull-skin">Dull Skin</Link></li>
              <li><Link to="/detan">Detan</Link></li>
              <li><Link to="/damaged-hair">Damaged Hair</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className='text-sm font-semibold mb-5'>Policies</h3>
            <ul className='text-[14px] space-y-2 text-gray-300'>
              <li><Link to="/policies/terms-of-service">Terms Of Service</Link></li>
              <li><Link to="/policies/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/policies/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/policies/refund-policy">Refund Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className='text-sm font-semibold mb-5'>Know More</h3>
            <ul className='text-[14px] space-y-2 text-gray-300'>
              <li><Link to="/pages/about-us">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className='text-sm font-semibold mb-1 py-4'>About</h3>
            <div className='text-gray-300 space-y-2'>
              <p className='max-w-80'>
                Rabiko Lifestyle Private Limited <br />
                GodrejGenesis, Unit No. 1609, Sector 5, Saltlake, West Bengal - 700091
              </p>
              <p className='pb-2'><a href="tel:+918336833230" className='underline'>+91 83368 33230</a></p>
              <p><a href="mailto:hello@mywishcare.com" className='underline'>hello@mywishcare.com</a></p>
            </div>
          </div>

        </div>

        <div className='text-gray-300 gap-4 text-xl flex py-14'>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook/></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><ImInstagram/></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><BsYoutube/></a>
        </div>

        <div className='text-[12px] font-bold text-gray-300 text-start'>@2025 - MyWishCare</div>
      </div>
    </div>
  )
}

export default Footer
