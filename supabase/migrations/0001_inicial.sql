-- TV Interactiva · esquema inicial
-- Multi-negocio (multi-rubro). Cada organización ve y edita solo lo suyo (RLS).
-- Las TVs no inician sesión: se identifican con un secreto aleatorio guardado en el aparato y leen su
-- contenido con funciones SECURITY DEFINER (tv_*).
-- Preparado para Platovi: categorias/productos tienen `origen` y `externo_id`, y la tabla `integraciones`
-- guarda la conexión con otros sistemas.

create extension if not exists pgcrypto with schema extensions;

-- ── Organizaciones y miembros ─────────────────────────────────────────────
create table public.organizaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(nombre) between 1 and 120),
  rubro text not null default 'otro'
    check (rubro in ('restaurante','cafeteria','clinica','turnos','retail','oficina','otro')),
  plan text not null default 'pro' check (plan in ('gratis','pro','negocio')),
  prueba_hasta timestamptz default (now() + interval '14 days'),
  marca jsonb not null default '{"color":"#6366f1","logo":null,"fuente":"moderna"}',
  moneda text not null default 'CLP',
  zona_horaria text not null default 'America/Santiago',
  canal text not null default encode(extensions.gen_random_bytes(16), 'hex'),
  turno_actual integer not null default 0,
  creado timestamptz not null default now()
);

create table public.miembros (
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rol text not null default 'dueno' check (rol in ('dueno','editor','operador')),
  creado timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index on public.miembros (user_id);

create table public.superadmins (user_id uuid primary key references auth.users(id) on delete cascade);

create or replace function public.es_miembro(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from miembros where org_id = p_org and user_id = auth.uid())
      or exists (select 1 from superadmins where user_id = auth.uid());
$$;

-- ── Catálogo (productos, servicios, trámites…) ───────────────────────────
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  nombre text not null,
  orden integer not null default 0,
  visible boolean not null default true,
  origen text not null default 'propio' check (origen in ('propio','platovi')),
  externo_id text,
  actualizado timestamptz not null default now(),
  unique (org_id, origen, externo_id)
);
create index on public.categorias (org_id, orden);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  categoria_id uuid references public.categorias(id) on delete set null,
  nombre text not null,
  descripcion text not null default '',
  precio numeric(12,2),
  foto text,
  agotado boolean not null default false,
  destacado boolean not null default false,
  orden integer not null default 0,
  origen text not null default 'propio' check (origen in ('propio','platovi')),
  externo_id text,
  actualizado timestamptz not null default now(),
  unique (org_id, origen, externo_id)
);
create index on public.productos (org_id, orden);

-- ── Contenido: listas de reproducción y diapositivas ──────────────────────
create table public.listas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  nombre text not null,
  creado timestamptz not null default now()
);

create table public.diapositivas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  lista_id uuid not null references public.listas(id) on delete cascade,
  tipo text not null check (tipo in ('menu','imagen','video','aviso','turnos','bienvenida')),
  orden integer not null default 0,
  duracion integer not null default 10 check (duracion between 3 and 600),
  activa boolean not null default true,
  horario jsonb,
  datos jsonb not null default '{}'
);
create index on public.diapositivas (lista_id, orden);

-- ── Pantallas y vinculación ───────────────────────────────────────────────
create table public.pantallas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  nombre text not null,
  lista_id uuid references public.listas(id) on delete set null,
  orientacion text not null default 'horizontal' check (orientacion in ('horizontal','vertical')),
  tema text not null default 'oscuro' check (tema in ('oscuro','claro')),
  llamador boolean not null default true,
  secreto_hash text unique, -- sha256 del secreto del aparato; el secreto nunca se guarda en claro
  ultimo_contacto timestamptz,
  creado timestamptz not null default now()
);
create index on public.pantallas (org_id);

create table public.codigos_vinculacion (
  codigo text primary key,
  secreto_hash text not null unique,
  vence timestamptz not null default (now() + interval '30 minutes')
);

-- ── Llamador ──────────────────────────────────────────────────────────────
create table public.llamados (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  texto text not null,
  destino text not null default '',
  creado timestamptz not null default now()
);
create index on public.llamados (org_id, creado desc);

-- ── Integraciones (Platovi y otras) ───────────────────────────────────────
create table public.integraciones (
  org_id uuid not null references public.organizaciones(id) on delete cascade,
  proveedor text not null check (proveedor in ('platovi')),
  externo_id text, -- id del restaurante en Platovi
  activa boolean not null default false,
  config jsonb not null default '{}',
  ultima_sincronizacion timestamptz,
  primary key (org_id, proveedor)
);

