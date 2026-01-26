import { Link } from 'react-router-dom'
import { FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-hpl-navy text-white mt-auto">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-hpl-maroon to-hpl-gold rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/HPL.png" 
                  alt="HPL Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <span className="text-white font-epic font-bold text-lg sm:text-xl hidden items-center justify-center">H</span>
              </div>
              <div>
                <h2 className="font-epic font-bold text-xl sm:text-2xl text-hpl-gold">HPL 2026</h2>
                <p className="text-xs sm:text-sm text-gray-400">Hostel Premier League</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md">
              The ultimate cricket battleground for AOT College hostels. 
              Where legends are born and rivalries are forged.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-epic font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-hpl-gold">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-sm">
              <li>
                <Link to="/teams" className="text-gray-400 hover:text-white transition-colors">
                  Teams
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-gray-400 hover:text-white transition-colors">
                  Matches
                </Link>
              </li>
              <li>
                <Link to="/points-table" className="text-gray-400 hover:text-white transition-colors">
                  Points Table
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-epic font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-hpl-gold">Connect</h3>
            <div className="flex gap-3 sm:gap-4">
              <a 
                href="#" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-hpl-gold transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-hpl-gold transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-hpl-gold transition-colors"
                aria-label="YouTube"
              >
                <FaYoutube className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 Hostel Premier League. AOT College.
          </p>
          <p className="text-gray-500 text-sm font-epic">
            "Where Legends Are Born"
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
