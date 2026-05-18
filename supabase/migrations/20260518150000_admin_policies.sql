-- ============================================================================
-- Policies para que usuarios con rol admin puedan ver y administrar datos
-- de otros usuarios. Sin estas policies, las RLS limitan a "datos propios".
--
-- Estrategia: agregamos policies adicionales que se evalúan con OR a las
-- existentes ("usuarios pueden ver lo suyo" OR "admin puede ver todo").
-- ============================================================================

-- Profiles: admin puede leer y actualizar a todos.
create policy "profiles_select_admin"
  on public.profiles for select
  using (public.has_role((select auth.uid()), 'admin'));

create policy "profiles_update_admin"
  on public.profiles for update
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- user_roles: admin puede ver y modificar todos los roles.
create policy "user_roles_select_admin"
  on public.user_roles for select
  using (public.has_role((select auth.uid()), 'admin'));

create policy "user_roles_insert_admin"
  on public.user_roles for insert
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "user_roles_update_admin"
  on public.user_roles for update
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "user_roles_delete_admin"
  on public.user_roles for delete
  using (public.has_role((select auth.uid()), 'admin'));

-- Campañas: admin ve borradores también (la pública solo ve activas en adelante).
create policy "campaigns_select_admin"
  on public.campaigns for select
  using (public.has_role((select auth.uid()), 'admin'));

create policy "campaigns_insert_admin"
  on public.campaigns for insert
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "campaigns_update_admin"
  on public.campaigns for update
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- Pricing tiers: admin puede CRUD.
create policy "campaign_pricing_tiers_all_admin"
  on public.campaign_pricing_tiers for all
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- Productos: admin puede CRUD.
create policy "products_all_admin"
  on public.products for all
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- Categorías: admin puede CRUD.
create policy "categories_all_admin"
  on public.categories for all
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- Settings: admin puede actualizar.
create policy "settings_update_admin"
  on public.settings for update
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

create policy "settings_insert_admin"
  on public.settings for insert
  with check (public.has_role((select auth.uid()), 'admin'));

-- Admin actions log: admin puede insertar (audit propio).
create policy "admin_actions_log_insert_admin"
  on public.admin_actions_log for insert
  with check (public.has_role((select auth.uid()), 'admin'));

-- Reservas: admin puede ver todas.
create policy "campaign_reservations_select_admin"
  on public.campaign_reservations for select
  using (public.has_role((select auth.uid()), 'admin'));

-- Campaign status updates: admin puede CRUD.
create policy "campaign_status_updates_all_admin"
  on public.campaign_status_updates for all
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));

-- Inventory items: admin puede CRUD.
create policy "inventory_items_all_admin"
  on public.inventory_items for all
  using (public.has_role((select auth.uid()), 'admin'))
  with check (public.has_role((select auth.uid()), 'admin'));
