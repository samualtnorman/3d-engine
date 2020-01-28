(function loop() {
	console.log(Date.now());
	setTimeout(() => this.loop.call(this), 0);
})()