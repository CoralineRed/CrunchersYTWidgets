using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProductionControlWidgetServer.HubInteraction.Roles
{
    public interface IHubRolesService
    {
        public Task<IEnumerable<string>> GetUsersRoleIds(string userId);
        public Task<bool> IsManager(IEnumerable<string> roleIds);
    }
}