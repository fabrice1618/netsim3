/*
 * Top navbar that mirrors the main menu entries as plain HTML buttons.
 * Replaces the canvas hamburger + floating UIMenu UX. Supports an optional
 * right-aligned group (used for Animation Controls).
 */

var UINavbar = function(containerId, leftEntries)
{
    var containerId = containerId;
    var leftEntries = leftEntries;
    var rightEntries = [];
    var _self = this;

    function init()
    {
        uitranslation.addObserver(_self);
        _self.render();
    }

    this.localeChanged = function()
    {
        _self.render();
    };

    this.setRightEntries = function(entries)
    {
        rightEntries = entries || [];
        _self.render();
    };

    function buildGroup(className, entries)
    {
        var group = document.createElement("div");
        group.setAttribute("class", className);
        for (var i = 0; i < entries.length; i++)
        {
            var entry = entries[i];
            var btn = document.createElement("button");
            btn.setAttribute("type", "button");
            btn.setAttribute("title", _(entry.text));
            btn.innerHTML = "<img src='" + entry.img + "' alt='' />" +
                            "<span>" + _(entry.text) + "</span>";
            btn.setAttribute("onclick", entry.js + "uimanager.menuOptionClicked();");
            group.appendChild(btn);
        }
        return group;
    }

    this.render = function()
    {
        var container = document.getElementById(containerId);
        if (container === null) return;
        container.innerHTML = "";
        container.appendChild(buildGroup("ns-nav-left", leftEntries));
        container.appendChild(buildGroup("ns-nav-right", rightEntries));
    };

    init();
};
