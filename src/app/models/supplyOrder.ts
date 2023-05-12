export interface SupplyOrder {
    partsData: PartsData[]
    supplyOrderNumber: number
    supplierName: string,
    totalQuantity: number
    totalAmount: number
    status: string
    comment: string
    date: string
    _id?: string
}

interface PartsData {
    partNumber: string
    partName: string
    quantity: number
    rate: number
    unit: string
    netAmount: number
}