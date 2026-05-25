interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted-foreground">
        {description ?? "This page is a placeholder. Functionality coming soon."}
      </p>

      <div className="mt-8 flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 text-sm text-muted-foreground">
        {title} content area
      </div>
    </div>
  );
}
