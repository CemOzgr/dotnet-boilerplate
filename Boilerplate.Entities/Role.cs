using Boilerplate.Core.Entities;

namespace Boilerplate.Entities;

public class Role : IEntity
{
    public int Id { get; set; }
    public string Name { get; set; }
}