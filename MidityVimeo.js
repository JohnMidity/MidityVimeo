/*
 * MidityVimeoLib for embedding Vimeo clips and adding your subtitles
 * Copyright (C) 2010  Ing. J. Zandbergen, www.midity.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * 2010 03 12 John Zandbergen
 *      Version 1.0: with the ability to have several movies on 1 page
 */
var MidityVimeoLib = {
    /* add an event to an object */
    addEvent: function() {
        if (window.addEventListener) {
            return function(el, type, fn) {
                el.addEventListener(type, fn, false);
            };
        } else if (window.attachEvent) {
            return function(el, type, fn) {
                var f = function() {
                    fn.call(el, window.event);
                };
                el.attachEvent('on' + type, f);
            };
        }
    }(),

    /* Initialize the library, which searches the page to make all moogaloop objects scriptable */
    initialize: function(){
        /* Get all embedded objects, we will scan through them to find the vimeo moogaloop.swf's */
        var objecten = document.getElementsByTagName("embed");
        var swfObjects = new Array();
        for(var i=0; i<objecten.length; i++)
        {
            if ( objecten[i].src.substr(0, "http://vimeo.com/moogaloop.swf".length) == "http://vimeo.com/moogaloop.swf")
            {
                // We found a moogaloop swf object
                swfObjects[swfObjects.length] = objecten[i];
            }
        }

        /* now we know the objects, let's replace them with loaded items */
        for(i=0; i<swfObjects.length; i++)
        {
            MidityVimeoLib.replace(swfObjects[i]);
        }
    },

    /* Replace an embedded moogaloop with a scriptable moogaloop */
    replace: function(embedObject){
        /* let's replace the embedded movie with a dynamically loaded one */
        /* first parse the data of the embedded swf */
        var parsedURI = MidityVimeoLib.parseURI(embedObject.src);

        /* first create a new div in which we are placing the new swf */
        var theNewDiv = document.createElement('div');
        theNewDiv.setAttribute("id", "MidityVimeo_" + parsedURI["options"]["clip_id"]);
        var width = embedObject.getAttribute("width");
        var height = embedObject.getAttribute("height");

        /*
         * everything is prepared. But due to the difference of objects in IE and others, we need
         * different approaches to replace the object.
         */
        if (embedObject.parentNode.tagName.toUpperCase() == "OBJECT")
        {
            /* We need to replace the parent node of the embed */
            embedObject.parentNode.parentNode.replaceChild(theNewDiv, embedObject.parentNode);
        }else{
            /* we need to replace the object itself */
            embedObject.parentNode.replaceChild(theNewDiv, embedObject);
        }

        var flashvars = {
            clip_id: parsedURI["options"]["clip_id"],
            show_portrait: parsedURI["options"]["show_portrait"],
            show_byline: parsedURI["options"]["show_byline"],
            show_title: parsedURI["options"]["show_title"],
            js_api: 1, 
            js_onLoad: 'MidityVimeoLib.loaded',
            js_swf_id: parsedURI["options"]["clip_id"]
        };
        var fullScreenAllowed = (parsedURI["options"]["fullscreen"]==1?'true':'false');
        var params = {
            allowscriptaccess: 'always',
            allowfullscreen: fullScreenAllowed
        };

        var attributes = {};

        swfobject.embedSWF(parsedURI["page"], "MidityVimeo_" + parsedURI["options"]["clip_id"], width, height, "9.0.0","expressInstall.swf", flashvars, params, attributes);
    },

    /* parse the url to a structured object */
    parseURI: function(URI){
        URI = decodeURI(URI);
        var r = URI.split("?");
        var keyvalues = r[1].split("&");
        var parsed = {
            "page":r[0],
            "options":{}
        };
        for(var i=0; i<keyvalues.length; i++)
        {
            var pair = keyvalues[i].split("=");
            parsed["options"][pair[0]] = pair[1];
        }
        return parsed;
    },

    /* this function is called after the newly embedded moogaloop is ready */
    loaded: function(swf_id){
        theSWF = document.getElementById("MidityVimeo_" + swf_id);
        theSWF.api_addEventListener('onProgress', 'MidityVimeoLib.onPlaying');
    },

    /* these are functions and variables to support subtitles */
    /* the subtitles are stored in here */
    subtitles: {},

    /* Call this function to attach subtitles to a movie */
    showSubtitles: function(clip_id, newSubtitles, div_id){
        MidityVimeoLib.subtitles[clip_id] = {
            "theDiv": div_id,
            "theSubtitles": newSubtitles
        };
    },

    /* This function is called during play. It shows the subtitle */
    onPlaying: function(time, clip_id){
        /* TODO: review code */
        if (MidityVimeoLib.subtitles[clip_id]){
            var subtitles = MidityVimeoLib.subtitles[clip_id].theSubtitles;
            var theDiv = MidityVimeoLib.subtitles[clip_id].theDiv;
            for(var i=0; i<subtitles.length; i++)
            {
                if ((subtitles[i][0] < time ) && (subtitles[i][1] > time))
                {
                    document.getElementById(theDiv).innerHTML = subtitles[i][2];
                    return;
                } else if (subtitles[i][0] > time ){
                    document.getElementById(theDiv).innerHTML = "";
                }
            }
        }
    }
}

MidityVimeoLib.addEvent(window, "load", MidityVimeoLib.initialize);
