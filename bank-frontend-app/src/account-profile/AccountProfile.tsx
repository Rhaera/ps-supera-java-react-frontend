import { ChangeEvent, Reducer, RefObject, Suspense, lazy, startTransition, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { Account, AccountAction, AccountActions, Transfer } from "../common.types"
import TransferCheckout from "../transfer-checkout/TransferCheckout"
import { useSearchParams } from "react-router-dom"

const TransferExtract = lazy(async () => {
  await new Promise(resolve => {
    setTimeout(resolve, 3000)
  })
  return await import("../transfer-extract/TransferExtract")
})

type TransferCheckoutRef = {
  handleCheckout: () => Promise<number>,
  amount: () => RefObject<HTMLInputElement>
}

type TransferExtractRef = {
  handlePeriodValidation: (date: string) => boolean,
  getPeriod(): {
    startPeriod: {
      day?: number,
      month?: number,
      year?: number
    },
    endPeriod: {
      day?: number,
      month?: number,
      year?: number
    }
  },
  isCompleteAndValidPeriod: (p: { day?: number, month?: number, year?: number }) => boolean
}

function reducer(transferState: AccountActions, action: AccountAction): AccountActions {
  switch (action.type) {
    case "select_transfer_type":
      return {
        ...transferState,
        getTransferType: () => action.transferType ?? ""
      }
    case "select_transfer_account":
      return {
        ...transferState,
        getTransferDestinyId: () => action.transferDestinyId ?? 0,
        getTransferDestinyName: () => action.transferDestinyName ?? ""
      }
    case "select_transfer_amount":
      return {
        ...transferState,
        getTransferAmount: () => action.transferAmount ?? 0
      }
    case "reset_transfer_account":
      return {
        getId: () => action.id ?? 0,
        getCurrentName: () => action.name ?? "",
        getTransferType: () => "TRANSFERENCIA"
      }
    case "reset_transfer":
      return {
        getId: () => action.id ?? 0,
        getCurrentName: () => action.name ?? ""
      }
    default:
      return transferState
  }
}

const AccountProfile = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  console.log(searchParams)
  const id = location.pathname.split("/")[2]
  const name = location.search.split("=")[1]
  // const [isPending, beginTransition] = useTransition()
  const [numberOfSameNames, setSameNamesNumber] = useState<number>(0)
  // const [startPeriod, setStart] = useState<string>("") transfer-history
  const [isTransfering, setTransfer] = useState<boolean>(false)
  const [all, setAll] = useState<Account[]>([])
  const [balanceHistory, setHistory] = useState<Transfer[]>([])
  const [showExtract, setShowExtract] = useState<boolean>(false)
  // const endPeriod = useRef<HTMLInputElement>(null) transfer-history
  const extractRef = useRef<HTMLInputElement>(null)
  const personSearch = useRef<HTMLInputElement>(null)
  const transferCheckout = useRef<undefined>(null)
  const [state, dispatch] = useReducer<Reducer<AccountActions, AccountAction>>(reducer, {
    getId: () => Number(id), 
    getCurrentName: () => name
  })
  const getAllAccounts = useCallback(async () => {
    const allAccounts = (await fetch("http://localhost:8080/api/v1/accounts/", {
      method: "GET"
    })).json()
    await allAccounts.then(res => {
      setAll(() => res as Account[])
      return
    })
  }, [isTransfering, personSearch.current?.value])
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
    await fetch(`http://localhost:8080/api/v1/transfers/${id}`, {
      method: "GET"
    }).then(noJsonRes => noJsonRes.json()).then(res => {
      setHistory(() => res as Transfer[])
      return
    }).catch(() => setHistory(() => []))
  }, [id])
  const memoBalance = useMemo(() => balanceHistory.map(transfer => transfer.amountTransferred).reduce((acc, current) => acc + current, 0), [balanceHistory])
  const transfersFilteredByDate = useMemo(() => {
    if (searchParams.toString().split("=").length <= 2)
      return () => balanceHistory
    const { handlePeriodValidation } = extractRef.current as unknown as TransferExtractRef
    return () => balanceHistory.filter(transfer => handlePeriodValidation(transfer.dateOfTransferOccurrence))
  }, [searchParams, balanceHistory])
  useEffect(() => { startTransition(() => { getAllAccounts() }) }, [getAllAccounts])
  useEffect(() => { startTransition(() => { getSameNamesNumber() }) }, [getSameNamesNumber])
  useEffect(() => { startTransition(() => { getBalanceTransfers() }) }, [getBalanceTransfers])
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    if (!personSearch.current?.value)
      return
    getAllAccounts()
    if (!isNaN(parseInt(personSearch.current.value)) &&
        personSearch.current.value !== id &&
        personSearch.current.value !== "." &&
        personSearch.current.value !== "," &&
        parseInt(personSearch.current.value) > 0 &&
        parseInt(personSearch.current.value) <= all.length) {
      dispatch({
        type: "select_transfer_account",
        transferDestinyId: parseInt(personSearch.current.value),
        transferDestinyName: all[parseInt(personSearch.current.value) - 1].name
      })
      personSearch.current.hidden = true
      return
    }
    personSearch.current.value = ""
  }
  const handleResetAccount = () => {
    dispatch({
      type: "reset_transfer_account",
      id: Number(id),
      name: name
    })
    if (personSearch.current?.hidden && personSearch.current.hidden)
      personSearch.current.hidden = false
  }
  const handleOnTransfer = () => {
    const { handleCheckout, amount } = transferCheckout.current as unknown as TransferCheckoutRef
    const amountValue = amount().current?.value.toString()
    if (isNaN(parseFloat(amountValue ?? "")) || (amountValue?.charAt(0) === "0" && amountValue.charAt(1) !== ".")) {
      alert(`${state?.getTransferType ? state.getTransferType() : ""} NÃO DISPONÍVEL!`)
      return
    }
    handleCheckout().then(res => {
      if (res === 0)
        return
      if (state.getTransferType && state.getTransferType() === "TRANSFERENCIA" && state.getTransferDestinyName)
        navigate(`/transfers/${id}/transfer?amount=${res}&to=${state.getTransferDestinyName()}`)
      navigate(`/transfers/${id}/${state.getTransferType && state.getTransferType() === "DEPOSITO" ? "deposit" : "withdrawl"}?amount=${res}`)
    })
  }
  const handleExtractTransition = (show: boolean): void => {
    startTransition(() => {
      setTimeout(() => setShowExtract(show), 500)
    })
  }
  const handleOnPeriodFilter = () => {
    if (!showExtract)
      return
    const { getPeriod, isCompleteAndValidPeriod } = extractRef.current as unknown as TransferExtractRef
    const period = getPeriod()
    if (isCompleteAndValidPeriod(period.startPeriod) && isCompleteAndValidPeriod(period.endPeriod)) {
      setSearchParams({
        userName: name,
        from: `${period.startPeriod.year}-${period.startPeriod.month}-${period.startPeriod.day}`,
        to: `${period.endPeriod.year}-${period.endPeriod.month}-${period.endPeriod.day}`
      })
      return
    }
    if (isCompleteAndValidPeriod(period.startPeriod)) {
      setSearchParams({
        userName: name,
        from: `${period.startPeriod.year}-${period.startPeriod.month}-${period.startPeriod.day}`
      })
      return
    }
    setSearchParams({
      userName: name
    })
  }
  return (
    <div className="wrapper">
      <h2>
        Bem vindo a sua BancoConta {name}
      </h2>
      <p>
        Número de usuários com o seu nome: {numberOfSameNames}
      </p>
      <div>
        {state.getTransferType && state.getTransferType() === "DEPOSITO" && (
        <>
          <TransferCheckout ref={transferCheckout} transferState={state} currentBalance={memoBalance} />
          <button onClick={handleOnTransfer}>Depositar</button>
          <button onClick={() => dispatch({
            type: "reset_transfer",
            id: Number(id),
            name: name
          })}>
            DEPÓSITO
          </button>
        </>
        )}
        {state.getTransferType && state.getTransferType() === "SAQUE" && (
        <>
          <TransferCheckout ref={transferCheckout} transferState={state} currentBalance={memoBalance} />
          <button onClick={handleOnTransfer}>Sacar</button>
          <button onClick={() => dispatch({
            type: "reset_transfer",
            id: Number(id),
            name: name
          })}>
            SAQUE
          </button>
        </>
        )}
        {state.getTransferType && state.getTransferType() === "TRANSFERENCIA" && (
        <>
          {!state.getTransferDestinyName && !state.getTransferDestinyId && <p>Total de BancoContas: {all.length}</p>}
          <input type="number" ref={personSearch} placeholder="ID da conta de destino" onChange={handleSearchChange} />
          {state?.getTransferDestinyName && state?.getTransferDestinyId && (
          <div>
            ID:{' '}
            <button onClick={handleResetAccount}>
              <strong>
                {state.getTransferDestinyId()}
              </strong>
            </button>
            Nome:{' '}
            <button onClick={handleResetAccount}>
              <strong>
                {state.getTransferDestinyName()}
              </strong>
            </button><br/>
            <p>Quanto deseja Transferir: {" "}</p>
            <TransferCheckout ref={transferCheckout} transferState={state} currentBalance={memoBalance} />
            <button onClick={handleOnTransfer}>Transferir</button>
          </div>
          )}
          <button onClick={() => dispatch({
            type: "reset_transfer",
            id: Number(id),
            name: name
          })}>
            TRANSFERÊNCIA
          </button>
        </>
        )}
        {isTransfering && !state.getTransferType && (
        <>
          <button onClick={() => dispatch({
            type: "select_transfer_type",
            transferType: "DEPOSITO"
          })}>
            DEPÓSITO
          </button>
          <button onClick={() => dispatch({
            type: "select_transfer_type",
            transferType: "SAQUE"
          })}>
            SAQUE
          </button>
          <button onClick={() => dispatch({
            type: "select_transfer_type",
            transferType: "TRANSFERENCIA"
          })}>
            TRANSFERÊNCIA
          </button>
        </>
        )}
      </div>
      <button onClick={() => {
        setTransfer((prev) => !prev)
        if (isTransfering)
          dispatch({
            type: "reset_transfer",
            id: Number(id),
            name: name
          })
      }}>
        {!isTransfering ? "Transferir" : <strong>X</strong>}
      </button>
      <Suspense fallback={<p><i>Carregando...</i></p>}>
        <p>
          Saldo Atual: {Math.round(100 * memoBalance) / 100}
        </p>
        {showExtract && <button onClick={handleOnPeriodFilter}>Filtrar</button>}
        <TransferExtract ref={extractRef} extract={transfersFilteredByDate()} isShown={showExtract} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {!showExtract ? 
          <button onClick={() => handleExtractTransition(true)} style={{ width: "10em" }}>Extrato</button> : 
          <button onClick={() => window.location.reload()} style={{ width: "5em" }}><strong>X</strong></button>}
          <button onClick={() => navigate("/home")} style={{ margin: "5px" }}>
            <strong>
              Sair
            </strong>
          </button>
        </div>
      </Suspense>
    </div>
  )
}

export default AccountProfile
