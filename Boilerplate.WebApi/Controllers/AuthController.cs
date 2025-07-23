using System.Security.Claims;
using Boilerplate.Business.Abstract;
using Boilerplate.Dto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Boilerplate.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IIdentityService _identityService;

    public AuthController(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
       AuthenticationResponse response = await _identityService.AuthenticateAsync(
           request.Email,
           request.Password
       );

       return Ok(response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        await _identityService.RegisterAsync(
            request.Name,
            request.Email,
            request.Password,
            HttpContext.RequestAborted
        );

        return Ok(ApiResult.Success(
                "Registration successful. Please check your email to activate your account."
            )
        );
    }

    [HttpPost("confirm-email/{token}")]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmailAsync(string token)
    {
        await _identityService.ConfirmEmailAsync(
            token,
            HttpContext.RequestAborted
        );

        return Ok(ApiResult.Success("Email confirmed successfully"));
    }

    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        await _identityService.ChangePasswordAsync(
            userId,
            request.CurrentPassword,
            request.NewPassword,
            HttpContext.RequestAborted
        );

        return Ok(ApiResult.Success("Password changed successfully"));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        UserInfoResponse userInfo = await _identityService.GetUserInfoAsync(
            userId,
            HttpContext.RequestAborted
        );

        return Ok(ApiResult.Success(content: userInfo));
    }
}