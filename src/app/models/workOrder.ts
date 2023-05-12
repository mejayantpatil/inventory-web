export interface WorkOrder {
    partsData: PartsData[]
    workOrderNumber: number
    serviceProviderName: string,
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