using Boilerplate.Core.FileManagement;

namespace Boilerplate.Core.Mailing;

public record MailData(
    string Subject,
    string Body,
    List<string> ToList,
    FileData[]? Attachments = null,
    string? DisplayName = null
);