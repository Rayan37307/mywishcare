import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'

// Constants
import { ROUTES } from '../constants/routes'
import { FaTiktok } from 'react-icons/fa'

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
              <li><Link to={ROUTES.COLLECTIONS_BESTSELLERS}>Bestsellers</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_SUN_CARE}>Sun Care</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_LIP_BALM}>Lip Balm</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_HAIRFALL}>Hairfall</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_HAIR_CARE_1}>Hair Care 1</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_ACNE}>Acne & Acne Marks</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_PIGMENTATION}>Pigmentation</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_DULL_SKIN}>Dull Skin</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_DETAN}>Detan</Link></li>
              <li><Link to={ROUTES.COLLECTIONS_DAMAGED_HAIR}>Damaged Hair</Link></li>
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
              <li><Link to={ROUTES.POLICIES_TERMS}>Terms Of Service</Link></li>
              <li><Link to={ROUTES.POLICIES_PRIVACY}>Privacy Policy</Link></li>
              <li><Link to={ROUTES.POLICIES_SHIPPING}>Shipping Policy</Link></li>
              <li><Link to={ROUTES.POLICIES_REFUND}>Refund Policy</Link></li>
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
              <li><Link to={ROUTES.PAGES_ABOUT}>About Us</Link></li>
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
                Mohakhali Dhaka, Dhaka, Bangladesh, 1206
              </p>
              <p className="pb-2">
                <a href="tel:+8801921521717" className="underline">+8801921521717</a>
              </p>
              <p>
                <a href="mailto:hello@wishcarebd.com" className="underline">hello@wishcarebd.com</a>
              </p>
            </div>
          </FooterSection>

        </div>

        {/* Social Icons */}
        <div className="text-gray-300 gap-6 text-xl flex py-10">
          <a href="https://www.facebook.com/wishcarebd/" target="_blank" rel="noopener noreferrer">
            <svg aria-hidden="true" focusable="false" width="24" className="icon icon-facebook" viewBox="0 0 24 24">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M10.183 21.85v-8.868H7.2V9.526h2.983V6.982a4.17 4.17 0 0 1 4.44-4.572 22.33 22.33 0 0 1 2.667.144v3.084h-1.83a1.44 1.44 0 0 0-1.713 1.68v2.208h3.423l-.447 3.456h-2.97v8.868h-3.57Z" fill="currentColor"></path>
    </svg>
          </a>
          <a href="https://www.instagram.com/wishcarebd/" target="_blank" rel="noopener noreferrer">
            <svg aria-hidden="true" focusable="false" width="24" className="icon icon-instagram" viewBox="0 0 24 24">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.4c-2.607 0-2.934.011-3.958.058-1.022.046-1.72.209-2.33.446a4.705 4.705 0 0 0-1.7 1.107 4.706 4.706 0 0 0-1.108 1.7c-.237.611-.4 1.31-.446 2.331C2.41 9.066 2.4 9.392 2.4 12c0 2.607.011 2.934.058 3.958.046 1.022.209 1.72.446 2.33a4.706 4.706 0 0 0 1.107 1.7c.534.535 1.07.863 1.7 1.108.611.237 1.309.4 2.33.446 1.025.047 1.352.058 3.959.058s2.934-.011 3.958-.058c1.022-.046 1.72-.209 2.33-.446a4.706 4.706 0 0 0 1.7-1.107 4.706 4.706 0 0 0 1.108-1.7c.237-.611.4-1.31.446-2.33.047-1.025.058-1.352.058-3.959s-.011-2.934-.058-3.958c-.047-1.022-.209-1.72-.446-2.33a4.706 4.706 0 0 0-1.107-1.7 4.705 4.705 0 0 0-1.7-1.108c-.611-.237-1.31-.4-2.331-.446C14.934 2.41 14.608 2.4 12 2.4Zm0 1.73c2.563 0 2.867.01 3.88.056.935.042 1.443.199 1.782.33.448.174.768.382 1.104.718.336.336.544.656.718 1.104.131.338.287.847.33 1.783.046 1.012.056 1.316.056 3.879 0 2.563-.01 2.867-.056 3.88-.043.935-.199 1.444-.33 1.782a2.974 2.974 0 0 1-.719 1.104 2.974 2.974 0 0 1-1.103.718c-.339.131-.847.288-1.783.33-1.012.046-1.316.056-3.88.056-2.563 0-2.866-.01-3.878-.056-.936-.042-1.445-.199-1.783-.33a2.974 2.974 0 0 1-1.104-.718 2.974 2.974 0 0 1-.718-1.104c-.131-.338-.288-.847-.33-1.783-.047-1.012-.056-1.316-.056-3.879 0-2.563.01-2.867.056-3.88.042-.935.199-1.443.33-1.782.174-.448.382-.768.718-1.104a2.974 2.974 0 0 1 1.104-.718c.338-.131.847-.288 1.783-.33C9.133 4.14 9.437 4.13 12 4.13Zm0 11.07a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm0-8.13a4.93 4.93 0 1 0 0 9.86 4.93 4.93 0 0 0 0-9.86Zm6.276-.194a1.152 1.152 0 1 1-2.304 0 1.152 1.152 0 0 1 2.304 0Z" fill="currentColor"></path>
    </svg>
          </a>
          <Link to={"https://www.tiktok.com/@wishcarebd?_r=1&_t=ZS-92KB9DHPLxF"}>
          <FaTiktok />
          </Link>
        </div>

        <div className="text-[12px] font-bold text-gray-300">@2025 - WishCare BD</div>
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


