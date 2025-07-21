namespace Boilerplate.Core.FileManagement;

public record FileData(
    string Path,
    string Name,
    byte[] Content,
    string? ContentType = null
)
{
    public string Path { get; set; } = Path;
    public string Name { get; set; } = Name;
    public string? ContentType { get; set; } = ContentType;
    public byte[] Content { get; set; } = Content;
}