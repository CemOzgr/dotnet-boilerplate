using System.Security.Claims;
using Boilerplate.Business.Abstract;
using Boilerplate.Core.DTOs;
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
    public async Task<ActionResult<AuthenticationResponse>> Login([FromBody] LoginRequest request)
    {
       AuthenticationResponse response = await _authenticationService.AuthenticateAsync(
           request.Email,
           request.Password
       );

       return Ok(response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthenticationResponse>> Register([FromBody] RegisterRequest request)
    {
        AuthenticationResponse response = await _authenticationService.RegisterAsync(
            request.Name,
            request.Email,
            request.Password
        );

        return Ok(response);
    }

    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized();
        }

        bool success = await _authenticationService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword);
        if (!success)
        {
            return BadRequest(new { message = "Current password is incorrect" });
        }

        return Ok(new { message = "Password changed successfully" });
    }

    [HttpGet("me")]
    public ActionResult GetCurrentUser()
    {
        Claim? userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        Claim? emailClaim = User.FindFirst(ClaimTypes.Email);
        Claim? nameClaim = User.FindFirst(ClaimTypes.Name);

        if (userIdClaim == null || emailClaim == null || nameClaim == null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            id = int.Parse(userIdClaim.Value),
            email = emailClaim.Value,
            name = nameClaim.Value,
            roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value)
        });
    }
}