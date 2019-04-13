function Pip(x, y, size) {
	this.width = this.height = size;
	this.munched = false;

	this.domElement = document.createElement('div');
	this.domElement.className = "pip";
	this.domElement.style.width = size + "px";
	this.domElement.style.height = size + "px";
	this.domElement.style.borderRadius = size + "px";
	this.domElement.style.left = Math.round(x-(size/2))+"px";
	this.domElement.style.top = Math.round(y-(size/2))+"px";

	this.munch = function() {
		this.munched = true;
		this.domElement.style.opacity = 0;
	};

	this.reset = function() {
		this.munched = false;
		this.domElement.style.opacity = 1;
	};
}
