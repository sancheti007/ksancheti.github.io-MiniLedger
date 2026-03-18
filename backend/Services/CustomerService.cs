using Microsoft.EntityFrameworkCore;
using ShopLedger.Data;
using ShopLedger.DTOs;
using ShopLedger.Models;

namespace ShopLedger.Services
{
    public interface ICustomerService
    {
        Task<List<CustomerDto>> GetAllAsync();
        Task<CustomerDto?> GetByIdAsync(int id);
        Task<CustomerDto> CreateAsync(CreateCustomerDto dto);
        Task<CustomerDto?> UpdateAsync(int id, CreateCustomerDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<TransactionDto>> GetCustomerTransactionsAsync(int customerId);
    }

    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _db;
        public CustomerService(AppDbContext db) => _db = db;

        public async Task<List<CustomerDto>> GetAllAsync()
        {
            return await _db.Customers
                .Include(c => c.Transactions)
                .Where(c => c.IsActive)
                .Select(c => new CustomerDto
                {
                    CustomerId = c.CustomerId,
                    CustomerName = c.CustomerName,
                    MobileNumber = c.MobileNumber,
                    InterestRate = c.InterestRate,
                    CreatedDate = c.CreatedDate,
                    IsActive = c.IsActive,
                    TotalDebit = c.Transactions.Sum(t => t.DebitAmount),
                    TotalCredit = c.Transactions.Sum(t => t.CreditAmount),
                    Balance = c.Transactions.Sum(t => t.DebitAmount) - c.Transactions.Sum(t => t.CreditAmount)
                })
                .ToListAsync();
        }

        public async Task<CustomerDto?> GetByIdAsync(int id)
        {
            var c = await _db.Customers.Include(x => x.Transactions).FirstOrDefaultAsync(x => x.CustomerId == id);
            if (c == null) return null;
            return new CustomerDto
            {
                CustomerId = c.CustomerId,
                CustomerName = c.CustomerName,
                MobileNumber = c.MobileNumber,
                InterestRate = c.InterestRate,
                CreatedDate = c.CreatedDate,
                IsActive = c.IsActive,
                TotalDebit = c.Transactions.Sum(t => t.DebitAmount),
                TotalCredit = c.Transactions.Sum(t => t.CreditAmount),
                Balance = c.Transactions.Sum(t => t.DebitAmount) - c.Transactions.Sum(t => t.CreditAmount)
            };
        }

        public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                CustomerName = dto.CustomerName,
                MobileNumber = dto.MobileNumber,
                InterestRate = dto.InterestRate,
                CreatedDate = DateTime.UtcNow
            };
            _db.Customers.Add(customer);
            await _db.SaveChangesAsync();
            return await GetByIdAsync(customer.CustomerId) ?? throw new Exception("Failed to create");
        }

        public async Task<CustomerDto?> UpdateAsync(int id, CreateCustomerDto dto)
        {
            var customer = await _db.Customers.FindAsync(id);
            if (customer == null) return null;
            customer.CustomerName = dto.CustomerName;
            customer.MobileNumber = dto.MobileNumber;
            customer.InterestRate = dto.InterestRate;
            await _db.SaveChangesAsync();
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var customer = await _db.Customers.FindAsync(id);
            if (customer == null) return false;
            customer.IsActive = false;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<List<TransactionDto>> GetCustomerTransactionsAsync(int customerId)
        {
            var txns = await _db.Transactions
                .Include(t => t.Customer)
                .Where(t => t.CustomerId == customerId)
                .OrderBy(t => t.TransactionDate)
                .ToListAsync();

            decimal balance = 0;
            return txns.Select(t =>
            {
                balance += t.DebitAmount - t.CreditAmount;
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
                    TransactionType = t.TransactionType,
                    RunningBalance = balance
                };
            }).ToList();
        }
    }
}
