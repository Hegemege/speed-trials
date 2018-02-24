<template>
    <div class="match-status-container ui-container">
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Standings</h2>
        </div>
        <div class="ui-container-content">
            <span>Something here</span>
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
export default class Standings extends Vue {
    matchData: any;
    isHost: any; // boolean

}
</script>

<style scoped lang="scss">
@import "../../main.scss";


</style>