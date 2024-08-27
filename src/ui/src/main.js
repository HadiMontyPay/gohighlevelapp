import { createApp } from "vue";
import App from "./App.vue";
import { GHL } from "./ghl";
import router from "./router";

const ghl = new GHL();
window.ghl = ghl;

createApp(App).use(router).mount("#app");
