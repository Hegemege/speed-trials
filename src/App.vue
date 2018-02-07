<template>
    <div id="app" class="full-height">
        <div id="nav" class="flex-container">
            <div id="nav-logo">
                <span>SPEED TRIALS LOGO</span>
            </div>
            <div class="nav-mobile-separator"></div>
            <div id="nav-links" class="flex-container">
                <router-link to="/">Home</router-link>
                <router-link to="/join">Join</router-link>

                <div class="nav-player-container" v-if="getPlayerName">
                    <div class="nav-mobile-separator"></div>
                    <div class="nav-separator"></div>
                    <div class="flex-container flex-container-vertical nav-player-name-display">
                        <span v-on:click="resetName" 
                        v-on:mouseover="showReset = true"
                        v-on:mouseleave="showReset = false">
                        {{ getPlayerName }}
                        </span>
                        <span class="nav-player-reset-text" v-show="showReset">
                            Reset
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
        <div v-if="getPlayerName">
            <router-view class="content flex-container flex-container-vertical"></router-view>
        </div>
        <div v-else>
            <PlayerNameInput class="content"></PlayerNameInput>
        </div>
        
    </div>
</template>




<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import PlayerNameInput from "@/components/player-name-input.vue";
import GlobalHelpers from "@/mixins.ts";

@Component({
    components: {   
        PlayerNameInput
    },
    computed: {
        registeredTrials() {
            return ["Trial 1", "Trial 2", "Trial 3"];
        },
        getPlayerName() {
            return this.$store.state["playerName"];
        },
    },
    data: function() {
        return {
            showReset: false,
        }
    },
    methods: {
        exactTrialActive(trial: string) {
            return this.$route.query["name"] === trial;
        },
        resetName() {
            this.$data.showReset = false;
            this.$store.dispatch("setPlayerName", "");
        }
    },
    created: function() {
        if (GlobalHelpers.methods.isLocalStorageSupported()) {
            let playerName = localStorage.getItem("playerName");
            if (playerName) {
                this.$store.commit("setPlayerName", playerName);
            }
        }
    },
})
export default class App extends Vue {}
</script>




<style lang="scss">
@import "main.scss";

/* General-use helpers */

.full-height {
    height: 100%;
}

.flex-item {
    flex: 1;
}

.flex-container {
    display: flex;
}

.flex-container-vertical {
    flex-direction: column;
}

.flex-align-center {
    align-items: center;
}

/* Page wide settings */

body, html {
    margin: 0;
    height: 100%;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 14px;
    color: $common-text-color;
    background-color: $common-background-color;
}

/* Page content styling */

.content {
    padding-top: 1em;
    padding-bottom: 1em;
    padding-left: 1em;
    padding-right: 1em;
}

@media (min-width: $mobile) {
    .content {
        padding-left: 3em;
        padding-right: 3em;
    }
}

/* Navbar styling */

// Mobile navbar is a column
#nav {
    font-size: 18px;

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
    font-size: 18px;
    //font-weight: bold;
    text-decoration: none;
    cursor: pointer;
    padding: 0.7em;

    // Desktop navbar links should be fixed width blocks
    @media (min-width: $mobile) {
        width: 5em;
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
