<template>
    <div id="app" class="page-full-height flex-container-desktop flex-container-vertical">
        <div id="nav" class="flex-container">
            <div id="nav-logo">
                <router-link to="/">
                    <span>SPEED TRIALS</span>
                </router-link>
             </div>

            <div class="nav-mobile-separator"></div>
            <div id="nav-links" class="flex-container">
                <router-link to="/create">Create</router-link>
                <router-link to="/join">Join</router-link>

                <div class="nav-player-container" v-if="userName">
                    <div class="nav-mobile-separator"></div>
                    <div class="nav-separator"></div>
                    <div class="flex-container flex-container-vertical nav-player-name-display"
                        v-on:mouseover="showReset = true"
                        v-on:mouseleave="showReset = false">
                        <span v-on:click="resetName">
                        {{ userName }}
                        </span>
                        <span class="nav-player-reset-text" v-show="showReset">
                            Click to reset
                        </span>
                    </div>
                </div>

                <div class="nav-mobile-separator"></div>
                <div class="nav-separator"></div>
                <span>Active:</span>
                <div v-for="(trial, index) in registeredTrials" :key="index" class="trial-link">
                    <router-link :to="{ path: '/trial', query: { name: trial }}" 
                                 v-bind:class="{ inactive: !exactTrialActive(trial)}">
                        {{ trial }}
                    </router-link>
                </div>
                <div class="nav-mobile-separator"></div>
                <router-link to="/history">History</router-link>
            </div>
        </div>
        <router-view v-if="userName" class="content"></router-view>
        <div v-else class="content">
            <h1>Login</h1>
            <UserNameInput></UserNameInput>
            <p>or</p>
            <TwitchLogin></TwitchLogin>
        </div>
        
        <cookie-law theme="blood-orange"></cookie-law>
    </div>
</template>




<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import UserNameInput from "@/components/user-name-input.vue";
import TwitchLogin from "@/components/twitch-login.vue";
import GlobalHelpers from "@/mixins.ts";

import CookieLaw from "vue-cookie-law";

import ApiService from "@/api-service";

@Component({
    components: {   
        UserNameInput,
        TwitchLogin,
        // This will display an error in editors because it can't find the custom typings shim in vue-cookie-law.d.ts in this project's root. Building works, though
        CookieLaw 
    }
})
export default class App extends Vue {
    private showReset: boolean = false;

    // Computed 
    get registeredTrials() {
        return ["Trial 1", "Trial 2", "Trial 3"];
    }

    get userName() {
        return this.$store.state.userName;
    }

    get hasTwitchBadge() {
        let userName = this.$store.state.userName;
        if (!userName) return false;

        return this.$store.state.hasBadge;
    }

    // Lifecycle hooks
    created() {
        // Get user's name
        ApiService.getUser()
            .then((data: any) => {
                if (data.name === undefined || data.isTwitchAuthenticated === undefined) {
                    console.error("Got invalid user info from server");
                    return;
                }

                console.log("Got from server", data);

                this.$store.commit("_setUserName", data.name);
                this.$store.commit("_setUserTwitchAuthenticated", data.isTwitchAuthenticated)
            });
    }

    // Methods
    exactTrialActive(trial: string) {
        return this.$route.query["name"] === trial;
    }

    resetName() {
        this.$data.showReset = false;
        this.$store.dispatch("setUserName", "");
    }
}
</script>




<style lang="scss">
@import "main.scss";

/* General-use helpers */

/* Navbar styling */

// Mobile navbar is a column
#nav {
    font-size: 20px;

    padding: 20px;
    cursor: default;
    background-color: $common-background-color-dark;

    flex-direction: column;
}

// Desktop navbar is a centered row
@media (min-width: $mobile) {
    #nav {
        justify-content: center;
        flex-direction: row;
        align-items: center;
    }
}

// Navbar link styles
#nav a {
    color: $common-text-color-dark;
    font-size: 20px;
    //font-weight: bold;
    text-decoration: none;
    cursor: pointer;
    padding: 0.7em;
    white-space: nowrap;

    // Desktop navbar links should be fixed width blocks
    @media (min-width: $mobile) {
        width: 5em;
        text-align: center;
    }
}

#nav #nav-logo a {
    @media (min-width: $mobile) {
        width: auto;
        text-align: center;
    }
}

#nav span {
    padding: 0.7em;
}

#nav-logo {
    padding: 0.7em;
    // Desktop navbar has a separator between logo and links
    @media (min-width: $mobile) {
        margin-right: 5em;
    }
}

// Mobile navbar links are in a column
#nav-links {
    flex-direction: column;
    // Desktop navbar links are in one row
    @media (min-width: $mobile) {
        flex-direction: row;
    }
}

#nav .nav-player-container {
    display: flex;
    flex-direction: column;
    @media (min-width: $mobile) {
        flex-direction: row;
    }
}

#nav .nav-player-container:hover {
    cursor: pointer;
}

#nav .nav-player-container .nav-player-reset-text {
    padding: 0;
    font-size: 10px;
    text-align: center;
    margin-top: -1em;
}

// Mobile separator in navbar
#nav .nav-mobile-separator {
    border-top: 1px solid $common-accent-color-dark;
}

@media (min-width: $mobile) {
    #nav .nav-mobile-separator {
        border: 0;
    }

    #nav .nav-separator {
        height: 1em + 0.7em + 0.7em;
        border-left: 1px solid $common-accent-color-dark;
    }
}


// Navbar link styling
#nav a:hover, #nav a.router-link-exact-active:hover, #nav .trial-link a:hover {
    background-color: $common-background-color-light;
}

#nav router-link:not(:first-child) {
    border-left: 2px solid $common-text-color;
}

#nav a.router-link-exact-active {
    color: $common-accent-color;
    background-color: $common-background-color;
}

/* Navbar trial section */

#nav .trial-link {
    display: flex;
}

#nav .trial-link a {
    width: auto;
}

#nav .trial-link a.router-link-exact-active.inactive {
    color: $common-text-color-dark;
    background-color: inherit;
}

</style>