-- ── Límites de plan (en el servidor, no solo en el navegador) ────────────
create or replace function public.limite_plan(p_plan text, p_que text)
returns integer language sql immutable as $$
  select case p_que
    when 'pantallas' then case p_plan when 'gratis' then 1 when 'pro' then 3 else 15 end
    when 'diapositivas' then case p_plan when 'gratis' then 8 when 'pro' then 100 else 300 end
  end;
$$;

create or replace function public.validar_limites()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_plan text; v_total integer;
begin
  select plan into v_plan from organizaciones where id = new.org_id;
  if tg_table_name = 'pantallas' then
    select count(*) into v_total from pantallas where org_id = new.org_id;
    if v_total >= limite_plan(v_plan, 'pantallas') then
      raise exception 'Tu plan permite % pantallas. Cambia de plan para sumar más.', limite_plan(v_plan, 'pantallas');
    end if;
  elsif tg_table_name = 'diapositivas' then
    select count(*) into v_total from diapositivas where lista_id = new.lista_id;
    if v_total >= limite_plan(v_plan, 'diapositivas') then
      raise exception 'Tu plan permite % diapositivas por lista.', limite_plan(v_plan, 'diapositivas');
    end if;
    if new.tipo = 'video' and v_plan = 'gratis' then
      raise exception 'Los videos están en el plan Pro.';
    end if;
  end if;
  return new;
end $$;

create trigger limites_pantallas before insert on public.pantallas
  for each row execute function public.validar_limites();
create trigger limites_diapositivas before insert on public.diapositivas
  for each row execute function public.validar_limites();

create or replace function public.tocar_actualizado()
returns trigger language plpgsql as $$ begin new.actualizado = now(); return new; end $$;
create trigger t_cat before update on public.categorias for each row execute function public.tocar_actualizado();
create trigger t_prod before update on public.productos for each row execute function public.tocar_actualizado();

-- ── RLS ───────────────────────────────────────────────────────────────────
alter table public.organizaciones enable row level security;
alter table public.miembros enable row level security;
alter table public.superadmins enable row level security;
alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.listas enable row level security;
alter table public.diapositivas enable row level security;
alter table public.pantallas enable row level security;
alter table public.codigos_vinculacion enable row level security; -- sin políticas: solo vía funciones
alter table public.llamados enable row level security;
alter table public.integraciones enable row level security;

create policy org_leer on public.organizaciones for select using (public.es_miembro(id));
-- El dueño edita nombre, rubro, marca, moneda y zona; plan y canal solo cambian desde el servidor.
create policy org_editar on public.organizaciones for update using (public.es_miembro(id)) with check (public.es_miembro(id));
revoke update on public.organizaciones from authenticated;
grant update (nombre, rubro, marca, moneda, zona_horaria) on public.organizaciones to authenticated;

create policy miembros_leer on public.miembros for select using (user_id = auth.uid() or public.es_miembro(org_id));

do $$
declare t text;
begin
  foreach t in array array['categorias','productos','listas','diapositivas','llamados','integraciones'] loop
    execute format('create policy %1$s_todo on public.%1$s for all using (public.es_miembro(org_id)) with check (public.es_miembro(org_id))', t);
  end loop;
end $$;

-- Pantallas: se crean solo con vincular_pantalla(); se pueden leer, editar y borrar.
create policy pantallas_leer on public.pantallas for select using (public.es_miembro(org_id));
create policy pantallas_editar on public.pantallas for update using (public.es_miembro(org_id)) with check (public.es_miembro(org_id));
create policy pantallas_borrar on public.pantallas for delete using (public.es_miembro(org_id));
revoke update on public.pantallas from authenticated;
grant update (nombre, lista_id, orientacion, tema, llamador) on public.pantallas to authenticated;

-- ── Funciones del panel ───────────────────────────────────────────────────
create or replace function public.crear_organizacion(p_nombre text, p_rubro text)
returns public.organizaciones language plpgsql security definer set search_path = public as $$
declare v organizaciones;
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero.'; end if;
  insert into organizaciones (nombre, rubro) values (p_nombre, p_rubro) returning * into v;
  insert into miembros (org_id, user_id, rol) values (v.id, auth.uid(), 'dueno');
  return v;
end $$;

