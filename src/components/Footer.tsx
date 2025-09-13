import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="mx-auto w-full max-w-screen-xl p-6 py-12 lg:py-16">
        <div className="md:flex md:justify-between">
          <div className="mb-8 md:mb-0">
            <a href="https://www.alertmeasap.com" className="flex items-center group">
              <span className="self-center text-3xl font-bold whitespace-nowrap text-white group-hover:text-green-400 transition-all duration-300">
                ALERT ME ASAP
              </span>
            </a>
            <p className="mt-4 text-white max-w-md text-sm leading-relaxed opacity-90">
              Get instant alerts for visa appointments, Amazon shifts, and more. Never miss an opportunity again.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 sm:gap-10 sm:grid-cols-4">
            {/* Our Services */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-green-400 tracking-wide">
                Our Services
              </h2>
              <ul className="text-white space-y-3">
                <li>
                  <a 
                    href="https://alertmeasap.com/usvisa" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>US Visa</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://alertmeasap.com/amazon" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Amazon Shifts</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-green-400 tracking-wide">
                Resources
              </h2>
              <ul className="text-white space-y-3">
                <li>
                  <a 
                    href="https://alertmeasap.com/contact" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Contact Us</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow me */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-green-400 tracking-wide">
                Follow Us
              </h2>
              <ul className="text-white space-y-3">
                <li>
                  <a 
                    href="https://youtube.com/@AlertMeASAP" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://tiktok.com/@alert_me_asap" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>TikTok</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://instagram.com/alertmeasap/" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Instagram</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://twitter.com/Harshilmevasa" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Twitter</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h2 className="mb-6 text-sm font-semibold uppercase text-green-400 tracking-wide">
                Legal
              </h2>
              <ul className="text-white space-y-3">
                <li>
                  <a 
                    href="https://www.freeprivacypolicy.com/live/707f1a4c-030b-4b80-96b6-69974909a414" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Privacy Policy</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="hover:text-green-400 hover:translate-x-1 transition-all duration-200"
                  >
                    Terms & Conditions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <hr className="my-8 border-slate-700 sm:mx-auto lg:my-12" />
        
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-white sm:text-center opacity-80">
            Copyright © 2025{' '}
            <a 
              href="https://www.alertmeasap.com" 
              className="hover:text-green-400 transition-colors duration-200 font-medium"
            >
              ALERT ME ASAP
            </a>
            . All rights reserved.
          </span>
          <span className="text-sm text-white sm:text-center mt-4 sm:mt-0 opacity-70">
            Made by{' '}
            <span className="hover:text-green-400 transition-colors cursor-pointer">
              Web3Templates
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
