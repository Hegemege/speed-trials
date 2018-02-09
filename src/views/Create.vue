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

@Component({

})
export default class Create extends Vue {
    private service: ApiService = new ApiService();

    createMatch() {
        //let body = 
        this.$data.service.createMatch()
            .then((result: boolean) => {
                console.log("Match created", result);
            });
    }
}
</script>
