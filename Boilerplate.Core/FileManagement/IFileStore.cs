namespace Boilerplate.Core.FileManagement;

public interface IFileStore
{
    Task UploadManyAsync(
        IEnumerable<FileData> files,
        CancellationToken cancellationToken = default
    );

    Task UploadAsync(
        FileData file,
        CancellationToken cancellationToken = default
    );

    Task<FileData> DownloadAsync(
        string path,
        CancellationToken cancellationToken = default
    );

    void Delete(string path);
}