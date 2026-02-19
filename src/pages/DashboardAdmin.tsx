import CadastroMembro from "./CadastroMembro.tsx";
import ListagemMembros from "./ListagemMembros.tsx";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import RelatoriosAvancados from "./RelatoriosAvancados.tsx"
import Configuracoes from "./Configuracoes.tsx"

export default function DashboardAdmin() {
    const [atualizarLista, setAtualizarLista] = useState(0);
    const [abaAtiva, setAbaAtiva] = useState<"membros" | "departamentos" | "relatorios" | "configuracoes">("membros");
    const [stats, setStats] = useState({ ativos: 0, inativos: 0, total: 0 });

    const fetchStats = async () => {
        const { data } = await supabase.from("membros").select("status");
        if (data) {
            const ativos = data.filter(m => m.status === "ativo").length;
            const inativos = data.filter(m => m.status === "inativo").length;
            setStats({ ativos, inativos, total: data.length });
        }
    };

    useEffect(() => { fetchStats(); }, [atualizarLista]);

    const chartData = [
        { name: "Ativos", value: stats.ativos },
        { name: "Inativos", value: stats.inativos },
    ];
    const COLORS = ["#10b981", "#ef4444"];

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-black font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-blue-900">Gestão de Membros</h1>
                <p className="text-gray-500 mt-1">Rhema COEPRHE - Painel Administrativo</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Card Total */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total de Membros</h3>
                        <p className="text-5xl font-black text-blue-600 mt-2">{stats.total}</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-green-600 font-bold">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> {stats.ativos} Ativos
                        </span>
                        <span className="flex items-center gap-1.5 text-red-500 font-bold">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> {stats.inativos} Inativos
                        </span>
                    </div>
                </div>

                {/* Card Recharts */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col md:flex-row items-center">
                    <div className="w-full h-48 md:w-1/2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%" cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {chartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-8 text-center md:text-left">
                        <h4 className="text-lg font-bold text-gray-800">Distribuição de Status</h4>
                        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                            Acompanhamento em tempo real da saúde da congregação. Use esses dados para planejar visitas e ações de integração.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_2fr] gap-10 items-start">
                <section>
                    <CadastroMembro onCadastro={() => setAtualizarLista(prev => prev + 1)} />
                </section>
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <ListagemMembros key={atualizarLista} />
                </section>
            </div>
        </div>
    );
}
