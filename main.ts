import { SignalingMessages } from "./types/SignalingMessages.js";
import { WebRTC } from "./WebRTC.js";
const socket = io('http://40.67.177.240:3016');
const webRTC = new WebRTC(socket);

document.addEventListener('DOMContentLoaded', function(){
    console.log('DOMload')
    socket.emit(SignalingMessages.GETRouterRTPCapabilities, roomId)
})
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomId = urlParams.get('room');

if (!roomId) {
    window.location.href = '/lobby.html';
}

const user1 = document.getElementById('user-1') as HTMLVideoElement
const camera = document.getElementById('camera-btn') as HTMLButtonElement
const microphone = document.getElementById('mic-btn') as HTMLButtonElement
const record = document.getElementById('record-btn') as HTMLButtonElement



const init = async () => {
    webRTC.registerSocketEvents()
}
webRTC.handleUserConnection = () => {
    user1.srcObject = webRTC.localStream
}
webRTC.NoWorker = () => {
    window.location.href = 'lobby.html'
}
webRTC.toggleCamera = () => {
    if(webRTC.producerVideo?.paused){
        webRTC.producerVideo.resume()
        webRTC.socket.emit('pause')  
        camera.style.backgroundColor = 'rgba(179,102,249,1)'
    }else{
        webRTC.producerVideo?.pause()
        webRTC.socket.emit('pause')
        camera.style.backgroundColor = 'rgba(255,80,80,1)'
    }
}

webRTC.toggleMic = () => {

    if(webRTC.producerAudio?.paused){
        webRTC.producerAudio.resume()
        webRTC.producerAudio.track!.enabled = true;
        microphone.style.backgroundColor = 'rgba(179,102,249,1)'
    }else{
        webRTC.producerAudio?.pause()
        webRTC.producerAudio!.track!.enabled = false;
        microphone.style.backgroundColor = 'rgba(255,80,80,1)'
    }
}
var recordIsStarted = false
webRTC.toggleRecord = () => {
    if(recordIsStarted){
        webRTC.socket.emit('close-record')
        record.style.backgroundColor = 'rgba(179,102,249,1)'
        recordIsStarted = false
        
    }else {
        webRTC.socket.emit('start-record')
        record.style.backgroundColor = 'rgba(102,249,122,1)'
        recordIsStarted = true
    }
}

camera.addEventListener('click', webRTC.toggleCamera)
microphone.addEventListener('click', webRTC.toggleMic)
//record.addEventListener('click', webRTC.toggleRecord)

init()
