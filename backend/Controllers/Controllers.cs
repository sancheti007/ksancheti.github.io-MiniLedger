using Microsoft.AspNetCore.Mvc;
using ShopLedger.DTOs;
using ShopLedger.Services;

namespace ShopLedger.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _service;
        public CustomersController(ICustomerService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<CustomerDto>>>> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(new ApiResponse<List<CustomerDto>> { Success = true, Data = data, Message = "Success" });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            if (data == null) return NotFound(new ApiResponse<CustomerDto> { Success = false, Message = "Not found" });
            return Ok(new ApiResponse<CustomerDto> { Success = true, Data = data });
        }

        [HttpGet("{id}/transactions")]
        public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetTransactions(int id)
        {
            var data = await _service.GetCustomerTransactionsAsync(id);
            return Ok(new ApiResponse<List<TransactionDto>> { Success = true, Data = data });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> Create([FromBody] CreateCustomerDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new ApiResponse<CustomerDto> { Success = false, Message = "Invalid data" });
            var data = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = data.CustomerId },
                new ApiResponse<CustomerDto> { Success = true, Data = data, Message = "Customer created" });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<CustomerDto>>> Update(int id, [FromBody] CreateCustomerDto dto)
        {
            var data = await _service.UpdateAsync(id, dto);
            if (data == null) return NotFound(new ApiResponse<CustomerDto> { Success = false, Message = "Not found" });
            return Ok(new ApiResponse<CustomerDto> { Success = true, Data = data, Message = "Updated" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(new ApiResponse<bool> { Success = false, Message = "Not found" });
            return Ok(new ApiResponse<bool> { Success = true, Data = true, Message = "Deleted" });
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;
        public TransactionsController(ITransactionService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetAll(
            [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var data = await _service.GetAllAsync(from, to);
            return Ok(new ApiResponse<List<TransactionDto>> { Success = true, Data = data });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<TransactionDto>>> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            if (data == null) return NotFound(new ApiResponse<TransactionDto> { Success = false, Message = "Not found" });
            return Ok(new ApiResponse<TransactionDto> { Success = true, Data = data });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<TransactionDto>>> Create([FromBody] CreateTransactionDto dto)
        {
            try
            {
                var data = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = data.TransactionId },
                    new ApiResponse<TransactionDto> { Success = true, Data = data, Message = "Transaction created" });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<TransactionDto> { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(new ApiResponse<bool> { Success = false, Message = "Not found" });
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class RawMaterialsController : ControllerBase
    {
        private readonly IRawMaterialService _service;
        public RawMaterialsController(IRawMaterialService service) => _service = service;

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<RawMaterialDto>>>> GetAll([FromQuery] int? customerId)
        {
            var data = await _service.GetAllAsync(customerId);
            return Ok(new ApiResponse<List<RawMaterialDto>> { Success = true, Data = data });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<RawMaterialDto>>> GetById(int id)
        {
            var data = await _service.GetByIdAsync(id);
            if (data == null) return NotFound(new ApiResponse<RawMaterialDto> { Success = false, Message = "Not found" });
            return Ok(new ApiResponse<RawMaterialDto> { Success = true, Data = data });
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<RawMaterialDto>>> Create([FromBody] CreateRawMaterialDto dto)
        {
            try
            {
                var data = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = data.RawMaterialId },
                    new ApiResponse<RawMaterialDto> { Success = true, Data = data, Message = "Raw material entry created" });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse<RawMaterialDto> { Success = false, Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(new ApiResponse<bool> { Success = false, Message = "Not found" });
            return Ok(new ApiResponse<bool> { Success = true, Data = true });
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;
        public DashboardController(IDashboardService service) => _service = service;

        [HttpGet("{period}")]
        public async Task<ActionResult<ApiResponse<DashboardSummaryDto>>> GetSummary(string period)
        {
            var data = await _service.GetSummaryAsync(period);
            return Ok(new ApiResponse<DashboardSummaryDto> { Success = true, Data = data });
        }
    }
}
