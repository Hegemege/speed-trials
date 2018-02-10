import Vue from "vue";
import Vuex from "vuex";

import GlobalHelpers from "@/mixins";
import ApiService from "@/api-service";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        userName: "",
        twitchAuthenticated: false,
        
    },
    mutations: {
        _setUserName(state, name) {
            state["userName"] = name;
        },
        _setUserTwitchAuthenticated(state, status) {
            state["twitchAuthenticated"] = status;
        }
    },
    actions: {
        setUserName(context, name): Promise<any> {
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
