<template>
    <div class="user-list-container ui-container">
        <h2>Participants</h2>
        <div class="content-separator"></div>
        <div class="flex-container flex-align-center user-list-row" v-for="user of userList" :key="user.name">
            <div class="flex-item flex-container flex-align-center">
                {{ user.name }}</span>
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
                <a class="kick-button">Kick</a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ApiService from "@/api-service";
import swal from "sweetalert2";

@Component({
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
    }
})
export default class UserList extends Vue {
    public userList!: any[];
    public isHost!: boolean; // Whether the current user is the host. Used to display host-only features

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
}
</script>

<style scoped lang="scss">
@import "../../main.scss";

.user-list-container {
    .user-list-row {
        padding-left: 0.5em;
        height: 32px;
    }

    .user-list-row:nth-child(even) {
        background-color: $common-background-color;
    }

    .user-list-row:nth-child(odd) {
        background-color: $common-background-color-light;
    }

    .kick-button {
        color: $common-accent-color;
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