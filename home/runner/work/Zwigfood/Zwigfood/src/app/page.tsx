'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');
  const { user } = useUser();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative h-[calc(100vh-4rem)] w-full overflow-hidden"
    >
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
        <div className="relative max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl opacity-50"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl opacity-50"
          />
          <h1 className="font-headline text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl">
            DineHub
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300 md:text-xl">
            Effortless Ordering, Deliciously Delivered.
          </p>
          <p className="mt-2 text-lg text-gray-300 md:text-xl">
            Your campus cafeteria, reimagined.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="font-bold">
              <Link href={user ? "/outlets" : "/auth/login"}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
