import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { HeroContent } from '@/components/HeroContent';
import Image from 'next/image';

export async function Hero() {
    const session = await getServerSession(authOptions)

    return (
        <section className="relative min-h-[90vh] flex items-center">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/mood_1.jpg"
                    alt="Hero background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/50" />
            </div>
            
            {/* Content */}
            <div className="container relative z-10">
                <HeroContent />
            </div>
        </section>
    );
}
