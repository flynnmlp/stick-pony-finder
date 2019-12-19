"use strict";

const $ = document.querySelector.bind(document);
var video;
var timer = null;

var currentPack = null;
var previewPack = null, previewPony = null;
var packNames = new Set;
ponies.forEach(pony => packNames.add(pony.pack));

function onYouTubeIframeAPIReady() {
	video = new YT.Player('video', {
		width: '960',
		height: '620',
		videoId: 'wa5GXX8Ei6E',
		playerVars: {
			rel: 0,
			modestbranding: 1,
		},
		events: {
			onStateChange: onPlayerStateChange
		},
	});
	
	$("#overlay").addEventListener("click", onOverlayClick, false);
	
	var select = $("#packs");
	select.addEventListener("change", onPackSelected, false);
	packNames.forEach(pack => {
		var option = select.appendChild(document.createElement("option"));
		option.text = pack;
		option.value = pack;
	});
	packNames.selectedIndex = 0;
	onPackSelected();
}

function onPlayerStateChange(event) {
	onTimeUpdate();
	
	clearInterval(timer);
	timer = setInterval(onTimeUpdate, (event.data == YT.PlayerState.PLAYING) ? 50 : 500);
}

function onTimeUpdate() {
	updateOverlay();
	preview(previewPony);
}

function updateOverlay() {
	var time = video.getCurrentTime();
	$("#overlay").style.display = (time > 110 && time < 220 && !("t3" in currentPack)) ? "block" : "";
}

function updatePreview() {
	var pack = $("#pack");
	pack.innerHTML = "";
	
	if(!previewPack) {
		$("#preview").style.display = "none";
		return;
	}
	
	getPonies(previewPack.name).forEach(function(pony) {
		var item = pack.appendChild(document.createElement("div"));
		var img = item.appendChild(document.createElement("img"));
		img.src = "../" + pony.img;
		
		item.appendChild(document.createTextNode(pony["pony name"]));
		item.appendChild(document.createElement("br"));
		item.appendChild(document.createTextNode(pony["creator name"]));
		
		item.addEventListener("mouseover", function() { preview(pony); }, false);
		item.addEventListener("mouseout",  function() { preview(null); }, false);
	});
}

function preview(pony) {
	var preview = $("#preview");
	previewPony = pony;
	
	if(!(pony && previewPack)) {
		preview.style.display = "none";
		return;
	}
	
	var pack = previewPack;
	
	var t = video.getCurrentTime();
	var movement = getMovement(pack, pony);
	
	if(t > movement.t_out || t < movement.t_in) {
		preview.style.display = "none";
		return;
	}
	
	preview.style.left = (movement.getX(t)*100)+"%";
	preview.style.top  = (movement.getY(t)*100)+"%";
	
	var size = Math.abs(movement.lx) * 125;
	preview.style.width = size+"px";
	preview.style.height = size+"px";
	preview.style.transform = `translate(${-size/2}px, ${-size/2}px)`;
	preview.style.display = "";
}

function onPackSelected() {
	currentPack = {
		type: "row",
		name: $("#packs").value,
	};
	
	onPackChanged();
	$("#video").focus();
}

function onPackChanged() {
	var message = $("#message");
	
	var ponies = getPonies(currentPack.name);
	
	if(!("t1" in currentPack)) {
		var pony = ponies[0];
		message.textContent = "click on " + pony["pony name"] + " on the *first* frame they appear.";
		message.appendChild(document.createElement("img")).src = "../" + pony.img;
	} else if(!("t2" in currentPack)) {
		var pony = ponies[0];
		message.textContent = "click on " + pony["pony name"] + " on the *last* frame they appear.";
		message.appendChild(document.createElement("img")).src = "../" + pony.img;
	} else if(!("t3" in currentPack)) {
		var pony = ponies.pop();
		message.textContent = "click on " + pony["pony name"] + " on the *last* frame they appear.";
		message.appendChild(document.createElement("img")).src = "../" + pony.img;
	} else {
		message.textContent = "select a pack"
	}
	
	$("#output").value = JSON.stringify(currentPack, null, 2);
}

function onOverlayClick(event) {
	updateOverlay();
	
	$("#video").focus();
	
	var rect = event.target.getBoundingClientRect();
	// compensate for 3px red border
	rect.x += 3;
	rect.y += 3;
	rect.width -= 6;
	rect.height -= 6;
	
	var time = video.getCurrentTime();
	var x = (event.clientX - rect.x) / rect.width;
	var y = (event.clientY - rect.y) / rect.height;
	
	if(!("t1" in currentPack)) {
		currentPack.t1 = time;
		currentPack.x1 = x;
		currentPack.y1 = y;
	} else if(!("t2" in currentPack)) {
		currentPack.t2 = time;
		currentPack.x2 = x;
		currentPack.y2 = y;
	/*} else if(!("lastStart" in currentPack)) {
		currentPack.lastStart = time;
		currentPack.lastStartX = x;
		currentPack.lastStartY = y;*/
	} else if(!("t3" in currentPack)) {
		currentPack.t3 = time;
		currentPack.x3 = x;
		currentPack.y3 = y;
		previewPack = currentPack;
		updatePreview();
	} else {
	}
	
	onPackChanged();
}

