<template>
    <div class="user-list-container ui-container flex-container-vertical flex-item">
        <div>
            <div class="ui-container-header flex-container flex-align-center flex-space-between">
                <h2>Participants</h2>
                <div class="alt-label">{{ userList.length }} <font-awesome-icon :icon="userIcon" /></div>
            </div>
        </div>

        <div class="scroll-container flex-item">
            <VuePerfectScrollbar class="scroll-area full-height" :settings="scrollbarSettings" ref="ps">
                <div class="user-list-rows full-height">
                    <div class="flex-container flex-align-center user-list-row" v-for="(user, index) of userList" :key="user.name">
                        <div class="status-indicator" :class="readyStatusIndicator(user)"></div>
                        <div class="flex-item flex-container flex-align-center" v-bind:class="getUserClass(user)">
                            <span>{{ user.name }}</span>
                            <img v-if="!user.guest" 
                                class="twitch-badge"
                                title="Logged in via Twitch"
                                src="../../assets/GlitchBadge_Purple_24px.png">
                            <img v-if="user.host" 
                                title="Host"
                                class="host-badge" 
                                src="../../assets/crown.svg">
                        </div>
                        <div v-if="user.you">
                            <a class="kick-button" v-on:click="leaveMatch">Leave</a>
                        </div>
                        <div v-else-if="isHost">
                            <a class="kick-button" v-on:click="kickUser(user, index)">Kick</a>
                        </div>
                    </div>
                </div>
            </VuePerfectScrollbar>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ApiService from "@/api-service";
import swal from "sweetalert2";
// @ts-ignore
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

// @ts-ignore
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
// @ts-ignore
import { faUser } from '@fortawesome/fontawesome-free-solid'

@Component({
    components: {
        FontAwesomeIcon,
        VuePerfectScrollbar
    },
    props: {
        userList: {
            default: () => {
                return [];
            }
        },
        isHost: {
            default: false,
            type: Boolean
        }
    },
    watch: {
        userList: function(newValue, oldValue) {
            this.$nextTick(() => {
                if (this.$refs.ps !== undefined) {
                    // @ts-ignore
                    this.$refs.ps.update();
                }
            });
        }
    }
})
export default class UserList extends Vue {
    userList: any; // any[]
    isHost: any; // boolean  // Whether the current user is the host. Used to display host-only features

    private scrollbarSettings: any = { 
        maxScrollbarLength: 60,
        wheelSpeed: 0.33,
        suppressScrollX: true
    };

    get userIcon() {
        return faUser;
    }

    readyStatusIndicator(user: any) {
        return user.ready ? "status-indicator-ready" : "status-indicator-not-ready";
    }

    leaveMatch() {
        swal({ 
            title: "Leave match?",
            text: "Are you sure you want to leave the match?",
            type: "question",
            showCancelButton: true,
            })
            .then((answer: any) => {
                if (answer.value) {
                    this.$parent.$emit("leave-match");
                }
            });
    }

    // Kick the user with given name/guest status and index in users list.
    // Two consecutive guests with the same name could technically be confused here, but who cares
    kickUser(user: any, index: number) {
        swal({ 
            title: "Kick \"" + user.name + "\"?",
            text: "Are you sure you want to kick \"" + user.name + "\" from the match? They can rejoin the match immediately", // TODO: add a time limit for kicked users
            type: "question",
            showCancelButton: true,
            })
            .then((answer: any) => {
                if (answer.value) {
                    this.$parent.$emit("kick-user", { user: user, index: index });
                }
            });
    }

    getUserClass(user: any) {
        if (user.host) {
            return "host-user";
        }

        if (user.you) {
            return "you-user";
        }
    }
}
</script>

<style scoped lang="scss">
@import "../../main.scss";

.user-list-container {
    min-height: 20em;
    @media (min-width: $mobile) { 
        min-height: 0;
    }

    .status-indicator {
        height: 100%;
        margin-right: 0.5em;
        &.status-indicator-ready {
            border-left: 5px solid $common-success-color;
        }

        &.status-indicator-not-ready {
            border-left: 5px solid $common-failure-color;
        }
    }


    .scroll-container {
        padding: 0.5em;
        padding-right: 0.1em;
    }

    .scroll-area {
        padding-left: 0.2em;
        padding-right: 0.8em;
    }

    .user-list-rows {
        max-height: 0; // hack
    }

    .user-list-row {
        height: 32px;

        .you-user:not(.host-user) {
            color: $common-alt-color;
        }

        .host-user {
            color: $common-accent-color;
        }
    }

    .user-list-row:nth-child(even) {
        background-color: $common-background-color;
    }

    .user-list-row:nth-child(odd) {
        background-color: $common-background-color-light;
    }

    .kick-button {
        color: $common-alt-color;
        text-align: right;
        padding-right: 0.5em;

        -webkit-user-select: none;  
        -moz-user-select: none;    
        -ms-user-select: none;      
        user-select: none;

        &:hover {
            cursor: pointer;
            color: $common-accent-color-lighter;
        }
    }
}

</style>