-- Tabela de Departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pastores
CREATE TABLE IF NOT EXISTS pastores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    telefone TEXT,
    departamento_id UUID REFERENCES departamentos(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastores ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
DROP POLICY IF EXISTS "Allow all for authenticated users" ON departamentos;
CREATE POLICY "Allow all for authenticated users" ON departamentos FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON pastores;
CREATE POLICY "Allow all for authenticated users" ON pastores FOR ALL TO authenticated USING (true);
