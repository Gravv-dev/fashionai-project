import Link from "next/link";

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
  image: React.ReactNode;
  href: string;
}

export function FeatureCard({
  number,
  title,
  description,
  image,
  href,
}: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-xl border border-border bg-card p-6 hover:border-brand/50 hover:shadow-lg transition-all"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-text-inverse transition-colors">
        <span className="text-sm font-bold">{number}</span>
      </div>
      <h3 className="mt-4 font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-muted leading-relaxed">
        {description}
      </p>
      <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-medium text-brand">
        Explore →
      </div>
      {image}
    </Link>
  );
}
