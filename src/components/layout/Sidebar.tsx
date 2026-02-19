import { Link } from "react-router-dom";

export default function Sidebar() {
    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
            <div className="p-6 text-xl font-bold border-b border-slate-700">
                Rhema Admin
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link to="/dashboard" className="block p-2 rounded hover:bg-slate-800">
                    Dashboard
                </Link>
                <Link to="/membros" className="block p-2 rounded hover:bg-slate-800">
                    Membros
                </Link>
                <Link to="/departamentos" className="block p-2 rounded hover:bg-slate-800">
                    Departamentos
                </Link>
                <Link to="/pastores" className="block p-2 rounded hover:bg-slate-800">
                    Pastores
                </Link>
            </nav>
        </aside>
    );
}
