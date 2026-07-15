"use client";

import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Youtube, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10 lg:px-16 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">MC</span>
              </div>
              <div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  মাদার কেয়ার
                </div>
                <p className="text-emerald-400 text-lg -mt-1">School & College</p>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-md text-[15px]">
              শিক্ষাই ভবিষ্যতের আলোর পথ। আধুনিক, নৈতিক ও মানসম্মত শিক্ষার নির্ভরযোগ্য প্রতিষ্ঠান।
            </p>

            <div className="mt-10 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>১৩ মাইল বাজার, কাহারোল থানা, দিনাজপুর জেলা</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>+880 17XX-XXXXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>info@mothercareschool.edu.bd</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-lg">দ্রুত লিংক</h4>
            <ul className="space-y-3.5 text-[15px]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">হোম</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">আমাদের সম্পর্কে</Link>
              </li>
              <li>
                <Link href="/admission" className="hover:text-white transition-colors">ভর্তি</Link>
              </li>
              <li>
                <Link href="/academic" className="hover:text-white transition-colors">একাডেমিক</Link>
              </li>
              <li>
                <Link href="/notice" className="hover:text-white transition-colors">নোটিশ</Link>
              </li>
            </ul>
          </div>

          {/* Academic */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-6 text-lg">একাডেমিক</h4>
            <ul className="space-y-3.5 text-[15px]">
              <li>
                <Link href="/programs" className="hover:text-white transition-colors">প্রোগ্রামসমূহ</Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-white transition-colors">শিক্ষকবৃন্দ</Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-white transition-colors">ফলাফল</Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors">একাডেমিক ক্যালেন্ডার</Link>
              </li>
              <li>
                <Link href="/facilities" className="hover:text-white transition-colors">সুবিধাসমূহ</Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold mb-6 text-lg">আমাদের সাথে যোগাযোগ</h4>

            <div className="flex gap-4">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: Instagram, href: "#", label: "Instagram" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="bg-slate-800 hover:bg-emerald-600 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            <div className="mt-12 text-xs text-slate-500 leading-relaxed">
              মাদার কেয়ার স্কুল অ্যান্ড কলেজ<br />
              প্রতিষ্ঠিত: ২০২৫<br />
              দিনাজপুর, বাংলাদেশ
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {year} Mother Care School & College. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              প্রাইভেসি পলিসি
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              ব্যবহারের শর্তাবলী
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;