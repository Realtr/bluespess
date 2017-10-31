'use strict';

function enqueue_icon_meta_load(newIcon) {
	if(this.icon_meta_load_queue[newIcon]) {
		return this.icon_meta_load_queue[newIcon];
	}
	var promise = new Promise((resolve, reject)=>{
		var xhr = new XMLHttpRequest();
		xhr.open("GET", this.resRoot+newIcon+".json", true);
		xhr.responseType = "json";
		xhr.onload = () => {
			var meta = xhr.response;
			for(var statekey in meta) {
				if(!meta.hasOwnProperty(statekey)) {
					continue;
				}
				var state = meta[statekey];
				var totalDelays = {};
				for(var dir in state.dirs) {
					if(!state.dirs.hasOwnProperty(dir)) {
						continue;
					}
					var totalDelay = 0;
					var frames = state.dirs[dir];
					for(var i = 0; i < frames.length; i++) {
						var frame = frames[i];
						totalDelay += frame.delay;
					}
					totalDelays[dir] = totalDelay;
				}
				state.totalDelays = totalDelays;
			}
			meta.__image_object = new Image();
			meta.__image_object.src = this.resRoot+newIcon;
			meta.__image_object.addEventListener("load", () => {
				// Make an image data object.
				var canvas = document.createElement("canvas");
				var ctx = canvas.getContext('2d');
				canvas.width = meta.__image_object.width;
				canvas.height = meta.__image_object.height;
				ctx.drawImage(meta.__image_object, 0, 0);
				meta.__image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);

				resolve();
				this.icon_meta_load_queue[newIcon] = undefined;
			});
			this.icon_metas[newIcon] = meta;
		};
		xhr.onerror = (error) => {
			reject(error || new Error(`Loading failed`));
		};
		xhr.send();
	});
	this.icon_meta_load_queue[newIcon] = promise;
	return promise;
}

module.exports = enqueue_icon_meta_load;
