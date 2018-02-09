<template>
    <div class="player-name-input">
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

.player-name-input {
    display: flex;
    flex-direction: column;
}

</style>