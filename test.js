console.log('test.js');
document.addEventListener('DOMContentLoaded', function(){
	['Speaker', 'Close', 'Menu', 'Switch', 'Lock', 'Bucket'].forEach(function(name) {
		var canvas = document.createElement('canvas');
		canvas.setAttribute('width', 50);
		canvas.setAttribute('height', 50);
		canvas.style.border = '1px solid #bbb';
		canvas.style.margin = '5px'
		var ctx = canvas.getContext('2d');
		canvasicon['draw' + name](ctx);
		document.body.appendChild(canvas);
	});
});

