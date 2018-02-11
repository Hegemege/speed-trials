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

import swal from "sweetalert2";

@Component({

})
export default class Join extends Vue {
    private codeInput: string = "";

    private joinMatch() {
        swal("This feature is coming soon", "", "warning");
    }
}
</script>
