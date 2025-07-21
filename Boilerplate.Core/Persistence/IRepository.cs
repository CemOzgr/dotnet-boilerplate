using Boilerplate.Core.Entities;

namespace Boilerplate.Core.Persistence;

public interface IRepository<TEntity> where TEntity : class, IEntity
{
    Task<TEntity?> GetAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default
    );

    Task<List<TEntity>> GetListAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default
    );

    Task<bool> ExistsAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default
    );

    Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default
    );

    Task AddManyAsync(
        IEnumerable<TEntity> entities,
        CancellationToken cancellationToken = default
    );

    void Delete(TEntity entity);

    Task<TEntity?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );

    Task<int> CountAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default
    );
}