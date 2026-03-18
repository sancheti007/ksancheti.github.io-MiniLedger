using Microsoft.EntityFrameworkCore;
using ShopLedger.Data;
using ShopLedger.DTOs;
using ShopLedger.Models;

namespace ShopLedger.Services
{
    public interface ITransactionService
    {
        Task<List<TransactionDto>> GetAllAsync(DateTime? from = null, DateTime? to = null);
        Task<TransactionDto?> GetByIdAsync(int id);
        Task<TransactionDto> CreateAsync(CreateTransactionDto dto);
        Task<bool> DeleteAsync(int id);
    }

    public class TransactionService : ITransactionService
    {
        private readonly AppDbContext _db;
        public TransactionService(AppDbContext db) => _db = db;

        public async Task<List<TransactionDto>> GetAllAsync(DateTime? from = null, DateTime? to = null)
        {
            var query = _db.Transactions.Include(t => t.Customer).AsQueryable();
            if (from.HasValue) query = query.Where(t => t.TransactionDate >= from.Value);
            if (to.HasValue) query = query.Where(t => t.TransactionDate <= to.Value);

            var txns = await query.OrderByDescending(t => t.TransactionDate).ToListAsync();

            return txns.Select(t => new TransactionDto
            {
                TransactionId = t.TransactionId,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer?.CustomerName ?? "",
                DebitAmount = t.DebitAmount,
                CreditAmount = t.CreditAmount,
                InterestAmount = t.InterestAmount,
                ItemDescription = t.ItemDescription,
                TransactionDate = t.TransactionDate,
                TransactionType = t.TransactionType
            }).ToList();
        }

        public async Task<TransactionDto?> GetByIdAsync(int id)
        {
            var t = await _db.Transactions.Include(x => x.Customer).FirstOrDefaultAsync(x => x.TransactionId == id);
            if (t == null) return null;
            return new TransactionDto
            {
                TransactionId = t.TransactionId,
                CustomerId = t.CustomerId,
                CustomerName = t.Customer?.CustomerName ?? "",
                DebitAmount = t.DebitAmount,
                CreditAmount = t.CreditAmount,
                InterestAmount = t.InterestAmount,
                ItemDescription = t.ItemDescription,
                TransactionDate = t.TransactionDate,
                TransactionType = t.TransactionType
            };
        }

        public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto)
        {
            var customer = await _db.Customers.FindAsync(dto.CustomerId);
            if (customer == null) throw new Exception("Customer not found");

            // Calculate interest on debit amount
            decimal interest = 0;
            if (dto.DebitAmount > 0)
            {
                interest = Math.Round(dto.DebitAmount * customer.InterestRate / 100, 2);
            }

            var txn = new Transaction
            {
                CustomerId = dto.CustomerId,
                DebitAmount = dto.DebitAmount,
                CreditAmount = dto.CreditAmount,
                InterestAmount = interest,
                ItemDescription = dto.ItemDescription,
                TransactionDate = dto.TransactionDate,
                TransactionType = dto.TransactionType
            };

            _db.Transactions.Add(txn);
            await _db.SaveChangesAsync();
            return await GetByIdAsync(txn.TransactionId) ?? throw new Exception("Failed to create");
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var txn = await _db.Transactions.FindAsync(id);
            if (txn == null) return false;
            _db.Transactions.Remove(txn);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
