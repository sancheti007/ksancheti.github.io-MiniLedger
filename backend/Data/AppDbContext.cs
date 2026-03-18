using Microsoft.EntityFrameworkCore;
using ShopLedger.Models;

namespace ShopLedger.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<RawMaterial> RawMaterials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>(e =>
            {
                e.HasKey(c => c.CustomerId);
                e.Property(c => c.CustomerName).IsRequired().HasMaxLength(150);
                e.Property(c => c.MobileNumber).HasMaxLength(15);
                e.HasMany(c => c.Transactions).WithOne(t => t.Customer).HasForeignKey(t => t.CustomerId);
                e.HasMany(c => c.RawMaterials).WithOne(r => r.Customer).HasForeignKey(r => r.CustomerId);
            });

            modelBuilder.Entity<Transaction>(e =>
            {
                e.HasKey(t => t.TransactionId);
                e.Property(t => t.ItemDescription).HasMaxLength(300);
            });

            modelBuilder.Entity<RawMaterial>(e =>
            {
                e.HasKey(r => r.RawMaterialId);
                e.Property(r => r.MaterialType).IsRequired().HasMaxLength(100);
            });

            // Seed data
            modelBuilder.Entity<Customer>().HasData(
                new Customer
                {
                    CustomerId = 1,
                    CustomerName = "Ramesh Kumar",
                    MobileNumber = "9876543210",
                    InterestRate = 2.0m,
                    CreatedDate = new DateTime(2024, 1, 1)
                },
                new Customer
                {
                    CustomerId = 2,
                    CustomerName = "Suresh Sharma",
                    MobileNumber = "9812345678",
                    InterestRate = 1.5m,
                    CreatedDate = new DateTime(2024, 1, 15)
                }
            );
        }
    }
}
