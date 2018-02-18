<template>
    <div class="match-status-container ui-container">
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Map pool</h2>
            <span class="alt-label">{{ chosenMapPool }}</span>
        </div>
        <div class="ui-container-content flex-container-vertical">
            <span class="map-pool-description">{{ mapPoolStatusDescription }}</span>
            <div v-if="isHost" v-on:click="selectMapPool">
                <button v-if="anyMapPoolChosen" class="small-button wide-button">Change</button>
                <button v-else class="small-button wide-button">Select</button>
            </div>
            <div v-else>
                <span>Waiting for host to choose a map pool for the match.</span>
            </div>
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
        },
        isHost: {
            default: false,
            type: Boolean
        }
    }
})
export default class MapPool extends Vue {
    matchData: any;
    isHost: any; // boolean

    get anyMapPoolChosen() {
        if (!this.matchData) return false;
        if (!this.matchData.mapPool) return false;
        return true;
    }

    get chosenMapPool() {
        if (!this.matchData) return "";
        if (!this.matchData.mapPool) return "Not selected";

        return this.matchData.mapPool;
    }

    get mapPoolStatusDescription() {
        if (!this.matchData) return "";
        if (!this.matchData.mapPool) return "No map pool selected yet.";
    }

    selectMapPool() {
        swal({
            title: "TODO",
            text: "TODO"
        });
    }
}
</script>

<style scoped lang="scss">
@import "../../main.scss";


.map-pool-description {
    margin-bottom: 0.5em;
}

</style>