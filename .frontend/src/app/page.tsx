"use client"

import type { StaticImageData } from 'next/image'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <header className="bg-primary text-primary-foreground py-12 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-8">
              <span className="text-2xl font-bold">VasenVolt</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Transform Your Energy Usage with AI
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mb-8">
              Experience the future of energy monitoring with our AI-powered platform.
            </p>
          </div>
        </header>

        <section className="flex flex-col md:flex-row items-center gap-8 py-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-lg mb-4">
              At VasenVolt, we're revolutionizing how people monitor and manage their energy consumption. 
              Our AI-powered platform provides real-time insights and recommendations to help you save energy and reduce costs.
            </p>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/energy-image.jpg"
              alt="Energy visualization"
              width={500}
              height={300}
              className="rounded-lg shadow-lg object-cover"
              priority
            />
          </div>
        </section>
      </main>
    </>
  )
} 