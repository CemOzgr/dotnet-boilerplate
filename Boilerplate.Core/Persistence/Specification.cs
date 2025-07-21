using System.Linq.Expressions;
using Boilerplate.Core.Entities;

namespace Boilerplate.Core.Persistence;

public class Specification<T> where T : class, IEntity
{
    public Expression<Func<T, bool>>? Criteria { get; private set; }
    public List<Expression<Func<T, object>>>? Includes { get; private set; }

    public Specification()
    {
    }

    public Specification(Expression<Func<T, bool>> criteria)
    {
        Criteria = criteria;
    }

    public Specification(
        Expression<Func<T, bool>> criteria,
        List<Expression<Func<T, object>>> includes
    )
    {
        Criteria = criteria;
        Includes = includes;
    }
}