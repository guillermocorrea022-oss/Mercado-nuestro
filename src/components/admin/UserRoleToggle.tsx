"use client";

import { useTransition, useState } from "react";

import { toggleUserRoleAction } from "@/app/admin/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

const ROLE_LABELS: Record<UserRole, string> = {
  comprador: "Comprador",
  vendedor_catalogo: "Vendedor catálogo",
  revendedor: "Revendedor",
  importador_avanzado: "Importador avanzado",
  admin: "Admin",
};

interface UserRoleToggleProps {
  userId: string;
  role: UserRole;
  active: boolean;
}

export function UserRoleToggle({ userId, role, active }: UserRoleToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleUserRoleAction(userId, role, !active);
      if (result.status === "error") {
        setError(result.message);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          buttonVariants({
            variant: active ? "default" : "outline",
            size: "xs",
          }),
        )}
      >
        {ROLE_LABELS[role]}
      </button>
      {error ? (
        <span className="text-xs text-destructive">{error}</span>
      ) : null}
    </div>
  );
}
