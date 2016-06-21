/*
 * MidityVimeoLib for embedding Vimeo clips and adding your subtitles
 * Copyright (C) 2010, 2016  Ing. J. Zandbergen, www.midity.com
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
 *      
 * 2016 06 19 John Zandbergen Version 2.0: Major rewrite, now builds on top of the Vimeo Player API. 
 * For information about the Vimeo Player API see: 
 * 		https://github.com/vimeo/player.js
 */
(function(window) {
	function defineMidityVimeoLib() {
		var MidityVimeoLib = {};

		/*
		 * The version of this library, might be helpful when future changes are
		 * done
		 */
		MidityVimeoLib.version = 2.0;

		/*
		 * The subtitles array will store the subtitles of all the Vimeo clips
		 * currently loaded.
		 */
		MidityVimeoLib.subtitles = [];

		/*
		 * This is the public function to be called when subtitles are needed
		 * for a clip
		 */
		MidityVimeoLib.showSubtitles = function(clip_id, newSubtitles, div_id) {
			MidityVimeoLib.subtitles[clip_id] = {
				"theDiv" : div_id,
				"theSubtitles" : newSubtitles
			};
		}

		/*
		 * This is called when the page is fully loaded, so we can add the event
		 * handlers for every vimeo iframe
		 */
		MidityVimeoLib.initialize = function() {
			/* get all the iframe objects */
			var iframeobjects = document.querySelectorAll('iframe');

			/*
			 * Add our playing event handler to all iframes, some wil fail but
			 * we'll catch the errors
			 */
			for (var i = 0; i < iframeobjects.length; i++) {
				var item = iframeobjects[i];
				MidityVimeoLib.addPlayingEvents(item, i);
			}
			;
		}

		/* adds an event handler to a single vimeo iframe */
		MidityVimeoLib.addPlayingEvents = function(item, index) {
			try {
				/* Try to link the player to the movie */
				var player = new Vimeo.Player(item);

				/* Let's add our event handler to the movie
				 * and also add a clip_id attribute to the iframe so we know
				 * which movie triggers events later on
				 */
				player.getVideoId().then(function(id) {
					/*
					 * let's add an eventhandler if we have subtitles for a
					 * movie with this id
					 */
					if (MidityVimeoLib.subtitles[id]) {
						item.clip_id = id;
						player.on('timeupdate', MidityVimeoLib.DuringPlaying);
					}
				}).catch(function(error) {});
			} catch (e) {
				/* this was not a vimeo iframe.... */
			}
		}

		/* This function is called during play. It shows the subtitle */
		MidityVimeoLib.DuringPlaying = function(data) {
			try {
				/* we added the clip_id to the iframe so we can read it fast */
				var clip_id = this.element.clip_id;

				/* the data holds the position of the movie player in seconds */
				var time = data.seconds;

				/* if we have subtitles for this movie, let's show them */
				if (MidityVimeoLib.subtitles[clip_id]) {
					var subtitles = MidityVimeoLib.subtitles[clip_id].theSubtitles;
					var theDiv = MidityVimeoLib.subtitles[clip_id].theDiv;
					for (var i = 0; i < subtitles.length; i++) {
						if ((subtitles[i][0] < time) && (subtitles[i][1] > time)) {
							document.getElementById(theDiv).innerHTML = subtitles[i][2];
							return;
						} else if (subtitles[i][0] > time) {
							document.getElementById(theDiv).innerHTML = "";
						}
					}
				}
			} catch (err) {
			}
		}

		/* Our 'reliable' function to add the onload listener */
		MidityVimeoLib.addEvent = function(el, type, fn) {
			if (el.addEventListener) {
				return el.addEventListener(type, fn, false);
			} else if (window.attachEvent) {
				var f = function() {
					fn.call(el, window.event);
				};
				return el.attachEvent('on' + type, f);
			}
		}

		return MidityVimeoLib;
	}

	/* load the library, we're going to do some initialisation after page-load */
	if (typeof (MidityVimeoLib) === 'undefined') {
		window.MidityVimeoLib = defineMidityVimeoLib();

		/* Initialize after the page is loaded */
		window.MidityVimeoLib.addEvent(window, "load", MidityVimeoLib.initialize);
	}
})(window);