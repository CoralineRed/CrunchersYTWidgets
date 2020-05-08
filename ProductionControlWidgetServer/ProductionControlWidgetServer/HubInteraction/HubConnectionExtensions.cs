using ProductionControlWidgetServer.HubInteraction.Roles;
using ProductionControlWidgetServer.HubInteraction.Users;

namespace ProductionControlWidgetServer.HubInteraction
{
    public static class HubConnectionExtensions
    {
        public static IHubRolesService CreateHubRolesService(this HubConnection connection)
        {
            return new HubRolesService(connection);
        }

        public static IHubUserService CreateHubUserService(this HubConnection connection)
        {
            return new HubUserService(connection);
        }
    }
}