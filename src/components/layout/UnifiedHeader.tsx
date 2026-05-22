"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
// Lucide se usa SOLO para íconos "de chrome" (chevrons, flechas)
// que no tienen equivalente en el set oficial de 24 íconos de IconMN.
// Los íconos semánticos (carrito, usuario, etc.) son SIEMPRE de IconMN.
import { ArrowRight, ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { IconMN } from "@/components/ui/IconMN";
import { cn } from "@/lib/utils";

import { AppContainer } from "./AppContainer";
import { CategoryProductsPreview } from "./CategoryProductsPreview";
import { Container } from "./Container";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CategoryNode = {
  id: string;
  slug: string;
  name: string;
  children: CategoryNode[];
};

interface UnifiedHeaderProps {
  userId: string | null;
  userName: string | null;
  unread: number;
  canPublish: boolean;
  categories: CategoryNode[];
}

// ─── Navegación de la home (anchors) ──────────────────────────────────────────

const HOME_NAV = [
  { href: "#sobre", label: "Nosotros" },
  { href: "#lineas", label: "Cómo funciona" },
  { href: "#campanas", label: "Campañas" },
  { href: "#faqs", label: "Preguntas" },
];

// Trust items — barra 1 navy oscuro arriba del todo. 3 pilares de confianza
// en formato compacto (ícono + título corto en una línea), centrados.
const TRUST_ITEMS = [
  {
    icon: "seguridad" as const,
    title: "Compra protegida con escrow",
  },
  {
    icon: "envios" as const,
    title: "Envío gratis en compras +$1.500",
  },
  {
    icon: "soporte" as const,
    title: "Soporte local en español",
  },
] as const;

// Nav links de la barra inferior. Las 3 secciones del spec
// (Mercado Nuestro / Campañas / Propuestas) + atajos a colecciones
// populares (Ofertas / Más vendidos) + ayuda (Cómo funciona / Ayuda).
// "Todas las categorías" abre el mega-menú con un botón aparte a la izq.
// Los links de Ofertas y Más vendidos son anchors a secciones dentro de la home
// del marketplace: la sección Imperdibles (FlashDeals) y "Más vendidos".
// Si el usuario está en otra página, lo lleva a /app/marketplace y luego salta.
const APP_NAV = [
  { href: "/app/marketplace", label: "Mercado Nuestro", match: "/app/marketplace" },
  { href: "/app/campanas", label: "Campañas", match: "/app/campanas" },
  { href: "/app/propuestas", label: "Propuestas", match: "/app/propuestas" },
  { href: "/app/marketplace#imperdibles", label: "Ofertas", match: "#imperdibles" },
  { href: "/app/marketplace#mas-vendidos", label: "Más vendidos", match: "#mas-vendidos" },
  { href: "/como-funciona", label: "Cómo funciona", match: "/como-funciona" },
  { href: "/contacto", label: "Ayuda", match: "/contacto" },
];

// ─── UnifiedHeader ────────────────────────────────────────────────────────────
// Variantes:
//   pathname "/"      → floating pill (landing)
//   pathname distinto → 2 pisos: arriba logo+buscador+auth, abajo Categorías+nav

export function UnifiedHeader({
  userId,
  userName,
  unread,
  canPublish,
  categories,
}: UnifiedHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const shouldReduce = useReducedMotion();

  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  // Resetear estado al cambiar de página y cerrar el dropdown
  useEffect(() => {
    setHidden(false);
    setAtTop(window.scrollY < 32);
    setCategoriesOpen(false);
  }, [pathname]);

  // Scroll direction detection — el header NO se oculta si el dropdown
  // de categorías está abierto (sino se va al carajo al hacer scroll).
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const currentY = window.scrollY;
      const goingDown = currentY > lastY;
      const movedEnough = Math.abs(currentY - lastY) > 6;

      if (currentY < 32) {
        setHidden(false);
        setAtTop(true);
      } else {
        setAtTop(false);
        if (movedEnough && !categoriesOpen) {
          if (goingDown && currentY > 80) setHidden(true);
          else if (!goingDown) setHidden(false);
        }
      }
      lastY = currentY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [categoriesOpen]);

  // ── HOME: pill flotante ──────────────────────────────────────────────────
  if (isHome) {
    return (
      <motion.header
        animate={
          shouldReduce
            ? { y: 0 }
            : { y: hidden ? "-130%" : 0, opacity: hidden ? 0 : 1 }
        }
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-1/2 top-4 z-50 w-[min(96%,1100px)] -translate-x-1/2"
      >
        <div
          className={cn(
            "rounded-full border border-border bg-white/85 backdrop-blur-xl transition-shadow duration-500",
            atTop ? "shadow-soft" : "shadow-glow",
          )}
        >
          <div className="flex h-14 items-center justify-between gap-4 pl-3 pr-2 sm:pl-4 sm:pr-3">
            <Link
              href="/"
              className="flex shrink-0 items-center"
              aria-label="Mercado Nuestro — Inicio"
            >
              <Image
                src="/logos/07_isotipo-principal_color.png"
                alt="Mercado Nuestro"
                width={36}
                height={36}
                className="sm:hidden"
                priority
              />
              <Image
                src="/logos/01_principal.png"
                alt="Mercado Nuestro"
                width={160}
                height={36}
                className="hidden sm:block"
                style={{ height: "auto", width: "auto", maxHeight: "36px" }}
                priority
              />
            </Link>

            <nav
              className="hidden lg:flex items-center gap-0.5"
              aria-label="Secciones de la página"
            >
              {HOME_NAV.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/app/campanas"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
            >
              Ir a la app
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </motion.header>
    );
  }

  // ── APP: 3 barras con sticky parcial ─────────────────────────────────────
  //   Barra 1 (navy,   h-10 = 40px): Trust bar — 3 columnas de confianza
  //                                  SIEMPRE VISIBLE (no se anima)
  //   Barra 2 (blanca, h-20 = 80px): Logo + Buscador + Selector país +
  //                                  Favoritos + Carrito + Cuenta
  //                                  SIEMPRE VISIBLE (no se anima)
  //   Barra 3 (blanca, h-12 = 48px): Todas las categorías ☰ + Nav links
  //                                  SE OCULTA al scrollear abajo
  //
  // Spacer total cuando todo visible:  40 + 80 + 48 = 168px = h-[10.5rem]
  // Cuando se oculta barra 3:          40 + 80      = 120px
  return (
    <>
      {/* ══════ BARRA 1 — TRUST BAR (siempre visible) ══════
          3 columnas con info de confianza: compra protegida, envío gratis,
          soporte local. Navy oscuro contrastando con la barra 2 blanca. */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-brand-blue-dark text-white">
        <AppContainer>
          <div className="flex h-10 items-center justify-between gap-4 overflow-x-auto md:grid md:grid-cols-3">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.title}
                className="flex shrink-0 items-center gap-2 md:justify-center"
              >
                <IconMN
                  name={item.icon}
                  variant="blanco"
                  size={26}
                  alt=""
                />
                <span className="whitespace-nowrap text-sm font-semibold">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </AppContainer>
      </div>

      {/* ══════ BARRA 2 — LOGO/BUSCADOR/AUTH (siempre visible) ══════
          Anclada justo debajo de la trust bar. NO se mueve al scrollear,
          siempre queda accesible el buscador, el carrito y la cuenta. */}
      <header className="fixed left-0 right-0 top-10 z-50 border-b border-neutral-gray-50 bg-white shadow-sm">
        <div className="bg-white">
          <AppContainer className="flex h-20 items-center gap-4 sm:gap-6">
            {/* Logo */}
            <Link
              href="/app/marketplace"
              className="shrink-0"
              aria-label="Mercado Nuestro — La tienda"
            >
              <Image
                src="/logos/07_isotipo-principal_color.png"
                alt="MN"
                width={44}
                height={44}
                className="sm:hidden"
                priority
              />
              <Image
                src="/logos/01_principal.png"
                alt="Mercado Nuestro"
                width={190}
                height={52}
                className="hidden sm:block"
                style={{ height: "auto", width: "auto", maxHeight: "52px" }}
                priority
              />
            </Link>

            {/* Buscador grande con botón submit cuadrado */}
            <form
              method="GET"
              action="/app/marketplace"
              className="flex max-w-3xl flex-1 items-center"
            >
              <input
                type="search"
                name="q"
                placeholder="Buscar productos, campañas y más…"
                aria-label="Buscar"
                className="h-12 flex-1 rounded-l-md border border-neutral-gray-300 bg-white px-5 text-sm text-neutral-gray-700 placeholder:text-neutral-gray-300 focus:border-brand-blue focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="flex h-12 w-14 shrink-0 items-center justify-center rounded-r-md bg-brand-blue text-white transition-colors hover:bg-brand-blue-dark"
              >
                <IconMN name="buscar" variant="blanco" size={28} alt="" />
              </button>
            </form>

            {/* Favoritos + Carrito + Cuenta — orden: primero accesos
                rápidos (favoritos/carrito), después la cuenta (al final). */}
            <div className="flex shrink-0 items-center gap-1">
              {/* Favoritos */}
              <Link
                href={userId ? "/perfil/deseos" : "/login?next=/perfil/deseos"}
                className="hidden items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-neutral-gray-50 md:inline-flex"
                aria-label="Mis favoritos"
              >
                <IconMN name="favoritos" size={30} alt="" />
                <span className="text-sm font-semibold text-neutral-gray-700">
                  Favoritos
                </span>
              </Link>

              {/* Carrito con badge */}
              <Link
                href={userId ? "/perfil/mis-compras" : "/login?next=/perfil/mis-compras"}
                className="relative inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-neutral-gray-50"
                aria-label="Carrito"
              >
                <div className="relative">
                  <IconMN name="carrito" size={30} alt="" />
                  {/* Badge — cuando tengamos cartCount real, mostrar acá */}
                  {unread > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-brand-yellow px-1 text-[10px] font-bold text-neutral-gray-700">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-semibold text-neutral-gray-700 md:inline">
                  Carrito
                </span>
              </Link>

              {/* Cuenta — al final, separador visual con border-left */}
              {userId ? (
                <Link
                  href="/perfil"
                  className="hidden items-center gap-2 rounded-lg border-l border-neutral-gray-50 px-3 py-2 transition-colors hover:bg-neutral-gray-50 md:inline-flex"
                  aria-label={`Mi cuenta${userName ? ` (${userName})` : ""}`}
                >
                  <IconMN name="usuario" size={30} alt="" />
                  <div className="leading-tight">
                    <p className="text-[11px] text-neutral-gray-700/70">
                      Hola
                    </p>
                    <p className="text-sm font-semibold text-neutral-gray-700">
                      {userName ?? "Mi cuenta"}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="hidden items-center gap-2 rounded-lg border-l border-neutral-gray-50 px-3 py-2 transition-colors hover:bg-neutral-gray-50 md:inline-flex"
                  aria-label="Iniciar sesión / Crear cuenta"
                >
                  <IconMN name="usuario" size={30} alt="" />
                  <div className="leading-tight">
                    <p className="text-[11px] text-neutral-gray-700/70">
                      Iniciar sesión
                    </p>
                    <p className="text-sm font-semibold text-neutral-gray-700">
                      Mi cuenta
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </AppContainer>
        </div>
      </header>

      {/* ══════ BARRA 3 — Todas las categorías + Nav (ANIMADA con scroll) ══════
          Anclada justo debajo de la barra 2 (top: 120px = 40 trust + 80 logo).
          Cuando scrolleás hacia abajo se oculta hacia arriba (translateY -100%),
          quedando detrás de las barras 1 y 2 (que tienen z-50 > z-40). Al
          subir, reaparece con la misma animación. */}
      <motion.div
        animate={
          shouldReduce
            ? { y: 0 }
            : { y: hidden ? "-100%" : 0, opacity: hidden ? 0 : 1 }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 right-0 top-[120px] z-40 border-b border-neutral-gray-50 bg-white shadow-sm"
      >
        <AppContainer className="relative flex h-12 items-stretch justify-center">
          {/* Cluster centrado: Todas las categorías + Nav links.
              "justify-center" en el AppContainer centra TODO horizontalmente.
              El CTA admin de la derecha queda fuera del flow con position
              absolute para no romper el centrado del cluster. */}
          <div className="flex items-stretch gap-4">
            {/* Botón "Todas las categorías" con ícono hamburguesa + separator */}
            <div className="flex items-stretch border-r border-neutral-gray-50 pr-4">
              <CategoriesDropdown
                open={categoriesOpen}
                setOpen={setCategoriesOpen}
                categories={categories}
              />
            </div>

            {/* Nav principal — todos los links inline */}
            <nav
              className="hidden items-stretch gap-1 lg:flex"
              aria-label="Navegación principal"
            >
              {APP_NAV.map((link) => {
                const active = link.match.startsWith("#")
                  ? false
                  : link.match === "/app/marketplace"
                    ? pathname === "/app/marketplace"
                    : pathname.startsWith(link.match);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center whitespace-nowrap border-b-[3px] px-3 text-sm transition-colors",
                      active
                        ? "border-brand-blue font-semibold text-brand-blue"
                        : "border-transparent font-normal text-neutral-gray-700 hover:text-brand-blue",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* CTA admin (publicar campaña) — absolute a la derecha para no
              afectar el centrado del cluster. */}
          {canPublish && (
            <Link
              href="/admin/campanas/nueva"
              className="absolute right-4 my-2 hidden items-center whitespace-nowrap rounded-full bg-brand-yellow px-3 text-xs font-bold text-neutral-gray-700 transition-colors hover:bg-brand-yellow/90 sm:right-6 lg:right-8 lg:inline-flex"
            >
              + Publicar campaña
            </Link>
          )}
        </AppContainer>
      </motion.div>

      {/* Espaciador animado: 168px cuando todo visible, 120px cuando barra 3 oculta.
          La animación es smooth, así el contenido sube acompañando la barra 3. */}
      <motion.div
        animate={{ height: hidden ? 120 : 168 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />
    </>
  );
}

// ─── CategoriesDropdown ───────────────────────────────────────────────────────
// Mega-menú estilo Mercado Libre: sidebar dark a la izquierda con los roots,
// panel blanco a la derecha con título de la categoría activa + grid de
// subcategorías L2 (con sus hijos L3 abajo).

interface CategoriesDropdownProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  categories: CategoryNode[];
}

function CategoriesDropdown({
  open,
  setOpen,
  categories,
}: CategoriesDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(
    categories[0]?.id ?? null,
  );

  // Sincronizar la categoría activa cuando cambian las categorías
  useEffect(() => {
    if (!activeId && categories[0]) setActiveId(categories[0].id);
  }, [categories, activeId]);

  // Click outside + Escape para cerrar
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, setOpen]);

  const activeRoot = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <div ref={containerRef} className="relative flex items-stretch">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex items-center gap-1.5 whitespace-nowrap border-b-[3px] px-4 text-sm font-semibold transition-colors",
          open
            ? "border-brand-blue text-brand-blue"
            : "border-transparent text-neutral-gray-700 hover:text-brand-blue",
        )}
      >
        <IconMN name="categorias" size={24} alt="" />
        Todas las categorías
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop liviano para que se note que está abierto */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none fixed left-0 right-0 top-[168px] -z-10 h-screen bg-black/20"
              aria-hidden
            />

            {/* Panel del mega-menu */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              role="menu"
              className="absolute left-0 top-full z-50 mt-2 w-[min(95vw,1100px)] overflow-hidden rounded-2xl border border-border bg-white shadow-2xl"
              style={{ maxHeight: "calc(100vh - 8rem)" }}
            >
              {categories.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Estamos preparando las categorías. Mientras tanto, podés
                  explorar las{" "}
                  <Link
                    href="/app/campanas"
                    className="font-bold text-blue hover:underline"
                    onClick={() => setOpen(false)}
                  >
                    campañas activas
                  </Link>
                  .
                </div>
              ) : (
                <div className="flex" style={{ maxHeight: "calc(100vh - 8rem)" }}>
                  {/* Sidebar de roots */}
                  <ul className="w-72 shrink-0 overflow-y-auto bg-navy py-3 text-navy-foreground">
                    {categories.map((root) => {
                      const isActive = root.id === activeRoot?.id;
                      return (
                        <li key={root.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveId(root.id)}
                            onFocus={() => setActiveId(root.id)}
                            className={cn(
                              "flex w-full items-center justify-between gap-3 px-6 py-3 text-left text-sm transition-colors",
                              isActive
                                ? "bg-blue font-bold text-white"
                                : "text-navy-foreground/85 hover:bg-white/5 hover:text-white",
                            )}
                          >
                            <span>{root.name}</span>
                            <ChevronRight
                              className={cn(
                                "size-4 shrink-0 transition-opacity",
                                isActive ? "opacity-100" : "opacity-30",
                              )}
                              aria-hidden
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Panel de subcategorías + preview, con footer sticky
                      siempre visible para que "Ver todos los productos"
                      no se pierda cuando hay mucho contenido scrolleable. */}
                  <div className="relative flex flex-1 flex-col bg-white">
                    <div className="flex-1 overflow-y-auto p-8">
                      {activeRoot ? (
                        <CategoryPanel
                          root={activeRoot}
                          onSelect={() => setOpen(false)}
                        />
                      ) : null}
                    </div>
                    {activeRoot ? (
                      <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-border bg-white/95 px-8 py-4 backdrop-blur-sm">
                        <Link
                          href={`/app/marketplace?cat=${activeRoot.slug}`}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-blue px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy"
                        >
                          Ver todos los productos
                          <ArrowRight className="size-4" aria-hidden />
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Panel derecho del mega-menu ──────────────────────────────────────────────
function CategoryPanel({
  root,
  onSelect,
}: {
  root: CategoryNode;
  onSelect: () => void;
}) {
  return (
    <div>
      {/* Título del root activo */}
      <Link
        href={`/app/marketplace?cat=${root.slug}`}
        onClick={onSelect}
        className="group inline-flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground hover:text-blue"
      >
        {root.name}
        <ArrowRight
          className="size-5 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
      <hr className="my-4 border-border" />

      {root.children.length === 0 ? (
        // Sin subcategorías: solo el preview de productos.
        <CategoryProductsPreview root={root} onSelect={onSelect} />
      ) : (
        // Grid de subcategorías + preview de productos abajo
        <>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-3">
            {root.children.map((mid) => (
              <div key={mid.id}>
                <Link
                  href={`/app/marketplace?cat=${mid.slug}`}
                  onClick={onSelect}
                  className="block text-base font-bold text-foreground transition-colors hover:text-blue"
                >
                  {mid.name}
                </Link>
                {mid.children.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {mid.children.map((leaf) => (
                      <li key={leaf.id}>
                        <Link
                          href={`/app/marketplace?cat=${leaf.slug}`}
                          onClick={onSelect}
                          className="block text-sm text-muted-foreground transition-colors hover:text-blue"
                        >
                          {leaf.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Preview de productos de la categoría debajo de las subcats */}
          <hr className="my-6 border-border" />
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Productos destacados
          </p>
          <CategoryProductsPreview root={root} onSelect={onSelect} />
        </>
      )}
    </div>
  );
}

