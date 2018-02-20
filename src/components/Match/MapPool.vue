<template>
    <div class="map-pool-container ui-container spinner-container flex-item flex-container-vertical">
        <OrbitSpinner :show="$store.getters.getLocalSpinnerState('matchMapPool')"></OrbitSpinner>
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Map pool</h2>
            <span class="alt-label">{{ chosenMapPool.name }}</span>
        </div>
        <div class="ui-container-content flex-item flex-container-vertical">
            <span class="map-pool-description">{{ mapPoolStatusDescription }}</span>
            <div v-if="isHost" v-on:click="selectMapPool">
                <button v-if="anyMapPoolChosen" class="small-button wide-button">Change</button>
                <button v-else class="small-button wide-button">Select</button>
                <div class="content-divider-long"></div>
            </div>
            <div v-else>
                <span v-if="!anyMapPoolChosen">Waiting for host to choose a map pool for the match.</span>
            </div>
            <div v-if="anyMapPoolChosen" class="map-list-container flex-item flex-container-vertical">
                <h3 class="map-list-header">Map list</h3>
                <span class="map-list-instructions">{{ mapListInstructions }}</span>
                <div class="content-divider-long"></div>
                <VuePerfectScrollbar class="scroll-area flex-item" :settings="scrollbarSettings">
                    <h4 class="map-list-sub-header">Open </h4>
                    <draggable v-model="openMaps" 
                               :options="sortableOptions"
                               class="map-list">
                        <MapCard v-for="element in openMaps" :key="element" :mapName="element">{{element}}</MapCard>
                    </draggable>
                    <h4 class="map-list-sub-header">Banned</h4>
                    <draggable v-model="bannedMaps" 
                               :options="sortableOptions"
                               class="map-list">
                        <MapCard v-for="element in bannedMaps" :key="element" :mapName="element">{{element}}</MapCard>
                    </draggable>
                    <h4 class="map-list-sub-header">Picked</h4>
                    <draggable v-model="pickedMaps" 
                               :options="sortableOptions"
                               class="map-list">
                        <MapCard v-for="element in pickedMaps" :key="element" :mapName="element">{{element}}</MapCard>
                    </draggable>
                </VuePerfectScrollbar>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import OrbitSpinner from "@/components/OrbitSpinner.vue";
import MapCard from "@/components/Match/MapCard.vue";

import ApiService from "@/api-service";
import swal from "sweetalert2";
// @ts-ignore
import draggable from 'vuedraggable';
// @ts-ignore
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

@Component({
    components: {
        OrbitSpinner,
        draggable,
        VuePerfectScrollbar,
        MapCard
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
    },
    watch: {
        matchData: function(newValue, oldValue) {
            // Update maps property based on selected map pool when matchData changes
            if (!newValue.mapPool) return; // If map pool isn't defined
            if (oldValue.mapPool === newValue.mapPool) return; // If map pool hasn't changed, do not update the list

            let index = this.$props.mapPoolData.findIndex((pool: any) => pool["_id"] === newValue.mapPool);
            if (index === -1) return; // If somehow the chosen map pool is invalid

            this.$data.openMaps = this.$props.mapPoolData[index].maps;
            this.$data.pickedMaps = [];
            this.$data.bannedMaps = [];
        }
    }
})
export default class MapPool extends Vue {
    matchData: any;
    mapPoolData: any; // any[]
    isHost: any; // boolean

    private openMaps: any[] = [];
    private pickedMaps: any[] = [];
    private bannedMaps: any[] = [];

    private scrollbarSettings: any = { 
        maxScrollbarLength: 60,
        wheelSpeed: 0.33,
        suppressScrollX: true
    };

    private sortableOptions: any = {
        group: "maps",
        ghostClass: "map-list-placeholder"
    }

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

        return this.mapPoolData[index];
    }

    get mapPoolStatusDescription() {
        if (!this.matchData) return "";
        if (!this.matchData.mapPool) return "No map pool selected yet.";
    }

    get mapListInstructions() {
        return "Instructions here";
    }

    selectMapPool() {
        // Names of the map pools
        let mapPoolOptions = this.mapPoolData
            .sort((pool1: any, pool2: any) => pool1.name < pool2.name ? -1 : 1);

        // If a map option is already chosen, remove that entry from the array and put it at the top.
        // This makes the current selection the default selection
        if (this.anyMapPoolChosen) {
            let chosen = this.chosenMapPool;
            let chosenPool = mapPoolOptions.find((pool: any) => pool.name === chosen.name); // Supposedly only one such map pool exists
            mapPoolOptions = mapPoolOptions.filter((pool: any) => pool.name !== chosen.name);
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

.map-pool-container {
    .map-pool-description {
        margin-bottom: 0.5em;
    }

    .map-list-container {

        .scroll-area {
            border: 1px solid $common-alt-color-darker;
            background-color: $common-background-color-dark;
            padding: 0.5em;
        }

        .map-list-instructions {
            display: block;
            padding: 0.5em;
        }

        .map-list {
            display: flex;
            flex-wrap: wrap;
            padding: 0.5em;
            min-height: 1em;
            border: 1px solid $common-alt-color-darker;
            background-color: $common-background-color-darker;
        }

        .map-list-header {
            text-align: center;
            padding: 0.5em;
            background-color: $common-background-color-darker;
        }

        .map-list-sub-header {
            text-align: center;
            padding: 0.5em;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            background-color: $common-background-color-darker;
            color: $common-accent-color;

            &:first-child {
                margin-top: 0;
            }
        }

        .map-list-placeholder {
            opacity: 0.33;
        }
    }
}



</style>