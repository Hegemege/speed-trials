<template>
    <div id="app" class="full-height">
        <div id="nav" class="flex-container">
            <div id="nav-logo">
                <span>SPEED TRIALS LOGO</span>
            </div>
            <div id="nav-links" class="flex-container">
                <router-link to="/">Home</router-link>
                <router-link to="/join">Join</router-link>
            </div>
        </div>
        <router-view class="flex-container flex-container-vertical"></router-view>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
    components: {

    },
    computed: {

    }
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

/* Page wide settings */

body, html {
    margin: 0;
    height: 100%;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: $common-text-color;
    background-color: $common-background-color;
}

/* Navbar styling */

// Mobile navbar is a column
#nav {
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
    font-weight: bold;
    text-decoration: none;
    cursor: pointer;
    padding: 10px;
}

// Desktop navbar links should be fixed width blocks
@media (min-width: $mobile) {
    #nav a {
        width: 10em;
        text-align: center;
    }
}

#nav-logo {
    padding: 20px;
}

// Mobile navbar links are in a column
#nav-links {
    flex-direction: column;
}

@media (min-width: $mobile) {
    // Desktop navbar has a separator between logo and links
    #nav-logo {
        margin-right: 10em;
    }

    // Desktop navbar links are in one row
    #nav-links {
        //flex: 3;
        flex-direction: row;
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
</style>
