using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using ProductionControlWidgetServer.HubInteraction;
using ProductionControlWidgetServer.Models;
using YouTrackSharp;

namespace ProductionControlWidgetServer.Controllers
{
    public class PlanController : ControllerBase
    {
        private readonly ILogger<PlanController> _logger;
        private readonly HubConnection _connection;

        public PlanController(ILogger<PlanController> logger, HubConnection connection)
        {
            _logger = logger;
            _connection = connection;
        }

        [HttpPost]
        public async Task<IActionResult> Periods([FromBody] WidgetRequestModel request)
        {
            var widgetOperations = new WidgetOperations(_connection);
            var isManager = await widgetOperations.IsManager(request.UserId);
            if (isManager || await widgetOperations.RequestsOnlyHimself(request.Emails, request.UserId))
                return Ok(await widgetOperations.Api1CRequest(request.Emails, request.Periods));
            return Unauthorized("");
        }
    }
}