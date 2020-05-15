using ProductionControlWidgetServer.OneCInteraction;

namespace ProductionControlWidgetServer
{
    public class OneCOperations
    {
        private readonly OneCConnection _connection;

        public OneCOperations(OneCConnection connection)
        {
            _connection = connection;
        }
    }
}