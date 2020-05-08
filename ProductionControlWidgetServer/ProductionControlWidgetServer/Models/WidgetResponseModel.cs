using Newtonsoft.Json;

namespace ProductionControlWidgetServer.Models
{
    public class WidgetResponseModel
    {
        [JsonProperty("users")]
        public ResponseLine[] Users;
    }
}