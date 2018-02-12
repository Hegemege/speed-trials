<template>
    <div v-if="matchData" class="match">
        <h1>{{ matchData.name }}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import io from "socket.io-client";
import ApiService from "@/api-service";

import swal from "sweetalert2";

import { config } from "../config";

@Component({

})
export default class Match extends Vue {
    private matchCode: string = "";
    private matchData: any = null;
    private selfDisconnected: boolean = false;

    private matchDataUpdatedTimestamp: number = 0;

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
            // Tell the server that the client requests access to the match code
            this.socket.emit("connect-match-code", this.matchCode);
        })

        this.socket.on("disconnect", () => {
            this.socket.io.reconnection(false);
            if (this.selfDisconnected) {
                this.$router.push("/");
                return;
            } 

            swal(
                "Match feed connection lost.", 
                "Lost connection to the live match feed. Returning back to main page.", 
                "error"
            ).then(() => {
                this.$router.push("/");
            });
        });

        this.socket.on("match-updated", () => {
            // Match has been updated. Get the newest match data from server API

            ApiService.getMatch(this.matchCode)
                .then((data: any) => {
                    if (!data.result) {
                        swal(
                            "Uh-oh", 
                            "Could not fetch match data. Error: " + data.errorMessage, 
                            "error"
                        ).then(() => {
                            this.selfDisconnected = true;
                            this.socket.disconnect();
                            return;
                        });
                    }
                    
                    // Only allow the latest update
                    if (this.matchDataUpdatedTimestamp < data.timestamp) {
                        this.matchDataUpdatedTimestamp = data.timestamp;
                        this.matchData = data.data;
                    }

                });
        })
    }

    destroyed() {
        this.selfDisconnected = true;
        this.socket.disconnect();
    }

    getMatchInfo() {
        
    }
}
</script>
