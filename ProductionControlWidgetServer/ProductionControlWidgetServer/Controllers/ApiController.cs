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
    [ApiController]
    [Route("[controller]")]
    public class ApiController : ControllerBase
    {
        private readonly ILogger<ApiController> _logger;
        private readonly HubConnection _connection;

        public ApiController(ILogger<ApiController> logger, HubConnection connection)
        {
            _logger = logger;
            _connection = connection;
        }


        [Route("Post")]
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] WidgetRequestModel request)
        {
            var widgetOperations = new WidgetOperations(_connection);
            var isManager = await widgetOperations.IsManager(request.UserId);
            return (isManager || await widgetOperations.RequestsOnlyHimself(request.Emails, request.UserId))
                ? Ok(JsonConvert.SerializeObject(await widgetOperations.Api1CRequest(request.Emails, request.Periods)))
                : (IActionResult) Unauthorized("");
        }
    }
}