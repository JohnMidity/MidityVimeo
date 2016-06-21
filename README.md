# Subtitles for Vimeo movies

## 1. add the scripts to your page
You'll need to add two JavaScripts:

1. Vimeo Player API

2. MidityVimeo

This is put in the head of your HTML:
```html
<script type="text/javascript" src="https://player.vimeo.com/api/player.js"></script>
<script type="text/javascript" src="MidityVimeo.js" ></script>
```

## 2. Add an iframe with the Vimeo shared code and space for subtitles

```html
<iframe src="https://player.vimeo.com/video/9594618" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
<div id="subtitles_9594618"></div>
```

## 3. Add your subtitles like this
```html
<script type="text/javascript">
	var subtitles = [
		[1,10, "<B>Visit De Kift at <a href=\"http://www.dekift.nl\">dekift.nl</B>"],
		[18, 24, "I am building an organ where we can sit in."],
		[290,290,""],
	];
    MidityVimeoLib.showSubtitles(9594618, subtitles, "subtitles_9594618");
</script>
```

## That's it! Have fun.

John Zandbergen, www.midity.com
