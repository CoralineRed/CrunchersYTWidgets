using Newtonsoft.Json;

namespace ProductionControlWidgetServer.Models
{
    public class PeriodWithPlan : Period
    {
        [JsonProperty("plan")] public int Plan { get; set; }
    }
}