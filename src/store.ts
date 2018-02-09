import Vue from "vue";
import Vuex from "vuex";

import GlobalHelpers from "@/mixins";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        playerName: "",
        hasBadge: false,
        
    },
    mutations: {
        setPlayerName(state, name) {
            state["playerName"] = name;
        }
    },
    actions: {
        setPlayerName(context, name) {
            context.commit("setPlayerName", name);
            if (GlobalHelpers.methods.isLocalStorageSupported()) {
                localStorage.setItem("playerName", name);
            }
        }
    },
});
