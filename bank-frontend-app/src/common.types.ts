export type Account = {
    name: string
}

export type Transfer = {
    amountTransferred: number
    dateOfTransferOccurrence: Date
    transferAccount: {
        accountOwnerName: string
        id: number
    }
    transferId: number
    transferOrigin?: string
    type: "DEPOSITO" | "SAQUE" | "TRANSFERENCIA" | Omit<string, "DEPOSITO" | "SAQUE" | "TRANSFERENCIA">
}
