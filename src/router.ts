import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Match from "./views/Match.vue";
import History from "./views/History.vue";

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
            path: "/history",
            name: "history",
            component: History,
        },
        {
            path: "/match/:code",
            name: "match",
            component: Match
        }
    ],
});
