import './AuthAccess.css'
import { ChangeEvent, FormEvent, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Account } from '../common.types'

const AuthAccess = () => {
  const navigate = useNavigate()
  const userId = useRef<HTMLInputElement>(null)
  const userName = useRef<HTMLInputElement>(null)
  const [hasName, setHasName] = useState<boolean>(false)
  const handleIdStateChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (hasName)
      setHasName(false)
  }
  const handleAuthClick = async (event: FormEvent) => {
    event.preventDefault()
    if (!userId.current)
      return
    if (isNaN(parseInt(userId.current.value))) {
      userId.current.value = ""
      alert("ID Inválido! Por favor, coloque o número correto ID.")
      return
    }
    const maybeNewAccount = await fetch(`http://localhost:8080/api/v1/accounts/${userId.current.value}`, {
      method: "GET"
    })
    if (maybeNewAccount.ok) {
      let account
      await maybeNewAccount.json().then((name: Account) => {
        account = name
        return
      })
      const { name } = account as unknown as Account
      navigate(`/accounts/${userId.current.value}?userName=${name}`)
      return
    }
    userId.current.value = "0"
    setHasName(true)
    if (!userName.current)
      return
    const formattedName = userName.current.value.charAt(0).toUpperCase().concat(userName.current.value.substring(1).toLowerCase())
    const newAccountAttempt = await fetch(`http://localhost:8080/api/v1/accounts?newUser=${formattedName}`, {
      method: "POST"
    })
    if (newAccountAttempt.status !== 201) {
      userId.current.value = ""
      userName.current.value = ""
      setHasName(false)
      alert("Erro Inesperado! Não foi possível criar a nova conta no momento!")
      return
    }
    let newAccount
    await newAccountAttempt.json().then((name: Account) => {
      newAccount = name
      return
    })
    const { name } = newAccount as unknown as Account
    let totalAccountsArray
    const totalAccounts = (await fetch(`http://localhost:8080/api/v1/accounts/`, {
      method: "GET"
    })).json()
    await totalAccounts.then((res: Account[]) => {
      totalAccountsArray = res
      return
    })
    const maxIdAccount = (totalAccountsArray as unknown as Account[]).length
    userId.current.value = `${maxIdAccount}`
    navigate(`/accounts/${maxIdAccount}?userName=${name}`)
  }
  return (
    <div>
      <form onSubmit={handleAuthClick} className="access-form" style={{ display: "flex", alignItems: "center" }}>
        <input id="account-id" type="text" className="access-input" required={true} onChange={handleIdStateChange} placeholder="ID" ref={userId} style={{ width: "10em", margin: "5px" }} />
        {hasName && (
          <input id="account-name" type="text" className="account-name" required={hasName} ref={userName} placeholder="Nome" />
        )}
        <button className="access-btn" type="submit" style={{ width: "20em", margin: "5px" }}>
          <h3>
            Acesse sua conta
          </h3>
        </button>
      </form>
    </div>
  )
}

export default AuthAccess
