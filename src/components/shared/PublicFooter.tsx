"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Facebook, Youtube, Instagram } from "lucide-react";
import { motion } from "framer-motion";

const PublicFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0c1f1a] text-emerald-100/70">
      {/* Subtle top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Soft background glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-teal-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-screen-2xl px-6 pb-12 pt-16 md:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="mb-6 flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-500/30">
                <Image
                  src="/asset/mothercare.png"
                  alt="মাদার কেয়ার স্কুল অ্যান্ড কলেজ"
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>

              <div>
                <div className="text-2xl font-bold tracking-tight text-white">
                  মাদার কেয়ার
                </div>
                <p className="-mt-0.5 text-base text-emerald-400">
                  School & College
                </p>
              </div>
            </div>

            <p className="max-w-md text-[15px] leading-relaxed text-emerald-100/60">
              শিক্ষাই ভবিষ্যতের আলোর পথ। আধুনিক, নৈতিক ও মানসম্মত শিক্ষার
              নির্ভরযোগ্য প্রতিষ্ঠান।
            </p>

            <div className="mt-8 space-y-3.5 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                <span>১৩ মাইল বাজার, কাহারোল, দিনাজপুর</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                <span>+880 1718-533364</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-emerald-400" />
                <span className="break-all">
                  mothercareschoolandcollege416@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="mb-5 text-lg font-semibold text-white">দ্রুত লিংক</h4>
            <ul className="space-y-3 text-[15px]">
              {[
                { href: "/", label: "হোম" },
                { href: "/about", label: "আমাদের সম্পর্কে" },
                { href: "/admission", label: "ভর্তি তথ্য" },
                { href: "/result", label: "ফলাফল" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative inline-block transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-emerald-400 transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="lg:col-span-4">
            <h4 className="mb-5 text-lg font-semibold text-white">
              আমাদের সাথে যুক্ত থাকুন
            </h4>

            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Youtube, href: "#", label: "YouTube" },
                { icon: Instagram, href: "#", label: "Instagram" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.12, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-200/80 shadow-inner transition-colors duration-300 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-600/30"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>

            <div className="mt-10 text-xs leading-relaxed text-emerald-100/40">
              <p>মাদার কেয়ার স্কুল অ্যান্ড কলেজ</p>
              <p>প্রতিষ্ঠিত: ২০২৫ · দিনাজপুর, বাংলাদেশ</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-emerald-800/40 pt-8 text-xs text-emerald-100/40 md:flex-row">
          <p>© {year} Mother Care School & College. সর্বস্বত্ব সংরক্ষিত।</p>

          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="transition-colors duration-300 hover:text-emerald-200"
            >
              প্রাইভেসি পলিসি
            </Link>
            <Link
              href="/terms"
              className="transition-colors duration-300 hover:text-emerald-200"
            >
              ব্যবহারের শর্তাবলী
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;