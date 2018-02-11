<template>
    <div class="nav-player-container" v-if="userName">
        <div class="nav-mobile-separator"></div>
        <div class="nav-separator"></div>
        <div class="flex-container flex-align-center">
            <div class="flex-container flex-container-vertical nav-player-name-display"
                v-on:mouseover="showReset = true"
                v-on:mouseleave="showReset = false">
                <span v-on:click="resetName">
                {{ userName }}
                </span>
                <span class="nav-player-reset-text" v-show="showReset">
                    Click to log out
                </span>
            </div>
            <img class="twitch-badge" v-if="hasTwitchBadge" src="../assets/GlitchBadge_Purple_24px.png">
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({

})
export default class PlayerNavDisplay extends Vue {
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
        this.$store.dispatch("setUserName", "");
        this.$store.dispatch("setUserTwitchAuthenticated", false);

        this.$router.push("/");
    }
}
</script>

<style scoped>

.twitch-badge {
    height: 24px;
    width: 24px;
    margin-right: 10px;
    background-color: white;
}

</style>