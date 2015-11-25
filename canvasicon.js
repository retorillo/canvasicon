/*! canvasicon.js - MIT License - (c) 2015 Retorillo */
var canvasicon = new function (undefined) {
	var canvasicon = this;
	function initprops(obj, setters) {
		obj = obj || {};
		setters.forEach(function(setter) {
			obj[setter.name] = obj[setter.name] || setter.value;
		});
		return obj;
	}
	canvasicon.$ = function (ctx) {
		var obj = {};
		obj.ctx = ctx;
		[ { l: 'beginPath',   s: 'bp' }, 
		  { l: 'closePath',   s: 'cp' },
		  { l: 'lineTo',      s: 'lt' },
		  { l: 'moveTo',      s: 'mt' },
		  { l: 'fill',        s: 'f'  },
		  { l: 'rect',        s: 'r'  },
		  { l: 'arc',         s: 'a'  },
		  { l: 'stroke',      s: 's'  },
		  { l: 'fillStyle',   s: 'fs', p: true },
		  { l: 'strokeStyle', s: 'ss', p: true },
		  { l: 'lineWidth',   s: 'lw', p: true },
		  { l: 'lineCap',     s: 'lc', p: true },
		].forEach(function(d) {
			obj[d.s] = d.p ? function() { this.ctx[d.l] = arguments[0]; return obj; }
				       : function() { this.ctx[d.l].apply(this.ctx, arguments); return obj; }
			obj[d.l] = obj[d.s];
		});
		return obj;
	}
	canvasicon.defaultSize = 50;
	canvasicon.primaryColor = '#000';
	canvasicon.dangerColor  = '#b02';
	canvasicon.drawSpeaker = function (ctx, style) {
		style = initprops(style, [
			{ name: 'x',                  value: 0 },
			{ name: 'y',                  value: 0 },
			{ name: 'height',             value: canvasicon.defaultSize },
			{ name: 'width',              value: canvasicon.defaultSize },
			{ name: 'volume',             value: 0 },
			{ name: 'bodyColor',          value: (style && style.volume) ? canvasicon.primaryColor : canvasicon.dangerColor },
			{ name: 'waveColors',         value: [canvasicon.primaryColor, canvasicon.primaryColor, canvasicon.primaryColor] },
			{ name: 'crossColor',         value: canvasicon.dangerColor },
			{ name: 'bodyWidthRate',      value: 0.5 },           // Body width rate as compated with size
			{ name: 'bodyHeightRate',     value: 0.8 },           // Body height rate as compared with size
			{ name: 'neckWidthRate',      value: 0.4 },           // Neck width rate compared with body width
			{ name: 'neckHeightRate',     value: 0.5 },           // Neck height rate compared with body height
			{ name: 'waveThicknessRate',  value: 0.1 },           // Wave thickness rate compared with size
			{ name: 'waveArcDegree',      value: Math.PI * 0.6 },
			{ name: 'waveCapStyle',       value: "round" }, 
			{ name: 'crossMarginRate',    value: 0.2 },           // Cross margin compared with (width - body)
			{ name: 'crossHPosRate',      value: 1 },             // Cross horizontal position rate (1 is center)
			{ name: 'crossVPosRate',      value: 1 },             // Cross vertical position rate (1 is middle)
			{ name: 'crossThicknessRate', value: 0.1 },           // Cross thickness rate compared with size
			{ name: 'crossCapStyle',      value: "round" },
			{ name: 'boundary',           value: false },
		]);
		var $ctx = canvasicon.$(ctx);
		var size = Math.min(style.width, style.height);
		var body_w  = style.bodyWidthRate * size;
		var x = style.x + (style.width - size) / 2;
		var y = style.x + (style.height - size) / 2;
		var wave_t  = style.waveThicknessRate * size; // wave thickness
		var cross_t = style.crossThicknessRate * size; // mute thickness
		var body_ym = (style.height - (style.bodyHeightRate * size)) / 2;  // y margin
		var wave_r  = (1 - style.bodyWidthRate) * size; // wave radius
		// Draw Boundary
		if (style.boundary) 
			$ctx.fs('red').rect(0,0,width,height);
		// Draw Speaker Body
		$ctx.fs(style.bodyColor)
		    .bp()
		    .mt(x, y + (1 - style.neckHeightRate) / 2 * size + body_ym)
		    .lt(x, y + (0.5 + 0.5 * style.neckHeightRate) * size - body_ym)
		    .lt(x + body_w * style.neckWidthRate, y + (0.5 + 0.5 * style.neckHeightRate) * size - body_ym)
		    .lt(x + body_w, y + size - body_ym)
		    .lt(x + body_w, y + body_ym)
		    .lt(x + body_w * style.neckWidthRate, y + (0.5 - 0.5 * style.neckHeightRate) * size + body_ym)
		    .cp()
		    .f();
		// Draw Wave
		$ctx.lw(wave_t).lc(style.waveCapStyle);
		[0.4, 0.7, 1].forEach(function (radius, index) {
			if (style.volume <= 0 || (index > 0 && style.volume < 0.33) ||
			    (index > 1 && volume < 0.66)) return;
			var cx = body_w;
			var cy = size / 2;
			var start = (Math.PI - style.waveArcDegree) / 2 - Math.PI / 2
			var end = start + style.waveArcDegree;
			$ctx.ss(style.waveColors[index])
			    .bp()
			    .arc(x + cx, y + cy, wave_r * radius - wave_t / 2, start, end)
			    .s()
			    .cp();
		});
		// Draw Cross
		$ctx.lw(cross_t).lc(style.crossCapStyle);
		if (!style.volume) {
			var cross_x = body_w;
			var cross_s = size - cross_x; //cross size
			var crossMargin = cross_s * style.crossMarginRate;
			cross_s -= crossMargin * 2;
			var offset_x = crossMargin * style.crossHPosRate;
			var offset_y = size * (style.crossVPosRate - 0.5) - cross_s / 2;
			$ctx.ss(style.crossColor)
			    .bp()
			    .mt(x + cross_x + offset_x, y + offset_y) //lt
			    .lt(x + cross_x + cross_s + offset_x, y + cross_s + offset_y) //rb
			    .mt(x + cross_x + cross_s + offset_x, y + offset_y) //rt
			    .lt(x + cross_x + offset_x, y + cross_s + offset_y) //lb
			    .s()
			    .cp();
		}
	}
};
