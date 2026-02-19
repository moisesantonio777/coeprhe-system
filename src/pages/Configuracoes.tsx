import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export default function Configuracoes() {
    const [usuarios, setUsuarios] = useState<any[]>([]);
    const [config, setConfig] = useState({
        pageSize: 10,
        primaryColor: "#3b82f6",
        appName: "Sistema COEPRHE",
        allowPublicReg: true
    });
    const [mensagem, setMensagem] = useState("");

    // Vamos buscar os perfis de usuários (da tabela profiles se existir, ou simular)
    const fetchUsers = async () => {
        // Nota: Em cenários reais, buscaríamos de uma tabela de 'profiles'
        // vinculada ao auth.users.
        const { data, error } = await supabase.from("membros").select("id, nome, email, cargo, status").limit(5);
        if (!error) setUsuarios(data || []);
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSaveConfig = () => {
        setMensagem("⌛ Salvando configurações...");
        setTimeout(() => {
            setMensagem("✅ Configurações salvas com sucesso!");
            setTimeout(() => setMensagem(""), 3000);
        }, 800);
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Configurações do Sistema</h2>
                <p className="text-slate-400 text-sm">Controle administrativo e personalização</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gestão de Acessos */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                            Gerenciamento de Usuários
                        </h3>
                        <button className="text-xs font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition">VER TODOS</button>
                    </div>

                    <div className="space-y-4 flex-1">
                        {usuarios.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition border border-transparent hover:border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {user.nome[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{user.nome}</p>
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{user.cargo || "ADMIN"}</p>
                                    </div>
                                </div>
                                <select className="text-[10px] font-black uppercase bg-white border border-gray-200 px-2 py-1 rounded-lg outline-none cursor-pointer">
                                    <option>Admin</option>
                                    <option>Líder</option>
                                    <option>Editor</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferências Gerais */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
                        Preferências Globais
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registros por Página</label>
                            <input
                                type="number"
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={config.pageSize}
                                onChange={e => setConfig({ ...config, pageSize: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cor Predominante</label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="color"
                                    className="w-12 h-12 rounded-xl border-none cursor-pointer"
                                    value={config.primaryColor}
                                    onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                                />
                                <span className="text-sm font-mono text-gray-500">{config.primaryColor}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div>
                                <p className="text-sm font-bold text-blue-900">Cadastro Público</p>
                                <p className="text-[10px] text-blue-400">Permitir que novos membros se auto-registrem</p>
                            </div>
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-blue-600"
                                checked={config.allowPublicReg}
                                onChange={e => setConfig({ ...config, allowPublicReg: e.target.checked })}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSaveConfig}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition"
                    >
                        SALVAR ALTERAÇÕES
                    </button>
                    {mensagem && <p className="text-center text-sm font-bold text-blue-600 animate-pulse">{mensagem}</p>}
                </div>
            </div>

            {/* Logs de Atividade */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-2 h-6 bg-slate-900 rounded-full"></span>
                        Logs de Atividade
                    </h3>
                    <button className="text-xs font-black text-slate-400 hover:text-slate-900 transition underline">LIMPAR TODOS</button>
                </div>
                <div className="space-y-3 overflow-hidden">
                    {[
                        { action: "Login realizado", user: "Admin", time: "Há 2 mins", type: "auth" },
                        { action: "Novo membro cadastrado: Ana Costa", user: "Pr. Marcos", time: "Há 15 mins", type: "data" },
                        { action: "Relatório Mensal Gerado", user: "Admin", time: "Há 1 hora", type: "export" },
                        { action: "Alteração de permissão aplicada", user: "Admin", time: "Ontem, 22:40", type: "sys" },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-4 text-xs p-3 hover:bg-slate-50 rounded-xl transition cursor-default">
                            <span className="text-gray-400 font-mono w-24">{log.time}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter w-16 text-center 
                                ${log.type === 'auth' ? 'bg-blue-100 text-blue-600' :
                                    log.type === 'data' ? 'bg-green-100 text-green-600' :
                                        log.type === 'export' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}
                            >
                                {log.type}
                            </span>
                            <span className="font-bold text-slate-700">{log.user}</span>
                            <span className="text-slate-500">—</span>
                            <span className="text-slate-400">{log.action}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
