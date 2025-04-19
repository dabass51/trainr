import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { HeaderNav } from "@/components/header-nav";
import { SheetNav } from "@/components/sheet-nav";
import { MenuIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export async function Header() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <header className="flex h-20 w-full items-center justify-between px-4 md:px-8 bg-background text-foreground">
      <Link href="/" className="flex items-center gap-2" prefetch={false}>
        <div className="relative w-16 h-16">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority></Image>
        </div>
        <span className="font-mono text-2xl tracking-wide">Trainingsplatz</span>
      </Link>

      <div className="flex items-center gap-4">
        <HeaderNav isAuthenticated={isAuthenticated} />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-background text-foreground">
            <SheetNav isAuthenticated={isAuthenticated} />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
