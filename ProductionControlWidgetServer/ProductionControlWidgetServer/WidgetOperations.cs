using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProductionControlWidgetServer.HubInteraction;
using ProductionControlWidgetServer.Models;

namespace ProductionControlWidgetServer
{
    public class WidgetOperations
    {
        private readonly HubConnection _connection;

        public WidgetOperations(HubConnection connection)
        {
            _connection = connection;
        }

        public async Task<bool> IsManager(string userId)
        {
            var roleIds = await _connection.CreateHubRolesService().GetUsersRoleIds(userId);
            return await _connection.CreateHubRolesService().IsManager(roleIds);
        }

        public async Task<bool> RequestsOnlyHimself(string[] requestEmails, string userId)
        {
            var user = await _connection.CreateHubUserService().GetUser(userId);
            var userEmail = user.Profile.Email.UserEmail;
            return requestEmails.All(reqEmail => reqEmail == userEmail);
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
            //TODO: сделать запрос к 1с
        }
    }
}