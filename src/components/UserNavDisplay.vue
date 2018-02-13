<template>
    <div class="nav-user-container" v-if="userName">
        <div class="nav-mobile-separator"></div>
        <div class="nav-separator"></div>
        <div class="flex-container flex-align-center"
             v-on:mouseover="showReset = true"
             v-on:mouseleave="showReset = false"
             v-on:click="resetName">
            <div class="flex-item flex-container flex-container-mobile flex-align-center nav-user-name-display">
                <span class="flex-container user-name-text">
                {{ userName }}
                <img class="twitch-badge" v-if="hasTwitchBadge" src="../assets/GlitchBadge_Purple_24px.png">
                </span>
                <span class="nav-user-reset-text" v-show="showReset">
                    Click to log out
                </span>
            </div>
            
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import swal from "sweetalert2";

@Component({

})
export default class UserNavDisplay extends Vue {
    private showReset: boolean = false;

    get userName() {
        return this.$store.state.userName;
    }

    get hasTwitchBadge() {
        const userName = this.$store.state.userName;
        if (!userName) { return false; }

        return this.$store.state.twitchAuthenticated;
    }


    private resetName() {
        this.$data.showReset = false;

        // Show the spinner for 1000ms
        this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
        window.setTimeout(() => {
            this.$store.commit("_setGlobalSpinner", { show: false, instant: false });

            swal("Bye-bye BibleCat", "Logged off succesfully.", "success");
        }, 500);

        // Visually transfer to login page after 500ms
        window.setTimeout(() => {
            this.$store.dispatch("setUserName", "");
            this.$store.dispatch("setUserTwitchAuthenticated", false);

            // Also update the router because the above will v-if the router-view in App.vue
            this.$router.push("/");
        }, 250);

        
    }
}
</script>

<style scoped lang="scss">
@import "../main.scss";

#nav .nav-user-container {
    display: flex;
    flex-direction: column;
    @media (min-width: $mobile) {
        flex-direction: row;
    }

    &:hover {
        cursor: pointer;
    }

    .user-name-text {
        color: $common-accent-color;
    }

    .nav-user-name-display {
        position: relative;
    }

    .nav-user-reset-text {
        font-size: 12px;
        @media (min-width: $mobile) {
            position: absolute;
            width: 100%;
            bottom: 0;
            padding: 0;
            line-height: 1em;
            font-size: 10px;
            text-align: center;
            pointer-events: none;
        }
    }
}

</style>