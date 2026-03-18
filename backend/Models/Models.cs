using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ShopLedger.Models
{
    public class Customer
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CustomerId { get; set; }

        [Required]
        [MaxLength(150)]
        public string CustomerName { get; set; } = string.Empty;

        [MaxLength(15)]
        public string MobileNumber { get; set; } = string.Empty;

        [Column(TypeName = "decimal(5,2)")]
        public decimal InterestRate { get; set; } = 2.0m;

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public ICollection<RawMaterial> RawMaterials { get; set; } = new List<RawMaterial>();
    }

    public class Transaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TransactionId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DebitAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CreditAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal InterestAmount { get; set; } = 0;

        [MaxLength(300)]
        public string ItemDescription { get; set; } = string.Empty;

        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

        public string TransactionType { get; set; } = "GENERAL"; // GENERAL, RAW_MATERIAL

        public Customer? Customer { get; set; }
    }

    public class RawMaterial
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RawMaterialId { get; set; }

        [Required]
        public int CustomerId { get; set; }

        [Required]
        [MaxLength(100)]
        public string MaterialType { get; set; } = string.Empty; // wheat, joa, jawar, seeds

        [Column(TypeName = "decimal(18,2)")]
        public decimal DebitQuantity { get; set; } = 0; // issued quantity

        [Column(TypeName = "decimal(18,2)")]
        public decimal CreditQuantity { get; set; } = 0; // returned quantity

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal DebitAmount { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CreditAmount { get; set; } = 0;

        public string Unit { get; set; } = "KG";

        [MaxLength(300)]
        public string Remarks { get; set; } = string.Empty;

        public DateTime EntryDate { get; set; } = DateTime.UtcNow;

        public Customer? Customer { get; set; }
    }
}
