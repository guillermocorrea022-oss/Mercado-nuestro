"use client";

import { useTransition, useState } from "react";
import { Heart } from "lucide-react";

import { toggleWishlistAction } from "@/app/(public)/producto/[slug]/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialActive: boolean;
}

export function WishlistButton({
  productId,
  initialActive,
}: WishlistButtonProps) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (result.status === "added") setActive(true);
      else if (result.status === "removed") setActive(false);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "gap-1.5",
      )}
      aria-pressed={active}
    >
      <Heart
        className={cn(
          "size-3.5 transition-colors",
          active ? "fill-primary text-primary" : "",
        )}
        aria-hidden
      />
      {active ? "Guardado" : "Guardar"}
    </button>
  );
}
