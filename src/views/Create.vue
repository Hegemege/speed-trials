<template>
    <div class="create">
        <h1>Create a new speedtrial match</h1>
        <p>Start a new match as the host.</p>
        <div class="centered">
            <button class="custom-button half-button"
                    v-on:click="createMatch">
                    New Match
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ApiService from "@/api-service";

import swal from "sweetalert2";

@Component({

})
export default class Create extends Vue {
    private createMatch() {
        this.$store.commit("_setGlobalSpinner", { show: true, instant: false });

        ApiService.createMatch()
            .then((data: any) => {
                this.$store.commit("_setGlobalSpinner", { show: false, instant: false });

                if (data.result) {
                    swal("Success", "Invite code: " + data.code, "success");
                } else {
                    swal("Error", "Unable to create match. Reason: " + data.errorMessage, "error");
                }
            });
    }
}
</script>
