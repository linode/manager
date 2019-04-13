function KeyButton(x, y) {
	var dom = this.domElement = document.createElement("div");
	dom.className = "keybutton";
	dom.style.left = x + "px";
	dom.style.top = y + "px";
}
