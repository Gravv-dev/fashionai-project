import Link from "next/link";

const FOOTER_LINKS = [
  {
    category: "Product",
    links: [
      { name: "Tech Pack Generator", href: "/techpack" },
      { name: "Flat Sketch Generator", href: "/flatsketch" },
      { name: "Line Sheet Studio", href: "/line-sheet" },
      { name: "Pricing", href: "/pricing" },
    ],
  },
  {
    category: "Resources",
    links: [
      { name: "Help Center", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Templates", href: "#" },
      { name: "Status", href: "#" },
    ],
  },
  {
    category: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Privacy Policy", href: "#" },
    ],
  },
] as const;

const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://www.instagram.com/" },
  { name: "TikTok", href: "https://www.tiktok.com/" },
  { name: "YouTube", href: "https://www.youtube.com/" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 border-b border-border pb-8">
          <div className="flex flex-col gap-4 lg:max-w-xs">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-text-inverse font-bold text-lg">
                FT
              </div>
              <span className="font-semibold text-text-primary tracking-tight">
                FashionTech AI
              </span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Clean, editable tech packs and flat sketches for fashion brands.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-text-primary transition-colors"
                  aria-label={social.name}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:hidden">
            {FOOTER_LINKS.map((category) => (
              <div key={category.category} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {category.category}
                </h3>
                <ul className="flex flex-col gap-2">
                  {category.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-brand transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="hidden lg:flex lg:flex-1 lg:grid lg:grid-cols-3 lg:gap-8">
            {FOOTER_LINKS.map((category) => (
              <div key={category.category} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {category.category}
                </h3>
                <ul className="flex flex-col gap-2">
                  {category.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary hover:text-brand transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <p>© 2026 FashionTech AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-brand transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-brand transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
