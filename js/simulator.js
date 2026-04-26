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

function newElement(type)
{
    var pos = nextElementPosition();
    switch (type)
    {
        case "host":
            network.createComputer(pos.x, pos.y);
            break;
        case "dns":
            network.createDNSServer(pos.x, pos.y);
            break;
        case "dhcp":
            network.createDHCPServer(pos.x, pos.y);
            break;
        case "web":
            network.createHTTPServer(pos.x, pos.y);
            break;
        case "switch":
            network.createSwitch(pos.x, pos.y, 8);
            break;
        case "router":
            network.createRouter(pos.x, pos.y);
            break;
    }
}

var _newElementCounter = 0;
function nextElementPosition()
{
    var col = _newElementCounter % 8;
    var row = Math.floor(_newElementCounter / 8) % 6;
    _newElementCounter++;
    return { x: 20 + col * 90, y: 60 + row * 90 };
}

function simulator(imgs) 
{
    images = imgs;
    var container = document.getElementById("simcontainer");
    var canvas = document.getElementById("simcanvas");
    
    var W = container.offsetWidth * window.devicePixelRatio;
    var H = container.offsetHeight * window.devicePixelRatio;
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext("2d", {antialias: true});
    
    uimanager = new UIManager();

    network = new Network(images, ctx, W, H);
    network.init();
    
    if (NetworkSimulator.initialdata !== null)
    {
      network.load(NetworkSimulator.initialdata);
    }

    createControlsWindow();
}

