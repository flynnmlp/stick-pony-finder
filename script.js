"use strict";

const $ = document.querySelector.bind(document);
var video;
var selection = null;
var packMap = {};
packs.forEach(function(pack) {
	packMap[pack.name] = pack;
});
var loader = null;

function onYouTubeIframeAPIReady() {
	video = new YT.Player('video', {
		width: '960',
		height: '540',
		videoId: 'wa5GXX8Ei6E',
		playerVars: {
			rel: 0,
			modestbranding: 1,
		},
		events: {
		  //'onStateChange': onPlayerStateChange
		},
	});
	
	$("#search").addEventListener("input", doSearch, false);
	doSearch();
	setInterval(updatePreview, 50);
}

function doSearch() {
	var preview = $("#preview");
	preview.style.display = "none";
	var text = $("#search").value.toLowerCase();
	
	var results = [];
	
	if(loader)
		loader.destroy();
	
	var list = $("#list");
	list.innerHTML = "";
	
	loader = lazyload(ponies.filter(function(pony){
		return pony["pony name"].toLowerCase().indexOf(text) !== -1 || pony["creator name"].toLowerCase().indexOf(text) !== -1;
	}).map(function(pony) {
		var li = list.appendChild(document.createElement("li"));
		if(!packMap[pony.pack])
			li.classList.add("unknown");
		
		var label = li.appendChild(document.createElement("label"));
		var radio = label.appendChild(document.createElement("input"));
		radio.type = "radio";
		radio.name = "pony";
		radio.checked = selection == pony;
		radio.addEventListener("change", function() {
			if(radio.checked) {
				selectPony(pony);
			}
		}, false);
		
		var img = label.appendChild(document.createElement("img"));
		img.classList.add("lazyload");
		img.dataset.src = pony.img;
		
		var div = label.appendChild(document.createElement("div"));
		div.appendChild(document.createTextNode(" " + pony["pony name"]));
		if(pony["creator name"])
			div.appendChild(document.createElement("small")).appendChild(document.createTextNode(" by " + pony["creator name"]));
		
		return img;
	}));
}

function selectPony(pony) {
	var pack = packMap[pony.pack];
	if(!pack) return;
	
	var movement = getMovement(pack, pony);
	var t = video.getCurrentTime();
	
	if(t < movement.t_in || t > movement.t_out) {
		video.pauseVideo();
		setTimeout(function() {
			video.seekTo((movement.t_in + movement.t_out) / 2, true);
		}, 100);
	}
	
	selection = pony;
	updatePreview();
}

function updatePreview() {
	var preview = $("#preview");
	
	var pony = selection;
	
	if(!pony) {
		preview.style.display = "none";
		return;
	}
	
	var pack = packMap[pony.pack];
	if(!pack) return;
	
	var t = video.getCurrentTime();
	var movement = getMovement(pack, pony);
	
	if(t > movement.t_out || t < movement.t_in) {
		preview.style.display = "none";
		return;
	}
	
	preview.style.left = (movement.getX(t)*100)+"%";
	preview.style.top  = (movement.getY(t)*100)+"%";
	
	var size = Math.abs(movement.lx) * 100;
	preview.style.width = size+"px";
	preview.style.height = size+"px";
	preview.style.transform = `translate(${-size/2}px, ${-size/2}px)`;
	preview.style.display = "";
}

