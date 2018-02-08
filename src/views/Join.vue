<template>
    <div class="join">
        <h1>Join a match</h1>
        <p>Input below a code the match host has given you, or open the link they shared with you.</p>
        <div class="flex-container-vertical">
            <div class="centered">
                <input class="digit-input half-input" 
                       type="text" 
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

@Component({
    components: {

    },
    computed: {

    },
    data: function() {
        return {
            codeInput: "",
        };
    },
    methods: {
        joinMatch() {
            console.log("Join match");
        }
    },
})
export default class Join extends Vue {}
</script>
