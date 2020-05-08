using Newtonsoft.Json;

namespace ProductionControlWidgetServer.HubInteraction.Roles
{
    public class Permission
    {
        [JsonProperty("id")] public string Id { get; set; }
        [JsonProperty("name")] public string Name { get; set; }
        [JsonProperty("key")] public string Key { get; set; }
    }

    public class HubRole
    {
        [JsonProperty("id")] public string Id { get; set; }
        [JsonProperty("name")] public string Name { get; set; }
        [JsonProperty("key")] public string Key { get; set; }
        [JsonProperty("permissions")] public Permission[] Permissions { get; set; }
    }
}