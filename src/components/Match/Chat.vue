<template>
    <div class="chat-container ui-container flex-container-vertical flex-item-2">
        <div class="flex-container flex-align-center flex-space-between ui-container-header">
            <h2 class="match-status-title">Chat</h2>
            <span class="alt-label">{{ chatterCount }} <icon name="user"></icon></span>
        </div>
        <div class="ui-container-content flex-item flex-container-vertical">
            <div class="flex-item">
                <div class="chat-message-area full-height">
                    <VuePerfectScrollbar class="scroll-area full-height" :settings="scrollbarSettings" ref="ps">
                        <div class="chat-scroll-area">
                            <div class="chat-row" 
                            v-for="message of getMessages" 
                            v-bind:class="getMessageClass(message)"
                            :key="message.id">
                                <span class="message-timestamp">{{ message.timestamp }}</span>
                                <span class="message-sender">
                                    {{ message.sender === null ? "Server" : message.sender }}
                                    <img v-if="message.guest === false" class="twitch-badge" src="../../assets/GlitchBadge_Purple_24px.png">
                                    <img v-if="message.host === true" class="host-badge" src="../../assets/crown.svg">
                                    : 
                                </span>
                                <span class="message-contents">{{ message.message }}</span>
                            </div>
                        </div>
                    </VuePerfectScrollbar>
                </div>
            </div>
            <div class="chat-input-area">
                <textarea 
                    rows="3" 
                    class="chat-input wide-input"
                    maxlength="1000"
                    placeholder="Type something and press Enter to send."
                    v-model="inputMessage"
                    @keydown="chatInputHandler"></textarea>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import ApiService from "@/api-service";
import swal from "sweetalert2";
// @ts-ignore
import VuePerfectScrollbar from 'vue-perfect-scrollbar';

import Icon from "vue-awesome/components/Icon.vue";
import "vue-awesome/icons/user"

@Component({
    components: {
        Icon,
        VuePerfectScrollbar
    },
    props: {
        socket: {
            default: null,
            type: Object
        }
    }
})
export default class Chat extends Vue {
    socket: any;

    private chatterCount: number = 0;
    private inputMessage: string = "";

    private scrollbarSettings: any = { 
        maxScrollbarLength: 60,
        wheelSpeed: 0.33,
        suppressScrollX: true
    };

    messages: any[] = [];

    get getMessages() {
        return this.messages;
    }

    created() {
        this.socket.emit("get-chatter-count", this.$parent.$data.matchCode);

        this.socket.on("chat-message", (data: any) => {
            if (this.messages.length > 100) {
                this.messages.shift();
            }

            let now = new Date();

            data.timestamp = ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2);
            data.id = this.getMessageKey();

            this.messages.push(data);

            this.$nextTick(() => {
                if (this.$refs.ps !== undefined) {
                    // @ts-ignore
                    this.$refs.ps.$el.scrollTop = 9999999999;
                    // @ts-ignore
                    this.$refs.ps.update();
                }
            });
        });

        this.socket.on("chat-count", (data: any) => {
            this.chatterCount = data;
        });
    }

    chatInputHandler(event: any) {
        if ((event.which === 13 || event.keyCode === 13) && !event.shiftKey) { // Enter without shift-enter
            event.preventDefault();
            if (this.inputMessage === "") return;

            let message = this.inputMessage;
            this.inputMessage = "";

            // Send the chat message
            this.socket.emit("chat-message", { message: message, code: this.$parent.$data.matchCode });
        }
    }

    getMessageKey() {
        return "_" + Math.random().toString(36).substr(2, 9);
    }

    getMessageClass(message: any) {
        if (message.host) {
            return "host-message";
        }

        if (message.sender === null) {
            return "server-message";
        }
    }
}
</script>

<style scoped lang="scss">
@import "../../main.scss";

.chat-container {
    min-height: 20em;
    @media (min-width: $mobile) { 
        min-height: 0;
    }
}

.chat-message-area {
    background-color: $common-background-color-darker;
    border: 1px solid $common-alt-color-darker;
}

.chat-scroll-area {
    max-height: 0; // hack
    padding-left: 0.4em;
    padding-right: 0.6em;
}

.chat-row {
    padding-top: 0.25em;
    padding-bottom: 0.25em;
    padding-left: 0.2em;
    line-height: 1.4em;
    
    color: $common-text-color-dark;

    .message-contents {
          /* These are technically the same, but use both */
        overflow-wrap: break-word;
        word-wrap: break-word;

        -ms-word-break: break-all;
        /* Instead use this non-standard one: */
        word-break: break-word;
    }

    &:nth-child(even) {
        background-color: $common-background-color-darkmid;
    }

    &:nth-child(odd) {
        background-color: $common-background-color-darker;
    }

    .message-timestamp {
        color: $common-text-color-darker;
        font-size: 13px;
        padding-right: 3px;
    }

    .message-sender {
        & .twitch-badge {
            margin-left: 5px;
            margin-bottom: -2px;
            width: 15px;
            height: 15px;
        }

        & .host-badge {
            width: 18px;
            height: 18px;
            margin-bottom: -3px;
        }
    }

    &.server-message {
        color: $common-text-color-darker;
        font-size: 12px;
    }

    &.host-message {
        color: $common-accent-color;
    }
}

.chat-input-area {
    margin-top: 0.7em;
    height: 4em;

    .chat-input {
        height: 100%;
        padding: 0.5em;

        font-family: $font-family;

        background-color: $common-background-color-darker;

        overflow-y: hidden;

        -webkit-box-sizing: border-box;
           -moz-box-sizing: border-box;
                box-sizing: border-box;

        resize: none;
    }
}

</style>