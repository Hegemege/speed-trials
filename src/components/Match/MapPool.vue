<template>
    <div class="map-pool-container ui-container spinner-container">
        <OrbitSpinner :show="$store.getters.getLocalSpinnerState('matchMapPool')"></OrbitSpinner>
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

import OrbitSpinner from "@/components/OrbitSpinner.vue";

import ApiService from "@/api-service";
import swal from "sweetalert2";

@Component({
    components: {
        OrbitSpinner
    },
    props: {
        matchData: {    
            default: {},
            type: Object
        },
        mapPoolData: {
            type: Array
        },
        isHost: {
            default: false,
            type: Boolean
        }
    }
})
export default class MapPool extends Vue {
    matchData: any;
    mapPoolData: any; // any[]
    isHost: any; // boolean

    get anyMapPoolChosen() {
        if (!this.matchData) return false;
        if (!this.matchData.mapPool) return false;
        return true;
    }

    get chosenMapPool() {
        if (!this.matchData) return "";
        if (!this.matchData.mapPool) return "Not selected";

        let index = this.mapPoolData.findIndex((pool: any) => pool["_id"] === this.matchData.mapPool);
        if (index === -1) return "<Invalid map pool>";

        return this.mapPoolData[index].name;
    }

    get mapPoolStatusDescription() {
        if (!this.matchData) return "";
        if (!this.matchData.mapPool) return "No map pool selected yet.";
    }

    selectMapPool() {
        // Names of the map pools
        let mapPoolOptions = this.mapPoolData
            .sort((pool1: any, pool2: any) => pool1.name < pool2.name ? -1 : 1);

        // If a map option is already chosen, remove that entry from the array and put it at the top.
        // This makes the current selection the default selection
        if (this.anyMapPoolChosen) {
            let chosen = this.chosenMapPool;
            let chosenPool = mapPoolOptions.filter((pool: any) => pool.name === chosen)[0]; // Supposedly only one such map pool exists
            mapPoolOptions = mapPoolOptions.filter((pool: any) => pool.name !== chosen);
            mapPoolOptions.unshift(chosenPool);
        }

        let mapPoolNames = mapPoolOptions
            .map((pool: any) => pool.name);
        
        swal({
            title: "Pick a map pool",
            input: "select",
            inputOptions: mapPoolNames
        })
        .then((selection: any) => {
            if (selection.value) { // User chose a value, "0", "1" etc.
                let chosenIndex = +selection.value;

                this.$store.commit("_setLocalSpinner", { name: "matchMapPool", state: true });

                // Send to backend and wait for reply
                ApiService.setMatchMapPool(this.$parent.$data.matchCode, mapPoolOptions[chosenIndex]["_id"])
                    .then((data: any) => {
                        if (!data.result) {
                            swal("Error", "Unable to set map pool for match. Reason: " + data.errorMessage, "error");
                            this.$store.commit("_setLocalSpinner", { name: "matchMapPool", state: false });
                            return;
                        }

                        this.$parent.$emit("host-update");
                    });
            }
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