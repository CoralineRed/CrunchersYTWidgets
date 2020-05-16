namespace ProductionControlWidgetServer.OneCInteraction
{
    public static class OneCConnectionExtensions
    {
        public static OneCService CreateOneCService(this OneCConnection connection)
        {
            return new OneCService(connection);
        }
    }
}