import {Instagram} from 'lucide-react'
import { Separator } from '@/components/ui/separator';

const sections = [
  {
    title: 'Product',
    links: [
      { name: 'Overview', href: '#' },
      { name: 'Pricing', href: '#' },
      { name: 'Marketplace', href: '#' },
      { name: 'Features', href: '#' },
      { name: 'Integrations', href: '#' },
      { name: 'Pricing', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '#' },
      { name: 'Team', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
      { name: 'Privacy', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help', href: '#' },
      { name: 'Sales', href: '#' },
      { name: 'Advertise', href: '#' },
    ],
  },
];

export function Footer() {
  return (
      <section className="py-32">
        <div className="container">
          <footer>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <img
                  src="https://www.shadcnblocks.com/images/block/logos/shadcn-ui.svg"
                  alt="logo"
                  className="mb-8 mr-auto h-7 md:mb-0"
              />
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <p className="text-lg font-medium">
                  Copy the code and make it yours.
                </p>
                <div className="flex gap-2">
                  <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-lg bg-primary p-2.5"
                  >
                    Hello
                  </a>
                  <a
                      href="#"
                      className="inline-flex items-center justify-center rounded-lg bg-primary p-2.5"
                  >
                    Hello
                  </a>
                </div>
              </div>
            </div>
            <Separator className="my-14" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {sections.map((section, sectionIdx) => (
                  <div key={sectionIdx}>
                    <h3 className="mb-4 font-bold">{section.title}</h3>
                    <ul className="space-y-4 text-muted-foreground">
                      {section.links.map((link, linkIdx) => (
                          <li
                              key={linkIdx}
                              className="font-medium hover:text-primary"
                          >
                            <a href={link.href}>{link.name}</a>
                          </li>
                      ))}
                    </ul>
                  </div>
              ))}
              <div>
                <h3 className="mb-4 font-bold">Legal</h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="font-medium hover:text-primary">
                    <a href="#">Term of Services</a>
                  </li>
                  <li className="font-medium hover:text-primary">
                    <a href="#">Privacy Policy</a>
                  </li>
                </ul>
                <h3 className="mb-4 mt-8 font-bold">Social</h3>
                <ul className="flex items-center space-x-6 text-muted-foreground">
                  <li className="font-medium hover:text-primary">
                    <a href="#">
                      <Instagram />
                    </a>
                  </li>

                </ul>
              </div>
            </div>
            <Separator className="my-14" />
            <p className="text-sm text-muted-foreground">
              © 2024 Lakt.at UG. All rights reserved.
            </p>
          </footer>
        </div>
      </section>
  );
};
