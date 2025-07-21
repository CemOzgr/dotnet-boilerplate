using System.Net;
using Boilerplate.Core.DTOs;
using Boilerplate.Core.Entities;
using Boilerplate.Entities.Exceptions;
using Serilog.Context;

namespace Boilerplate.WebApi.Middleware;

public class ExceptionMiddleware
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly RequestDelegate _next;

    public ExceptionMiddleware(
        RequestDelegate next,
        IWebHostEnvironment env,
        ILogger<ExceptionMiddleware> logger
    )
    {
        _env = env;
        _logger = logger;
        _next = next;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _next(httpContext);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(httpContext, ex);
        }
    }

    private async Task HandleExceptionAsync(
        HttpContext httpContext,
        Exception exception
    )
    {
        Type exceptionType = exception.GetType();
        string message = exceptionType.IsSubclassOf(typeof(DomainExceptionBase))
                         || !_env.IsProduction()
            ? exception.Message
            : "Something went wrong";

        string requestId = httpContext.TraceIdentifier;

        using (LogContext.PushProperty("RequestId", requestId))
        using (LogContext.PushProperty("requestPath", httpContext.Request.Path.Value))
        {
            _logger.LogError(exception, exception.Message);
        }

        int statusCode = (int)(exception switch
        {
            DuplicateUserException => HttpStatusCode.BadRequest,
            _ => HttpStatusCode.InternalServerError
        });

        ErrorDto errorDto = new(
            requestId,
            DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
            message,
            statusCode
        );

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(errorDto);
    }
}