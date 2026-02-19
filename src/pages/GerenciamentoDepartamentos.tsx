import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function GerenciamentoDepartamentos() {
    const [departamentos, setDepartamentos] = useState<any[]>([]);
    const [nome, setNome] = useState("");
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");
    const [mensagem, setMensagem] = useState("");

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const fetchDepartamentos = async () => {
        let query = supabase.from("departamentos").select("*").order("nome", { ascending: true });
        if (search) query = query.ilike("nome", `%${search}%`);
        if (filterStatus) query = query.eq("status", filterStatus);

        const { data, error } = await query;
        if (error) console.error(error);
        else setDepartamentos(data || []);
    };

    useEffect(() => { fetchDepartamentos(); }, [search, filterStatus]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from("departamentos").insert([{ nome, status: "ativo" }]);
        if (error) setMensagem("Erro: " + error.message);
        else {
            setMensagem("Departamento criado!");
            setNome("");
            fetchDepartamentos();
        }
    };

    const handleUpdate = async () => {
        const { error } = await supabase.from("departamentos").update({ nome: editNome }).eq("id", editId);
        if (error) setMensagem("Erro: " + error.message);
        else {
            setMensagem("Atualizado com sucesso!");
            setEditId(null);
            fetchDepartamentos();
        }
    };

    const handleInativar = async (id: string, nome: string) => {
        if (!confirm(`Deseja inativar o departamento ${nome}?`)) return;
        const { error } = await supabase.from("departamentos").update({ status: "inativo" }).eq("id", id);
        if (error) setMensagem("Erro: " + error.message);
        else fetchDepartamentos();
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Departamentos</h2>
                    <p className="text-sm text-gray-400">Gerencie os setores da igreja</p>
                </div>
            </div>

            <form onSubmit={handleCreate} className="mb-8 flex gap-2">
                <input
                    className="flex-1 border bg-gray-50 border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Novo Departamento (ex: Infantil)"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                />
                <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">ADICIONAR</button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                    className="border border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="🔎 Buscar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    className="border border-gray-100 bg-gray-50 p-2.5 rounded-xl text-sm outline-none"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="">Status: Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                </select>
            </div>

            {mensagem && <p className="mb-4 text-center text-sm font-bold text-blue-600 uppercase tracking-widest animate-pulse">{mensagem}</p>}

            <div className="overflow-x-auto rounded-xl border border-gray-50">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                            <th className="p-4 border-b">Nome</th>
                            <th className="p-4 border-b">Status</th>
                            <th className="p-4 border-b text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departamentos.map(d => (
                            <tr key={d.id} className="hover:bg-blue-50/30 transition border-b border-gray-50">
                                <td className="p-4">
                                    {editId === d.id ? (
                                        <input className="border p-2 rounded-lg w-full focus:ring-1 focus:ring-blue-500 outline-none" value={editNome} onChange={e => setEditNome(e.target.value)} />
                                    ) : (
                                        <span className="font-medium text-gray-700">{d.nome}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${d.status === "ativo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {d.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        {editId === d.id ? (
                                            <>
                                                <button onClick={handleUpdate} className="text-green-600 font-bold hover:underline">Salvar</button>
                                                <button onClick={() => setEditId(null)} className="text-gray-400 font-bold hover:underline">Cancelar</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => { setEditId(d.id); setEditNome(d.nome); }} className="text-blue-600 font-bold hover:underline">Editar</button>
                                                {d.status !== "inativo" && (
                                                    <button onClick={() => handleInativar(d.id, d.nome)} className="text-red-400 hover:text-red-600 font-bold transition">Inativar</button>
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
        </div>
    );
}
