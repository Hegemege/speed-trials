<template>
    <div class="map-card">
        <div class="card-overlay flex-container flex-align-center">
            <span class="map-name">{{ mapName }}</span>
        </div>
        <img :src="image" @onerror="imageLoadingError()">
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
    props: {
        mapName: {
            default: "",
            type: String
        }
    }
})
export default class MapCard extends Vue {
    mapName: any; // string

    get image() {
        return require("../../assets/map_thumbnails/" + this.mapName + ".png");
    }

    imageLoadingError() {
        console.log("Unable to load map image", this.mapName);
    }
}
</script>

<style scoped lang="scss">
@import "../../main.scss";

.map-card {
    position: relative;
    max-width: 25%;

    cursor: grab;

    @media (min-width: $mobile) {
        max-width: 33%;
    }

    color: $common-alt-color;

    opacity: 0.8;

    &:hover {
        color: $common-accent-color;
        opacity: 1;
    }

    .card-overlay {
        position: absolute;
        width: 100%;
        height: 33%;
        bottom: 0;
        background-color: rgba(0,0,0, 0.7);

        .map-name {
            width: 100%;
            text-align: center;
        }
    }

    & img {
        width: 100%;
        height: 100%;
    }
}

</style>