-- ==========================================
-- SCRIPT DE RESET TOTAL (profiles + membros)
-- ==========================================

-- 1. Garante que as tabelas existam com a estrutura EXATA
DROP TABLE IF EXISTS public.membros CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Criar Profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar Membros
CREATE TABLE public.membros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita Segurança (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;

-- 3. Cria Políticas de Acesso
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Full access to members for authenticated users" 
ON public.membros FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Insere VOCE como ADMIN (Substitua se o ID mudou)
INSERT INTO public.profiles (id, email, role)
VALUES ('0f7a85e9-bd55-4d1a-8cbe-184678ebf520', 'wesleymoisesantonio@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 5. Gatilho para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'member');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
