import GerenciamentoDepartamentos from "./GerenciamentoDepartamentos.tsx";
import GerenciamentoPastores from "./GerenciamentoPastores.tsx";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export default function DashboardDepartamentos() {
    const [stats, setStats] = useState({ deptos: 0, pastores: 0 });

    const fetchStats = async () => {
        const { count: deptos } = await supabase.from("departamentos").select("*", { count: 'exact', head: true });
        const { count: pastores } = await supabase.from("pastores").select("*", { count: 'exact', head: true });
        setStats({ deptos: deptos || 0, pastores: pastores || 0 });
    };

    useEffect(() => { fetchStats(); }, []);

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Total Departamentos</h3>
                        <p className="text-6xl font-black text-blue-600 mt-1">{stats.deptos}</p>
                    </div>
                    <div className="text-5xl opacity-20">🏢</div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Pastores e Líderes</h3>
                        <p className="text-6xl font-black text-indigo-600 mt-1">{stats.pastores}</p>
                    </div>
                    <div className="text-5xl opacity-20">👔</div>
                </div>
            </div>

            <GerenciamentoDepartamentos />
            <GerenciamentoPastores />
        </div>
    );
}
