## Developing a Hub widget
The following commands are available:

  - `npm test` to launch karma tests
  - `npm start` to run a local development server
  - `npm run lint` to lint your code (JS and CSS)
  - `npm run stylelint` to lint CSS only
  - `npm run build` to generate a production bundle (will be available under `dist`)
  - `npm run ci-test` to launch karma tests and report the results to TeamCity

To check your widget, go to the widget playground page located at `<your_hub_server>/dashboard/widgets-playground`.

You may encounter the following problem when using a local development server together with Hub running over HTTPS: all major browsers block insecure scripts. 
In Chrome you can add a security exception: click the security notification in the address bar (the one saying "The page is trying to load scripts from unauthenticated sources") and 
press the "Load unsafe scripts" button. Similar workarounds are available in other browsers as well.

##Установка виджета
Для установки виджета необходимо провести следующие дейсивия:
 - Если архив в папке `dist` отсутствует (отсутствует папка целиком) или изменился исходный код:
    - Если отсутствует папка `node_modules` необходимо выполнить команду `npm install`
    - Запустить команду `npn run build` (сгенерируется папка dist)
    - Все содержимое папки добавить в zip-архив
 - На странице `https://<your_youtrack_instance>/youtrack/admin/hub/widgets` открыть окно добавления нового виджета и перенести туда zip-архив с production bundle.
 
 Теперь виджет установлен в данный инстанс и доступен через добавление виджета на dashboard.