(function () {
const oldOnLoad = window.onload;
window.onload = function () {
    if (oldOnLoad) oldOnLoad.apply(this, arguments);

    const logTest = document.createElement("p");
    logTest.style.color = "red";

    const aTag = document.createElement("a");
    aTag.innerText = "動画のソースページに行く";
    aTag.href = "javascript:void(0);";
    aTag.onclick = function () {
        const parent = document.getElementById('MainVideoPlayer');
        if (parent) {
            const src = parent.querySelector("video").src;
            window.open(src);
        }else{
            console.log("動画のソースページに行けませんでした")
        }
    };

    const storageKey = "MYLIST";
    let myListArray = JSON.parse(localStorage.getItem(storageKey)) || [];
    const strRegistered = "|！登録済み！";

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

    function removeVideo(id){
        myListArray = myListArray.filter(videoId => videoId != id);
        localStorage.setItem(storageKey, JSON.stringify(myListArray));
        myListOpen.onclick.call(this);
    }

    const myListOpen = document.createElement("a");
    myListOpen.innerText = "|マイリストを表示";
    myListOpen.onclick = function(){
        const container = document.body.querySelector(".BottomContainer .InView");
        if (!container) return;

        const divID = "KNS_MYLIST";
        let myListDiv = document.getElementById(divID);
        if (!myListDiv){
            myListDiv = document.createElement("div");
            myListDiv.id = divID;
        }
        myListDiv.innerHTML = "<p>マイリス数: " + myListArray.length + "</p><hr>";
        for (let i = myListArray.length - 1; i >= 0; i--){
            const videoId = myListArray[i];
            const iframe = document.createElement("iframe");
            iframe.width = 280;
            iframe.height = 160;
            iframe.src = "https://ext.nicovideo.jp/thumb/" + videoId;
            iframe.scrolling = "no";
            iframe.frameborder = 0;
            iframe.style.border = "solid 1px #ccc";
            iframe.style.display = "inline-block";
            iframe.style.verticalAlign = "top";
            const deleteButton = document.createElement("div");
            deleteButton.onclick = removeVideo.bind(this, videoId);
            deleteButton.style.cursor = "pointer";
            deleteButton.style.width = "40px";
            deleteButton.style.height = (iframe.height) + "px";
            deleteButton.style.border = "white solid 1px"
            deleteButton.style.display = "inline-block";
            deleteButton.style.verticalAlign = "top";
            deleteButton.style.background = "red";
            deleteButton.style.color = "white";
            deleteButton.style.textAlign = "center";
            deleteButton.innerText = "×";
            myListDiv.appendChild(iframe);
            myListDiv.appendChild(deleteButton);
        }
        container.insertBefore(myListDiv, container.firstChild);
    }

    const parents = [
        document.querySelector('.VideoDescriptionContainer'),
        document.querySelector('div.UserDetailsHeader.UserDetailsContainer-details')
    ];
    for (let i = 0; i < parents.length; i++){
        const parent = parents[i];
        if (parent){
            parent.appendChild(aTag);
            parent.appendChild(myList);
            parent.appendChild(myListOpen);
            parent.appendChild(logTest);
            fetch("./list.json"
            ).then(res => res.text()
            ).then(res => console.log(res)
            ).catch(e => console.log(e));
            break;
        }
    }
}

})()
