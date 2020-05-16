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
            var oneCService = _oneCConnection.CreateOneCService();

            var newPeriods = periods
                .Select(x => (Period: x,
                    Dates: (From: DateTimeOffset.Parse(x.From).DateTime, To: DateTimeOffset.Parse(x.To).DateTime)))
                .ToList();

            var employees = await oneCService.GetEmployeesAsync();
            var schedules = (await oneCService.GetSchedulesAsync(newPeriods
                    .Select(x => x.Dates).ToList()))
                .GroupBy(x => (x.ВремяНачала.Date, x.ГрафикРаботы_Key) )
                .Select(x =>
                    (Hours: x.Select(y => y.ЧасыРаботы).Aggregate(0, (a, b) => a + b),
                        x.Key.Date,
                        ScheduleKey: x.Key.ГрафикРаботы_Key));

            return new WidgetResponseModel
            {
                Users = (from employeeEmail in from email in emails
                            join employee in employees
                                on email equals employee.Email into employee
                            from employeeEmail in employee.DefaultIfEmpty()
                            select (Email: email, ScheduleKey: employeeEmail?.ScheduleKey ?? Guid.Empty)
                        join schedule in schedules
                            on employeeEmail.ScheduleKey equals schedule.ScheduleKey into employee
                        from employeeSchedule in employee.DefaultIfEmpty()
                        select new
                        {
                            employeeEmail.Email,
                            employeeSchedule.Date,
                            employeeSchedule.Hours
                        })
                    .GroupBy(x => x.Email)
                    .Select(group => new ResponseLine()
                    {
                        Email = group.Key,
                        Periods = newPeriods
                            .Select(period => new PeriodWithPlan
                            {
                                From = period.Period.From,
                                To = period.Period.To,
                                Plan = group
                                    .Where(x => x.Date >= period.Dates.From && x.Date <= period.Dates.To)
                                    .Select(x => x.Hours)
                                    .Aggregate(0, (x, y) => x + y)
                            })
                            .ToArray()
                    })
                    .ToArray()
            };
        }
    }
}