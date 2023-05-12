interface Data {
    partNo: string
    partName: string
    quantity: number
    rate: number
    discountPercentage: number
    discount: number
    grossAmount: number
    sgstPercentage: number
    sgstAmount: number
    cgstPercentage: number
    cgstAmount: number
    netAmount: number
}
export interface Transaction {
    _id?: string
    transactionNo: number,
    paymentMode: string
    supplierInvoiceNo: string
    supplierName: string
    date: string
    data: Data[]
    grossAmount: number
    gst: number
    tradeDiscount: number
    igst: number
    grandTotal: number
    cashDiscount: number
    otherCharges: number
    netAmount: number
    comment: string
    type: string
}