// Este arquivo deve estar em public/firebase-messaging-sw.js
// Usamos a versão compat (v9 compat ou v8) pois service workers 
// nativamente têm dificuldade com módulos ES6 sem ferramentas de build.
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Estas credenciais devem ser as mesmas do seu src/lib/firebase.ts
// Nota: Em produção, você pode injetar isso durante o build ou carregar de um config
// Para simplificar, repetimos aqui ou usamos constantes conhecidas.
firebase.initializeApp({
    apiKey: "AIzaSyCa3KTUx9nOfy0kb4GlwWFt2jk1pI9JGQs",
    authDomain: "easy-maintenance-backend.firebaseapp.com",
    projectId: "easy-maintenance-backend",
    messagingSenderId: "712996442578",
    appId: "1:712996442578:web:10be3d605b36b43d45f80b"
});

const messaging = firebase.messaging();

// Lida com mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Mensagem recebida em background: ", payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/icons/icon-192.png", // Ajuste conforme seus ícones em public/
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
