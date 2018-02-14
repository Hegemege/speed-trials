<template>
    <div class="player-name-input">
        <h2>As guest</h2>
        <input class="large-centered-input constant-input" 
               type="text"
               placeholder="username"
               v-on:keyup.enter="onSubmit" 
               v-model="playerName">
        <button v-on:click="onSubmit"
                class="custom-button constant-button">
                Submit
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import swal from "sweetalert2";

@Component({

})
export default class UserNameInput extends Vue {
    private isLoading: boolean = false;
    private playerName: string = "";
    private errorMessage: string = "";

    private onSubmit() {
        if (this.playerName === "") {
            swal("You forgot something!", "Empty username", "error");
            return;
        }

        if (!this.playerName.match(/^[a-zA-Z0-9_]{3,25}$/)) {
            swal("Invalid username", 
                "Guest name can contain a-z, A-Z, 0-9 or an underscore, and must be 3 to 25 symbols long.", 
                "error");
            return;
        }

        this.$store.commit("_setGlobalSpinner", { show : true, instant: false });

        this.$store.dispatch("setUserName", this.playerName)
            .then((result: any) => {
                this.$store.commit("_setGlobalSpinner", { show : false, instant: false });
                if (!result.result) {
                    this.errorMessage = result.errorMessage;
                    swal("Wait a minute...", this.errorMessage, "error");
                }
        });
    }
}
</script>

<style scoped>

.player-name-input {
    display: flex;
    flex-direction: column;
}

</style>