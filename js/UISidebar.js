/*
 * Left sidebar that displays contextual menu entries for the currently
 * selected element. Replaces the floating per-element UIMenu popup.
 */

var UISidebar = function(containerId)
{
    var containerId = containerId;
    var currentTitle = null;
    var currentEntries = null;
    var _self = this;

    function init()
    {
        uitranslation.addObserver(_self);
        _self.clear();
    }

    this.localeChanged = function()
    {
        if (currentEntries === null)
        {
            _self.clear();
        }
        else
        {
            _self.render(currentTitle, currentEntries);
        }
    };

    this.render = function(title, entries)
    {
        currentTitle = title;
        currentEntries = entries;

        var container = document.getElementById(containerId);
        if (container === null) return;
        container.innerHTML = "";

        var header = document.createElement("h3");
        header.textContent = (title === null || title === undefined || title === "") ? _("Selection") : title;
        container.appendChild(header);

        for (var i = 0; i < entries.length; i++)
        {
            var entry = entries[i];
            var a = document.createElement("a");
            a.setAttribute("href", "#");
            a.setAttribute("class", "entry");
            a.innerHTML = "<img src='" + entry.img + "' alt='' />" +
                          "<span>" + _(entry.text) + "</span>";
            a.setAttribute("onclick", entry.js + "uimanager.menuOptionClicked();return false;");
            container.appendChild(a);
        }
    };

    this.clear = function()
    {
        currentTitle = null;
        currentEntries = null;

        var container = document.getElementById(containerId);
        if (container === null) return;
        container.innerHTML = "<div class='empty'>" + _("Select an element") + "</div>";
    };

    init();
};
