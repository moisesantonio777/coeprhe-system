import { useState } from "react"
import { supabase } from "../services/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Erro: " + error.message)
    } else {
      alert("Login realizado com sucesso")
    }
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login COEPRHE</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>
        Entrar
      </button>
    </div>
  )
}
