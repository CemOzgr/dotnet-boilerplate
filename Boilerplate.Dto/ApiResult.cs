namespace Boilerplate.Dto;

public record ApiResult(string Message, object? Content = null)
{
    public static ApiResult Success(string message = "Success", object? content = null) => new(message, content);

    public static ApiResult Error(string message) => new ApiResult(message);
};