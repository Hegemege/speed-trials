<template>
    <div class="join">
        <h1>Join a match</h1>
        <p>Type below the code a match host has given you.</p>
        <div class="flex-container-vertical">
            <div class="centered">
                <input class="large-centered-input half-input" 
                       type="text" 
                       placeholder="code"
                       v-on:keyup.enter="joinMatch" 
                       v-model="codeInput">
            </div>

            <div class="centered">
                <button class="custom-button half-button"
                        v-on:click="joinMatch">
                    Join Match
                </button>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApiService from "@/api-service";

import swal from "sweetalert2";

@Component({

})
export default class Join extends Vue {
    private codeInput: string = "";

    private joinMatch() {
        // Validate the input so we don't get stuck in the spinner on invalid input
        if (!this.codeInput.match(/^[a-zA-Z0-9]{7}$/)) {
            swal("Invalid code", "Invite codes are alphanumeric 7-symbol combinations", "error");
            return;
        }

        this.$store.commit("_setGlobalSpinner", { show: true, instant: false });

        ApiService.checkMatchExists(this.codeInput)
            .then((data: any) => {
                this.$store.commit("_setGlobalSpinner", { show: false, instant: false });

                if (data.result) {
                    this.$router.push("/match/" + data.code); // Acts the same as just entering the URL in browser
                } else {
                    swal("Error", "Unable to join match. Reason: " + data.errorMessage, "error");
                }
            });
    }
}
</script>
