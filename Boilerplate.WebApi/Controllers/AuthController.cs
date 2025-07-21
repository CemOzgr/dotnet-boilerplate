using System.Security.Claims;
using Boilerplate.Dto;
using Boilerplate.Infrastructure.Authentication.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Boilerplate.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthenticationService _authenticationService;

    public AuthController(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginAsync([FromBody] LoginRequest request)
    {
       AuthenticationResponse response = await _authenticationService.AuthenticateAsync(
           request.Email,
           request.Password
       );

       return Ok(response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterRequest request)
    {
        AuthenticationResponse response = await _authenticationService.RegisterAsync(
            request.Name,
            request.Email,
            request.Password,
            HttpContext.RequestAborted
        );

        return Ok(ApiResult.Success(content: response));
    }

    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePasswordAsync([FromBody] ChangePasswordRequest request)
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        bool success = await _authenticationService.ChangePasswordAsync(
            userId,
            request.CurrentPassword,
            request.NewPassword,
            HttpContext.RequestAborted
        );

        return success
            ? Ok(ApiResult.Success("Password changed successfully"))
            : BadRequest(ApiResult.Error("Current password is incorrect"));
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUserAsync()
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        UserInfoResponse? userInfo = await _authenticationService.GetUserInfoAsync(
            userId,
            HttpContext.RequestAborted
        );

        return userInfo == null
            ? NotFound(ApiResult.Error("User not found"))
            : Ok(ApiResult.Success(content: userInfo));
    }
}