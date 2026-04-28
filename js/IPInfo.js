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

function isValidIPv4(ipv4)
{
    var result = false;
    if (ipv4 !== null)
    {
        var parts = ipv4.split(".");
        if (parts.length === 4)
        {
            var allDigits = /^\d+$/;
            result = true;
            for (var i = 0; i < 4; i++)
            {
                if (!allDigits.test(parts[i])) { result = false; break; }
                var n = parseInt(parts[i], 10);
                if (n < 0 || n > 255) { result = false; break; }
            }
        }
    }
    else
    {
        result = true;
    }

    return result;
}

function isValidHostname(hostname)
{
    if (hostname === null || hostname === "") return false;
    var labelRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?$/;
    var labels = hostname.split(".");
    for (var i = 0; i < labels.length; i++)
    {
        if (!labelRegex.test(labels[i])) return false;
    }
    return true;
}

function ipStringToInt(ip) 
{
    var result = null;
    if (ip !== null) 
    {
        var parts = ip.split(".");
        
        result = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | (parts[3]);
    }
    
    return result;
}

function ipIntToString(ip) 
{
    result = null;
    
    if (ip !== null) 
    {
        var byte1 = ip & 0XFF;
        var byte2 = ip >> 8 & 0xFF;
        var byte3 = ip >> 16 & 0xFF;
        var byte4 = ip >> 24 & 0xFF;
        
        result = byte4 + "." + byte3 + "." + byte2 + "." + byte1;
    }
    
    return result;
}

var IPInfo = function() 
{
    var IPv4 = null;
    var DNS1 = null;
    var DNS2 = null;
    var netmask = null;
    var static = false;
    
    this.save = function() 
    {
        var result = {};
        result.IPv4 = static ? IPv4 : null;
        result.DNS1 = static ? DNS1 : null;
        result.DNS2 = static ? DNS2 : null;
        result.netmask = static ? netmask : null;
        result.static = static;
        
        return result;
    };
    
    this.load = function(data) 
    {
        if (data != null) 
        {
            IPv4 = data.IPv4;
            DNS1 = data.DNS1;
            DNS2 = data.DNS2;
            netmask = data.netmask;
            static = data.static;
        }
    };
    
    this.sameNetwork = function(ip) 
    {
        var result = false;
        if ((IPv4 !== null) && (netmask !== null) && isValidIPv4(ip)) 
        {
            //console.log("Is "+ip+" in my network "+ipIntToString(IPv4)+"?");
            var intip = ipStringToInt(ip);
            var testnetwork = intip & netmask;
            var thisnetwork = IPv4 & netmask;
            result = testnetwork === thisnetwork;
        }
        return result;
    };
    
    this.setIPv4 = function(ipv4) 
    {
        if (isValidIPv4(ipv4)) 
        {
            IPv4 = ipStringToInt(ipv4);
        }
    };
    
    this.setNetmask = function(mask) 
    {
        if (isValidIPv4(mask)) 
        {
            netmask = ipStringToInt(mask);
        }
    };
    
    this.setDNS1 = function(dns) 
    {
        if (isValidIPv4(dns)) 
        {
            DNS1 = ipStringToInt(dns);
        }
    };
    
    this.setDNS2 = function(dns) 
    {
        if (isValidIPv4(dns)) 
        {
            DNS2 = ipStringToInt(dns);
        }
    };
    
    this.setStatic = function(s) 
    {
        static = s;
    };
    
    this.getIPv4 = function() 
    {
        return ipIntToString(IPv4);
    };
    
    this.getDNS1 = function() 
    {
        return ipIntToString(DNS1);
    };
    
    this.getDNS2 = function() 
    {
        return ipIntToString(DNS2);
    };
    
    this.getNetmask = function() 
    {
        return ipIntToString(netmask);
    };
    
    this.getStatic = function() 
    {
        return static;
    };
};
