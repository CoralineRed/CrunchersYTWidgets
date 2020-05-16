using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using ProductionControlWidgetServer.OneCInteraction.Employees;
using ProductionControlWidgetServer.OneCInteraction.RegisterEmployees;
using ProductionControlWidgetServer.OneCInteraction.Schedules;

namespace ProductionControlWidgetServer.OneCInteraction
{
    public class OneCService
    {
        private readonly OneCConnection _connection;

        public OneCService(OneCConnection connection)
        {
            _connection = connection ?? throw new ArgumentNullException(nameof(connection));
        }

        public async Task<List<Employee>> GetEmployeesAsync()
        {
            var client = _connection.GetAuthenticatedHttpClient();

            var employees = JsonConvert.DeserializeObject<EmployeeResponse>(
                await (await client.GetAsync(
                        "Catalog_Сотрудники?$expand=Физлицо&$select=Ref_Key,Физлицо/КонтактнаяИнформация/АдресЭП"))
                    .Content
                    .ReadAsStringAsync());

            var registerEmployees = JsonConvert.DeserializeObject<RegisterEmployeeResponse>(
                await (await client.GetAsync(
                        "InformationRegister_Сотрудники?$select=RecordSet/Сотрудник_Key,RecordSet/ГрафикРаботы_Key")
                    )
                    .Content
                    .ReadAsStringAsync());

            return registerEmployees.Value[0].RecordSet.Join(employees.Value,
                    x => x.Сотрудник_Key,
                    y => y.Ref_Key,
                    (x, y) => new
                        Employee
                        {
                            Email = y.Физлицо.КонтактнаяИнформация[0].АдресЭП,
                            ScheduleKey = x.ГрафикРаботы_Key
                        })
                .ToList();
        }

        public async Task<List<Schedule>> GetSchedulesAsync(List<(DateTime From, DateTime To)> periods)
        {
            var client = _connection.GetAuthenticatedHttpClient();

            string filter = periods
                .Select(x =>
                    $"ВремяНачала ge datetime'{x.From:O}' and ВремяОкончания lt datetime'{x.To.AddDays(1):O}'")
                .Aggregate((x, y) => $"{x} or {y}");
            return JsonConvert.DeserializeObject<ScheduleResponse>(
                    await (await client.GetAsync(
                            $"InformationRegister_%D0%93%D1%80%D0%B0%D1%84%D0%B8%D0%BA%D0%B8%D0%A0%D0%B0%D0%B1%D0%BE%D1%82%D1%8B?$select=ГрафикРаботы_Key,ВремяНачала,ЧасыРаботы&$filter={filter}")
                        )
                        .Content
                        .ReadAsStringAsync())
                .Value;
        }
    }
}