"use client";

import { motion } from "framer-motion";
import { Github, Twitter, Mail } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-start px-8 md:px-24 bg-gradient-to-b from-black via-[#0d0d0d] to-[#111] relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,140,0.1),transparent)] z-0" />

      <section className="z-10 max-w-2xl space-y-6">
        {/* Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111]/70 border border-[#222] backdrop-blur-sm">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm">
            Crafting Experiences at{" "}
            <span className="text-green-400">Dimension</span>
          </span>
        </div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold"
        >
          Ronak Fabian
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 leading-relaxed max-w-xl"
        >
          This is a change to webapp!
        </motion.p>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button className="px-5 py-2 rounded-md bg-white text-black font-medium hover:bg-gray-200 transition">
            Learn How ↓
          </button>
          <button className="px-5 py-2 rounded-md border border-gray-600 hover:bg-gray-800 transition">
            More about me
          </button>
        </div>

        {/* Socials */}
        <div className="flex gap-5 pt-6 text-gray-400">
          <Github className="w-5 h-5 hover:text-white cursor-pointer" />
          <Twitter className="w-5 h-5 hover:text-white cursor-pointer" />
          <Mail className="w-5 h-5 hover:text-white cursor-pointer" />
        </div>
      </section>
    </main>
  );
}
