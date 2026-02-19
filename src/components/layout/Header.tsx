import { supabase } from "../../services/supabase";

export default function Header() {

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    return (
        <header className="bg-white shadow p-4 flex justify-between items-center">
            <h1 className="font-semibold text-lg">Painel Administrativo</h1>
            <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
                Sair
            </button>
        </header>
    );
}
