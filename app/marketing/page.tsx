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
            
            <Features />
            
            <Elevate />
            
            <GetStarted />
        </main>
    );
};

export default MarketingPage;
