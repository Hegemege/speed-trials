<template>
    <div class="match-status-container ui-container">
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Status</h2>
            <span class="alt-label">{{ matchStatusTitle }}</span>
        </div>
        <div class="ui-container-content">
            <span>{{ matchStatusDescription }}</span>
        </div>
        <div class="ui-container-sub-header">
            <h3>Match settings</h3>
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
                return "The match has concluded.";
            } else {
                return "The match is in progress.";
            }
        } else {
            if (this.matchData.users.length < 2) {
                return "Waiting for more participants.";
            } else {
                // Waiting for host to update settings
                if (this.matchData.mapPool === "") return "Waiting for host to select map pool.";
                //if (!this.matchData.settings) return "Waiting for host to decide match settings.";

                // Ready status
                let notReady = this.matchData.users.findIndex((user: any) => !user.ready);
                if (notReady !== -1) {
                    return "Waiting for all participants to be ready."
                } else {
                    "Waiting for host to start the match.";
                }
            }
        }
    }

}
</script>

<style scoped lang="scss">
@import "../../main.scss";


</style>