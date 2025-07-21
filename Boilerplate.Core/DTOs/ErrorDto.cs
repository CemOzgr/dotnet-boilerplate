namespace Boilerplate.Core.DTOs;

public record ErrorDto(string RequestId, string TimeStamp, string Message, int StatusCode);