import Vue from "vue";
import Vuex from "vuex";

import GlobalHelpers from "@/mixins";
import ApiService from "@/api-service";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userName: "",
        twitchAuthenticated: false,
        globalSpinner: {
            show: false,
            instant: false,
        },
        localSpinners: [
            { name: "matchTitle", state: false },
            { name: "matchMapPool", state: false },
            { name: "joinButton", state: false },
            { name: "readyButton", state: false }
        ]
    },
    getters: {
        getLocalSpinnerState: (state: any) => (name: string) => {
            let index = state.localSpinners.findIndex((spinner: any) => spinner.name === name);
            if (index === -1) return null;

            return state.localSpinners[index].state;
        }
    },
    mutations: {
        _setUserName(state, name) {
            state.userName = name;
        },
        _setUserTwitchAuthenticated(state, status) {
            state.twitchAuthenticated = status;
        },
        _setGlobalSpinner(state, values) {
            // Update instant first
            state.globalSpinner.instant = typeof values.instant === "boolean" ? values.instant : false;
            state.globalSpinner.show = typeof values.show === "boolean" ? values.show : false;
        },
        _setLocalSpinner(state, params) {
            // Params contains the name of the variable to alter and it's state
            let index = state.localSpinners.findIndex((spinner: any) => spinner.name === params.name);
            if (index === -1) return;

            state.localSpinners[index].state = params.state;
        }
    },
    actions: {
        setUserName(context, name): Promise<any> {
            // Insant reset
            if (name === "") {
                context.commit("_setUserName", "");
            }

            // Update session on server side too
            return ApiService.setGuest(name)
                .then((data: any) => {
                    if (data.result) {
                        context.commit("_setUserName", name);
                    }
                    return data;
                });
        },

        setUserTwitchAuthenticated(context, status) {
            context.commit("_setUserTwitchAuthenticated", name);
        },
    },
});
