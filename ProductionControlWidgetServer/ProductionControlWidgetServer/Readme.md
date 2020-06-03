#Инструкция по установке и настройке сервера.
1. В файле appsetting.json: 
    - в объекте Hub указать:
        1. serverUrl: адрес ЮТ хаба (напр: `https://yt.hightech.group/hub`)(без слэша на конце)
        2. bearerToken: perm токен администратора сервера (напр:`perm:cm9vdA==.NDctMQ==.wEr2jWIySnSWAHC1rX1pTjjMZb3mAU`) (токен можно получить в профиле пользователя в хабе в табе `Authentication`, при нажатии на кнопку `New token...`)
    - в объекте 1С
        1. serverUrl: общая часть адреса сервера с инстансом 1c'а (напр: `http://188.40.196.94/unftest/odata/standard.odata`)(без слэша на конце) 
        2. basicToken: токен аутентификации на сервере 1c'а (напр: `aGlnaHRlY2h0ZXN0dXNlcjpwVkJTMWpCNg==`)
