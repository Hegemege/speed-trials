<template>
    <div v-if="matchData" class="match">
        <h1>{{ matchData.name }}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import io from "socket.io-client";

import { config } from "../config";

@Component({

})
export default class Match extends Vue {
    private matchData: any = null;
    private socket: any = io(config.serverHost);

    created() {
        // Poll server
        //this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
        this.socket.on("connect", () => {
            console.log("CONNECTED");
        })

        this.socket.on("disconnect", () => {
            console.log("DISCONNECTED");
        });
    }

    getMatchInfo() {
        
    }
}
</script>
