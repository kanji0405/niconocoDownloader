//============================================================
// - alias Window
//============================================================
(function(){
	const _onload = window.onload;
	window.onload = function(){
		if (_onload) _onload.call(this);
		KNS_MainManager.init();
	}
})();

//============================================================
// - KNS_MainManager
//============================================================
class KNS_MainManager{
	static listMax(){ return 5; }
	static async init(){
		this.index = 0;
		const [tab] = await KNS_ParentTabManager.getParentTab();
		if (tab){
			const parsed = KNS_ParentTabManager.parseUrl(
				tab.url, KNS_ParentTabManager.RE_VIDEO_PAGE
			);
			if (parsed.length > 0){
				this.arrangeButtons(true, parsed);
			}else{
				this.arrangeButtons(false, '');
			}
			this.refresh();
		}else{
			this.drawError('NO_TABS');
		}
	}
	static arrangeButtons(isNiconico, videoId){
		this.parseKnsADD(document.getElementById('KNS_ADD'), isNiconico, videoId);
		this.parseKnsDL(document.getElementById('KNS_DL'), isNiconico);
		this.parseKnsSHOW(document.getElementById('KNS_SHOW'));
		this.parseKnsTEST(document.getElementById('KNS_TEST'));
	}
	static parseKnsADD(button, isNiconico, videoId){
		if (this.checkButtonHide(button, isNiconico) === false){
			button.onclick = this.addVideo.bind(this, videoId);
		}
		return true;
	}
	static parseKnsDL(button, isNiconico, url){
		if (this.checkButtonHide(button, isNiconico) === false){
			button.onclick = this.gotoSourcePage.bind(this);
		}
		return true;
	}
	static parseKnsSHOW(button){
		if (button === null) return false;
		button.onclick = button.onclick = function(){
			this.index = 0;
			this.refresh();
		}.bind(this);
		return true;
	}
	static parseKnsTEST(button){
		if (button){
			button.onclick = async function(){
				const json = await fetch('./list.json').then(res => res.json());
				json.forEach(videoId=>KNS_BookmarkManager.addUrl(videoId));
				this.index = 0;
				this.refresh();
			}.bind(this);
			return true;
		}
		return false;
	}
	static addVideo(videoId){
		KNS_BookmarkManager.addUrl(videoId);
		this.refresh();
	}
	static removeVideo(videoId){
		KNS_BookmarkManager.removeUrl(videoId);
		this.refresh();
	}
	static gotoSourcePage(){
		KNS_ParentTabManager.gotoSourcePage();
	}
	static async refresh(){
		const [drawable] = document.getElementsByTagName('footer');
		if (drawable){
			const urlList = await KNS_BookmarkManager.extractFolder();
			const maxCols = this.listMax();
			const origin = this.index * maxCols;
			const last = Math.min(urlList.length, (this.index + 1) * maxCols);

			const flagment = new DocumentFragment();
			for (let i = origin; i < last; i++){
				const url = urlList[i];
				if (url){
					flagment.appendChild(this.makeUrlFrame(url));
				}
			}
			drawable.innerText = '';
			drawable.appendChild(flagment);
		}
	}
	static makeUrlFrame(url){
		const videoId = url.title;
		const iframe = document.createElement("iframe");
		iframe.src = "https://ext.nicovideo.jp/thumb/" + videoId;
		iframe.scrolling = "no";
		const deleteButton = document.createElement("div");
		deleteButton.className = 'deleteBox'
		deleteButton.onclick = this.removeVideo.bind(this, videoId);
		deleteButton.innerText = "×";
		const div = document.createElement('div');
		div.className = 'mylistItem';
		div.appendChild(iframe);
		div.appendChild(deleteButton);
		return div;
	}
	static checkButtonHide(button, isNiconico){
		if (button === null){
			return true;
		}else if (isNiconico === false){
			button.style.display = 'none';
			return true;
		}
		return false;
	}
	static drawError(text){
		document.write(text);
		throw new Error(text);
	}
}

//============================================================
// - KNS_BookmarkManager
//============================================================
class KNS_BookmarkManager{
	static ADDON_NAME = 'NiconicoDownloader';
	static getChromeBookmarks(){
		return chrome.bookmarks;
	}
	static async getAppFolderId(){
		try{
			const [root] = await this.getChromeBookmarks().getTree();
			let defaultChild = root.children.find(d => d.id === 1);
			if (defaultChild === undefined){
				defaultChild = root.children[0];
			}
			const addonFolder = defaultChild.children.find(
				dir => dir.title === this.ADDON_NAME
			);
			if (addonFolder === undefined){
				return await chrome.bookmarks.create({
					parentId: defaultChild.id, title: this.ADDON_NAME
				}, newFolder => newFolder.id);
			}else{
				return addonFolder.id;
			}
		}catch (e){
			console.warn(e);
			return null;
		}
	}
	static async extractFolder(){
		try{
			const id = await KNS_BookmarkManager.getAppFolderId();
			return await this.getChromeBookmarks().getChildren(
				String(id));
		}catch (e){
			console.warn(e);
			return [];
		}
	}
	static addUrl(videoId){

	}
	static removeUrl(videoId){

	}
}

//============================================================
// - KNS_ParentTabManager
//============================================================
class KNS_ParentTabManager{
	static RE_IS_NICONICO = '^http(?:s?)\:\/{2}www\\.nicovideo\\.jp';
	static RE_VIDEO_PAGE = this.RE_IS_NICONICO + '\/watch\/([\\w\\d]+)[\?\/]?';
	static getChromeTabs(){
		return chrome.tabs;
	}
	static async getParentTab(){
		const tabs = this.getChromeTabs();
		if (tabs === undefined){
			return null;
		}else{
			return await tabs.query({ active: true, currentWindow: true });
		}
	}
	static parseUrl(url, regexp){
		if (
			typeof url === 'string' &&
			new RegExp(regexp, 'i').test(url) === true
		){
			return RegExp.$1 || '';
		}else{
			return '';
		}
	}
	static async gotoSourcePage(){
		const [parent] = await this.getParentTab();
		if (parent){
			await this.getChromeTabs().sendMessage(
				parent.id, { type: 'DL_LINK' }, function(src){
					if (src.length > 0) this.createNewTab(src);
				}.bind(this)
			);
		}
	}
	static async createNewTab(url){
		const options = { url: url };
		const curTab = await this.getParentTab();
		if (curTab) options['openerTabId'] = curTab.id;
		this.getChromeTabs().create(options);
	}
}
/*

(function () {
const oldOnLoad = window.onload;
window.onload = function () {
	const myList = document.createElement("a");
	myList.innerText = "|マイリストに保存";
	myList.onclick = function(){
		let movieId = /watch\/(\w{2}\d+)[\/\?]?/.test(location.href) ? RegExp.$1 : false
		myList.innerText = strRegistered;
		if (movieId){
			if(myListArray.includes(movieId)){
				logTest.innerText = "既に登録済みです";
			}else{
				myListArray.push(movieId);
				localStorage.setItem(storageKey, JSON.stringify(myListArray));
				logTest.innerText = movieId + "を登録しました。";
				myListOpen.onclick.call(this);
			}
		}else{
			logTest.innerText = "登録に失敗しました";
		}
	}
})()

*/
