using Microsoft.EntityFrameworkCore;
using ShopLedger.Data;
using ShopLedger.DTOs;
using ShopLedger.Models;

namespace ShopLedger.Services
{
    public interface IRawMaterialService
    {
        Task<List<RawMaterialDto>> GetAllAsync(int? customerId = null);
        Task<RawMaterialDto?> GetByIdAsync(int id);
        Task<RawMaterialDto> CreateAsync(CreateRawMaterialDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class RawMaterialService : IRawMaterialService
    {
        private readonly AppDbContext _db;
        public RawMaterialService(AppDbContext db) => _db = db;

        public async Task<List<RawMaterialDto>> GetAllAsync(int? customerId = null)
        {
            var query = _db.RawMaterials.Include(r => r.Customer).AsQueryable();
            if (customerId.HasValue) query = query.Where(r => r.CustomerId == customerId.Value);

            return await query.OrderByDescending(r => r.EntryDate).Select(r => new RawMaterialDto
            {
                RawMaterialId = r.RawMaterialId,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer!.CustomerName,
                MaterialType = r.MaterialType,
                DebitQuantity = r.DebitQuantity,
                CreditQuantity = r.CreditQuantity,
                UnitPrice = r.UnitPrice,
                DebitAmount = r.DebitAmount,
                CreditAmount = r.CreditAmount,
                Unit = r.Unit,
                Remarks = r.Remarks,
                EntryDate = r.EntryDate,
                NetQuantity = r.DebitQuantity - r.CreditQuantity,
                NetAmount = r.DebitAmount - r.CreditAmount
            }).ToListAsync();
        }

        public async Task<RawMaterialDto?> GetByIdAsync(int id)
        {
            var r = await _db.RawMaterials.Include(x => x.Customer).FirstOrDefaultAsync(x => x.RawMaterialId == id);
            if (r == null) return null;
            return new RawMaterialDto
            {
                RawMaterialId = r.RawMaterialId,
                CustomerId = r.CustomerId,
                CustomerName = r.Customer!.CustomerName,
                MaterialType = r.MaterialType,
                DebitQuantity = r.DebitQuantity,
                CreditQuantity = r.CreditQuantity,
                UnitPrice = r.UnitPrice,
                DebitAmount = r.DebitAmount,
                CreditAmount = r.CreditAmount,
                Unit = r.Unit,
                Remarks = r.Remarks,
                EntryDate = r.EntryDate,
                NetQuantity = r.DebitQuantity - r.CreditQuantity,
                NetAmount = r.DebitAmount - r.CreditAmount
            };
        }

        public async Task<RawMaterialDto> CreateAsync(CreateRawMaterialDto dto)
        {
            var debitAmount = dto.DebitQuantity * dto.UnitPrice;
            var creditAmount = dto.CreditQuantity * dto.UnitPrice;

            var rm = new RawMaterial
            {
                CustomerId = dto.CustomerId,
                MaterialType = dto.MaterialType,
                DebitQuantity = dto.DebitQuantity,
                CreditQuantity = dto.CreditQuantity,
                UnitPrice = dto.UnitPrice,
                DebitAmount = debitAmount,
                CreditAmount = creditAmount,
                Unit = dto.Unit,
                Remarks = dto.Remarks,
                EntryDate = dto.EntryDate
            };

            _db.RawMaterials.Add(rm);
            await _db.SaveChangesAsync();
            return await GetByIdAsync(rm.RawMaterialId) ?? throw new Exception("Failed");
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var rm = await _db.RawMaterials.FindAsync(id);
            if (rm == null) return false;
            _db.RawMaterials.Remove(rm);
            await _db.SaveChangesAsync();
            return true;
        }
    }

    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetSummaryAsync(string period);
    }

    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _db;
        public DashboardService(AppDbContext db) => _db = db;

        public async Task<DashboardSummaryDto> GetSummaryAsync(string period)
        {
            var now = DateTime.UtcNow;
            DateTime fromDate = period switch
            {
                "monthly" => new DateTime(now.Year, now.Month, 1),
                "halfyearly" => now.AddMonths(-6),
                "yearly" => new DateTime(now.Year, 1, 1),
                _ => new DateTime(now.Year, now.Month, 1)
            };

            var txns = await _db.Transactions
                .Include(t => t.Customer)
                .Where(t => t.TransactionDate >= fromDate)
                .ToListAsync();

            var customers = await _db.Customers
                .Include(c => c.Transactions)
                .Where(c => c.IsActive)
                .ToListAsync();

            var rawMaterials = await _db.RawMaterials
                .Where(r => r.EntryDate >= fromDate)
                .ToListAsync();

            var customerSummaries = customers.Select(c =>
            {
                var cTxns = txns.Where(t => t.CustomerId == c.CustomerId).ToList();
                return new CustomerSummaryDto
                {
                    CustomerId = c.CustomerId,
                    CustomerName = c.CustomerName,
                    MobileNumber = c.MobileNumber,
                    TotalDebit = cTxns.Sum(t => t.DebitAmount),
                    TotalCredit = cTxns.Sum(t => t.CreditAmount),
                    InterestAccrued = cTxns.Sum(t => t.InterestAmount),
                    Balance = cTxns.Sum(t => t.DebitAmount) - cTxns.Sum(t => t.CreditAmount)
                };
            }).ToList();

            // Monthly breakdown
            var monthlyBreakdown = txns
                .GroupBy(t => new { t.TransactionDate.Year, t.TransactionDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new MonthlyBreakdownDto
                {
                    Year = g.Key.Year,
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM"),
                    Debit = g.Sum(t => t.DebitAmount),
                    Credit = g.Sum(t => t.CreditAmount),
                    Interest = g.Sum(t => t.InterestAmount)
                }).ToList();

            var rawMaterialSummaries = rawMaterials
                .GroupBy(r => r.MaterialType)
                .Select(g => new RawMaterialSummaryDto
                {
                    MaterialType = g.Key,
                    TotalDebitQty = g.Sum(r => r.DebitQuantity),
                    TotalCreditQty = g.Sum(r => r.CreditQuantity),
                    NetQuantity = g.Sum(r => r.DebitQuantity) - g.Sum(r => r.CreditQuantity),
                    TotalDebitAmount = g.Sum(r => r.DebitAmount),
                    TotalCreditAmount = g.Sum(r => r.CreditAmount),
                    NetAmount = g.Sum(r => r.DebitAmount) - g.Sum(r => r.CreditAmount)
                }).ToList();

            return new DashboardSummaryDto
            {
                Period = period,
                TotalDebit = txns.Sum(t => t.DebitAmount),
                TotalCredit = txns.Sum(t => t.CreditAmount),
                TotalInterest = txns.Sum(t => t.InterestAmount),
                NetBalance = txns.Sum(t => t.DebitAmount) - txns.Sum(t => t.CreditAmount),
                TotalCustomers = customers.Count,
                TotalTransactions = txns.Count,
                CustomerSummaries = customerSummaries,
                MonthlyBreakdown = monthlyBreakdown,
                RawMaterialSummaries = rawMaterialSummaries
            };
        }
    }
}
