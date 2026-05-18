"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteAddressAction } from "@/app/(user)/perfil/direcciones/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("¿Eliminar esta dirección?")) return;
    startTransition(async () => {
      await deleteAddressAction(addressId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "gap-1.5 text-muted-foreground hover:text-destructive",
      )}
      aria-label="Eliminar dirección"
    >
      <Trash2 className="size-3.5" aria-hidden />
      Eliminar
    </button>
  );
}
