import { Hero } from '@/components/home/hero';
import { Features } from '@/components/home/features';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
