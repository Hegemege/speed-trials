<template>
    <div class="match-status-container ui-container">
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Status</h2>
            <span class="alt-label">{{ matchStatusTitle }}</span>
        </div>
        <div class="ui-container-content">
            <span>{{ matchStatusDescription }}</span>
        </div>
        <div class="ui-container-sub-header flex-container flex-align-center centered">
            <h3>Match settings</h3>
            <span v-if="isHost" v-on:click="changeSettings" class="change-settings-button">Change</span>
            <sweet-modal ref="changeSettingsModal"
                         title="Test"
                         :hide-close-button="true" 
                         overlay-theme="dark" 
                         modal-theme="dark">
                Test
            </sweet-modal>
        </div>
        <div class="match-settings-container">
            <div class="settings-line flex-container flex-space-between">
                <span>Number of maps:</span>
                <span class="settings-line-setting">{{ mapsPlayed }}</span>
            </div>
            <div class="settings-line flex-container flex-space-between">
                <span>Scoring system:</span>
                <div class="flex-container flex-align-center">
                     <div v-if="matchData.settings.scoringMode !== ''" 
                     v-tooltip="{ content: scoringSystemTooltip }">
                        <font-awesome-icon class="settings-info-icon" size="xs" :icon="infoIcon" />
                     </div>
                    <span class="settings-line-setting">{{ scoringSystem }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

// @ts-ignore
import FontAwesomeIcon from '@fortawesome/vue-fontawesome'
// @ts-ignore
import { faQuestionCircle } from '@fortawesome/fontawesome-free-regular'

import ApiService from "@/api-service";
import swal from "sweetalert2";

// @ts-ignore
import { SweetModal } from 'sweet-modal-vue'

@Component({
    components: {
        FontAwesomeIcon,
        SweetModal
    },
    props: {
        matchData: {
            default: {},
            type: Object
        },
        isHost: {
            default: false,
            type: Boolean
        }
    }
})
export default class MatchStatus extends Vue {
    matchData: any;
    isHost: any; // boolean

    get infoIcon() {
        return faQuestionCircle;
    }

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

    get mapsPlayed() {
        return this.matchData.settings.mapsPlayed !== 0 ? this.matchData.settings.mapsPlayed : "Not set";
    }

    get scoringSystem() {
        if (this.matchData.settings.scoringMode === "total") {
            return "Total time";
        } else if (this.matchData.settings.scoringMode === "individual") {
            return "Map points";
        }

        return "Not set";
    }

    get scoringSystemTooltip() {
        if (this.matchData.settings.scoringMode === "total") {
            return "Score is calculated as the sum of lowest times of all maps. User with the lowest score (total time) wins.";
        } else if (this.matchData.settings.scoringMode === "individual") {
            return "Score is calculated based on standings for each map. User with the highest score wins.";
        }

        return "";
    }

    changeSettings() {
        // @ts-ignore
        this.$refs.changeSettingsModal.open();
    }

}
</script>

<style scoped lang="scss">
@import "../../main.scss";

.change-settings-button {
    margin-left: 1em;
    margin-right: 1em;
    color: $common-alt-color;

    &:hover {
        cursor: pointer;
        color: $common-accent-color-lighter;
    }
}

.match-settings-container {
    padding: 0.5em;
}

.settings-line {

    .settings-line-setting {
        color: $common-accent-color;
    }

    .settings-info-icon {
        margin-right: 0.5em;
        color: $common-text-color-dark;
    }
}

</style>