export interface Product {
    partNumber: string
    partName: string
    saleRate: number
    newRate: number
    category: string
    quantity: number
    purchasedQuantity: number
    consumedQuantity: number
    closingQuantity: number
    unit: string
    storeLocation: string
    ledgerPageNumber: string
    _id?: string
    orderPlaced?: boolean
}