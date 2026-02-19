import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function ListagemMembros() {
    const [membros, setMembros] = useState<any[]>([]);
    const [editId, setEditId] = useState<string | null>(null);
    const [editNome, setEditNome] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editTelefone, setEditTelefone] = useState("");
    const [editCargo, setEditCargo] = useState("");
    const [mensagem, setMensagem] = useState("");

    // Estdos para Busca e Filtro (necessários para o fetch)
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCargo, setFilterCargo] = useState("");

    // Estados para Paginação e Ordenação
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const fetchMembros = async () => {
        let query = supabase.from("membros").select("*");

        // Busca e filtros
        if (search) query = query.ilike("nome", `%${search}%`).or(`email.ilike.%${search}%`);
        if (filterStatus) query = query.eq("status", filterStatus);
        if (filterCargo) query = query.eq("cargo", filterCargo);

        // Ordenação
        query = query.order(sortColumn, { ascending: sortDirection === "asc" });

        // Paginação
        query = query.range((page - 1) * pageSize, page * pageSize - 1);

        const { data, error } = await query;
        if (error) console.error("Erro ao buscar membros:", error);
        else setMembros(data || []);
    };

    useEffect(() => { fetchMembros(); }, [page, sortColumn, sortDirection, search, filterStatus, filterCargo]);

    const handleEdit = (m: any) => {
        setEditId(m.id); setEditNome(m.nome); setEditEmail(m.email || "");
        setEditTelefone(m.telefone || ""); setEditCargo(m.cargo || ""); setMensagem("");
    };

    const handleUpdate = async () => {
        const { error } = await supabase.from("membros").update({ nome: editNome, email: editEmail, telefone: editTelefone, cargo: editCargo }).eq("id", editId);
        if (error) setMensagem("Erro: " + error.message);
        else { setMensagem("Atualizado!"); setEditId(null); fetchMembros(); }
    };

    const handleInativar = async (id: string, nome: string) => {
        if (!confirm(`Deseja realmente inativar o membro ${nome}?`)) return;

        const { error } = await supabase.from("membros").update({ status: "inativo" }).eq("id", id);
        if (error) setMensagem("Erro: " + error.message);
        else fetchMembros();
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const exportCSV = () => {
        if (membros.length === 0) {
            alert("Não há membros para exportar!");
            return;
        }

        const headers = ["Nome", "Email", "Telefone", "Cargo", "Status", "Criado em"];
        const rows = membros.map(m => [
            m.nome,
            m.email || "",
            m.telefone || "",
            m.cargo || "",
            m.status,
            new Date(m.created_at).toLocaleDateString(),
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `membros_coeprhe_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportPDF = async () => {
        if (membros.length === 0) {
            alert("Não há membros para exportar!");
            return;
        }

        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");
            const doc = new jsPDF();

            // Cabeçalho Profissional COEPRHE (Vetorial)
            doc.setFontSize(18);
            doc.setTextColor(22, 78, 99); // Blue 900
            doc.text("COEPRHE - Casa de Oração Rhema", 14, 15);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text("Relatório Geral de Membros", 14, 22);
            doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 27);

            doc.setDrawColor(200);
            doc.line(14, 30, 196, 30);

            // Tabela Vetorial de Alta Qualidade
            autoTable(doc, {
                startY: 35,
                head: [["Nome", "Email", "Telefone", "Cargo", "Status"]],
                body: membros.map(m => [
                    m.nome,
                    m.email || "N/A",
                    m.telefone || "N/A",
                    m.cargo || "-",
                    m.status.toUpperCase()
                ]),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 9, cellPadding: 3 },
                alternateRowStyles: { fillColor: [245, 247, 250] },
            });

            doc.save(`relatorio_membros_coeprhe_${Date.now()}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar PDF. Certifique-se de ter instalado: npm install jspdf jspdf-autotable");
        }
    };

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl text-black">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Lista Registrada</h2>
                    <p className="text-sm text-gray-500">Gerencie e exporte os dados da congregação</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button
                        onClick={exportCSV}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition font-bold text-sm border border-slate-200"
                    >
                        📂 CSV
                    </button>
                    <button
                        onClick={exportPDF}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition font-bold text-sm shadow-md"
                    >
                        📄 Gerar PDF
                    </button>
                </div>
            </div>

            {/* Busca e Filtros Simples */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="relative">
                    <input
                        className="w-full border border-gray-200 bg-gray-50 p-2.5 pl-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm"
                        placeholder="🔎 Buscar nome ou email..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <select className="border border-gray-200 bg-gray-50 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                    <option value="">Status: Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                </select>
                <div className="relative sm:col-span-2 lg:col-span-1">
                    <input
                        className="w-full border border-gray-200 bg-gray-50 p-2.5 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm"
                        placeholder="👔 Filtrar por cargo..."
                        value={filterCargo}
                        onChange={e => { setFilterCargo(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {mensagem && (
                <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${mensagem.includes("Erro") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                    {mensagem}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-left">
                            <th className="p-3 font-bold border-b cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("nome")}>
                                Nome {sortColumn === "nome" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="p-3 font-bold border-b cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("email")}>
                                Email {sortColumn === "email" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="p-3 font-bold border-b">Telefone</th>
                            <th className="p-3 font-bold border-b cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("cargo")}>
                                Cargo {sortColumn === "cargo" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="p-3 font-bold border-b cursor-pointer hover:text-blue-600 transition" onClick={() => handleSort("status")}>
                                Status {sortColumn === "status" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                            </th>
                            <th className="p-3 font-bold border-b text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {membros.map(m => (
                            <tr
                                key={m.id}
                                className={`hover:bg-blue-50 transition border-b border-gray-50 ${new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                    ? "bg-yellow-50/50"
                                    : ""
                                    }`}
                            >
                                {editId === m.id ? (
                                    <>
                                        <td className="p-3"><input className="w-full border p-2 rounded-lg text-black focus:ring-1 focus:ring-blue-500" value={editNome} onChange={e => setEditNome(e.target.value)} /></td>
                                        <td className="p-3"><input className="w-full border p-2 rounded-lg text-black focus:ring-1 focus:ring-blue-500" value={editEmail} onChange={e => setEditEmail(e.target.value)} /></td>
                                        <td className="p-3"><input className="w-full border p-2 rounded-lg text-black focus:ring-1 focus:ring-blue-500" value={editTelefone} onChange={e => setEditTelefone(e.target.value)} /></td>
                                        <td className="p-3"><input className="w-full border p-2 rounded-lg text-black focus:ring-1 focus:ring-blue-500" value={editCargo} onChange={e => setEditCargo(e.target.value)} /></td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-white font-bold text-[10px] uppercase tracking-tighter ${m.status === "ativo" ? "bg-green-500" : "bg-red-500"}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="p-3 flex gap-2 justify-center">
                                            <button onClick={handleUpdate} className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 shadow-sm text-xs font-bold">Salvar</button>
                                            <button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-3 py-1.5 rounded-lg hover:bg-gray-500 shadow-sm text-xs font-bold">Voltar</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-3 font-medium text-gray-900">{m.nome}</td>
                                        <td className="p-3 text-gray-500">{m.email}</td>
                                        <td className="p-3 text-gray-500">{m.telefone}</td>
                                        <td className="p-3 text-gray-600">{m.cargo}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-white font-bold text-[10px] uppercase tracking-tighter shadow-sm ${m.status === "ativo" ? "bg-green-500" : "bg-red-500"}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => handleEdit(m)} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 text-xs font-bold transition">Editar</button>
                                                {m.status !== "inativo" && (
                                                    <button
                                                        onClick={() => handleInativar(m.id, m.nome)}
                                                        className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 text-xs font-bold transition"
                                                    >
                                                        Inativar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between mt-6 items-center gap-4">
                <button
                    className="w-full sm:w-auto bg-white border border-gray-200 px-4 py-2 rounded-xl disabled:opacity-30 text-gray-700 font-bold hover:bg-gray-50 transition text-sm shadow-sm"
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    ← Anterior
                </button>
                <div className="px-4 py-1.5 bg-blue-50 rounded-full text-blue-700 text-xs font-bold tracking-widest uppercase">
                    Página {page}
                </div>
                <button
                    className="w-full sm:w-auto bg-white border border-gray-200 px-4 py-2 rounded-xl disabled:opacity-30 text-gray-700 font-bold hover:bg-gray-50 transition text-sm shadow-sm"
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={membros.length < pageSize}
                >
                    Próximo →
                </button>
            </div>

            {membros.length === 0 && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center mt-6">
                    <p className="text-gray-400 font-medium">{search === "" ? "Nenhum membro registrado no sistema." : `Nenhum resultado para "${search}".`}</p>
                </div>
            )}
        </div>
    );
}
