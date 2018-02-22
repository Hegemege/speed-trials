<template>
    <div v-if="matchData" 
         class="match flex-item flex-container-vertical">
        <div class="spinner-container">
            <OrbitSpinner :show="$store.getters.getLocalSpinnerState('matchTitle')"></OrbitSpinner>

            <div class="match-title-row flex-container flex-align-center flex-wrap">
                <div class="flex-container flex-align-center">
                    <h1>{{ matchData.name }}</h1>
                    <span v-if="isHost" v-on:click="renameMatch" class="rename-button">Rename</span>
                    <span v-if="matchData.host === null" class="abandoned-text">
                        (Abandoned)
                        <a class="abandoned-leave-button" v-on:click="leaveMatchPage">Leave</a>
                    </span>
                </div>

                <div class="flex-container flex-align-stretch">
                    <div v-if="isHost" class="flex-container flex-align-stretch">
                        <div class="flex-container flex-align-center">
                            <CustomCheckbox id="privateCheckbox" 
                                v-model="privateCheckbox"
                                v-on:change="onPrivateCheckboxChanged()"></CustomCheckbox>
                            <label for="privateCheckbox">Private match</label>
                        </div>

                        <div class="content-divider-vertical-long"></div>
                        <div class="flex-container flex-align-center">
                            <CustomCheckbox id="canJoinCheckbox" 
                                v-model="canJoinCheckbox"
                                v-on:change="onJoinCheckboxChanged()"></CustomCheckbox>
                            <label for="canJoinCheckbox">Allow joining</label>
                        </div>
                    </div>

                    <div v-else class="flex-container flex-align-center">
                        <span v-if="matchData.private">Private match</span>
                        <span v-else>Public match</span>
                    </div>

                    <div v-if="matchData.allowJoin" class="content-divider-vertical-long"></div>
                    <div v-if="matchData.allowJoin" class="flex-container flex-align-center">
                        <span class="noselect match-code-label">Invite code:</span>
                        <div class="match-code">
                            <span>{{ matchCode }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex-item flex-container-desktop">
            <div class="flex-item-desktop full-height flex-container-vertical">
                <UserList :userList="matchData.users" :isHost="isHost"></UserList>

                <div v-if="!joined && matchData.allowJoin && !matchData.started" 
                     class="ui-container spinner-container">
                    <OrbitSpinner :size="35" :show="$store.getters.getLocalSpinnerState('joinButton')"></OrbitSpinner>
                    <button v-on:click="joinMatchPressed"
                        class="small-button wide-button">
                        Join
                    </button>
                </div>

                <div v-if="joined && !matchData.started" 
                     class="ui-container spinner-container">
                    <OrbitSpinner :size="35" :show="$store.getters.getLocalSpinnerState('readyButton')"></OrbitSpinner>
                    <button v-on:click="readyPressed"
                        :class="readyButtonClass"
                        class="small-button wide-button ready-button">
                    </button>
                </div>

                <Chat :chatData="chatData" :socket="socket"></Chat>
            </div>
            <div class="content-divider-vertical"></div>

            <div class="flex-item-desktop full-height flex-container-vertical">
                <MatchStatus :matchData="matchData"></MatchStatus>
            </div>

            <div class="flex-item-desktop full-height flex-container-vertical">
                <MapPool :matchData="matchData" :isHost="isHost" :mapPoolData="mapPoolData"></MapPool>
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
import CustomCheckbox from "@/components/CustomCheckbox.vue";

import UserList from "@/components/Match/UserList.vue";
import MatchStatus from "@/components/Match/MatchStatus.vue";
import Chat from "@/components/Match/Chat.vue";
import MapPool from "@/components/Match/MapPool.vue";

import ApiService from "@/api-service";

import swal from "sweetalert2";
import io from "socket.io-client";
import Icon from "vue-awesome/components/Icon.vue";
import "vue-awesome/icons/check-circle"
import "font-awesome/css/font-awesome.css";

import { config } from "../config";
import { Socket } from "net";

@Component({
    components: {
        OrbitSpinner,
        CustomCheckbox,
        Icon,
        UserList,
        MatchStatus,
        Chat,
        MapPool
    }
})
export default class Match extends Vue {
    private matchCode: string = "";
    private matchData: any = null;
    private mapPoolData: any[] = [];
    private chatData: any = null;

    // Flags
    private isHost: boolean = false;
    private wasJoined: boolean = false;
    private isReady: boolean = false;

    // Admin-only
    private canJoinCheckbox: boolean = true;
    private privateCheckbox: boolean = true;

    // Socket and data handling
    private matchDataUpdatedTimestamp: number = 0;
    private socket: any;
    private selfDisconnected: boolean = false;

    get joined() {
        // If no user in data is marked as "you"
        return this.matchData.users.findIndex((user: any) => user.you === true) !== -1;
    }

    get readyButtonClass() {
        return this.isReady ? "status-ready" : "status-not-ready";
    }

    created() {
        // Get map pool data
        this.getMapPoolData();

        this.socket  = io(config.serverHost, { reconnection: false });
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
            this.$store.commit("_setGlobalSpinner", { show: false, instant: false });
            // Tell the server that the client requests access to the match code
            this.socket.emit("connect-match-code", this.matchCode);
        })

        this.socket.on("match-connected", (data: any) => {
            if (data.instantJoin) {
                this.joinMatchPressed();
            } else {
                this.getMatchData();
            }
        });

        this.socket.on("unable-to-join", (data: any) => {
            swal(
                "Uh-oh!", 
                data.errorMessage, 
                "error"
            );
            this.$router.push("/");
        });

        this.socket.on("join-match-confirm", (inform: boolean) => {
            this.wasJoined = true;
            if (inform) {
                swal("Success", "You have joined the match", "success");
            }
        });

        this.socket.on("disconnect", () => {
            this.socket.io.reconnection(false);

            // Do not display the disconnect popup if the disconnection was deliberate
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
            this.getMatchData();
        })

        // Leaving the match
        // Event from child component (UserList)
        this.$on("leave-match", () => {
            this.socket.emit("leave-match", this.matchCode); // Inform the server

            this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
        });

        this.socket.on("unable-to-leave", (data: any) => {
            swal(
                "ILLEGAL!", 
                data.errorMessage, 
                "error"
            )
        });

        // Server has confirmed the action. Show swal and go back to home
        this.socket.on("leave-match-confirm", () => {
            this.$store.commit("_setGlobalSpinner", { show: false, instant: false });

            swal("Success", "You have left the match", "success")
                .then(() => {
                    this.$router.push("/");
                });
        });

        this.$on("kick-user", (data: any) => {
            this.socket.emit("kick-user", { code: this.matchCode, data: data });
        });

        this.socket.on("unable-to-kick", (data: any) => {
            swal(
                "Whoa.", 
                data.errorMessage, 
                "error"
            )
        });

        this.$on("host-update", () => {
            this.socket.emit("host-update", this.matchCode);
        });
    }

    getMapPoolData() {
        // Ran immediately when opening the match
        ApiService.getMapPoolData()
            .then((data: any[]) => {
                this.mapPoolData = data;
            });
    }

    getMatchData(showSpinner: boolean = false) {
        if (showSpinner) {
            this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
        }

        if (!this.matchData) { // First update
            this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
        }
        ApiService.getMatch(this.matchCode)
            .then((data: any) => {
                if (!data.result) {
                    swal(
                        "Uh-oh...", 
                        "Could not fetch match data. Error: " + data.errorMessage, 
                        "error"
                    ).then(() => {
                        if (showSpinner) {
                            this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
                        }

                        this.selfDisconnected = true;
                        this.socket.disconnect();
                        
                        return;
                    });
                }

                if (showSpinner) {
                    this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
                }
                
                // First update
                if (!this.matchData) {
                    this.$store.commit("_setGlobalSpinner", { show: false, instant: false });
                }

                // Only allow the latest update
                if (this.matchDataUpdatedTimestamp < data.timestamp) {
                    this.matchDataUpdatedTimestamp = data.timestamp;
                    
                    // If the user was not host before (and this is not the first update), tell them via swal
                    if (!this.isHost && data.isHost && this.matchData) {
                        swal(
                            "You are now the host.", 
                            "You have become the host of the match. CoolCatgasm", 
                            "info"
                        );
                    }

                    // If the user was in the match's user list and is not there anymore, show kick message
                    if (data.data.users.findIndex((user: any) => user.you) === -1 && this.wasJoined) {
                        swal("Stop right there, criminal scum!", "You have been kicked from the match", "warning")
                            .then(() => {
                                this.selfDisconnected = true;
                                this.socket.disconnect();
                                this.$router.push("/");
                            });
                    }

                    this.matchData = data.data;
                    this.isHost = data.isHost;

                    // Find self in users list, update isReady
                    let userSelf = this.matchData.users.find((user: any) => user.you);
                    if (userSelf !== null) {
                        this.isReady = userSelf.ready;
                    }
                }

                this.setLoadingSpinners(false);

            });
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

                this.$store.commit("_setLocalSpinner", { name: "matchTitle", state: true });

                ApiService.renameMatch(this.matchCode, result.value)
                    .then((data: any) => {
                        
                        if (!data.result) {
                            swal("Error", "Unable to rename match. Reason: " + data.errorMessage, "error");
                            this.$store.commit("_setLocalSpinner", { name: "matchTitle", state: false });
                            return;
                        }

                        // The server will emit a "match-updated" message to everyone in the room
                        this.socket.emit("host-update", this.matchCode);
                    });
            }
        });
    }

    setLoadingSpinners(value: boolean) {
        this.$store.commit("_setLocalSpinner", { name: "matchTitle", state: value });
        this.$store.commit("_setLocalSpinner", { name: "matchMapPool", state: value });
        this.$store.commit("_setLocalSpinner", { name: "joinButton", state: value });
        this.$store.commit("_setLocalSpinner", { name: "readyButton", state: value });
    }

    joinMatchPressed() {
        this.$store.commit("_setLocalSpinner", { name: "joinButton", state: true });
        this.socket.emit("join-match", this.matchCode);
    }

    readyPressed() {
        this.$store.commit("_setLocalSpinner", { name: "readyButton", state: true });
        this.socket.emit("ready-match", { code: this.matchCode, ready: !this.isReady });
    }

    onJoinCheckboxChanged() {
        swal({
            title: this.canJoinCheckbox ? "Allow joining?" : "Disallow joining?",
            showCancelButton: true,
            focusConfirm: true,
        }).then((status: any) => {
            if (status.dismiss) {
                this.canJoinCheckbox = !this.canJoinCheckbox;
            } else {
                
                this.$store.commit("_setLocalSpinner", { name: "matchTitle", state: true });

                // Send the update to server
                ApiService.allowJoinMatch(this.matchCode, this.canJoinCheckbox)
                    .then((data: any) => {
                        if (data.result) {
                            swal(
                                "Success", 
                                this.canJoinCheckbox ? 
                                    "Users can now join this match" : 
                                    "Users can no longer join this match", 
                                "success"
                            );

                            this.socket.emit("host-update", this.matchCode);
                        } else {
                            this.$store.commit("_setLocalSpinner", { name: "matchTitle", state: false });
                            swal(
                                "Error", 
                                "Unable to change join status. Reason: " + data.errorMessage, 
                                "error"
                            );
                        }
                    });
            }
        });
    }
    
    onPrivateCheckboxChanged() {
        swal({
            title: this.privateCheckbox ? "Make the match private?" : "Make the match public?",
            text: this.privateCheckbox ? 
                "Only those with the invite code can view the match details" :
                "The match will be visible on the front page",
            showCancelButton: true,
            focusConfirm: true,
        }).then((status: any) => {
            if (status.dismiss) {
                this.privateCheckbox = !this.privateCheckbox;
            } else {
                
                this.$store.commit("_setLocalSpinner", { name: "matchTitle", state: true });

                // Send the update to server
                ApiService.changePrivacyMatch(this.matchCode, this.privateCheckbox)
                    .then((data: any) => {
                        if (data.result) {
                            swal(
                                "Success", 
                                this.privateCheckbox ? 
                                    "The match is now unlisted and not visible on the front page" :
                                    "The match is now visible on the front page", 
                                "success"
                            );

                            this.socket.emit("host-update", this.matchCode);
                        } else {
                            this.$store.commit("_setLocalSpinner", { name: "matchTitle", state: false });
                            swal(
                                "Error", 
                                "Unable to change privacy status. Reason: " + data.errorMessage, 
                                "error"
                            );
                        }
                    });
            }
        });
    }

    leaveMatchPage() {
        this.$router.push("/");
    }
}
</script>

