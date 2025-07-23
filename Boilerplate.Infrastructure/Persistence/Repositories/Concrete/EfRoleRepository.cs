using Boilerplate.Core.Persistence.EfCore;
using Boilerplate.Entities;
using Boilerplate.Infrastructure.Persistence.Repositories.Abstract;

namespace Boilerplate.Infrastructure.Persistence.Repositories.Concrete;

public class EfRoleRepository : EfRepositoryBase<Role, BoilerplateContext>, IRoleRepository
{
    public EfRoleRepository(BoilerplateContext context) : base(context)
    {
    }
}