import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { signOut } from 'next-auth/react'
import {Signout} from "@/components/signout";

type HomeIconProps = React.SVGProps<SVGSVGElement>;
type MenuIconProps = React.SVGProps<SVGSVGElement>;
type MountainProps = React.SVGProps<SVGSVGElement>;


export async function Header() {
  const session = await getServerSession(authOptions)
  return (
    <header className="flex h-20 w-full shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <Link href="/" className="flex items-center gap-2" prefetch={false}>
            <MountainIcon className="h-6 w-6" />
            <span className="font-bold">Acme Inc</span>
          </Link>
          <div className="grid gap-4 py-6">
            <Link href="#" className="flex items-center gap-2 text-lg font-medium" prefetch={false}>
              <HomeIcon className="h-5 w-5" />
              Home
            </Link>
              {session ? (
                  <Signout></Signout>
              ) : (
                  <>
                <Link href="/auth/signin" className="flex items-center gap-2 text-lg font-medium">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="flex items-center gap-2 text-lg font-medium">
                  Sign up
                </Link>
                  </>

              )}
          </div>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center gap-2 mr-auto hidden lg:flex" prefetch={false}>
        <MountainIcon className="h-6 w-6" />
        <span className="font-bold">Acme Inc</span>
      </Link>
      <nav className="hidden lg:flex gap-6">
        <Link href="/" className="text-lg font-medium hover:underline" prefetch={false}>
          Home
        </Link>

        {session ? (
            <Signout></Signout>
        ) : (
            <>
              <Link href="/auth/signin" className="text-lg font-medium hover:underline">
                Sign in
              </Link>
              <Link href="/auth/signup" className="text-lg font-medium hover:underline">
                Sign up
              </Link>
            </>
        )}

      </nav>
    </header>
  )
}




const HomeIcon: React.FC<HomeIconProps> = (props) => {
  return (
      <svg
          {...props}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
  );
}


function MenuIcon(props:MenuIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function MountainIcon(props:MountainProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}
