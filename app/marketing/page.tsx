// /app/marketing/page.tsx
import React from 'react';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Elevate } from '@/components/Elevate';
import { GetStarted } from '@/components/GetStarted';
import { ParallaxImage } from '@/components/ParallaxImage';

const MarketingPage = () => {
    return (
        <main>
            <Hero />
            <ParallaxImage 
                src="/mood_2.jpg" 
                alt="Athletes training at sunset"
            />
            <Features />
            <ParallaxImage 
                src="/mood_3.jpg" 
                alt="Runner on mountain trail"
            />
            <Elevate />
            <ParallaxImage 
                src="/mood_4.jpg" 
                alt="Group workout session"
            />
            <GetStarted />
        </main>
    );
};

export default MarketingPage;
