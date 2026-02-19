-- 1. Criar Tabela de Congregações
CREATE TABLE IF NOT EXISTS congregacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS para Congregações
ALTER TABLE congregacoes ENABLE ROW LEVEL SECURITY;

-- 3. Políticas para Congregações
DROP POLICY IF EXISTS "Allow all for authenticated users" ON congregacoes;
CREATE POLICY "Allow all for authenticated users" ON congregacoes FOR ALL TO authenticated USING (true);

-- 4. Atualizar Tabela de Pastores
-- Adicionar campo Cargo (se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pastores' AND column_name = 'cargo') THEN
        ALTER TABLE pastores ADD COLUMN cargo TEXT;
    END IF;
END $$;

-- Adicionar campo Congregação (se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pastores' AND column_name = 'congregacao_id') THEN
        ALTER TABLE pastores ADD COLUMN congregacao_id UUID REFERENCES congregacoes(id) ON DELETE SET NULL;
    END IF;
END $$;
