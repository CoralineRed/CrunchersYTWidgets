using System.Threading.Tasks;

namespace ProductionControlWidgetServer.HubInteraction.Users
{
    public interface IHubUserService
    {
        public Task<HubUser> GetUser(string userId);
    }
}