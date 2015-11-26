/*! canvasicon.js - MIT License - (c) 2015 Retorillo */
var canvasicon = new function (undefined) {
	var canvasicon = this;
	function initprops(obj, setters) {
		obj = obj || {};
		[ { name: 'x',      value: 0 }, 
		  { name: 'y',      value: 0 },
		  { name: 'width',  value: canvasicon.defaultSize },
		  { name: 'height', value: canvasicon.defaultSize }
		].forEach(function(i) { setters.push(i); });
		setters.forEach(function(setter) {
			obj[setter.name] = obj[setter.name] || setter.value;
		});
		return obj;
	}
	function Rect(x, y, w, h){
		this.x = x || 0; this.y = y || 0; this.w = w || 0; this.h = h || 0;
		this.resize = function(w, h) { var t = this; var cx = t.cx, cy = t.cy; t.w = w; t.h = h; t.cx = cx; t.cy = cy; return t; }
		this.inflate = function (x, y) { var t = this; t.x -= x / 2; t.w += x; t.y -= y / 2; t.h += y; return t; }
		this.offset  = function (x, y) { var t = this; t.x += x; t.y += y; return t; }
		this.clone = function() { return new Rect(this.x, this.y, this.w, this.h); }
		var toarray = function (list) { var a = []; for (var c = 0 ; c < list.length; c++) a.push(list[c]); return a; }
		var split = function(ratio, y, h) {
			var r = [], tr = 0; y = y || 'y'; h = h || 'h'; ratio.forEach(function(r) { tr += r });
			for (var c = 0, sy = this[y], sh = this[h] / tr; c < ratio.length; sy += r[c][h], c++) {
				r[c] = this.clone(); r[c][y] = sy; r[c][h] = sh * ratio[c];
			}
			return 	r;
		}
		this.split  = function() { return split.apply(this, [toarray(arguments)]); }
		this.vsplit = function() { return split.apply(this, [toarray(arguments), 'x', 'w']); }
		Object.defineProperties(this, {
			cx: { get: function()  { return this.x + this.w / 2; },
			      set: function(v) { this.x = v - this.w / 2; } },
			cy: { get: function()  { return this.y + this.h / 2; },
			      set: function(v) { this.y = v - this.h / 2; } },
			r:  { get: function()  { return this.x + this.w; } },
			b:  { get: function()  { return this.y + this.h; } },
		});
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
		function deg2rad (deg) { return (deg / 180) * Math.PI }
		obj.arcd = function(cx, cy, r, d1, d2) { this.arc(cx, cy, r, deg2rad(d1), deg2rad(d2)); return this; }
		// WARNING: polygon method is experimental
		obj.polygon = function (toolHandler) {
			var _tool = {};
			var _x = 0, _y = 0, _c = 0;
			tool.mv(function(x, y, absolute) {
				if (absolute) { _x = x; _y = y; }
				else { _x += x, _y += y; }
				if (_c++ == 0) obj.bp().mt(_x, _y);
				else obj.lt(_x, _y);
			});
			toolHandler.apply(this, [_tool]);
			if (_c > 0) obj.cp();
			return this;
		}
		obj.cross = function (x, y, width, height){
			this.bp().mt(x, y).lt(x + width, y + width).mt(x + width, y).lt(x, y + width).s().cp();
			return this;
		}
		return obj;
	}
	canvasicon.defaultSize = 50;
	canvasicon.primaryColor = '#000';
	canvasicon.dangerColor  = '#b02';
	canvasicon.drawSpeaker = function (ctx, style) {
		style = initprops(style, [
			{ name: 'volume',             value: 1 },
			{ name: 'bodyColor',          value: canvasicon.primaryColor },
			{ name: 'waveColors',         value: [canvasicon.primaryColor, canvasicon.primaryColor, canvasicon.primaryColor] },
			{ name: 'crossColor',         value: canvasicon.dangerColor },
			{ name: 'bodyWidthRate',      value: 0.5 },           // Body width rate as compated with size
			{ name: 'bodyHeightRate',     value: 0.8 },           // Body height rate as compared with size
			{ name: 'neckWidthRate',      value: 0.4 },           // Neck width rate compared with body width
			{ name: 'neckHeightRate',     value: 0.5 },           // Neck height rate compared with body height
			{ name: 'waveThicknessRate',  value: 0.1 },           // Wave thickness rate compared with size
			{ name: 'waveArcDegree',      value: Math.PI * 0.6 },
			{ name: 'waveCapStyle',       value: 'round' }, 
			{ name: 'crossMarginRate',    value: 0.2 },           // Cross margin compared with (width - body)
			{ name: 'crossHPosRate',      value: 1 },             // Cross horizontal position rate (1 is center)
			{ name: 'crossVPosRate',      value: 1 },             // Cross vertical position rate (1 is middle)
			{ name: 'crossThicknessRate', value: 0.1 },           // Cross thickness rate compared with size
			{ name: 'crossCapStyle',      value: 'round' },
			{ name: 'boundary',           value: false },
		]);
		var $ctx = canvasicon.$(ctx);
		var size = Math.min(style.width, style.height);
		var body_w  = style.bodyWidthRate * size;
		var x = style.x + (style.width - size) / 2;
		var y = style.y + (style.height - size) / 2;
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
		    .mt(x, y + (0.5 - 0.5 * style.neckHeightRate) * size + body_ym)
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
			    (index > 1 && style.volume < 0.66)) return;
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
			$ctx.ss(style.crossColor).cross(x + cross_x + offset_x, y + offset_y, cross_s, cross_s);
		}
	}
	canvasicon.drawClose = function (ctx, style) {
		style = initprops(style, [
			{ name: 'color',         value: canvasicon.primaryColor },
			{ name: 'cap',           value: 'round' },
			{ name: 'thicknessRate', value: 0.15 }, // Thickness rate compared with size 
			{ name: 'marginRate',    value: 0.10 }, // Margin rate compared with size

		]);
		var $ctx = canvasicon.$(ctx);
		var size = Math.min(style.width, style.height);
		var x = style.x + (style.width - size) / 2;
		var y = style.y + (style.height - size) / 2;
		var t = style.thicknessRate * size;
		var m = style.marginRate * size;
		$ctx.lw(t).lc(style.cap).ss(style.color).cross(x + t + m, y + t + m, style.width - 2 * (t + m), style.height - 2 * (t + m));
	}
	canvasicon.drawMenu = function (ctx, style) {
		style = initprops(style, [
			{ name: 'color',         value: canvasicon.primaryColor },
			{ name: 'cap',           value: 'round' },
			{ name: 'thicknessRate', value: 0.15 }, // Thickness rate compared with size 
			{ name: 'lineGap',       value: 0.25 }, // Line gap (0.5 is longest, 0 is none)
		]);
		var $ctx = canvasicon.$(ctx);
		var size = Math.min(style.width, style.height);
		var x = style.x + (style.width - size) / 2;
		var y = style.y + (style.height - size) / 2;
		var t = style.thicknessRate * size;
		var line = function(y) { $ctx.lw(t).lc(style.cap).ss(style.color).bp().mt(x + t, y).lt(x + style.width - t, y).s().cp(); };
		[(0.5 - style.lineGap), 0.5, (0.5 + style.lineGap)].forEach(function(hr) { line(y + hr * style.height) });
	}
	canvasicon.drawSwitch = function (ctx, style) {
		style = initprops(style, [
			{ name: 'borderColor',     value: canvasicon.primaryColor },
			{ name: 'toggleColor',     value: canvasicon.primaryColor },
			{ name: 'cap',             value: 'round' },
			{ name: 'backgroundColor', value: 'transparent' },
			{ name: 'switch',          value: 0 },    // 0 is off, 1 is on
			{ name: 'thicknessRate',   value: 0.08 }, // Thickness rate compared with width 
			{ name: 'cornerRate',      value: 0.20 },
		]);
		var bounds = new Rect(0, 0, style.width, style.height);
		var t = style.thicknessRate * bounds.w;
		var cr = style.cornerRate;
		bounds.inflate(-t, -t).resize(bounds.w, cr * bounds.w * 2); 
		var cells = bounds.vsplit(cr, 1 - cr * 2, cr);
		var $ctx = canvasicon.$(ctx);
		$ctx.lw(t).lc(style.cap).ss(style.borderColor).fs(style.backgroundColor).bp()
			.arcd(cells[0].r, cells[0].cy, cells[0].w, 90, 270).lt(cells[1].r, cells[1].y)
			.arcd(cells[2].x, cells[2].cy, cells[2].w, 270, 90).lt(cells[1].x, cells[1].b)
			.f().s().cp().fs(style.toggleColor).bp()
			.arcd(cells[1].x + cells[1].w * style.switch, cells[1].cy, cells[0].w - t, 0, 360)
			.f().cp();
	}
};
