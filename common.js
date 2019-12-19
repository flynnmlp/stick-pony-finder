function getPonies(packName) {
	return ponies.filter(pony => pony.pack == packName).sort((a,b)=>a.position - b.position);
}

function getMovement(pack, pony) {
	if(pack.type === "row") {
		var numPonies = getPonies(pony.pack).length;
		
		var ds = numPonies == 1 ? 0 : (pony.position - 1) / (numPonies - 1);
		
		var dt21 = pack.t2 - pack.t1;
		// movement speed
		var vx = (pack.x2 - pack.x1) / dt21;
		var vy = (pack.y2 - pack.y1) / dt21;
		// y intercept for first pony
		var intercept_x1 = pack.x1 - pack.t1 * vx;
		var intercept_y1 = pack.y1 - pack.t1 * vy;
		// y intercept for last pony
		var intercept_x2 = pack.x3 - pack.t3 * vx;
		var intercept_y2 = pack.y3 - pack.t3 * vy;
		
		// effective intercept
		var intercept_x = intercept_x1 * (1-ds) + intercept_x2 * ds;
		var intercept_y = intercept_y1 * (1-ds) + intercept_y2 * ds;
		
		function getX(t) {
			return intercept_x + vx * t;
		}
		function getY(t) {
			return intercept_y + vy * t;
		}
		
		var lx = intercept_x1 - intercept_x2;
		var ly = intercept_y1 - intercept_y2;
		
		var t_in  = Math.max(pack.t1,   -intercept_x /vx) - 1/24;
		var t_out = Math.min(pack.t3, (1-intercept_x)/vx) + 1/24;
		
		return {
			getX: getX,
			getY: getY,
			lx: lx,
			ly: ly,
			t_in: t_in,
			t_out: t_out,
		};
	} else {
		throw "Unknown pony pack type."
	}
}


