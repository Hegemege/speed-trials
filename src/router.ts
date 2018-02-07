import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Join from "./views/Join.vue";
import Trial from "./views/Trial.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    routes: [
        {
            path: "/",
            name: "home",
            component: Home,
        },
        {
            path: "/join",
            name: "join",
            component: Join,
        },
        {
            path: "/trial",
            name: "trial",
            component: Trial,
        },
    ],
});
