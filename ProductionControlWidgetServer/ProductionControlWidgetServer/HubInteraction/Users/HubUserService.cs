using System;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace ProductionControlWidgetServer.HubInteraction.Users
{
    public class HubUserService : IHubUserService
    {
        private readonly HubConnection _connection;

        public HubUserService(HubConnection connection)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
        }

        public async Task<HubUser> GetUser(string userId)
        {
            var client = await _connection.GetAuthenticatedHttpClient();
            var response = await client.GetAsync($"rest/users/{userId}");

            response.EnsureSuccessStatusCode();

            return JsonConvert.DeserializeObject<HubUser>(await response.Content.ReadAsStringAsync());
        }
    }
}