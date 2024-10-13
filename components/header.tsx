import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Signout } from "@/components/signout";

type HomeIconProps = React.SVGProps<SVGSVGElement>;
type MenuIconProps = React.SVGProps<SVGSVGElement>;
type MountainProps = React.SVGProps<SVGSVGElement>;

export async function Header() {
  const session = await getServerSession(authOptions);
  return (
      <header className="flex h-20 w-full items-center justify-between px-4 md:px-8 bg-gray-900 text-white shadow-lg">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <MountainIcon className="h-8 w-8 text-yellow-400" />
          <span className="font-bold text-2xl tracking-wide">Trainr</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="hover:text-yellow-400 transition duration-300">
            Home
          </Link>
          {session ? (
              <>
                <Link href="/training-units" className="hover:text-yellow-400 transition duration-300">
                  Trainings
                </Link>
                <Link href="/weight" className="hover:text-yellow-400 transition duration-300">
                  Weight
                </Link>
                <Link href="/events" className="hover:text-yellow-400 transition duration-300">
                  Events
                </Link>
                <Link href="/profile" className="hover:text-yellow-400 transition duration-300">
                  Profile
                </Link>
                <Link href="/upload" className="hover:text-yellow-400 transition duration-300">
                  Upload
                </Link>
                <Signout />
              </>
          ) : (
              <>
                <Link href="/auth/signin" className="hover:text-yellow-400 transition duration-300">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="hover:text-yellow-400 transition duration-300">
                  Sign up
                </Link>
              </>
          )}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden text-white border-gray-700 hover:bg-gray-700">
              <MenuIcon className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-gray-900 text-white">
            <div className="py-6 space-y-6">
              <Link href="/" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
                <HomeIcon className="h-5 w-5" />
                Home
              </Link>
              {session ? (
                  <>
                    <Link href="/training-units" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
                      Trainings
                    </Link>
                    <Link href="/weight" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
                      Weight
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
                      Profile
                    </Link>
                    <Link href="/upload" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
                      Upload
                    </Link>
                    <Signout />
                  </>
              ) : (
                  <>
                    <Link href="/auth/signin" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
                      Sign in
                    </Link>
                    <Link href="/auth/signup" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
                      Sign up
                    </Link>
                  </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </header>
  );
}

const HomeIcon: React.FC<HomeIconProps> = (props) => (
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

function MenuIcon(props: MenuIconProps) {
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
  );
}

function MountainIcon(props: MountainProps) {
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
  );
}
