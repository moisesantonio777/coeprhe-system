import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import Modal from "../components/ui/Modal.tsx";

export default function GerenciamentoPastores() {
    const [pastores, setPastores] = useState<any[]>([]);
    const [departamentos, setDepartamentos] = useState<any[]>([]);
    const [congregacoes, setCongregacoes] = useState<any[]>([]);

    // Estados do Formulário
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cargo, setCargo] = useState("");
    const [departamento_id, setDepartamentoId] = useState("");
    const [congregacao_id, setCongregacaoId] = useState("");

    // Estados de Edição
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editTelefone, setEditTelefone] = useState("");
    const [editCargo, setEditCargo] = useState("");
    const [editDepto, setEditDepto] = useState("");
    const [editCongregacao, setEditCongregacao] = useState("");

    // Estados de UI
    const [mensagem, setMensagem] = useState("");
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [novaCongregacaoNome, setNovaCongregacaoNome] = useState("");

    const fetchPastores = async () => {
        let query = supabase
            .from("pastores")
            .select("*, departamentos(nome), congregacoes(nome)")
            .order("nome", { ascending: true });

        if (search) query = query.ilike("nome", `%${search}%`);

        const { data, error } = await query;
        if (error) console.error(error);
        else setPastores(data || []);
    };

    const fetchDepartamentos = async () => {
        const { data } = await supabase.from("departamentos").select("id, nome").eq("status", "ativo");
        setDepartamentos(data || []);
    };

    const fetchCongregacoes = async () => {
        const { data } = await supabase.from("congregacoes").select("id, nome").eq("status", "ativo");
        setCongregacoes(data || []);
    };

    useEffect(() => {
        fetchPastores();
        fetchDepartamentos();
        fetchCongregacoes();
    }, [search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from("pastores").insert([{
            nome, email, telefone, cargo,
            departamento_id: departamento_id || null,
            congregacao_id: congregacao_id || null,
            status: "ativo"
        }]);

        if (error) setMensagem("Erro: " + error.message);
        else {
            setMensagem("Pastor cadastrado!");
            setNome(""); setEmail(""); setTelefone(""); setCargo("");
            setDepartamentoId(""); setCongregacaoId("");
            fetchPastores();
        }
    };

    const handleUpdate = async () => {
        const { error } = await supabase.from("pastores").update({
            nome: editNome,
            email: editEmail,
            telefone: editTelefone,
            cargo: editCargo,
            departamento_id: editDepto || null,
            congregacao_id: editCongregacao || null
        }).eq("id", editId);

        if (error) setMensagem("Erro: " + error.message);
        else {
            setMensagem("Atualizado!");
            setEditId(null);
            fetchPastores();
        }
    };

    const handleCreateCongregacao = async () => {
        if (!novaCongregacaoNome) return;

        const { data, error } = await supabase
            .from("congregacoes")
            .insert([{ nome: novaCongregacaoNome, status: "ativo" }])
            .select()
            .single();

        if (error) {
            alert("Erro ao criar congregação: " + error.message);
        } else {
            await fetchCongregacoes();
            setCongregacaoId(data.id);
            setNovaCongregacaoNome("");
            setIsModalOpen(false);
        }
    };

    const handleInativar = async (id: string, nome: string) => {
        if (!confirm(`Deseja inativar o pastor ${nome}?`)) return;
        const { error } = await supabase.from("pastores").update({ status: "inativo" }).eq("id", id);
        if (error) setMensagem("Erro: " + error.message);
        else fetchPastores();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Pastores e Líderes</h2>
                <p className="text-sm text-gray-400">Gestão ministerial da casa</p>
            </div>

            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
                <input className="border border-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nome do Pastor" value={nome} onChange={e => setNome(e.target.value)} required />
                <input className="border border-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
                <input className="border border-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />
                <input className="border border-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cargo (Ex: Pastor Titular)" value={cargo} onChange={e => setCargo(e.target.value)} />

                <select className="border border-white p-3 rounded-xl outline-none" value={departamento_id} onChange={e => setDepartamentoId(e.target.value)}>
                    <option value="">Selecione o Departamento</option>
                    {departamentos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>

                <div className="flex gap-2">
                    <select className="flex-1 border border-white p-3 rounded-xl outline-none" value={congregacao_id} onChange={e => setCongregacaoId(e.target.value)}>
                        <option value="">Selecione a Congregação</option>
                        {congregacoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-blue-600 border border-blue-100 px-4 rounded-xl hover:bg-blue-50 transition font-bold text-xl"
                        title="Criar nova congregação"
                    >
                        +
                    </button>
                </div>

                <button type="submit" className="md:col-span-2 lg:col-span-3 bg-blue-700 text-white p-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-100 uppercase tracking-tighter">✨ Cadastrar Líder</button>
            </form>

            <div className="mb-4">
                <input
                    className="w-full border border-gray-100 bg-gray-50 p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="🔎 Pesquisar pastores por nome..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {mensagem && <p className="mb-4 text-center text-sm font-bold text-green-600 animate-pulse">{mensagem}</p>}

            <div className="overflow-x-auto rounded-xl border border-gray-50 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest">
                            <th className="p-4 border-b">Nome / Cargo</th>
                            <th className="p-4 border-b">E-mail / Telefone</th>
                            <th className="p-4 border-b">Estrutura (Depto/Congr)</th>
                            <th className="p-4 border-b text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pastores.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/20 transition border-b border-gray-50">
                                <td className="p-4">
                                    {editId === p.id ? (
                                        <div className="space-y-1">
                                            <input className="border p-2 rounded-lg w-full text-sm font-bold" value={editNome} onChange={e => setEditNome(e.target.value)} />
                                            <input className="border p-2 rounded-lg w-full text-xs" value={editCargo} onChange={e => setEditCargo(e.target.value)} placeholder="Cargo" />
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="font-bold text-gray-700">{p.nome}</div>
                                            <div className="text-[10px] text-gray-400 uppercase">{p.cargo || "Sem cargo"}</div>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-xs">
                                    {editId === p.id ? (
                                        <div className="space-y-1">
                                            <input className="border p-1.5 rounded w-full" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email" />
                                            <input className="border p-1.5 rounded w-full" value={editTelefone} onChange={e => setEditTelefone(e.target.value)} placeholder="Telefone" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-gray-600">{p.email || "Sem email"}</div>
                                            <div className="text-blue-500 font-semibold">{p.telefone || "Sem telefone"}</div>
                                        </>
                                    )}
                                </td>
                                <td className="p-4">
                                    {editId === p.id ? (
                                        <div className="space-y-1">
                                            <select className="border p-2 rounded w-full text-xs" value={editDepto} onChange={e => setEditDepto(e.target.value)}>
                                                <option value="">Depto: Geral</option>
                                                {departamentos.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                                            </select>
                                            <select className="border p-2 rounded w-full text-xs" value={editCongregacao} onChange={e => setEditCongregacao(e.target.value)}>
                                                <option value="">Congregação: Geral</option>
                                                {congregacoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg font-bold text-[9px] uppercase w-fit text-center">
                                                {p.departamentos?.nome || "Geral"}
                                            </span>
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-bold text-[9px] uppercase w-fit text-center">
                                                {p.congregacoes?.nome || "Sede"}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-3">
                                        {editId === p.id ? (
                                            <>
                                                <button onClick={handleUpdate} className="text-green-600 font-bold hover:underline">Salvar</button>
                                                <button onClick={() => setEditId(null)} className="text-gray-400 font-bold hover:underline">Fechar</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => {
                                                    setEditId(p.id);
                                                    setEditNome(p.nome);
                                                    setEditEmail(p.email || "");
                                                    setEditTelefone(p.telefone || "");
                                                    setEditCargo(p.cargo || "");
                                                    setEditDepto(p.departamento_id || "");
                                                    setEditCongregacao(p.congregacao_id || "");
                                                }} className="text-blue-500 hover:text-blue-800 transition">📝</button>
                                                {p.status !== "inativo" && (
                                                    <button onClick={() => handleInativar(p.id, p.nome)} className="text-red-400 hover:text-red-600 transition">🚫</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal para Nova Congregação */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nova Congregação"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nome da Unidade</label>
                        <input
                            className="w-full border border-gray-200 bg-gray-50 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Ex: Rhema Central"
                            value={novaCongregacaoNome}
                            onChange={e => setNovaCongregacaoNome(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleCreateCongregacao}
                        className="w-full bg-blue-600 text-white p-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                    >
                        CRIAR CONGREGAÇÃO
                    </button>
                </div>
            </Modal>
        </div>
    );
}
