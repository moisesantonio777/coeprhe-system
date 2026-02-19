import CadastroMembro from "./CadastroMembro.tsx"
import ListagemMembros from "./ListagemMembros.tsx"

export default function DashboardLeader() {
    return (
        <div style={{ padding: "40px" }}>
            <h2>Painel do Líder</h2>
            <p>Você pode visualizar membros da sua congregação.</p>
            <hr style={{ margin: "20px 0" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
                <CadastroMembro onCadastro={() => { }} />
                <ListagemMembros />
            </div>
        </div>
    )
}
