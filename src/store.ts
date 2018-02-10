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
            instant: false
        },
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
            state.globalSpinner.instant = typeof values["instant"] === "boolean" ? values["instant"] : false;
            state.globalSpinner.show = typeof values["show"] === "boolean" ? values["show"] : false;
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
        }
    },
});
