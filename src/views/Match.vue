<template>
    <div v-if="matchData" class="match">
        <h1>{{ matchData.name }}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import io from "socket.io-client";

import swal from "sweetalert2";

import { config } from "../config";

@Component({

})
export default class Match extends Vue {
    private matchCode: string;
    private matchData: any = null;
    private socket: any = io(config.serverHost, {
        reconnection: false
    });

    created() {
        // Get code from route id
        this.matchCode = this.$route.params.code;
        if (!this.matchCode) {
            swal(
                "Missing match code.", 
                "Can't open match page without a code. Duh!", 
                "error"
            ).then(() => {
                this.$router.push("/");
            });
            return;
        }

        // Open websocket
        this.socket.on("connect", () => {
            this.socket.emit("connect-match-code", this.matchCode);
        })

        this.socket.on("disconnect", () => {
            this.socket.io.reconnection(false);
            swal(
                "Match feed connection lost.", 
                "Lost connection to the live match feed. Returning back to main page.", 
                "error"
            ).then(() => {
                this.$router.push("/");
            });
        });
    }

    getMatchInfo() {
        
    }
}
</script>
