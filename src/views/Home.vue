<template>
    <div class="home flex-item flex-container-desktop">
        <div class="flex-item-desktop full-height">
            <Create></Create>
            <div class="content-separator"></div>
            <Join></Join>
        </div>
        <div class="content-separator-vertical"></div>
        <div class="flex-item-desktop full-height">
            <History></History>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Create from "./Create.vue";
import Join from "./Join.vue";
import History from "./History.vue";

@Component({
    components: {
        Create,
        Join,
        History
    },
})
export default class Home extends Vue {}
</script>
