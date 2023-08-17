import { Ref, forwardRef, memo, useCallback, useImperativeHandle, useRef } from "react"
import { AccountActions, Transfer } from "../common.types"

const TransferCheckout = forwardRef(function TransferCheckout(props: { transferState: AccountActions, currentBalance: number }, ref: Ref<unknown | HTMLInputElement>) {
    const transferAmountRef = useRef<HTMLInputElement>(null)
    const transferBody = props.transferState
    const balance = props.currentBalance
    const handleTransferAmountValidation = (transferToValidate: AccountActions): boolean => {
        if (transferToValidate?.getTransferAmount) return true
        return false
    }
    const handleCheckout = useCallback(async (): Promise<number> => {
        if (!handleTransferAmountValidation(transferBody)) return new Promise(function(resolve) {
            resolve(0)
        })
        if (transferBody.getTransferType && transferBody.getTransferType() !== "DEPOSITO" && transferBody.getTransferAmount && transferBody.getTransferAmount() > balance) {
            alert(transferBody.getTransferType() + " indisponível! Saldo insuficiente.")
            return new Promise(function(resolve) {
                resolve(0)
            })
        }
        const amountToBeTransfer = Math.abs(transferBody.getTransferAmount ? transferBody.getTransferAmount() : 0)
        const currentDate = new Date()
        const currentInstant = `${currentDate.getFullYear()}-` +
            `${(currentDate.getMonth() + 1).toString().length > 1 ? (currentDate.getMonth() + 1).toString() : "0".concat((currentDate.getMonth() + 1).toString())}-` +
            `${currentDate.getDate().toString().length > 1 ? currentDate.getDate() : "0".concat(currentDate.getDate().toString())}T` +
            `${currentDate.getHours().toString().length > 1 ? currentDate.getHours() : "0".concat(currentDate.getHours().toString())}:` +
            `${currentDate.getMinutes().toString().length > 1 ? currentDate.getMinutes() : "0".concat(currentDate.getMinutes().toString())}:` +
            `${currentDate.getSeconds().toString().length > 1 ? currentDate.getSeconds() : "0".concat(currentDate.getSeconds().toString())}.` +
            `${currentDate.getMilliseconds().toString().length > 1 ? currentDate.getMilliseconds() : "0".concat(currentDate.getMilliseconds().toString())}Z`
        const transfer = {
            amountTransferred: transferBody.getTransferType && transferBody.getTransferType() === "DEPOSITO" ? amountToBeTransfer : (-1) * amountToBeTransfer,
            dateOfTransferOccurrence: currentInstant,
            transferAccount: {
                accountOwnerName: transferBody.getCurrentName(),
                id: transferBody.getId()
            },
            transferId: 0,
            transferOrigin: transferBody.getTransferDestinyName ? transferBody.getTransferDestinyName() : null,
            type: transferBody.getTransferType ? transferBody.getTransferType() : undefined
        } as Transfer
        await fetch("http://localhost:8080/api/v1/transfers/", {
            method: "GET"
        }).then(res => res.json()).then(list => {
            transfer.transferId = (list as Transfer[]).length + 1
        })
        const options = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transfer)
        }
        const transferAttempt = await fetch("http://localhost:8080/api/v1/transfers", options)
        const onCreated = transferAttempt.status
        if (onCreated === 201 && transfer.type === "TRANSFERENCIA") {
            const transferDestiny = {
                ...transfer,
                amountTransferred: amountToBeTransfer,
                transferAccount: {
                    accountOwnerName: transferBody.getTransferDestinyName ? transferBody.getTransferDestinyName() : null,
                    id: transferBody.getTransferDestinyId ? transferBody.getTransferDestinyId() : null
                },
                transferId: transfer.transferId + 1,
                transferOrigin: transferBody.getCurrentName()
            } as Transfer
            const destinyOptions = {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transferDestiny)
            }
            const transferDestinyAttempt = await fetch("http://localhost:8080/api/v1/transfers", destinyOptions)
            return transferDestinyAttempt.status === 201 ? 
                new Promise(function(resolve) { resolve(amountToBeTransfer) }) : 
                new Promise(function(resolve) { resolve((-1) * amountToBeTransfer) })
        }
        if (onCreated === 201) return new Promise(function(resolve) {
            resolve(amountToBeTransfer)
        })
        return new Promise(function(resolve) {
            resolve(0)
        })
    }, [transferBody])
    useImperativeHandle(ref, () => {
        return {
            handleCheckout,
            amount() {
                return transferAmountRef
            }
        }
    }, [])
    return (
        <div>
            <input type="number" placeholder="R$ 0.00" ref={transferAmountRef} onChange={(ev) => {
                transferBody.getTransferAmount = () => Number(ev.target.value)
            }} 
            />
        </div>
    )
})

export default memo(TransferCheckout)
