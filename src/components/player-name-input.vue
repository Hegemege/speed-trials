<template>
    <div class="player-name-input">
        <h1>Enter your display name:</h1>
        <input class="text-input" 
               type="text" 
               v-on:keyup.enter="onSubmit" 
               v-model="playerName">
        <button v-on:click="onSubmit">Submit</button>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
    data: function() {
        return {
            playerName: ""
        }
    },
    computed: {

    },
    methods: {
        onSubmit: function() {
            this.$store.dispatch("setPlayerName", this.$data.playerName);

            let playerName = localStorage.getItem("playerName");
        }
    }
})
export default class PlayerNameInput extends Vue {}
</script>

<style scoped>

</style>