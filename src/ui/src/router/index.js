import { createRouter, createWebHistory } from "vue-router";
import SettingsPage from "../components/Settings.vue";
import PaymentPage from "../components/PaymentPage.vue";

const routes = [
  {
    path: "/",
    name: "SettingsPage",
    component: SettingsPage,
  },
  {
    path: "/payment",
    name: "PaymentPage",
    component: PaymentPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
