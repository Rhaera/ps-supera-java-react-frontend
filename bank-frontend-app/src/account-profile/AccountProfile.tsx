import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Account, Transfer } from "../common.types"

const AccountProfile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const id = location.pathname.split("/")[2]
  const name = location.search.split("=")[1]
  const [numberOfSameNames, setSameNamesNumber] = useState<number>(0)
  const [startPeriod, setStart] = useState<string>("")
  const [isTransfering, setTransfer] = useState<boolean>(false)
  const [all, setAll] = useState<Account[]>([])
  const [balanceHistory, setHistory] = useState<Transfer[]>([])
  const endPeriod = useRef<HTMLInputElement>(null)
  const personSearch = useRef<HTMLInputElement>(null)
  const getAllAccounts = useCallback(async () => {
    const allAccounts = (await fetch("http://localhost:8080/api/v1/accounts/", {
      method: "GET"
    })).json()
    await allAccounts.then(res => {
      setAll(() => res as Account[])
      return
    })
  }, [isTransfering])
  const getSameNamesNumber = useCallback(async () => {
    const allSameNames = (await fetch(`http://localhost:8080/api/v1/accounts?name=${name}`, {
      method: "GET"
    })).json()
    await allSameNames.then(res => {
      setSameNamesNumber(() => (res as Account[]).length)
      return
    })
  }, [name, all])
  const getBalanceTransfers = useCallback(async () => {
    console.log("triggered")
    await fetch(`http://localhost:8080/api/v1/transfers/${id}`, {
      method: "GET"
    }).then(noJsonRes => noJsonRes.json()).then(res => {
      setHistory(() => res as Transfer[])
      return
    }).catch(() => setHistory(() => []))
  }, [id])
  const memoBalance = useMemo(() => balanceHistory.map(transfer => transfer.amountTransferred).reduce((acc, current) => acc + current, 0), [balanceHistory])
  useEffect(() => { getAllAccounts() }, [getAllAccounts])
  useEffect(() => { getSameNamesNumber() }, [getSameNamesNumber])
  useEffect(() => { getBalanceTransfers() }, [getBalanceTransfers])
  return (
    <div className="wrapper">
      <h2>
        Bem vindo a sua BancoConta {name}
      </h2>
      <p>
        Número de usuários com o seu nome: {numberOfSameNames}
      </p>
      <button onClick={() => {
        setTransfer((prev) => !prev)
        console.log(isTransfering)
        console.log(all)
        console.log(balanceHistory)
      }}>
        Click 1
      </button>
      <button onClick={() => {
        window.location.reload()
      }}>
        Click 2
      </button>
      <p>
        Saldo Atual: {memoBalance}
      </p>
    </div>
  )
}

export default AccountProfile
