using System;

namespace ProductionControlWidgetServer.OneCInteraction.Schedules
{
    public class Schedule
    {
        public Guid ГрафикРаботы_Key { get; set; }
        public DateTime ВремяНачала { get; set; }
        public int ЧасыРаботы { get; set; }
    }
}