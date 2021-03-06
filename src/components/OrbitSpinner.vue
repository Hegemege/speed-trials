<template>
    <div v-show="!instantSpinner || showSpinner">
        <div class="overlay" :class="overlayClass"></div>
        <div v-show="showSpinner" class="orbit-spinner" :style="spinnerStyle">
            <div class="orbit one" :style="orbitStyle"></div>
            <div class="orbit two" :style="orbitStyle"></div>
            <div class="orbit three" :style="orbitStyle"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

// Copied from epic-spinners.
// Will change to their components when they offer native typings...
@Component({
    props: {
        global: {
            default: false,
            type: Boolean
        },
        size: {
            default: 55,
            type: Number,
        },
        duration: {
            default: 1200,
            type: Number,
        },
        color: {
            default: "#ff1d5e",
            type: String,
        },
        show: {
            default: true,
            type: Boolean
        },
        instant: {
            default: false,
            type: Boolean
        }
    },
})
export default class OrbitSpinner extends Vue {
    global: any; // boolean
    size: any; // number
    duration: any; // number
    color: any; // string
    show: any; // boolean
    instant: any; // boolean

    get showSpinner() {
        return this.global ? this.$store.state.globalSpinner.show : this.show;
    }

    get instantSpinner() {
        return this.global ? this.$store.state.globalSpinner.instant : this.instant;
    }

    get overlayClass() {
        return [
            this.showSpinner ? "visible" : "",
            this.instantSpinner ? "instant" : "",
        ];
    }

    get spinnerStyle() {
        return {
          height: this.size + "px",
          width: this.size + "px",
          top: "calc(50% - " + this.size/2  + "px)",
          left: "calc(50% - " + this.size/2 + "px)"
        };
    }

    get orbitStyle() {
        return {
            borderColor: this.color,
            animationDuration: this.duration + "ms",
        };
    }
}
</script>

<style scoped lang="scss">

$target-opacity: 0.25;

.overlay {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10000;

    pointer-events: none;

    background-color: rgba(0,0,0,0);

    &:not(.instant) {
        transition:background-color 0.5s ease;
    }
}

.overlay.visible {
    pointer-events: auto;
    background-color: rgba(0,0,0,0.4);
}

.orbit-spinner, .orbit-spinner * {
    box-sizing: border-box;
}

.orbit-spinner {
    position: absolute;
    border-radius: 50%;
    perspective: 800px;
}

.orbit-spinner .orbit {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    opacity: 1;
}

.orbit-spinner .orbit:nth-child(1) {
    left: 0%;
    top: 0%;
    animation: orbit-spinner-orbit-one-animation 1200ms linear infinite;
    border-bottom: 3px solid #ff1d5e;
}

.orbit-spinner .orbit:nth-child(2) {
    right: 0%;
    top: 0%;
    animation: orbit-spinner-orbit-two-animation 1200ms linear infinite;
    border-right: 3px solid #ff1d5e;
}

.orbit-spinner .orbit:nth-child(3) {
    right: 0%;
    bottom: 0%;
    animation: orbit-spinner-orbit-three-animation 1200ms linear infinite;
    border-top: 3px solid #ff1d5e;
}

@keyframes orbit-spinner-orbit-one-animation {
    0% {
        transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
    }
    100% {
        transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
    }
}

@keyframes orbit-spinner-orbit-two-animation {
    0% {
        transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
    }
    100% {
        transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
    }
}

@keyframes orbit-spinner-orbit-three-animation {
    0% {
        transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
    }
    100% {
        transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
    }
}
</style>