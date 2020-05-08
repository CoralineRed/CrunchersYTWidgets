namespace ProductionControlWidgetServer.Models
{
    public class WidgetRequestModel
    {
        public string[] Emails { get; set; }
        public Period[] Periods { get; set; }
        public string UserId { get; set; }
    }
}