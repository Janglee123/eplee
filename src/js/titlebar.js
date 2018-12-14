const remote = require('electron').remote;
let win = remote.getCurrentWindow();

$(document).ready(function(){

    $('#settings').on("click", function() {
        reader.SettingsController.show();
    });

	$('#fullscreen').on("click", function() {
		let isFullScreen = win.isFullScreen();
		if(isFullScreen){
			win.setFullScreen(false);
			$(fullscreen)
			.addClass("icon-fullscreen-full")
			.removeClass("icon-fullscreen-small");
		}
		else{
			win.setFullScreen(true);
			$(fullscreen)
			.addClass("icon-fullscreen-small")
			.removeClass("icon-fullscreen-full");
		}
	})


	$('#minimize').on("click", function() {
		win.minimize();
	});

	$('#maximize').on("click", function() {
		// toogling maximize
		if(win.isMaximized()){
			win.unmaximize()
			$(maximize)
			.addClass("icon-maximize")
			.removeClass("icon-maximize-exit")
		}
		else{
			win.maximize();
			$maximize
			.addClass("icon-maximize-exit")
			.removeClass("icon-maximize")
		}
	})

	$('#close').on("click", function() {
		win.close();
	});

});
