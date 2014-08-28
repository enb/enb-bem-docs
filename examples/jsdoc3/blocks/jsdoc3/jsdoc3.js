/**
 * Button
 *
 * Description
 */
BEM.DOM.decl('button', {

    /**
     * event description
     *
     * @event button#press
     */

    /**
     * event description
     *
     * @event button#release
     */

    /**
     * @private
     */
    onSetMod: {
        // ...
    },

    /**
     * Description
     *
     * @public
     * @returns {Boolean} returns `true` when disabled.
     */
    isDisabled: function() {

        return this.hasMod('disabled', 'yes');

    },

    /**
     * Description
     *
     * @public
     * @param {String} [val] Link URL
     * @returns {String|BEM.DOM} Returns current value
     */
    url: function(val) {

    },

    /**
     * Private method
     *
     * @private
     */
    _onClick: function(e) {
    }

});
