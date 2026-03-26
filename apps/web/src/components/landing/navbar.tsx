"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#features", label: "Fonctionnalités" },
  { href: "#how-it-works", label: "Comment ça marche" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#testimonials", label: "Avis" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
          <span className="text-3xl">🐾</span>
          <span className="gradient-text">Petoo</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-petoo-500 transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-petoo-500 transition-colors px-3 py-2"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold bg-petoo-500 hover:bg-petoo-600 text-white px-4 py-2 rounded-full transition-all hover:shadow-lg hover:shadow-petoo-500/30 active:scale-95"
          >
            Essai gratuit
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-base font-medium text-gray-700 hover:text-petoo-500 transition-colors py-1"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Link href="/login" className="text-center text-sm font-medium text-gray-700 py-2">
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-center text-sm font-semibold bg-petoo-500 text-white py-3 rounded-full"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
