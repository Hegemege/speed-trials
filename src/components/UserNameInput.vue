<template>
    <div class="user-name-input">
        <h2>As a guest</h2>
        <input class="large-centered-input constant-input" 
               type="text"
               placeholder="username"
               v-on:keyup.enter="onSubmit" 
               v-model="userName">
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
    private userName: string = "";
    private errorMessage: string = "";

    private onSubmit() {
        if (this.userName === "") {
            swal("You forgot something!", "Empty username", "error");
            return;
        }

        if (!this.userName.match(/^[a-zA-Z0-9_]{3,25}$/)) {
            swal("Invalid username", 
                "Guest name can contain a-z, A-Z, 0-9 or an underscore, and must be 3 to 25 symbols long.", 
                "error");
            return;
        }

        this.$store.commit("_setGlobalSpinner", { show : true, instant: false });

        this.$store.dispatch("setUserName", this.userName)
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

.user-name-input {
    display: flex;
    flex-direction: column;
}

</style>