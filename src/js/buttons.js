const url = require('url');
const path  = require('path');
const remote = require('electron').remote;
const dialog = remote.dialog;
let win = remote.getCurrentWindow();


$(document).ready(function(){
	
	$('#fullscreen').on("click", function() {
		let isFullScreen = win.isFullScreen();
		if(isFullScreen){
			win.setFullScreen(false);
			$fullscreen
			.addClass("icon-fullscreen-full")
			.removeClass("icon-fullscreen-small");
		}
		else{
			win.setFullScreen(true);
			$fullscreen
			.addClass("icon-fullscreen-small")
			.removeClass("icon-fullscreen-full");
		}
	})

	$('#settings').on("click", function() {
		reader.SettingsController.show();
	});

	$('#minimize').on("click", function() {
		win.minimize();
	});

	$('#maximize').on("click", function() {
		// toogling maximize
		if(win.isMaximized()){
			win.unmaximize()
			$maximize
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


	$('#add').on("click", function(){
		let pathtoepub = dialog.showOpenDialog(
            {
                filters:[{ name: 'ePub', extensions: 'epub' }],
                properties:['openFile'],
            }
        );
        if(!pathtoepub){
            return;
        }
        pathtoepub = pathtoepub[0];
        console.log(pathtoepub);
        if(!pathtoepub.endsWith('.epub')){
            dialog.showMessageBox({message:'Please select ePub file'});
            return;
        }

        win.loadURL(url.format({
            slashes: true,
            protocol: 'file:',
            pathname: path.join(__dirname,'..','html','reader.html'),
            query: {
                bookPath:pathtoepub
            }
        }));
	});

});
