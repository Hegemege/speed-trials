<template>
    <div v-if="matchData" class="match">
        <h1>{{ matchData.name }}</h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({

})
export default class Match extends Vue {
    private matchData: any = null;

    created() {
        // Poll server
        //this.$store.commit("_setGlobalSpinner", { show: true, instant: false });
    }
}
</script>
