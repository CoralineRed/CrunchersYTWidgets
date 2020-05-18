using System;
using System.Collections;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using ProductionControlWidgetServer.HubInteraction;
using ProductionControlWidgetServer.HubInteraction.Users;
using ProductionControlWidgetServer.Models;
using ProductionControlWidgetServer.OneCInteraction;

namespace ProductionControlWidgetServer
{
    public class WidgetOperations
    {
        private readonly HubConnection _hubConnection;
        private readonly OneCConnection _oneCConnection;

        public WidgetOperations(HubConnection hubConnection, OneCConnection oneCConnection)
        {
            _hubConnection = hubConnection;
            _oneCConnection = oneCConnection;
        }

        public async Task<bool> IsManager(string userId)
        {
            var roleIds = await _hubConnection.CreateHubRolesService().GetUsersRoleIds(userId);
            return await _hubConnection.CreateHubRolesService().IsManager(roleIds);
        }

        public async Task<string> GetUserEmail(string userId)
        {
            var user = await _hubConnection.CreateHubUserService().GetUser(userId);
            return user.Profile.Email.UserEmail;
        }

        public async Task<WidgetResponseModel> Api1CRequest(string[] emails, Period[] periods)
        {
            var rnd = new Random();
            var users = emails.Select(email =>
            {
                var user = new ResponseLine() {Email = email};
                user.Periods = periods.Select(period => new PeriodWithPlan()
                    {From = period.From, To = period.To, Plan = rnd.Next(1, 70)}).ToArray();
                return user;
            }).ToArray();
            return new WidgetResponseModel() {Users = users};
        }
    }
}
