// Directives

import {noop, clickNode} from './utilities'


let Directives = function (Vue) {
    Object.defineProperties(this, {
        Vue: {get: () => Vue},
        confirmDefinition: {
            get: this.defineConfirm
        },
        alertDefinition: {
            get: this.defineAlert
        }
    })
}

Directives.prototype.defineConfirm = function () {
    const _this = this
    const DirectiveDefinition = {}

    const getConfirmMessage = function(binding) {
        if (binding.value && binding.value.message) {
            return binding.value.message
        }
        return typeof binding.value === 'string' ? binding.value : null
    }

    const getCatchCallback = function(binding) {
        if (binding.value && binding.value.cancel) {
            return binding.value.cancel
        }
        return noop
    }

    const getThenCallback = function(binding, el){
        if (binding.value && binding.value.ok) {
            return binding.value.ok
        } else {
            return () => {
                // Unbind to allow original event
                el.removeEventListener('click', el.VuejsDialog.clickHandler, true)
                // Trigger original event
                clickNode(el)
                // Re-bind listener
                el.addEventListener('click', el.VuejsDialog.clickHandler, true)
            }
        }
    }

    const clickHandler = function (event, el, binding) {
        event.preventDefault()
        event.stopImmediatePropagation()

        let confirmMessage = getConfirmMessage(binding)
        let thenCallback = getThenCallback(binding, el)
        let catchCallback = getCatchCallback(binding)

        _this.Vue.dialog
            .confirm(confirmMessage)
            .then(thenCallback)
            .catch(catchCallback)
    }


    DirectiveDefinition.bind = (el, binding) => {
        if (el.VuejsDialog === undefined) {
            el.VuejsDialog = {}
        }

        el.VuejsDialog.clickHandler = function (event) {
            clickHandler(event, el, binding)
        }

        el.addEventListener('click', el.VuejsDialog.clickHandler, true)
    }

    DirectiveDefinition.unbind = (el) => {
        el.removeEventListener('click', el.VuejsDialog.clickHandler, true)
    }

    return DirectiveDefinition
}

Directives.prototype.defineAlert = function () {
    //
}

export default Directives
