namespace Boilerplate.Dto;

public record ErrorDto(string RequestId, string TimeStamp, string Message, int StatusCode);