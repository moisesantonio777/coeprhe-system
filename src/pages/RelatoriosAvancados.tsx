import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

export default function RelatoriosAvancados() {
    const [data, setData] = useState({
        membros: [] as any[],
        pastores: [] as any[],
        departamentos: [] as any[]
    });
    const [loading, setLoading] = useState(true);
    const [mensagem, setMensagem] = useState("");

    const fetchData = async () => {
        setLoading(true);
        const [mRes, pRes, dRes] = await Promise.all([
            supabase.from("membros").select("*"),
            supabase.from("pastores").select("*, departamentos(nome)"),
            supabase.from("departamentos").select("*")
        ]);

        setData({
            membros: mRes.data || [],
            pastores: pRes.data || [],
            departamentos: dRes.data || []
        });
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const statusMembros = [
        { name: "Ativos", value: data.membros.filter(m => m.status === "ativo").length },
        { name: "Inativos", value: data.membros.filter(m => m.status === "inativo").length }
    ];

    const membrosPorCargo = data.membros.reduce((acc: any[], current) => {
        const cargo = current.cargo || "Não definido";
        const existing = acc.find(a => a.name === cargo);
        if (existing) existing.count += 1;
        else acc.push({ name: cargo, count: 1 });
        return acc;
    }, []).slice(0, 5);

    const COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];

    const exportSuperPDF = async () => {
        setMensagem("⌛ Gerando Relatório Institucional...");
        try {
            const { default: jsPDF } = await import("jspdf");
            const { default: autoTable } = await import("jspdf-autotable");
            const doc = new jsPDF();

            const addHeader = (title: string) => {
                // Tenta carregar o logo se o usuário salvou em /public/logo.png
                try {
                    doc.addImage("/logo.png", "PNG", 14, 8, 22, 22);
                } catch (e) {
                    console.log("Logo não encontrado em /public/logo.png");
                }

                doc.setFontSize(22);
                doc.setTextColor(22, 78, 99);
                doc.text("COEPRHE", 42, 18);

                doc.setFontSize(9);
                doc.setTextColor(120);
                doc.text("Casa de Oração e Ensinamento da Palavra Rhema", 42, 23);

                doc.setFontSize(11);
                doc.setTextColor(0);
                doc.text(title, 42, 29);

                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Emitido: ${new Date().toLocaleString()}`, 160, 29);

                doc.setDrawColor(230);
                doc.line(14, 34, 196, 34);
            };

            // PÁGINA 1: MEMBROS
            addHeader("RELATÓRIO GERAL DE MEMBROS");
            autoTable(doc, {
                startY: 40,
                head: [["Nome", "Cargo", "Status"]],
                body: data.membros.map(m => [m.nome, m.cargo || "-", m.status.toUpperCase()]),
                headStyles: { fillColor: [22, 78, 99], fontSize: 10 },
                styles: { fontSize: 9 },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index === 2) {
                        const val = data.cell.raw as string;
                        if (val === "ATIVO") data.cell.styles.textColor = [16, 185, 129];
                        if (val === "INATIVO") data.cell.styles.textColor = [239, 68, 68];
                    }
                }
            });

            // PÁGINA 2: LIDERANÇA
            doc.addPage();
            addHeader("RELATÓRIO DE LIDERANÇA E PASTORES");
            autoTable(doc, {
                startY: 40,
                head: [["Nome", "Telefone", "Departamento"]],
                body: data.pastores.map(p => [p.nome, p.telefone || "-", p.departamentos?.nome || "Geral"]),
                headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
                styles: { fontSize: 9 }
            });

            // PÁGINA 3: ESTRUTURA
            doc.addPage();
            addHeader("ESTRUTURA DE DEPARTAMENTOS");
            autoTable(doc, {
                startY: 40,
                head: [["Departamento", "Status"]],
                body: data.departamentos.map(d => [d.nome, d.status.toUpperCase()]),
                headStyles: { fillColor: [5, 150, 105], fontSize: 10 },
                styles: { fontSize: 9 }
            });

            doc.save(`SuperRelatorio_COEPRHE_${Date.now()}.pdf`);
            setMensagem("✅ PDF gerado com sucesso!");
        } catch (error) {
            setMensagem("❌ Erro ao exportar relatório.");
            console.error(error);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-blue-600 font-bold">Consolidando visão pastoral...</div>;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-xl border border-blue-50 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Inteligência Estratégica</h2>
                    <p className="text-slate-400 text-sm mt-1">Dados consolidados para tomada de decisão</p>
                </div>
                <button
                    onClick={exportSuperPDF}
                    className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                    💎 GERAR RELATÓRIO INSTITUCIONAL
                </button>
            </div>

            {mensagem && (
                <div className="bg-blue-600 text-white p-4 rounded-2xl text-center font-bold text-sm shadow-lg animate-in slide-in-from-top duration-300">
                    {mensagem}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                        Saúde da Membresia
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusMembros} cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={85}
                                    paddingAngle={10} dataKey="value" stroke="none"
                                >
                                    {statusMembros.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                        Principais Funções
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={membrosPorCargo}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={35} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: "Membros", val: data.membros.length, icon: "🛡️", color: "text-blue-600" },
                    { label: "Liderança", val: data.pastores.length, icon: "👑", color: "text-indigo-600" },
                    { label: "Deptos", val: data.departamentos.length, icon: "🏛️", color: "text-emerald-600" }
                ].map(card => (
                    <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="text-3xl">{card.icon}</div>
                        <div>
                            <h4 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{card.label}</h4>
                            <p className={`text-3xl font-black ${card.color}`}>{card.val}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
