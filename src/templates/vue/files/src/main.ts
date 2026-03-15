import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
<% if (pinia) { %>import { createPinia } from 'pinia'<% } %>

const app = createApp(App)

<% if (pinia) { %>app.use(createPinia())<% } %>
app.use(router)

app.mount('#app')
