import { BsYoutube } from 'react-icons/bs'
import { FaFacebook } from 'react-icons/fa'
import { ImInstagram } from 'react-icons/im'

const Footer = () => {
  return (
    <div className='mt-20 bg-[#373737] text-white py-8 rounded-t-2xl'>
        <div className='container mx-auto'>
            <div className='flex items-start justify-between flex-wrap px-4'>
            <div>
                <h3 className='text-sm font-semibold mb-5'>Shop</h3>
                <ul className='text-[14px] space-y-2 text-gray-300'>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                </ul>
            </div>
            <div>
                <h3 className='text-sm  font-semibold mb-5'>Ploices</h3>
                <ul className='text-[14px] space-y-2 text-gray-300'>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                    <li>Link</li>
                </ul>
            </div>
            <div>
                <h3 className='text-sm font-semibold mb-5'>know more</h3>
                 <ul className='text-[14px] space-y-2 text-gray-300'>
                    <li>Link</li>
                </ul>
            </div>
            <div>
                <h3 className='text-sm font-semibold mb-1 py-4'>about</h3>
                <div className='text-gray-300 space-y-2'>
                    <p className='max-w-80'>Rabiko Lifestyle Private Limited <br />
GodrejGenesis, Unit No. 1609, Sector 5, Saltlake, West Bengal - 700091</p>
                <p className='pb-8'>982018201</p>
                <a href="" className='underline'>euhdeud@gjs.oj</a>
                </div>

            </div>
        </div>
        <div className='text-gray-300 gap-4 text-xl flex py-8'>
            <FaFacebook/> <ImInstagram/> <BsYoutube/>
        </div>
        <div className='text-[12px] font-bold text-gray-300 text-start'>@2025 - MyWishCare</div>
        </div>
    </div>
  )
}

export default Footer