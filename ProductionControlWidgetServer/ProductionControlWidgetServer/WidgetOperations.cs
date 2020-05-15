using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProductionControlWidgetServer.HubInteraction;
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

        public async Task<bool> RequestsOnlyHimself(string[] requestEmails, string userId)
        {
            var user = await _hubConnection.CreateHubUserService().GetUser(userId);
            var userEmail = user.Profile.Email.UserEmail;
            return requestEmails.All(reqEmail => reqEmail == userEmail);
        }

        public async Task<WidgetResponseModel> Api1CRequest(string[] emails, Period[] periods)
        {
            _oneCConnection.
            
            var rnd = new Random();
            var users = emails.Select(email =>
            {
                var user = new ResponseLine() {Email = email};
                user.Periods = periods.Select(period => new PeriodWithPlan()
                    {From = period.From, To = period.To, Plan = rnd.Next(1, 70)}).ToArray();
                return user;
            }).ToArray();
            return new WidgetResponseModel() {Users = users};
            //TODO: сделать запрос к 1с
        }

        class OneCService
        {
            private readonly OneCConnection _connection;

            public OneCService(OneCConnection connection)
            {
                _connection = connection ?? throw new ArgumentNullException(nameof(connection));
            }

            public async Task GetEmployees()
            {
                var client = _connection.GetAuthenticatedHttpClient();
                var employees = await client.GetAsync($"Catalog_Сотрудники?$expand=Физлица&$select=Red_Key,,ВремяОкончания,ГрафикРаботы_Key&$filter=ВремяНачала ge datetime'2019-12-30T00:00:00'");
                var
            }

            public async Task GetSchedules()
            {
                
            }
        }
    }
}