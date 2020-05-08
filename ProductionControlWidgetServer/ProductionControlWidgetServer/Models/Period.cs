using System;
using Newtonsoft.Json;

namespace ProductionControlWidgetServer.Models
{
    public class Period
    {
        [JsonProperty("from")] public string From { get; set; }
        [JsonProperty("to")] public string To { get; set; }
    }
}