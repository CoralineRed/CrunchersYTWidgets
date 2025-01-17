﻿using System;
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
using ProductionControlWidgetServer.OneCInteraction;
using YouTrackSharp;

namespace ProductionControlWidgetServer.Controllers
{
    public class PlanController : ControllerBase
    {
        private readonly ILogger<PlanController> _logger;
        private readonly HubConnection _hubConnection;
        private readonly OneCConnection _oneCConnection;

        public PlanController(ILogger<PlanController> logger, HubConnection hubConnection,
            OneCConnection oneCConnection)
        {
            _logger = logger;
            _hubConnection = hubConnection;
            _oneCConnection = oneCConnection;
        }

        [HttpPost]
        public async Task<IActionResult> Periods([FromBody] WidgetRequestModel request)
        {
            var widgetOperations = new WidgetOperations(_hubConnection, _oneCConnection);
            var myEmail = await widgetOperations.GetUserEmail(request.UserId);
            return Ok(await widgetOperations.Api1CRequest(
                await widgetOperations.IsManager(request.UserId)
                    ? request.Emails
                    : request.Emails.Where(x=>x==myEmail).ToArray(),
                request.Periods));
        }
    }
}