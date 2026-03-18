-- ═══════════════════════════════════════════════════════
--  SUPABASE MIGRATION — Birthday Studio
--  Collez ce SQL dans : Supabase > SQL Editor > New Query
-- ═══════════════════════════════════════════════════════

-- 1. Table des cartes d'anniversaire
CREATE TABLE IF NOT EXISTS public.cards (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text NOT NULL,
  age         text,
  message     text,
  model       text NOT NULL DEFAULT 'arch',
  theme       text NOT NULL DEFAULT 'noir',
  photo_b64   text,         -- photo encodée en base64
  thumb_b64   text,         -- miniature 120x160 base64
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 2. Index pour accélérer les requêtes par user
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS cards_created_at_idx ON public.cards(created_at DESC);

-- 3. Row Level Security (RLS) — chaque utilisateur ne voit que ses cartes
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Politique : lecture → uniquement ses propres cartes
CREATE POLICY "users_read_own_cards"
  ON public.cards FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : insertion → uniquement pour soi-même
CREATE POLICY "users_insert_own_cards"
  ON public.cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique : suppression → uniquement ses propres cartes
CREATE POLICY "users_delete_own_cards"
  ON public.cards FOR DELETE
  USING (auth.uid() = user_id);

-- 4. (Optionnel) Limiter le nombre de cartes par utilisateur à 50
--    pour éviter les abus sur le plan gratuit
CREATE OR REPLACE FUNCTION check_card_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.cards WHERE user_id = NEW.user_id) >= 50 THEN
    RAISE EXCEPTION 'Limite de 50 cartes atteinte. Supprimez-en pour continuer.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_card_limit
  BEFORE INSERT ON public.cards
  FOR EACH ROW EXECUTE FUNCTION check_card_limit();
