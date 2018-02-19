<template>
    <div id="app" class="page-full-height flex-container-vertical">
        <div id="nav" class="flex-container">
            <div id="nav-logo">
                <router-link to="/">
                    <span>SPEED TRIALS</span>
                </router-link>
             </div>

            <div class="nav-mobile-separator"></div>
            <div id="nav-links" class="flex-container">
                <UserNavDisplay></UserNavDisplay>

                <div class="nav-mobile-separator"></div>
                <div class="nav-separator"></div>
                <router-link to="/history">History</router-link>
            </div>
        </div>
        <OrbitSpinner :global="true"></OrbitSpinner>
        <div class="content-wrapper flex-item flex-container-vertical">
            <div class="content flex-item flex-container">
                <router-view v-if="!isLoading && userName"></router-view>
                <div v-else-if="!isLoading && !userName" class="flex-item flex-container">
                    <div class="flex-item flex-container-desktop">
                        <div class="flex-item-desktop full-height">
                            <h1>Log in</h1>
                            <p>
                                To start using the site, please log in first. You can log in as a guest
                                if you are just going to be joining SpeedTrial(tm) matches
                            </p>
                            <UserNameInput></UserNameInput>
                            <p>or</p>
                            <TwitchLogin></TwitchLogin>
                        </div>
                        <div class="content-divider-vertical-large"></div>
                        <div class="flex-item-desktop full-height">
                            <History></History>
                        </div>
                    </div>
                </div>
                <div v-else></div>
            </div>
        </div>

        <cookie-law message="This website uses cookies to ensure smooth user experience. By continuing to browse this website, you agree to the use of cookies." theme="blood-orange"></cookie-law>

        <div class="footer flex-container flex-align-center flex-space-between">
            <div class="flex-container flex-align-center">
                <a target="_blank" href="https://github.com/Hegemege/speed-trials" class="github-link"><img src="./assets/GitHub-Mark-Light-32px.png" class="github-logo"></a>
                
                <span>Speed Trials by @Hegemege, part of speedrunbets.com</span>
            </div>
            <span>Powered by Vue.js</span>
        </div>
    </div>
</template>




<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import UserNameInput from "@/components/UserNameInput.vue";
import TwitchLogin from "@/components/TwitchLogin.vue";
import UserNavDisplay from "@/components/UserNavDisplay.vue";
import History from "@/views/History.vue";
import GlobalHelpers from "@/mixins.ts";
import CookieLaw from "vue-cookie-law";

import ApiService from "@/api-service";

import OrbitSpinner from "@/components/OrbitSpinner.vue";

import swal from "sweetalert2";

@Component({
    components: {
        UserNameInput,
        TwitchLogin,
        UserNavDisplay,
        History,
        OrbitSpinner,
        // This will display an error in editors because it can't find the
        // custom typings shim in vue-cookie-law.d.ts in this project's root.
        // Building works, though
        CookieLaw,
    },
})
export default class App extends Vue {
    private isLoading: boolean = true;

    // Computed

    get userName() {
        return this.$store.state.userName;
    }

    // Lifecycle hooks
    private created() {
        // Test websocket
        

        this.$store.commit("_setGlobalSpinner", { show: true, instant: true });
        // Get user's name
        ApiService.getUser()
            .then((data: any) => {
                this.$store.commit("_setGlobalSpinner", { show: false, instant: true });
                this.isLoading = false;

                if (!data.result) {
                    swal("Error", data.errorMessage, "error");
                    return;
                }

                if (data.name === undefined || data.isTwitchAuthenticated === undefined) {
                    return;
                }

                // Calls the mutations, not the actions
                this.$store.commit("_setUserName", data.name);
                this.$store.commit("_setUserTwitchAuthenticated", data.isTwitchAuthenticated);
            });
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
#nav a:hover, #nav a.router-link-exact-active:hover {
    background-color: $common-background-color-light;
}

#nav router-link:not(:first-child) {
    border-left: 2px solid $common-text-color;
}

#nav a.router-link-exact-active {
    color: $common-accent-color;
    background-color: $common-background-color;
}

.footer {
    padding: 0.75em;
    background-color: $common-background-color-dark;

    font-size: 15px;
    color: $common-text-color-dark;

    .github-logo {
        margin-right: 1em;
    }

    .github-logo:hover {
        cursor: pointer;
    }

    .github-link {
        height: 32px;
    }
}

</style>
