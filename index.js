$(function(){
	var animations = [];
	var w = 200;
	var h = 200;
	var cubicInOut = Math.easeInOutCubic = function (keytime) {
		keytime /= 0.5; if (keytime < 1) return 0.5 * keytime * keytime * keytime;
		keytime -= 2; return 0.5 * (keytime * keytime * keytime + 2);
	};

	[{ name: 'Speaker', transition: 'volume', step: 1/4, duration: 3000, easing: cubicInOut }, 
	 { name: 'Close' }, 
	 { name: 'Menu' }, 
	 { name: 'Switch', transition: 'switch', duration: 1000, easing: cubicInOut }, 
	 { name: 'Lock', transition: 'unlocked', step: 0.5, duration: 1000 }, 
	 { name: 'Bucket' }
	 ].forEach(function(i) {
		var $c = $('<canvas>')
			.attr('width', w)
			.attr('height', h)
			.css('border', '1px solid #bbb')
			.css('margin', '5px')
			.css('display', 'inline-block')
			.appendTo('#output');
		i.ctx = $c.get(0).getContext('2d');
		if (i.transition) 
			animations.push(i);
		canvasicon['draw' + i.name](i.ctx, { width: w, height: h });
	});

	var start = new Date().getTime();
	setInterval(function() {
		var duration = new Date().getTime() - start;
		animations.forEach(function(i) {
			var animationDuration = i.duration || 1000;
			var keytime = ((duration % animationDuration) / (animationDuration));
			keytime = keytime > 0.5 ? (1 - keytime) * 2 : keytime * 2;
			if (i.easing) keytime = i.easing(keytime);
			var style = {};
			var v = i.step ? Math.floor(keytime / i.step) * i.step : keytime;
			style.width = w;
			style.height = h;
			style[i.transition] = v;
			i.ctx.clearRect(0, 0, w, h);
			canvasicon['draw' + i.name](i.ctx, style);
		});
	}, 50);
});

