<template>
    <div class="home flex-item flex-container-desktop">
        <div class="flex-item-desktop full-height">
            <Create></Create>
            <div class="content-divider-large"></div>
            <Join></Join>
        </div>
        <div class="content-divider-vertical-large"></div>
        <div class="flex-item-desktop full-height flex-container-vertical">
            <LiveMatches class="flex-item"></LiveMatches>
            <History class="flex-item"></History>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Create from "./Create.vue";
import Join from "./Join.vue";
import History from "./History.vue";
import LiveMatches from "./LiveMatches.vue";

@Component({
    components: {
        Create,
        Join,
        History,
        LiveMatches
    },
})
export default class Home extends Vue {}
</script>
