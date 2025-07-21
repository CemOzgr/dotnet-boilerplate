using System.Linq.Expressions;
using Boilerplate.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Boilerplate.Core.Persistence.EfCore;

public abstract class EfRepositoryBase<TEntity, TContext> : IRepository<TEntity>
    where TEntity : class, IEntity
    where TContext : DbContext
{
    protected readonly TContext Context;
    protected readonly DbSet<TEntity> DbSet;

    protected EfRepositoryBase(TContext context)
    {
        Context = context ?? throw new ArgumentNullException(nameof(context));
        DbSet = Context.Set<TEntity>();
    }

    public virtual Task<TEntity?> GetAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default)
    {
        return DbSet
            .ApplySpecification(specification)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public virtual Task<List<TEntity>> GetListAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default)
    {
        return DbSet
            .ApplySpecification(specification)
            .ToListAsync(cancellationToken);
    }

    public virtual Task<bool> ExistsAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default)
    {
        return DbSet
            .ApplySpecification(specification)
            .AnyAsync(cancellationToken);
    }

    public virtual async Task AddAsync(
        TEntity entity,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(entity);

        await DbSet.AddAsync(entity, cancellationToken);
    }

    public virtual Task AddManyAsync(
        IEnumerable<TEntity> entities,
        CancellationToken cancellationToken = default
    )
    {
        return DbSet.AddRangeAsync(entities, cancellationToken);
    }

    public virtual void Delete(TEntity entity) => DbSet.Remove(entity);


    public virtual async Task<TEntity?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        return await DbSet.FindAsync([id], cancellationToken);
    }

    public virtual Task<int> CountAsync(
        Specification<TEntity> specification,
        CancellationToken cancellationToken = default
    )
    {
        return DbSet
            .AsQueryable()
            .ApplySpecification(specification)
            .CountAsync(cancellationToken);
    }

    public virtual Task<TEntity?> FirstOrDefaultAsync(
        Expression<Func<TEntity, bool>> predicate,
        CancellationToken cancellationToken = default,
        params Expression<Func<TEntity, object>>[] includes)
    {
        var query = DbSet.AsQueryable();

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        return query.FirstOrDefaultAsync(predicate, cancellationToken);
    }

    public virtual Task<bool> AnyAsync(
        Expression<Func<TEntity, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        return DbSet.AnyAsync(predicate, cancellationToken);
    }
}