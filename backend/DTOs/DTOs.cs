namespace ShopLedger.DTOs
{
    public class CustomerDto
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public decimal InterestRate { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsActive { get; set; }
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal Balance { get; set; }
    }

    public class CreateCustomerDto
    {
        public string CustomerName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public decimal InterestRate { get; set; } = 2.0m;
    }

    public class TransactionDto
    {
        public int TransactionId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal InterestAmount { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; } = "GENERAL";
        public decimal RunningBalance { get; set; }
    }

    public class CreateTransactionDto
    {
        public int CustomerId { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string ItemDescription { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
        public string TransactionType { get; set; } = "GENERAL";
    }

    public class RawMaterialDto
    {
        public int RawMaterialId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string MaterialType { get; set; } = string.Empty;
        public decimal DebitQuantity { get; set; }
        public decimal CreditQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string Unit { get; set; } = "KG";
        public string Remarks { get; set; } = string.Empty;
        public DateTime EntryDate { get; set; }
        public decimal NetQuantity { get; set; }
        public decimal NetAmount { get; set; }
    }

    public class CreateRawMaterialDto
    {
        public int CustomerId { get; set; }
        public string MaterialType { get; set; } = string.Empty;
        public decimal DebitQuantity { get; set; }
        public decimal CreditQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string Unit { get; set; } = "KG";
        public string Remarks { get; set; } = string.Empty;
        public DateTime EntryDate { get; set; } = DateTime.UtcNow;
    }

    public class DashboardSummaryDto
    {
        public string Period { get; set; } = string.Empty;
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal TotalInterest { get; set; }
        public decimal NetBalance { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalTransactions { get; set; }
        public List<CustomerSummaryDto> CustomerSummaries { get; set; } = new();
        public List<MonthlyBreakdownDto> MonthlyBreakdown { get; set; } = new();
        public List<RawMaterialSummaryDto> RawMaterialSummaries { get; set; } = new();
    }

    public class CustomerSummaryDto
    {
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public decimal TotalDebit { get; set; }
        public decimal TotalCredit { get; set; }
        public decimal InterestAccrued { get; set; }
        public decimal Balance { get; set; }
    }

    public class MonthlyBreakdownDto
    {
        public string Month { get; set; } = string.Empty;
        public int Year { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Interest { get; set; }
    }

    public class RawMaterialSummaryDto
    {
        public string MaterialType { get; set; } = string.Empty;
        public decimal TotalDebitQty { get; set; }
        public decimal TotalCreditQty { get; set; }
        public decimal NetQuantity { get; set; }
        public decimal TotalDebitAmount { get; set; }
        public decimal TotalCreditAmount { get; set; }
        public decimal NetAmount { get; set; }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
