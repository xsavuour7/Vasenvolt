'use client';

import Image from 'next/image';
import Link from 'next/link';

export function Hero() {
  return (
    <div className="relative flex min-h-[600px] flex-col items-center justify-center gap-8 overflow-hidden px-4 text-center">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1920&auto=format&fit=crop"
          alt="Energy monitoring"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
        AI-Powered Energy Monitoring
      </h1>
      <p className="max-w-2xl text-lg text-white/90 sm:text-xl">
        Reduce waste and lower costs with our intelligent energy monitoring solution for businesses and homeowners.
      </p>
      <div className="flex flex-col items-center gap-2 text-white">
        <p className="text-lg">
          Ready to optimize your energy consumption?{' '}
          <Link href="/demo" className="font-semibold underline hover:text-white/80">
            View our demo
          </Link>
        </p>
        <p className="text-lg">
          or{' '}
          <Link href="/get-started" className="font-semibold underline hover:text-white/80">
            Get started today
          </Link>
        </p>
      </div>
    </div>
  );
} 