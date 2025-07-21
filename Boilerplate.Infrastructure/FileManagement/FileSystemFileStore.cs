using Boilerplate.Core.FileManagement;

namespace Boilerplate.Infrastructure.FileManagement;

internal class FileSystemFileStore : IFileStore
{
    public Task UploadManyAsync(
        IEnumerable<FileData> files,
        CancellationToken cancellationToken = default
    )
    {
        return Task.WhenAll(
            files.Select(async file => await UploadAsync(file, cancellationToken))
        );
    }

    public async Task UploadAsync(
        FileData file,
        CancellationToken cancellationToken = default
    )
    {
        Directory.CreateDirectory(file.Path);
        string fullPath = Path.Combine(file.Path, file.Name);

        await File.WriteAllBytesAsync(
            fullPath,
            file.Content,
            cancellationToken
        );
    }

    public async Task<FileData> DownloadAsync(
        string path,
        CancellationToken cancellationToken = default
    ) =>
        new(
            path,
            Path.GetFileName(path),
            await File.ReadAllBytesAsync(path, cancellationToken)
        );

    public void Delete(string path)
    {
        if (!File.Exists(path))
        {
            throw new InvalidOperationException("file could not be found");
        }

        File.Delete(path);
    }
}