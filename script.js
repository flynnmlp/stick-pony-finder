"use strict";

const $ = document.querySelector.bind(document);
var video;
var selection = null;

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
	
	var list = $("#list");
	list.innerHTML = "";
	
	ponies.forEach(function(pack) {
		pack.names.forEach(function(name, i) {
			if(name.toLowerCase().indexOf(text) === -1) return;
			
			var li = list.appendChild(document.createElement("li"));
			var label = li.appendChild(document.createElement("label"));
			var radio = label.appendChild(document.createElement("input"));
			radio.type = "radio";
			radio.name = "pony";
			radio.addEventListener("change", function() {
				if(radio.checked) {
					video.pauseVideo();
					video.seekTo(pack.t1, true);
					selection = {"pack": pack, "index": i, };
				}
			}, false);
			
			label.appendChild(document.createTextNode(" " + name));
		});
	});
}

function updatePreview() {
	var preview = $("#preview");
	
	if(!selection) {
		preview.style.display = "none";
		return;
	}
	
	var pack = selection.pack;
	var index = selection.index;
	
	var t = video.getCurrentTime();
	
	if(pack.type === "row") {
		var ds = index / pack.names.length - 1;
		
		var dt = pack.t2 - pack.t1;
		// movement speed
		var vx = (pack.x2 - pack.x1) / dt;
		var vy = (pack.y2 - pack.y1) / dt;
		// length of the line
		var lx = pack.x2 - pack.x3 + vx * (pack.t2 - pack.t3);
		var ly = pack.y2 - pack.y3 + vy * (pack.t2 - pack.t3);
		
		var x = pack.x1 + vx * (t - pack.t1) + lx * ds;
		var y = pack.y1 + vy * (t - pack.t1) + ly * ds;
		
		preview.style.display = "";
		preview.style.left = (x*100)+"%";
		preview.style.top  = (y*100)+"%";
		
		var size = Math.abs(lx) * 100;
		preview.style.width = size+"px";
		preview.style.height = size+"px";
		preview.style.transform = `translate(${-size/2}px, ${-size/2}px)`;
	} else {
		console.error("Unknown pony pack type");
	}
}

