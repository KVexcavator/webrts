Это сервер- посредник, который передает сообщения между пользователями. 
в одном окне запускаем
node index.js
в другом окне тестируем сервер утилитой wscat
npm install -g wscat
wscat -c ws://localhost:9000
логинить пользователя
{"type": "login", "name": "Vasia1"}
ещё в окне
{"type": "login", "name": "Vasia2"}
предложить общаться
{"type": "offer", "offer": "on offer", "name": "Vasia2"}
ответ на предложение
{"type": "answer", "answer": "on answer", "name": "Vasia1"}