
document.getElementById("play_button").addEventListener("click", clickEvent);
function clickEvent(){
    
    videoPlayer=document.getElementById("video")
   videoPlayer.src+="?autoplay=1";
   document.getElementById("play_button").style.display="none";
   document.getElementById("poster").setAttribute("style", "display:none !important");



}
