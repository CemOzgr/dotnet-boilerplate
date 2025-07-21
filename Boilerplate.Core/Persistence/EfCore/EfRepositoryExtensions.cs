using Boilerplate.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Boilerplate.Core.Persistence.EfCore;

public static class EfRepositoryExtensions
{
    public static IQueryable<T> ApplySpecification<T>(
        this IQueryable<T> queryable,
        Specification<T> specification
    ) where T : class, IEntity
    {
        IQueryable<T> query = queryable;

        if (specification.Criteria != null)
        {
            query = query.Where(specification.Criteria);
        }

        if (specification.Includes != null)
        {
            query = specification.Includes.Aggregate(query, (current, include) => current.Include(include));
        }

        return query;
    }
}