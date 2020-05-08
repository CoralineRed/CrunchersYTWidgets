using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using ProductionControlWidgetServer.HubInteraction.Users;

namespace ProductionControlWidgetServer.HubInteraction.Roles
{
    public class HubRolesService : IHubRolesService
    {
        private HubConnection _connection;

        public HubRolesService(HubConnection connection)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
        }

        public async Task<IEnumerable<string>> GetUsersRoleIds(string userId)
        {
            var client = await _connection.GetAuthenticatedHttpClient();
            var response = await client.GetAsync($"rest/users/{userId}");

            response.EnsureSuccessStatusCode();

            var user = JsonConvert.DeserializeObject<HubUser>(await response.Content.ReadAsStringAsync());
            return user.AllUniqueRolesIds;
        }

        public async Task<bool> IsManager(IEnumerable<string> roleIds)
        {
            var client = await _connection.GetAuthenticatedHttpClient();
            var listOfRolesTasks = new List<Task<HubRole>>();
            foreach (var roleId in roleIds)
            {
                listOfRolesTasks.Add(Task.Run(() => AsyncRoleRequest(roleId, client)));
            }

            Task.WaitAll(listOfRolesTasks.ToArray());
            var roles = listOfRolesTasks.Select(x => x.Result);
            return roles.Any(role => role.Permissions.Any(permission => permission.Name == "Read User"));
        }

        private async Task<HubRole> AsyncRoleRequest(string roleId, HttpClient client)
        {
            var response = await client.GetAsync($"rest/roles/{roleId}");
            response.EnsureSuccessStatusCode();
            return JsonConvert.DeserializeObject<HubRole>(await response.Content.ReadAsStringAsync());
        }
    }
}