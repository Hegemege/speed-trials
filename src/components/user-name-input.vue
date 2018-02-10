<template>
    <div class="player-name-input">
        <OrbitSpinner v-show="isLoading"></OrbitSpinner>
        <h2>As guest</h2>
        <input class="large-centered-input constant-input" 
               type="text" 
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

import OrbitSpinner from "@/components/orbit-spinner.vue";
import swal from "sweetalert2";

@Component({
    components: {
        OrbitSpinner
    }
})
export default class UserNameInput extends Vue {
    private isLoading: boolean = false;
    private playerName: string = "";
    private errorMessage: string = "";  

    onSubmit() {
        this.isLoading = true;

        this.$store.dispatch("setUserName", this.$data.playerName)
            .then((result: any) => {
                this.isLoading = false;
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