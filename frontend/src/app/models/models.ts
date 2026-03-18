export interface Customer {
  customerId: number;
  customerName: string;
  mobileNumber: string;
  interestRate: number;
  createdDate: string;
  isActive: boolean;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface CreateCustomer {
  customerName: string;
  mobileNumber: string;
  interestRate: number;
}

export interface Transaction {
  transactionId: number;
  customerId: number;
  customerName: string;
  debitAmount: number;
  creditAmount: number;
  interestAmount: number;
  itemDescription: string;
  transactionDate: string;
  transactionType: string;
  runningBalance: number;
}

export interface CreateTransaction {
  customerId: number;
  debitAmount: number;
  creditAmount: number;
  itemDescription: string;
  transactionDate: string;
  transactionType: string;
}

export interface RawMaterial {
  rawMaterialId: number;
  customerId: number;
  customerName: string;
  materialType: string;
  debitQuantity: number;
  creditQuantity: number;
  unitPrice: number;
  debitAmount: number;
  creditAmount: number;
  unit: string;
  remarks: string;
  entryDate: string;
  netQuantity: number;
  netAmount: number;
}

export interface CreateRawMaterial {
  customerId: number;
  materialType: string;
  debitQuantity: number;
  creditQuantity: number;
  unitPrice: number;
  unit: string;
  remarks: string;
  entryDate: string;
}

export interface DashboardSummary {
  period: string;
  totalDebit: number;
  totalCredit: number;
  totalInterest: number;
  netBalance: number;
  totalCustomers: number;
  totalTransactions: number;
  customerSummaries: CustomerSummary[];
  monthlyBreakdown: MonthlyBreakdown[];
  rawMaterialSummaries: RawMaterialSummary[];
}

export interface CustomerSummary {
  customerId: number;
  customerName: string;
  mobileNumber: string;
  totalDebit: number;
  totalCredit: number;
  interestAccrued: number;
  balance: number;
}

export interface MonthlyBreakdown {
  month: string;
  year: number;
  debit: number;
  credit: number;
  interest: number;
}

export interface RawMaterialSummary {
  materialType: string;
  totalDebitQty: number;
  totalCreditQty: number;
  netQuantity: number;
  totalDebitAmount: number;
  totalCreditAmount: number;
  netAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}

export const MATERIAL_TYPES = ['wheat', 'joa', 'jawar', 'seeds'];
export const MATERIAL_UNITS = ['KG', 'QUINTAL', 'TON', 'BAG'];

export const TRANSLATIONS: { [key: string]: { en: string; hi: string } } = {
  'dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'customers': { en: 'Customers', hi: 'ग्राहक' },
  'transactions': { en: 'Transactions', hi: 'लेन-देन' },
  'rawMaterials': { en: 'Raw Materials', hi: 'कच्चा माल' },
  'customerName': { en: 'Customer Name', hi: 'ग्राहक का नाम' },
  'mobileNumber': { en: 'Mobile Number', hi: 'मोबाइल नंबर' },
  'interestRate': { en: 'Interest Rate (%)', hi: 'ब्याज दर (%)' },
  'debitAmount': { en: 'Debit Amount', hi: 'नामे राशि' },
  'creditAmount': { en: 'Credit Amount', hi: 'जमा राशि' },
  'itemDescription': { en: 'Item Description', hi: 'वस्तु विवरण' },
  'date': { en: 'Date', hi: 'तारीख' },
  'customerId': { en: 'Customer ID', hi: 'ग्राहक संख्या' },
  'materialType': { en: 'Material Type', hi: 'सामग्री प्रकार' },
  'quantity': { en: 'Quantity', hi: 'मात्रा' },
  'unitPrice': { en: 'Unit Price', hi: 'इकाई मूल्य' },
  'remarks': { en: 'Remarks', hi: 'टिप्पणी' },
  'save': { en: 'Save', hi: 'सहेजें' },
  'cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'edit': { en: 'Edit', hi: 'संपादित करें' },
  'delete': { en: 'Delete', hi: 'हटाएं' },
  'print': { en: 'Print Statement', hi: 'विवरण प्रिंट करें' },
  'monthly': { en: 'Monthly', hi: 'मासिक' },
  'halfYearly': { en: 'Half Yearly', hi: 'छमाही' },
  'yearly': { en: 'Yearly', hi: 'वार्षिक' },
  'totalDebit': { en: 'Total Debit', hi: 'कुल नामे' },
  'totalCredit': { en: 'Total Credit', hi: 'कुल जमा' },
  'balance': { en: 'Balance', hi: 'शेष' },
  'interest': { en: 'Interest', hi: 'ब्याज' },
  'addCustomer': { en: 'Add Customer', hi: 'ग्राहक जोड़ें' },
  'addTransaction': { en: 'Add Transaction', hi: 'लेन-देन जोड़ें' },
  'addRawMaterial': { en: 'Add Raw Material', hi: 'कच्चा माल जोड़ें' },
  'shopLedger': { en: 'Shop Ledger', hi: 'दुकान खाता बही' },
  'wheat': { en: 'Wheat', hi: 'गेहूँ' },
  'joa': { en: 'Joa (Barley)', hi: 'जौ' },
  'jawar': { en: 'Jawar (Sorghum)', hi: 'ज्वार' },
  'seeds': { en: 'Seeds', hi: 'बीज' },
  'debitQty': { en: 'Issued Qty', hi: 'जारी मात्रा' },
  'creditQty': { en: 'Returned Qty', hi: 'वापसी मात्रा' },
  'netBalance': { en: 'Net Balance', hi: 'शुद्ध शेष' },
  'totalCustomers': { en: 'Total Customers', hi: 'कुल ग्राहक' },
  'totalTransactions': { en: 'Total Transactions', hi: 'कुल लेन-देन' },
  'summary': { en: 'Summary', hi: 'सारांश' },
  'statement': { en: 'Account Statement', hi: 'खाता विवरण' },
  'actions': { en: 'Actions', hi: 'कार्यवाही' },
  'status': { en: 'Status', hi: 'स्थिति' },
  'active': { en: 'Active', hi: 'सक्रिय' },
  'inactive': { en: 'Inactive', hi: 'निष्क्रिय' },
};
