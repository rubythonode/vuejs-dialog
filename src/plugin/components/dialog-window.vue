<template>
    <div>
        <transition :name="animation" appear="" @after-leave="backdrop = false">
            <div v-if="show" ref="container" class="dg-container">
                <div class="dg-content-cont dg-content-cont--floating">
                    <div class="dg-main-content">
                        <!--<div class="dg-content-header">-->
                        <!---->
                        <!--</div>-->

                        <div class="dg-content-body">
                            <div v-if="options.html" class="dg-content" v-html="options.message"></div>
                            <div v-else="" class="dg-content">{{ options.message }}</div>

                            <!--<form style="background-color: ghostwhite; padding: 10px; margin-bottom: -15px">-->
                                <!--<label for="dg-confirm-input" style="font-size: 13px">Type "{{ options.verification }}" below to confirm</label>-->
                                <!--<input type="text" :placeholder="options.verification" id="dg-confirm-input"-->
                                       <!--style="width: 100%;margin-top: 10px;-->
                               <!--padding: 5px 15px; font-size: 16px;border-radius: 4px; border: 2px solid #eee"/>-->
                            <!--</form>-->
                        </div>

                        <div class="dg-content-footer">

                            <button @click="clickLeftBtn()" :is="leftBtnComponent" :loading="loading"
                                       :enabled="leftBtnEnabled" :options="options" :focus="leftBtnFocus">
                                <span>{{ options.reverse ? options.okText : options.cancelText}}</span>
                            </button>

                            <button :is="rightBtnComponent" @click="clickRightBtn()" :loading="loading"
                                       :enabled="rightBtnEnabled" :options="options" :focus="rightBtnFocus">
                                <span>{{ options.reverse ? options.cancelText : options.okText }}</span>
                            </button>

                            <div class="dg-clear"></div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <transition name="dg-backdrop" appear="" @after-leave="anmiationEnded" @after-enter="show = true">
            <div v-if="backdrop" class="dg-backdrop"></div>
        </transition>
    </div>
</template>

<script>
    import OkBtn from './ok-btn.vue'
    import CancelBtn from './cancel-btn.vue'
    import {DIALOG_TYPES, ANIMATION_TYPES} from '../js/constants'

    export default {
        data: function () {
            return {
                show: false,
                backdrop: true,
                canceled: false,
                loading: false
            }
        },
        props: {
            options: {
                type: Object,
                required: true
            }
        },
        computed: {
            animation(){
                let a = this.options.animation.toUpperCase()
                return ANIMATION_TYPES.hasOwnProperty(a)
                    ? ANIMATION_TYPES[a]
                    : ANIMATION_TYPES.ZOOM
            },
            loaderEnabled(){
                return !!this.options.loader
            },
            cancelBtnDisabled(){
                return (this.options.window === DIALOG_TYPES.ALERT)
            },
            leftBtnEnabled(){
                return (this.cancelBtnDisabled === false) || (this.options.reverse === true)
            },
            rightBtnEnabled(){
                return (this.cancelBtnDisabled === false) || (this.options.reverse === false)
            },
            leftBtnComponent(){
                return (this.options.reverse === false) ? 'cancel-btn' : 'ok-btn'
            },
            rightBtnComponent(){
                return (this.options.reverse === true) ? 'cancel-btn' : 'ok-btn'
            },
            leftBtnFocus(){
                return (this.options.reverse === true)
            },
            rightBtnFocus(){
                return (this.options.reverse === false)
            }
        },
        methods: {
            clickRightBtn(){
                this.options.reverse ? this.cancel() : this.proceed()
            },
            clickLeftBtn(){
                this.options.reverse ? this.proceed() : this.cancel()
            },
            proceed(){
                if (this.loaderEnabled) {
                    this.switchLoadingState(true)
                    this.options.promiseResolver({
                        close: this.close,
                        loading: this.switchLoadingState
                    })
                } else {
                    this.options.promiseResolver(true)
                    this.close()
                }
            },
            cancel(){
                if (this.loading === true)
                    return
                this.canceled = true
                this.close()
            },
            switchLoadingState(loading = null){
                if(loading === null){
                    loading = !this.loading
                }

                this.loading = !!loading
            },
            close(){
                this.show = false
            },
            anmiationEnded(){
                if (this.canceled){
                    this.options.promiseRejecter(false)
                }
                this.$emit('close')
            },
            escapeKeyListener(e) {
                if (e.keyCode === 27) {
                    this.cancelBtnDisabled ? this.proceed() : this.cancel()
                }
            }
        },
        created() {
            document.addEventListener('keydown', this.escapeKeyListener);
        },
        destroyed() {
            document.removeEventListener('keydown', this.escapeKeyListener);
        },
        components: {CancelBtn, OkBtn}
    }
</script>

<style lang="css">
    @import url('../styles/_animations.css');
    @import url('../styles/default.css');
</style>
