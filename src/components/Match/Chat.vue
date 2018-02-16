<template>
    <div class="chat-container ui-container flex-container-vertical flex-item">
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Chat</h2>
            <span class="alt-label">{{ chatterCount }} <icon name="user"></icon></span>
        </div>
        <div class="ui-container-content flex-item">

        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ApiService from "@/api-service";
import swal from "sweetalert2";

import Icon from "vue-awesome/components/Icon.vue";
import "vue-awesome/icons/user"


@Component({
    components: {
        Icon,
    },
    props: {
        chatData: {
            default: null,
            type: Object
        },
        socket: {
            default: null,
            type: Object
        }
    }
})
export default class Chat extends Vue {
    chatData: any;
    socket: any;

    private chatterCount: number = 0;

    created() {
        this.socket.emit("get-chatter-count", this.$parent.$data.matchCode);

        this.socket.on("chat-message", (data: any) => {
            console.log("Got chat data", data);
        });

        this.socket.on("chat-count", (data: any) => {
            this.chatterCount = data;
        });
    }
}
</script>

<style scoped lang="scss">
@import "../../main.scss";


</style>