-- Execute esse comando no SQL Editor do seu painel Supabase
-- Isso criará o perfil de administrador para a sua conta atual

INSERT INTO public.profiles (id, email, role)
VALUES ('0f7a85e9-bd55-4d1a-8cbe-184678ebf520', 'wesleymoisesantonio@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = EXCLUDED.email;