<style scoped lang="scss">

@import "../main.scss";

.match-title-row {
    padding-left: 1em;
    padding-right: 1em;

    justify-content: space-between;

    .match-code-label {
        margin-right: 0.5em;
    }

    .match-code {
        text-align: center;
        padding: 0.5em;
        background-color: $common-background-color-dark;
        margin: 0;
        font-size: 20px;
        border: 1px dashed $common-background-color-light;
        font-family: "Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace;
    }   

    .abandoned-text {
        margin-left: 2em;
    }

    .abandoned-leave-button {
        color: $common-accent-color;

        &:hover {
            cursor: pointer;
            color: $common-accent-color-lighter;
        }
    }
}

.rename-button {
    margin-left: 1em;
    margin-right: 1em;
    color: $common-alt-color;

    &:hover {
        cursor: pointer;
        color: $common-accent-color-lighter;
    }
}

.ready-button {
    &.status-not-ready {
        color: $common-failure-color;
        border-color: $common-failure-color;

        &:hover::before {
            font-family: FontAwesome;
            content: "\f058 ";
        }

        &:hover {
            &::after {
                content: "I am ready!";
            }
            
            color: $common-success-color;
            border-color: $common-success-color;
        }

        /*
        &:not(:hover)::before {
            font-family: FontAwesome;
            content: "\f057 ";
        }
        */

        &:not(:hover)::after {
            content: "Not ready";
        }
    }

    &.status-ready {
        color: $common-success-color;
        border-color: $common-success-color;

        &:hover::before {
            font-family: FontAwesome;
            content: "\f057 ";
        }

        &:hover {
            &::after {
                content: "I am not ready!";
            }

            color: $common-failure-color;
            border-color: $common-failure-color;
        }

        /*
        &:not(:hover)::before {
            font-family: FontAwesome;
            content: "\f058 ";
        }
        */

        &:not(:hover)::after {
            content: "Ready";
        }
    }
}



</style>