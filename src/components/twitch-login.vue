<template>
    <div class="twitch-login">
        <h2>With your Twitch account</h2>
        <button v-on:click="onSubmit"
                class="custom-button constant-button flex-container flex-align-center centered">
            <span class="login-text">Login</span>
            <img src="../assets/GlitchBadge_Purple_48px.png">
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApiService from "@/api-service";

@Component({

})
export default class TwitchLogin extends Vue {
    private service: ApiService = new ApiService();

    onSubmit() {
        window.location.href = "/auth/twitch";
    }
}
</script>

<style scoped>

.login-text {
    margin-right: 0.5em;
}

</style>