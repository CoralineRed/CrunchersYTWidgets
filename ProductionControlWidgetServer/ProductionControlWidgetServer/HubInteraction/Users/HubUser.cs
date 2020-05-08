using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace ProductionControlWidgetServer.HubInteraction.Users
{
    public class HubUser
    {
        [JsonProperty("id")] public string Id { get; set; }
        [JsonProperty("name")] public string Name { get; set; }
        [JsonProperty("projectRoles")] public ICollection<ProjectRole> ProjectRoles { get; set; }

        [JsonProperty("transitiveProjectRoles")]
        public ICollection<ProjectRole> TransitiveProjectRoles { get; set; }

        [JsonProperty("sourcedProjectRoles")] public ICollection<ProjectRole> SourcedProjectRoles { get; set; }
        public Profile Profile { get; set; }

        public IEnumerable<string> AllUniqueRolesIds => ProjectRoles.Select(x => x.Role.Id)
            .Union(TransitiveProjectRoles.Select(x => x.Role.Id))
            .Union(SourcedProjectRoles.Select(x => x.Role.Id)).Distinct();
    }
}