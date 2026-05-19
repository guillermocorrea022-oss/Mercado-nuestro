import { Quote } from "lucide-react";

import { StarRating } from "@/components/ui/star-rating";
import { cn } from "@/lib/utils";

type Props = {
  author: string;
  role?: string;
  rating: number;
  body: string;
  className?: string;
};

export function TestimonialCard({
  author,
  role,
  rating,
  body,
  className,
}: Props) {
  return (
    <figure
      className={cn(
        "hover-lift relative flex h-full flex-col gap-5 rounded-3xl border border-border bg-card p-7 shadow-soft",
        className,
      )}
    >
      <Quote
        className="absolute -top-3 right-6 size-8 text-primary/15"
        aria-hidden
      />
      <StarRating value={rating} size="size-4" />
      <blockquote className="text-base leading-relaxed text-foreground">
        “{body}”
      </blockquote>
      <figcaption className="mt-auto">
        <p className="text-sm font-semibold tracking-tight">{author}</p>
        {role ? (
          <p className="text-xs text-muted-foreground">{role}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}
