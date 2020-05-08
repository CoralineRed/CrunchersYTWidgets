using Newtonsoft.Json;

namespace ProductionControlWidgetServer.HubInteraction.Users
{
    public class Profile
    {
        [JsonProperty("email")]
        public Email Email { get; set; }
    }
}