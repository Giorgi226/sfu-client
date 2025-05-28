var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { SignalingMessages } from "./types/SignalingMessages.js";
import { WebRTC } from "./WebRTC.js";
const socket = io('http://localhost:3012');
const webRTC = new WebRTC(socket);
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMload');
    socket.emit(SignalingMessages.GETRouterRTPCapabilities, roomId);
});
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const roomId = urlParams.get('room');
if (!roomId) {
    window.location.href = '/lobby.html';
}
const user1 = document.getElementById('user-1');
const camera = document.getElementById('camera-btn');
const microphone = document.getElementById('mic-btn');
const record = document.getElementById('record-btn');
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    webRTC.registerSocketEvents();
});
webRTC.handleUserConnection = () => {
    user1.srcObject = webRTC.localStream;
};
webRTC.NoWorker = () => {
    window.location.href = 'lobby.html';
};
webRTC.toggleCamera = () => {
    var _a, _b;
    if ((_a = webRTC.producerVideo) === null || _a === void 0 ? void 0 : _a.paused) {
        webRTC.producerVideo.resume();
        webRTC.socket.emit('pause');
        camera.style.backgroundColor = 'rgba(179,102,249,1)';
    }
    else {
        (_b = webRTC.producerVideo) === null || _b === void 0 ? void 0 : _b.pause();
        webRTC.socket.emit('pause');
        camera.style.backgroundColor = 'rgba(255,80,80,1)';
    }
};
webRTC.toggleMic = () => {
    var _a, _b;
    if ((_a = webRTC.producerAudio) === null || _a === void 0 ? void 0 : _a.paused) {
        webRTC.producerAudio.resume();
        webRTC.producerAudio.track.enabled = true;
        microphone.style.backgroundColor = 'rgba(179,102,249,1)';
    }
    else {
        (_b = webRTC.producerAudio) === null || _b === void 0 ? void 0 : _b.pause();
        webRTC.producerAudio.track.enabled = false;
        microphone.style.backgroundColor = 'rgba(255,80,80,1)';
    }
};
var recordIsStarted = false;
webRTC.toggleRecord = () => {
    if (recordIsStarted) {
        webRTC.socket.emit('close-record');
        record.style.backgroundColor = 'rgba(179,102,249,1)';
        recordIsStarted = false;
    }
    else {
        webRTC.socket.emit('start-record');
        record.style.backgroundColor = 'rgba(102,249,122,1)';
        recordIsStarted = true;
    }
};
camera.addEventListener('click', webRTC.toggleCamera);
microphone.addEventListener('click', webRTC.toggleMic);
//record.addEventListener('click', webRTC.toggleRecord)
init();
