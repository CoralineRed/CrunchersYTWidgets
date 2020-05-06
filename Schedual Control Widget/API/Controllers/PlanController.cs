using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using YouTrackSharp;
using YouTrackSharp.Management;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlanController : Controller
    {
        private readonly BearerTokenConnection _bearerTokenConnection;

        public PlanController(BearerTokenConnection bearerTokenConnection)
        {
            _bearerTokenConnection = bearerTokenConnection;
        }

        [HttpPost("forPeriods")]
        public async Task<ActionResult<UserPlan[]>> ForPeriods(EmailsWithPeriods emailsWithPeriods)
        {
            var userManagementService = _bearerTokenConnection.CreateUserManagementService();
            var users = await userManagementService.GetUsers();

            //FIXME уточнить, как нужно делать валидацию пользователей
            var allowedEmails = users.Where(x => emailsWithPeriods.Emails.Contains(x.Email));

            var periods = emailsWithPeriods.Periods;
            var userPlans = allowedEmails.Select(
                user => new UserPlan(
                    user.Email,
                    //FIXME прокидываем запрос на 1С, получаем план для пользователей в нужный период
                    periods.Select(period => new PeriodWithPlan(period.From, period.To,
                        new Random().Next(
                            (int) ((DateTime.Parse(period.To) - DateTime.Parse(period.From)).TotalDays + 1) * 8) +
                        "h")))
            );

            return Ok(userPlans);
        }
    }

    public class UserPlan
    {
        public UserPlan()
        {
        }

        public UserPlan(string email, IEnumerable<PeriodWithPlan> periods)
        {
            Email = email;
            Periods = periods;
        }

        public string Email { get; set; }
        public IEnumerable<PeriodWithPlan> Periods { get; set; }
    }

    public class EmailsWithPeriods
    {
        public string[] Emails { get; set; }
        public Period[] Periods { get; set; }
        public string UserId { get; set; }
    }

    public class Period
    {
        public Period()
        {
        }

        public Period(string from, string to)
        {
            From = from;
            To = to;
        }

        public string From { get; set; }
        public string To { get; set; }
    }

    public class PeriodWithPlan : Period
    {
        public PeriodWithPlan()
        {
        }

        public PeriodWithPlan(string from, string to, string plan) : base(from, to)
        {
            Plan = plan;
        }

        public string Plan { get; set; }
    }
}