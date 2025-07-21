using Boilerplate.Core.Persistence.EfCore;
using Boilerplate.Entities;
using Boilerplate.Infrastructure.Persistence.Repositories.Abstract;

namespace Boilerplate.Infrastructure.Persistence.Repositories.Concrete;

public class EfUserRepository : EfRepositoryBase<User, BoilerplateContext>, IUserRepository
{
    public EfUserRepository(BoilerplateContext context) : base(context)
    {
    }
}