"use client";

import { useTransition, useState } from "react";

import { activateResellerRoleAction } from "@/app/(user)/perfil/revendedor/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActivateResellerButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function activate() {
    setError(null);
    startTransition(async () => {
      const result = await activateResellerRoleAction();
      if (result.status === "error") setError(result.message);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={activate}
        disabled={isPending}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 px-6 text-base shadow-glow",
        )}
      >
        {isPending ? "Activando..." : "Activar como revendedor"}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
