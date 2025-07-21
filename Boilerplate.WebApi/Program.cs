using System.Text;
using Boilerplate.Infrastructure.Authentication;
using Boilerplate.Infrastructure.FileManagement;
using Boilerplate.Infrastructure.Mailing;
using Boilerplate.Infrastructure.Persistence;
using Boilerplate.WebApi.Extensions;
using Boilerplate.WebApi.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOpenApi()
    .AddEndpointsApiExplorer()
    .AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Boilerplate API",
            Version = "v1",
            Description = "A comprehensive boilerplate API with JWT authentication"
        });

        // JWT Bearer Authentication için güvenlik tanımı
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
        });

        // Tüm endpointler için güvenlik gereksinimi
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

builder.Services.AddControllers();

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
    .AddMailingModule(builder.Configuration)
    .AddFileManagementModule()
    .AddAuthenticationModule();

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app
    .UseHttpsRedirection()
    .UseAuthentication()
    .UseAuthorization();

app.UseMiddleware<ExceptionMiddleware>();

app.MapControllers();

// Seed the database in development
if (app.Environment.IsDevelopment())
{
    await app.SeedDatabaseAsync();
}

await app.RunAsync();