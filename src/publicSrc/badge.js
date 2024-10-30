const ck = require('js-cookie')

module.exports = {
    /**
     * hasBadge
     * @returns {string|undefined} The URL of the badge, or undefined if the user has no badge
     */
    hasBadge() {
        return ck.get('hasBadge')
    },

    /**
     * grabBadgeList
     * @returns {Promise<Object>} A promise that resolves to a list of badges keyed by name
     */
    grabBadgeList: async () => {
        return await (await fetch("/badge.json")).json()
    },

    /**
     * isBadgeCode
     * @param {Object} badgeList A list of badges keyed by name
     * @param {string} code The code to look for
     * @returns {string|undefined} The URL of the badge of the given code, or undefined if not found
     */
    isBadgeCode: (badgeList, code) => {
        for (const [badgeURL, badgeValue] of Object.entries(badgeList)) {
            if (badgeURL === code) {
                return badgeValue
            }
        }
        return undefined
    },

    /**
     * giveBadge
     * @param {string} badgeURL The name of the badge to give
     */
    giveBadge: (badgeURL) => {
        ck.set('hasBadge', badgeURL, { expires: 365 })
    },

    /**
     * migrateBadge
     * Updates a badge from the old format (just the string "1") to the new format (the URL of the badge)
     */
    migrateBadge: () => {
        if (ck.get("hasBadge") == "1") {
            ck.set('hasBadge', "/app/chat/verified-icon.png", { expires: 365 })
        }
        if (ck.get("hasBadge") == "/app/chat/verified-icon.png") {
            ck.set('admin', "0", { expires: 365 })
        }
        if (ck.get("hasBadge") == "/app/chat/verified-icon.png") {
            ck.remove("hasBadge")
        }
    }
}
