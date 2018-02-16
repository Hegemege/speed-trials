<template>
    <div class="match-status-container ui-container">
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Match status</h2>
            <span class="alt-label">{{ matchStatusTitle }}</span>
        </div>
        <div class="ui-container-content">
            <span>{{ matchStatusDescription }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ApiService from "@/api-service";
import swal from "sweetalert2";

@Component({
    props: {
        matchData: {
            default: {},
            type: Object
        }
    }
})
export default class MatchStatus extends Vue {
    matchData: any;

    get matchStatusTitle() {
        if (!this.matchData) return "";

        if (this.matchData.started) {
            if (this.matchData.ended) {
                return "Finished";
            } else {
                return "In progress";
            }
        } else {
            return "Waiting...";
        }
    }

    get matchStatusDescription() {
        if (!this.matchData) return "";

        if (this.matchData.started) {
            if (this.matchData.ended) {
                return "Finished";
            } else {
                return "In progress";
            }
        } else {
            return "Waiting for more participants";
        }
    }

}
</script>

<style scoped lang="scss">
@import "../../main.scss";


</style>