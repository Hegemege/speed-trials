<template>
    <div v-if="matchData" 
         class="match flex-item flex-container flex-container-vertical">
        <div class="spinner-container">
            <OrbitSpinner :show="nameSpinnerVisible"></OrbitSpinner>
            <div class="match-title-row flex-container flex-align-center">
                <div class="flex-container flex-align-center">
                    <h1>{{ matchData.name }}</h1>
                    <span v-if="isHost" v-on:click="renameMatch" class="rename-button">Rename</span>
                </div>
                <div>
                    <span>Invite code: </span>
                    <span class="match-code">{{ matchCode }}</span>
                </div>
            </div>
        </div>
        <div class="flex-item flex-container-desktop">
            <div class="flex-item-desktop full-height">
                <UserList :userList="matchData.users" :isHost="isHost"></UserList>
            </div>
            <div class="content-separator-vertical"></div>
            <div class="flex-item-desktop full-height">
                <div class="ui-container">
                    <h2>Match status</h2>
                </div>
            </div>
            <div class="flex-item-desktop full-height">
                <div class="ui-container">
                    <h2>Map pool</h2>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <h1>Joining... ({{ matchCode }})</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import OrbitSpinner from "@/components/OrbitSpinner.vue";
import UserList from "@/components/Match/UserList.vue";

import ApiService from "@/api-service";

import swal from "sweetalert2";
import io from "socket.io-client";

import { config } from "../config";

@Component({
    components: {
        UserList,
        OrbitSpinner
    }
})
export default class Match extends Vue {
    private matchCode: string = "";
    private matchData: any = null;
    private isHost: boolean = false;
    private selfDisconnected: boolean = false;

    private matchDataUpdatedTimestamp: number = 0;

    private socket: any = io(config.serverHost, {
        reconnection: false
    });

    private nameSpinnerVisible: boolean = false;

    created() {
        // Set spinner
        this.$store.commit("_setGlobalSpinner", { show: true, instant: false });

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
                    
                    // First update
                    if (!this.matchData) {
                        this.$store.commit("_setGlobalSpinner", { show: false, instant: false });
                    }

                    // Only allow the latest update
                    if (this.matchDataUpdatedTimestamp < data.timestamp) {
                        this.matchDataUpdatedTimestamp = data.timestamp;
                        this.matchData = data.data;
                        this.isHost = data.isHost;
                    }

                    this.setLoadingSpinners(false);

                });
        })
    }

    destroyed() {
        this.selfDisconnected = true;
        this.socket.disconnect();
    }

    renameMatch() {
        swal({
            title: "Rename match", 
            input: "text", 
            showCancelButton: true,
            confirmButtonText: "Rename",
            inputValue: this.matchData.name
        }).then((result: any) => {
            if (result.value !== undefined) {
                this.nameSpinnerVisible = true;

                ApiService.renameMatch(this.matchCode, result.value)
                    .then((data: any) => {
                        if (!data.result) {
                            swal("Error", "Unable to rename match. Reason: " + data.errorMessage, "error");
                            return;
                        }

                        // The server will emit a "match-updated" message to everyone in the room
                        this.socket.emit("host-update", this.matchCode);
                    });
            }
        });
    }

    setLoadingSpinners(value: boolean) {
        this.nameSpinnerVisible = value;
    }
}
</script>

<style scoped lang="scss">

@import "../main.scss";

.match-title-row {
    padding-left: 1em;

    justify-content: space-between;
}

.rename-button {
    margin-left: 1em;
    color: $common-accent-color;

    &:hover {
        cursor: pointer;
        color: $common-accent-color-lighter;
    }
}

</style>