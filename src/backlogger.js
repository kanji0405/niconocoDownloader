(function(){
	const crt = chrome.runtime;
	crt.onMessage.addListener(function(msg, sender, sendResponse){
		if (msg.type === 'DL_LINK') return getVideoSrc(sendResponse);
	});

	function getVideoSrc(sendResponse){
		const videoFrame = document.getElementById('MainVideoPlayer');
		if (videoFrame) {
			const videos = videoFrame.getElementsByTagName("video");
			if (videos[0]){
				sendResponse(videos[0].src);
				return;
			}
		}
		sendResponse('');
	}
})();
