using System.Text;
using Boilerplate.Infrastructure.Authentication;
using Boilerplate.Infrastructure.Persistence;
using Boilerplate.WebApi.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOpenApi()
    .AddControllers();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Authentication:Issuer"],
            ValidAudience = builder.Configuration["Authentication:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["Authentication:SecretKey"] ??
                    throw new InvalidOperationException("Authentication:SecretKey is not configured")
                )
            )
        };
    });

builder.Services.AddAuthorization();

builder.Services
    .AddPersistenceModule(builder.Configuration)
    .AddAuthenticationModule();

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app
    .UseHttpsRedirection()
    .UseAuthentication()
    .UseAuthorization();

app.UseMiddleware<ExceptionMiddleware>();

app.MapControllers();

await app.RunAsync();