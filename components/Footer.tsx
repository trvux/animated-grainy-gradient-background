"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black text-neutral-500 font-sans text-xs">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-1.5 font-medium text-neutral-400">
          <span>Trvux</span>
          <span className="text-neutral-600 font-light">
            © 2026 All rights reserved.
          </span>
        </div>

        <div className="flex gap-6 font-light">
          <Link
            href="https://github.com/trvux"
            target="_blank"
            className="hover:text-neutral-300 transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="https://medium.com/@Trvux115"
            target="_blank"
            className="hover:text-neutral-300 transition-colors"
          >
            Medium
          </Link>
          <Link href="#" className="hover:text-neutral-300 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
