import { ChangeEvent, Ref, Suspense, forwardRef, memo, useCallback, useDeferredValue, useEffect, useImperativeHandle, useReducer, useState, useTransition } from "react"
import { Transfer } from "../common.types"
import { useLocation } from "react-router"

type Period = {
  day?: number,
  month?: number,
  year?: number
}

type PeriodAction = {
  type: string,
  start: boolean,
  date?: number
}

type ExtractPeriod = {
  startPeriod: Period,
  endPeriod: Period
}

function getPeriod(period: string): Period {
  return {
    day: parseInt(period.substring(8, 10)) ?? 0,
    month: parseInt(period.substring(5, 7)) ?? 0,
    year: parseInt(period.substring(0, 4)) ?? 0
  }
}

const extractPeriodReducer = (state: ExtractPeriod, action: PeriodAction): ExtractPeriod => {
  switch (action.type) {
    case "day":
      return action.start ? { ...state, startPeriod: { ...state.startPeriod, day: action.date } } : { ...state, endPeriod: { ...state.endPeriod, day: action.date } }
    case "month":
      return action.start ? { ...state, startPeriod: { ...state.startPeriod, month: action.date } } : { ...state, endPeriod: { ...state.endPeriod, month: action.date } }
    case "year":
      return action.start ? { ...state, startPeriod: { ...state.startPeriod, year: action.date } } : { ...state, endPeriod: { ...state.endPeriod, year: action.date } }
    case "reset":
      return action.start ? { startPeriod: {}, endPeriod: {} } : { ...state, endPeriod: {} }
    default:
      return state
  }
}

const TransferExtract = forwardRef((props: { extract: Transfer[], isShown: boolean }, ref: Ref<HTMLInputElement | unknown>) => {
  const location = useLocation()
  const searchParams = location.search.split("=")
  console.log(searchParams.length)
  const transferExtract = props.extract
  const isShown = props.isShown
  const [isPending, startTransition] = useTransition()
  const [person, setPerson] = useState<string>("")
  const deferredPerson = useDeferredValue<string>(person)
  const [period, periodDispatcher] = useReducer(extractPeriodReducer, { startPeriod: {}, endPeriod: {} })
  const isCompleteAndValidPeriod = (p: Period): boolean => {
    if (!p.day || !p.month || !p.year)
      return false
    if (p.day.toString().includes(".") || p.month.toString().includes(".") || p.year.toString().includes("."))
      return false
    return (p.day > 0 && p.day < 32) && (p.month > 0 && p.month < 13) && p.year > 1900
  }
  const handlePeriodValidation = useCallback((date: string): boolean => {
    if (!period.startPeriod.year || !period.startPeriod.month || !period.startPeriod.day || !isCompleteAndValidPeriod(period.startPeriod)) {
      periodDispatcher({
        type: "reset",
        start: true
      })
      return false
    }
    const periodToBeValidated: Period = getPeriod(date)
    if (!periodToBeValidated.day || !periodToBeValidated.month || !periodToBeValidated.year)
      return false
    if (period.startPeriod.year > periodToBeValidated.year)
      return false
    if (period.startPeriod.month > periodToBeValidated.month)
      return false
    if (period.startPeriod.day > periodToBeValidated.day)
      return false
    if (!period.endPeriod.year || !period.endPeriod.month || !period.endPeriod.day || !isCompleteAndValidPeriod(period.endPeriod)) {
      periodDispatcher({
        type: "reset",
        start: false
      })
      return true
    }
    if (period.endPeriod.year < periodToBeValidated.year)
      return false
    if (period.endPeriod.month < periodToBeValidated.month)
      return false
    if (period.endPeriod.day < periodToBeValidated.day)
      return false
    return true
  }, [period])
  const handleTransferTypeConverter = (type: string): string => {
    switch (type) {
      case "DEPOSIT":
        return "Depósito"
      case "WITHDRAWAL":
        return "Saque"
      case "TRANSFER":
        return "Pix"
      default:
        return type
    }
  }
  // filterByName
  const handleOnTransitionExtract = (): void => {
    const timeout = async () => {
      return await new Promise(resolve => {
        setTimeout(resolve, 2000)
      })
    }
    timeout()
  }
  useImperativeHandle(ref, () => {
    return {
      handlePeriodValidation,
      getPeriod() {
        return period
      },
      isCompleteAndValidPeriod
    }
  }, [isShown, period])
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Suspense fallback={<p><i>Carregando...</i></p>}>
        {isShown && (
          <>
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <div style={{ margin: "5px" }}>
              <p>
                Início
              </p>
              <input type="number" placeholder="Dia" onChange={(ev: ChangeEvent<HTMLInputElement>) => periodDispatcher({
                type: "day",
                start: true,
                date: parseInt(ev.target.value) ?? undefined
              })}
              />
              <input type="number" placeholder="Mês" onChange={(ev: ChangeEvent<HTMLInputElement>) => periodDispatcher({
                type: "month",
                start: true,
                date: parseInt(ev.target.value) ?? undefined
              })}
              />
              <input type="number" placeholder="Ano" onChange={(ev: ChangeEvent<HTMLInputElement>) => periodDispatcher({
                type: "year",
                start: true,
                date: parseInt(ev.target.value) ?? undefined
              })}
              />
            </div>
            <div style={{ margin: "5px" }} hidden={!isCompleteAndValidPeriod(period.startPeriod)}>
              <p>
                Fim
              </p>
              <input type="number" placeholder="Dia" onChange={(ev: ChangeEvent<HTMLInputElement>) => periodDispatcher({
                type: "day",
                start: false,
                date: parseInt(ev.target.value) ?? undefined
              })}
              />
              <input type="number" placeholder="Mês" onChange={(ev: ChangeEvent<HTMLInputElement>) => periodDispatcher({
                type: "month",
                start: false,
                date: parseInt(ev.target.value) ?? undefined
              })}
              />
              <input type="number" placeholder="Ano" onChange={(ev: ChangeEvent<HTMLInputElement>) => periodDispatcher({
                type: "year",
                start: false,
                date: parseInt(ev.target.value) ?? undefined
              })}
              />
            </div>
          </div>
          <h2>
            Extrato{searchParams.length > 2 && 
            isCompleteAndValidPeriod(period.startPeriod) && 
            ` de ${period.startPeriod.day}/${period.startPeriod.month}/${period.startPeriod.year} até`}
            {searchParams.length > 3 && isCompleteAndValidPeriod(period.endPeriod) ? ` ${period.endPeriod.day}/${period.endPeriod.month}/${period.endPeriod.year}` : " hoje"}:
          </h2>
          <input type="text" placeholder="Nome" onChange={(e: ChangeEvent<HTMLInputElement>) => setPerson(() => e.target.value)} />
          <Suspense fallback={<p><i>Carregando Extrato...</i></p>}>
          {isPending ? <p><i>Carregando Extrato...</i></p> : (
          <ul key={transferExtract.length} style={{ justifyContent: "center" }}>
          {transferExtract.map(transfer => (
            <li key={transfer.transferId}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p style={{ margin: "5px" }}>{transfer.dateOfTransferOccurrence}</p>
                <p style={{ margin: "5px" }}>{transfer.transferOrigin ?? "N/A"}</p>
                <p style={{ margin: "5px" }}>{handleTransferTypeConverter(transfer.type.toString())}</p>
                <p style={{ margin: "5px" }}>{transfer.amountTransferred}</p>
              </div>
            </li>
          ))}
          </ul>
          )}
          </Suspense>
          </>
        )}
      </Suspense>
    </div>
  )
})

export default memo(TransferExtract)
