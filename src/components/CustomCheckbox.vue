<template>
    <label class="custom-checkbox-container">
            <input class="custom-checkbox-input" 
                type="checkbox" 
                :checked="shouldBeChecked" 
                @change="updateInput">
        <span class="custom-checkbox-checkmark"></span>
    </label>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
    props: {
        modelValue: {
            default: false
        }
    },
    model: {
        prop: "modelValue",
        event: "change"
    }
})
export default class CustomCheckbox extends Vue {
    modelValue: any; // boolean

    get shouldBeChecked() {
        return this.modelValue === true;
    }

    updateInput(event: any) {
        let isChecked = event.target.checked
        this.$emit("change", isChecked ? true : false)
    }
}
</script>

<style scoped lang="scss">
@import "../main.scss";

.custom-checkbox-container {
    display: block;
    position: relative;
    padding-left: 32px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.custom-checkbox-input {
    visibility: hidden;
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

.custom-checkbox-checkmark {
    position: absolute;
    top: -6px;
    left: 0;
    height: 1em;
    width: 1em;
    background-color: #eee;
}

/* On mouse-over, add a grey background color */
.custom-checkbox-container:hover input ~ .custom-checkbox-checkmark {
    background-color: #ccc;
}
.custom-checkbox-container input:checked ~ .custom-checkbox-checkmark {
    background-color: $common-alt-color-dark;
}

/* Create the checkmark/indicator (hidden when not checked) */
.custom-checkbox-checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

/* Show the checkmark when checked */
.custom-checkbox-container input:checked ~ .custom-checkbox-checkmark:after {
    display: block;
}

/* Style the checkmark/indicator */
.custom-checkbox-container .custom-checkbox-checkmark:after {
    left: 8px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
}

</style>