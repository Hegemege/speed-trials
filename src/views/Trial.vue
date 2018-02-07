<template>
    <div class="trial">
        <h1>{{ trialName }}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
    components: {

    },
    computed: {
        trialName() {
            return this.$route.query["name"];
        },
    }
})
export default class Trial extends Vue {}
</script>
