/*
 * This file is part of the Education Network Simulator project and covered
 * by GPLv3 license. See full terms in the LICENSE file at the root folder
 * or at http://www.gnu.org/licenses/gpl-3.0.html.
 *
 * (c) 2015 Jorge García Ochoa de Aspuru
 * bardok@gmail.com
 *
 * Images are copyrighted by their respective authors and have been
 * downloaded from http://pixabay.com/
 *
 */

var AnimationControls =
{
    MSG_ADVANCE_PRE: 0,
    MSG_ADVANCE: 2,
    setSpeed: function(multiplier)
    {
        this.MSG_ADVANCE *= multiplier;
        if (this.MSG_ADVANCE > 16)
        {
            this.MSG_ADVANCE = 16;
        }
        else if (this.MSG_ADVANCE < 0.125)
        {
            this.MSG_ADVANCE = 0.125;
        }
    },
    playPause: function()
    {
        var tmp = this.MSG_ADVANCE;
        this.MSG_ADVANCE = this.MSG_ADVANCE_PRE;
        this.MSG_ADVANCE_PRE = tmp;
    }
};

function createControlsWindow()
{
    uimanager.getNavbar().setRightEntries([
        { img: "img/64/minus.png",     text: "Slow",       js: "AnimationControls.setSpeed(0.5);" },
        { img: "img/64/playpause.png", text: "Play/Pause", js: "AnimationControls.playPause();" },
        { img: "img/64/plus.png",      text: "Fast",       js: "AnimationControls.setSpeed(2);" }
    ]);
}