create or replace function public.vincular_pantalla(p_org uuid, p_codigo text, p_nombre text, p_lista uuid)
returns public.pantallas language plpgsql security definer set search_path = public as $$
declare v_cod codigos_vinculacion; v pantallas;
begin
  if not es_miembro(p_org) then raise exception 'Sin permiso.'; end if;
  select * into v_cod from codigos_vinculacion where codigo = upper(trim(p_codigo)) and vence > now();
  if not found then raise exception 'Ese código no existe o ya venció. Revisa el que aparece en la TV.'; end if;
  insert into pantallas (org_id, nombre, lista_id, secreto_hash)
    values (p_org, coalesce(nullif(trim(p_nombre), ''), 'Pantalla'), p_lista, v_cod.secreto_hash)
    returning * into v;
  delete from codigos_vinculacion where codigo = v_cod.codigo;
  return v;
end $$;

create or replace function public.llamar(p_org uuid, p_texto text, p_destino text)
returns public.llamados language plpgsql security definer set search_path = public as $$
declare v llamados; v_texto text := nullif(trim(p_texto), '');
begin
  if not es_miembro(p_org) then raise exception 'Sin permiso.'; end if;
  if v_texto is null then
    update organizaciones set turno_actual = turno_actual + 1 where id = p_org returning turno_actual::text into v_texto;
  end if;
  insert into llamados (org_id, texto, destino) values (p_org, v_texto, coalesce(p_destino, '')) returning * into v;
  delete from llamados where org_id = p_org and creado < now() - interval '2 days';
  return v;
end $$;

-- ── Funciones de la TV (sin sesión) ───────────────────────────────────────
create or replace function public.tv_solicitar_codigo(p_secreto text)
returns text language plpgsql security definer set search_path = public as $$
declare v_hash text := encode(extensions.digest(p_secreto, 'sha256'), 'hex'); v_codigo text; v_letras text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if length(p_secreto) < 20 then raise exception 'Secreto inválido.'; end if;
  if exists (select 1 from pantallas where secreto_hash = v_hash) then return null; end if;
  select codigo into v_codigo from codigos_vinculacion where secreto_hash = v_hash and vence > now();
  if found then return v_codigo; end if;
  delete from codigos_vinculacion where secreto_hash = v_hash or vence < now();
  loop
    v_codigo := (select string_agg(substr(v_letras, 1 + floor(random() * length(v_letras))::int, 1), '') from generate_series(1, 6));
    begin
      insert into codigos_vinculacion (codigo, secreto_hash) values (v_codigo, v_hash);
      exit;
    exception when unique_violation then -- otro código igual: probar de nuevo
    end;
  end loop;
  return v_codigo;
end $$;

create or replace function public.tv_paquete(p_secreto text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_p pantallas; v_o organizaciones;
begin
  update pantallas set ultimo_contacto = now()
    where secreto_hash = encode(extensions.digest(p_secreto, 'sha256'), 'hex') returning * into v_p;
  if not found then return null; end if;
  select * into v_o from organizaciones where id = v_p.org_id;
  return jsonb_build_object(
    'org', jsonb_build_object('id', v_o.id, 'nombre', v_o.nombre, 'rubro', v_o.rubro, 'marca', v_o.marca,
      'moneda', v_o.moneda, 'zona_horaria', v_o.zona_horaria, 'canal', v_o.canal, 'plan', v_o.plan),
    'pantalla', to_jsonb(v_p) - 'secreto_hash',
    'diapositivas', coalesce((select jsonb_agg(to_jsonb(d) order by d.orden) from diapositivas d where d.lista_id = v_p.lista_id), '[]'),
    'categorias', coalesce((select jsonb_agg(to_jsonb(c) order by c.orden) from categorias c where c.org_id = v_o.id), '[]'),
    'productos', coalesce((select jsonb_agg(to_jsonb(x) order by x.orden) from productos x where x.org_id = v_o.id), '[]'),
    'llamados', coalesce((select jsonb_agg(to_jsonb(l) order by l.creado desc) from
      (select * from llamados where org_id = v_o.id order by creado desc limit 8) l), '[]'),
    'generado', now()
  );
end $$;

revoke all on function public.tv_solicitar_codigo(text) from public;
revoke all on function public.tv_paquete(text) from public;
grant execute on function public.tv_solicitar_codigo(text) to anon, authenticated;
grant execute on function public.tv_paquete(text) to anon, authenticated;

-- ── Archivos (imágenes y videos) ──────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
  values ('medios', 'medios', true, 104857600)
  on conflict (id) do nothing;

create policy medios_subir on storage.objects for insert to authenticated
  with check (bucket_id = 'medios' and public.es_miembro(((storage.foldername(name))[1])::uuid));
create policy medios_borrar on storage.objects for delete to authenticated
  using (bucket_id = 'medios' and public.es_miembro(((storage.foldername(name))[1])::uuid));
