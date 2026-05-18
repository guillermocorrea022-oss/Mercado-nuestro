-- ============================================================================
-- Policies de INSERT que faltaron en la migracion Phase 1 para tablas
-- relacionadas con vendedores y marketplace. Sin estas, los usuarios no
-- pueden activar su rol vendedor ni publicar en marketplace.
-- ============================================================================

create policy "seller_profiles_insert_own"
  on public.seller_profiles for insert
  with check ((select auth.uid()) = user_id);

create policy "catalog_links_insert_own"
  on public.catalog_links for insert
  with check ((select auth.uid()) = seller_id);

-- (marketplace_listings_all_own ya cubre INSERT, pero por completitud)
create policy "marketplace_listings_insert_own"
  on public.marketplace_listings for insert
  with check ((select auth.uid()) = seller_id);

create policy "marketplace_orders_insert_buyer"
  on public.marketplace_orders for insert
  with check ((select auth.uid()) = buyer_id);

create policy "wishlists_insert_own"
  on public.wishlists for insert
  with check ((select auth.uid()) = user_id);

create policy "wishlists_delete_own"
  on public.wishlists for delete
  using ((select auth.uid()) = user_id);
