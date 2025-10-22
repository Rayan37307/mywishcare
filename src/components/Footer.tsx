import { Link } from 'react-router-dom'
import { BsYoutube } from 'react-icons/bs'
import { FaFacebook } from 'react-icons/fa'
import { ImInstagram } from 'react-icons/im'
import { ChevronDown, ChevronUp } from 'lucide-react'
import React, { useState, useEffect } from 'react'

const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect screen size to disable collapse on larger devices
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSection = (section: string) => {
    if (!isMobile) return // only toggle on mobile
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <div className="bg-[#373737] text-white py-8 rounded-t-2xl">
      <div className="lg:px-10 md:px-8 sm:px-6 px-4">
        <div className="flex flex-wrap justify-between max-lg:px-4 divide-y divide-gray-600 sm:divide-none">
          
          <FooterSection
            title="Shop"
            name="shop"
            isMobile={isMobile}
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <ul className="text-[14px] space-y-2 text-gray-300">
              <li><Link to="/collections/bestsellers">Bestsellers</Link></li>
              <li><Link to="/collections/sun-care">Sun Care</Link></li>
              <li><Link to="/collections/hairfall">Hairfall</Link></li>
              <li><Link to="/collections/acne">Acne & Acne Marks</Link></li>
              <li><Link to="/collections/pigmentation">Pigmentation</Link></li>
              <li><Link to="/collections/dull-skin">Dull Skin</Link></li>
              <li><Link to="/collections/detan">Detan</Link></li>
              <li><Link to="/collections/damaged-hair">Damaged Hair</Link></li>
            </ul>
          </FooterSection>

          <FooterSection
            title="Policies"
            name="policies"
            isMobile={isMobile}
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <ul className="text-[14px] space-y-2 text-gray-300">
              <li><Link to="/policies/terms-of-service">Terms Of Service</Link></li>
              <li><Link to="/policies/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/policies/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/policies/refund-policy">Refund Policy</Link></li>
            </ul>
          </FooterSection>

          <FooterSection
            title="Know More"
            name="knowmore"
            isMobile={isMobile}
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <ul className="text-[14px] space-y-2 text-gray-300">
              <li><Link to="/pages/about-us">About Us</Link></li>
            </ul>
          </FooterSection>

          <FooterSection
            title="About"
            name="about"
            isMobile={isMobile}
            openSection={openSection}
            toggleSection={toggleSection}
          >
            <div className="text-gray-300 space-y-2">
              <p className="max-w-80">
                Rabiko Lifestyle Private Limited <br />
                GodrejGenesis, Unit No. 1609, Sector 5, Saltlake, West Bengal - 700091
              </p>
              <p className="pb-2">
                <a href="tel:+918336833230" className="underline">+91 83368 33230</a>
              </p>
              <p>
                <a href="mailto:hello@mywishcare.com" className="underline">hello@mywishcare.com</a>
              </p>
            </div>
          </FooterSection>

        </div>

        {/* Social Icons */}
        <div className="text-gray-300 gap-4 text-xl flex py-10">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><ImInstagram /></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"><BsYoutube /></a>
        </div>

        <div className="text-[12px] font-bold text-gray-300">@2025 - MyWishCare</div>
      </div>
    </div>
  )
}

interface FooterSectionProps {
  title: string
  name: string
  isMobile: boolean
  openSection: string | null
  toggleSection: (name: string) => void
  children: React.ReactNode
}

const FooterSection: React.FC<FooterSectionProps> = ({
  title,
  name,
  isMobile,
  openSection,
  toggleSection,
  children,
}) => {
  const isOpen = openSection === name

  return (
    <div className="w-full sm:w-auto sm:mb-6 py-4 sm:py-0">
      <button
        className={`flex items-center justify-between w-full ${
          isMobile ? 'cursor-pointer' : 'cursor-default mb-4'
        }`}
        onClick={() => toggleSection(name)}
      >
        <h3 className="text-sm font-semibold">{title}</h3>
        {isMobile && (
          <div>
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isMobile
            ? isOpen
              ? 'max-h-[500px] opacity-100 mt-3'
              : 'max-h-0 opacity-0'
            : 'max-h-none opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default Footer


