var eraser_radius = 6;
var stroke_width = 3;
var line = d3.svg.line();
var paths = [];
var erase_path = {};
var eraseMode = false;
var drawMode = true;
var eraseBtn = document.getElementById('erase');
var drawBtn = document.getElementById('draw');
var socket = io();

var svg = d3.select("body").append("svg");

var mtouch = mtouch_events()
	.on('touch', touch)
	.on('drag', drag)
	.on('release', release);


var overlay =
	svg.append('rect')
		.attr("width", window.innerWidth)
		.attr("height", window.innerHeight)
		.call(mtouch);

var g_paths =
	svg.append('g')
		.attr('id', 'paths');

var g_erase = svg.append('g')
	.attr('id', 'erase');

mtouch.frame(overlay.node());

function init () {
	bindEvents();
	socketManager();
	update(paths);
}

function socketManager () {
	socket.on('update drawing', function(data) {
		paths = data;
		update(paths);
	});
}

function bindEvents () {
	eraseBtn.addEventListener('mousedown', function(event) {
		event.target.classList.add('active');
		drawBtn.classList.remove('active');

		drawMode = false;
		eraseMode = true;
	});

	drawBtn.addEventListener('mousedown', function(event) {
		event.target.classList.add('active');
		eraseBtn.classList.remove('active');

		drawMode = true;
		eraseMode = false;
	});
}

function viewportWidth () {
	if (window.innerWidth) return window.innerWidth;
	var
		doc = document,
		html = doc && doc.documentElement,
		body = doc && (doc.body || doc.getElementsByTagName("body")[0]),
		getWidth = function (elm) {
			if (!elm) return 0;
			var setOverflow = function (style, value) {
				var oldValue = style.overflow;
				style.overflow = value;
				return oldValue || "";
			}, style = elm.style, oldValue = setOverflow(style, "hidden"), width = elm.clientWidth || 0;
			setOverflow(style, oldValue);
			return width;
		};
	return Math.max(
		getWidth(html),
		getWidth(body)
	);
}

function viewporHeight () {
	if (window.innerHeight) return window.innerHeight;
	var
		doc = document,
		html = doc && doc.documentElement,
		body = doc && (doc.body || doc.getElementsByTagName("body")[0]),
		getHeight = function (elm) {
			if (!elm) return 0;
			var setOverflow = function (style, value) {
				var oldValue = style.overflow;
				style.overflow = value;
				return oldValue || "";
			}, style = elm.style, oldValue = setOverflow(style, "hidden"), height = elm.clientheight || 0;
			setOverflow(style, oldValue);
			return height;
		};
	return Math.max(
		getHeight(html),
		getHeight(body)
	);
}

function touch() {
	var f = d3.event.finger;
	var group;

	if (eraseMode === true) {
		erase_path.data = [f.pos0.slice()];

		erase_path.el = g_erase.append('path')
			.classed('erase', true)
			.style('fill', 'none')
			.style('stroke', '#aa598a')
			.style('opacity', 0.5)
			.style('stroke-width', eraser_radius * 2)
			.style('stroke-linecap', 'round')
			.style('stroke-linejoin', 'round');

		erase_path.el.datum(erase_path.data)
			.attr('d', function (d) {
				return line(d) + 'Z'
			});
	} else {
		erase_path.data = [f.pos0.slice()];
		paths.push(erase_path.data);

		erase_path.el = g_paths.append('path')
			.style('fill', 'none')
			.style('stroke', '#000')
			.style('opacity', 1)
			.style('stroke-width', 3)
			.style('stroke-linecap', 'round')
			.style('stroke-linejoin', 'round')
			.style({
				'pointer-events': 'none'
			});

		erase_path.el.style('opacity', 1);
		erase_path.el.datum(erase_path.data)
			.attr('d', function (d) {
				return line(d) + 'Z'
			});

		update(paths)
	}
}

function drag() {
	var f = d3.event.finger;

	erase_path.data.push(f.pos.slice());
	erase_path.el.attr('d', line);
}

function release() {
	if (eraseMode === true) {
		paths = erase(paths, erase_path.data);
		d3.selectAll('.erase').remove();
	}

	socket.emit('update drawing', paths);
}

function update(paths) {

	var p = g_paths.selectAll('path')
		.data(paths);

	p.enter()
		.append('path')
		.style('fill', 'none')
		.style('stroke', '#444')
		.style('stroke-width', stroke_width)
		.style('stroke-linecap', 'round')
		.style('stroke-linejoin', 'round');

	p.attr('d', line);

	p.exit().remove();
}

init()