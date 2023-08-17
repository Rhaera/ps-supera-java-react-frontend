export type Account = {
    name: string
}

export type Transfer = {
    amountTransferred: number
    dateOfTransferOccurrence: string
    transferAccount: {
        accountOwnerName: string
        id: number
    }
    transferId: number
    transferOrigin?: string
    type: "DEPOSITO" | "SAQUE" | "TRANSFERENCIA" | Omit<string, "DEPOSITO" | "SAQUE" | "TRANSFERENCIA">
}

export type AccountActions = {
    getId: () => number
    getCurrentName: () => string
    getTransferType?: () => "DEPOSITO" | "SAQUE" | "TRANSFERENCIA" | Omit<string, "DEPOSITO" | "SAQUE" | "TRANSFERENCIA">
    getTransferDestinyId?: () => number
    getTransferDestinyName?: () => string
    getTransferAmount?: () => number
}

export type AccountAction = {
    type: 
        "select_transfer_type" | 
        "select_transfer_account" | 
        "select_transfer_amount" | 
        "reset_transfer_account" |
        "reset_transfer" | 
        Omit<string, "select_transfer_type" | "select_transfer_account" | "select_transfer_amount" | "reset_transfer_account" | "reset_transfer" >
    id?: number
    name?: string
    transferType?: "DEPOSITO" | "SAQUE" | "TRANSFERENCIA" | Omit<string, "DEPOSITO" | "SAQUE" | "TRANSFERENCIA">
    transferDestinyId?: number
    transferDestinyName?: string
    transferAmount?: number
}
