using Newtonsoft.Json;

namespace ProductionControlWidgetServer.HubInteraction.Users
{
    public class Email
    {
        [JsonProperty("verified")]
        public bool Verified { get; set; }
        [JsonProperty("email")]
        public string UserEmail { get; set; }
    }
}