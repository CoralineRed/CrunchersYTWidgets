using Newtonsoft.Json;

namespace ProductionControlWidgetServer.Models
{
    public class ResponseLine
    {
        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("periods")]
        public PeriodWithPlan[] Periods { get; set; }
    }
}