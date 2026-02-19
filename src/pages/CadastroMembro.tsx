import { useState } from "react";
import { supabase } from "../services/supabase";

export default function CadastroMembro({ onCadastro }: { onCadastro: () => void }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cargo, setCargo] = useState("");
    const [mensagem, setMensagem] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const { error } = await supabase.from("membros").insert([{ nome, email, telefone, cargo, status: 'ativo' }]);
        if (error) setMensagem("Erro: " + error.message);
        else {
            setMensagem("Membro cadastrado com sucesso!");
            setNome(""); setEmail(""); setTelefone(""); setCargo("");
            onCadastro();
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">Novo Cadastro</h2>
                <p className="text-sm text-gray-400">Adicione um novo membro à congregação</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                        <input
                            className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="Ex: João da Silva"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-mail</label>
                        <input
                            type="email"
                            className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                            placeholder="email@exemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Telefone</label>
                            <input
                                className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                placeholder="(00) 00000-0000"
                                value={telefone}
                                onChange={e => setTelefone(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Cargo/Função</label>
                            <input
                                className="w-full border border-gray-200 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                placeholder="Ex: Diácono"
                                value={cargo}
                                onChange={e => setCargo(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition font-black shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                    <span>✨ Cadastrar Membro</span>
                </button>
            </form>

            {mensagem && (
                <div className={`mt-6 p-4 rounded-xl text-center text-sm font-bold animate-pulse ${mensagem.includes("Erro") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    {mensagem}
                </div>
            )}
        </div>
    );
}
