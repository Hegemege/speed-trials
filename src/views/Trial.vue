<template>
    <div class="trial">
        <h1>{{ trialName }}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({

})
export default class Trial extends Vue {
    get trialName() {
        return this.$route.query.name;
    }
}
</script>
