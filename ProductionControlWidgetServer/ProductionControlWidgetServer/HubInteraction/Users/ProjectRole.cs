using Newtonsoft.Json;

namespace ProductionControlWidgetServer.HubInteraction.Users
{
    public class Role
    { 
        [JsonProperty("id")] 
        public string Id { get; set; }
        [JsonProperty("key")]
        public string Key { get; set; }
        [JsonProperty("name")]
        public string Name { get; set; }
    }

    public class Owner
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("login")]
        public string Login { get; set; }
    }
    public class RelatedProject
    {
        [JsonProperty("id")] 
        public string Id { get; set; }
    }
    public class ProjectRole
    {
        
        [JsonProperty("id")]
        public string Id { get; set; }
        [JsonProperty("role")]
        public Role Role { get; set; }
        [JsonProperty("project")]
        public RelatedProject Project { get; set; }
        [JsonProperty("owner")]
        public Owner Owner { get; set; }
        
    }
}