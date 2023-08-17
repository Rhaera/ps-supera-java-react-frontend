import { useLocation } from "react-router"

const TransferReceipt = () => {
  const location = useLocation()
  const searchParams = location.search.split("=")
  const params = location.pathname.split("/")
  console.log(params + " | " + searchParams)
  return (
    <>
      <h1>
        {params[3] === "transfer" ? 
        `TRANSFERÊNCIA EFETUADA PARA ${searchParams[2].toUpperCase()}\n` : 
        (params[3] === "deposit" ? "DEPÓSITO" : "SAQUE").concat(" EFETUADO")}
      </h1>
      <hr />
      <p>
        Seu ID: {params[2]}
        Valor: R$ {searchParams[1]}
      </p>
      <button onClick={() => {
        window.history.back()
      }}>
        <strong>
          VOLTAR
        </strong>
      </button>
    </>
  )
}

export default TransferReceipt
