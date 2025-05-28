var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as mediaSoupClient from 'mediasoup-client';
import { SignalingMessages } from './types/SignalingMessages';
export class WebRTC {
    constructor(socket) {
        this.localStream = null;
        this.remoteStream = null;
        this.consumers = [];
        this.device = null;
        this.roomId = null;
        this.constraints = {
            video: {
                width: { min: 640, ideal: 1920, max: 1920 },
                height: { min: 480, ideal: 1000, max: 1000 },
                frameRate: { min: 30 },
                advanced: [
                    { width: 1920, height: 1280 },
                    { frameRate: { min: 50 } },
                    { frameRate: { min: 40 } }
                ]
            },
            audio: true
        };
        this.handleUserLeft = () => { };
        this.handleUserConnection = () => { };
        this.NoWorker = () => { };
        this.toggleMic = () => { };
        this.toggleCamera = () => { };
        this.toggleRecord = () => { };
        this.onRouterCapabilities = (rtpCapabilities) => __awaiter(this, void 0, void 0, function* () {
            console.log('onRouterCapabilities', rtpCapabilities);
            yield this.loadDevice(rtpCapabilities);
            this.pubish();
        });
        this.onProducerTransportCreated = (data) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            console.log('onProducerTransportCreated');
            let stream = yield navigator.mediaDevices.getUserMedia(this.constraints);
            if (this.outTransport) {
            }
            else {
                const transport = (_a = this.device) === null || _a === void 0 ? void 0 : _a.createSendTransport(data.parameters);
                console.log('iceee candidateesssss: ', data.parameters.iceCandidates);
                this.outTransport = transport;
                transport === null || transport === void 0 ? void 0 : transport.on('connect', (_a, callback_1, errback_1) => __awaiter(this, [_a, callback_1, errback_1], void 0, function* ({ dtlsParameters }, callback, errback) {
                    this.socket.emit(SignalingMessages.ConnectProducerTransport, dtlsParameters);
                    this.socket.addEventListener('producerConnected', () => {
                        console.log('producerConnected');
                        callback();
                    });
                }));
                // begin transport on producer  in this case this is for only VIDEO!, for audio we need another transport
                transport === null || transport === void 0 ? void 0 : transport.on('produce', (_a, callback_1, errback_1) => __awaiter(this, [_a, callback_1, errback_1], void 0, function* ({ kind, rtpParameters }, callback, errback) {
                    console.log('kind', kind);
                    const message = {
                        transportId: transport.id,
                        kind: kind,
                        rtpParameters: rtpParameters
                    };
                    this.socket.emit(SignalingMessages.PRODUCE, message);
                    this.socket.addEventListener('produced', (producerId) => {
                        console.log('produced');
                        callback(producerId);
                    });
                }));
                // end transport producer
                transport === null || transport === void 0 ? void 0 : transport.on('connectionstatechange', (state) => {
                    switch (state) {
                        case 'connecting':
                            console.log('connecting');
                            break;
                        case 'connected':
                            console.log('connected');
                            this.localStream = stream;
                            this.handleUserConnection();
                            break;
                        case 'failed':
                            console.log('failed');
                            transport.close();
                            break;
                        default:
                            break;
                    }
                });
                console.log('stream', stream);
                const trackVideo = stream === null || stream === void 0 ? void 0 : stream.getVideoTracks()[0];
                const trackAudio = stream === null || stream === void 0 ? void 0 : stream.getAudioTracks()[0];
                console.log('track', trackVideo);
                //const params = { track }
                try {
                    this.producerAudio = yield (transport === null || transport === void 0 ? void 0 : transport.produce({ track: trackAudio }));
                    //update for simulcast
                    this.producerVideo = yield (transport === null || transport === void 0 ? void 0 : transport.produce({
                        track: trackVideo,
                        encodings: [
                            { rid: 'r0', maxBitrate: 100000, scaleResolutionDownBy: 4.0 },
                            { rid: 'r1', maxBitrate: 300000, scaleResolutionDownBy: 2.0 },
                            { rid: 'r2', maxBitrate: 900000, scaleResolutionDownBy: 1.0 }
                        ],
                        codecOptions: {
                            videoGoogleStartBitrate: 1000
                        }
                    }));
                    console.log((_b = this.producerVideo) === null || _b === void 0 ? void 0 : _b.rtpParameters.encodings);
                }
                catch (error) {
                    console.error(error);
                }
                const settings = trackVideo.getSettings();
                console.log('Resolution: ', settings.width, ' x ', settings.height);
            }
        });
        this.onSubTransportCreated = (data) => __awaiter(this, void 0, void 0, function* () {
            if (this.inTransport) {
                console.log('I already have transport!');
                this.consumer();
            }
            else {
                console.log('onSubTransportCreated');
                const transport = this.device.createRecvTransport(data.parameters);
                this.inTransport = transport;
                transport === null || transport === void 0 ? void 0 : transport.on('connect', (_a, callback_1, errback_1) => __awaiter(this, [_a, callback_1, errback_1], void 0, function* ({ dtlsParameters }, callback, errback) {
                    this.socket.emit(SignalingMessages.ConnectConsumerTransport, dtlsParameters);
                    this.socket.addEventListener('subConnected', () => {
                        callback();
                    });
                }));
                transport === null || transport === void 0 ? void 0 : transport.on('connectionstatechange', (state) => __awaiter(this, void 0, void 0, function* () {
                    switch (state) {
                        case 'connecting':
                            console.log('subscribing......');
                            break;
                        case 'connected':
                            console.log('connected');
                            break;
                        case 'failed':
                            console.log('failed');
                            transport.close();
                            break;
                        default:
                            break;
                    }
                }));
                this.consumer();
            }
        });
        this.consumer = () => {
            console.log('consumer');
            const rtpCapabilities = this.device.rtpCapabilities;
            this.socket.emit(SignalingMessages.CONSUME, rtpCapabilities);
        };
        this.subscribe = () => {
            this.socket.emit(SignalingMessages.CreateConsumerTransport);
        };
        this.onPause = (consumerId) => {
            const videoContainer = document.getElementById('addvideos');
            const children = videoContainer.children;
            for (let i = children.length - 1; i >= 0; i--) {
                if (children[i].getAttribute('consumerId') === consumerId) {
                    console.log('addclasss');
                    children[i].classList.add('displayHide');
                }
            }
        };
        this.onResume = (consumerId) => {
            const videoContainer = document.getElementById('addvideos');
            const children = videoContainer.children;
            for (let i = children.length - 1; i >= 0; i--) {
                if (children[i].getAttribute('consumerId') === consumerId) {
                    console.log('addclasss');
                    children[i].classList.remove('displayHide');
                }
            }
        };
        this.onSubscribed = (response) => __awaiter(this, void 0, void 0, function* () {
            console.log('responseeee: ', response);
            if (response.kind === 'video') {
                console.log('onSubscribed');
                //const {id , producerId, kind, rtpParameters} = response
                let codecOptions = {};
                const consumerVid = yield this.inTransport.consume({
                    id: response.id,
                    producerId: response.producerId,
                    kind: response.kind,
                    rtpParameters: response.rtpParameters
                });
                this.socket.emit(SignalingMessages.RESUME, response.id);
                consumerVid.appData = { producerId: response.producerId };
                this.consumers.push(consumerVid);
                const stream = new MediaStream();
                stream.addTrack(consumerVid.track);
                console.log('streeeeeeeeeeeeeam', stream);
                const videoContainer = document.getElementById('addvideos');
                const video = document.createElement('video');
                videoContainer === null || videoContainer === void 0 ? void 0 : videoContainer.appendChild(video);
                video.setAttribute('producerId', response.producerId);
                video.setAttribute('consumerId', response.id);
                video.srcObject = stream;
                video.autoplay = true;
                video.playsInline = true;
                video.classList.add('smallFrame');
            }
            else {
                console.log('onSubscribed audioo');
                // const {id , producerId, kind, rtpParameters} = response
                let codecOptions = {};
                const consumerAud = yield this.inTransport.consume({
                    id: response.id,
                    producerId: response.producerId,
                    kind: response.kind,
                    rtpParameters: response.rtpParameters
                });
                this.socket.emit(SignalingMessages.RESUME, response.id);
                consumerAud.appData = { producerId: response.producerId };
                this.consumers.push(consumerAud);
                const stream = new MediaStream();
                stream.addTrack(consumerAud.track);
                console.log('audiooo', stream);
                const audioContainer = document.getElementById('addvideos');
                const audio = document.createElement('audio');
                audioContainer === null || audioContainer === void 0 ? void 0 : audioContainer.appendChild(audio);
                audio.setAttribute('producerId', response.producerId);
                audio.srcObject = stream;
                audio.autoplay = true;
                audio.muted = false;
            }
        });
        this.handleLeavingUser = (producerId, audioProducerId) => __awaiter(this, void 0, void 0, function* () {
            console.log('handleLeavingUser', producerId, audioProducerId);
            const videoContainer = document.getElementById('addvideos');
            const children = videoContainer.children;
            var vidIndex = this.consumers.findIndex(c => JSON.stringify(c.appData) === producerId);
            var audIndex = this.consumers.findIndex(c => JSON.stringify(c.appData) === audioProducerId);
            this.consumers.splice(vidIndex, 1);
            this.consumers.splice(audIndex, 1);
            if (this.consumers.length === 0) {
                this.inTransport.close();
                this.inTransport = null;
                this.socket.emit('close-inTransport');
            }
            const producers = {
                producerId: producerId,
                audioProducerId: audioProducerId
            };
            this.socket.emit('closeConsumers', producers);
            // this.consumerVid = null
            // this.consumerAud = null
            for (let i = children.length - 1; i >= 0; i--) {
                if (children[i].getAttribute('producerId') === producerId || children[i].getAttribute('producerId') === audioProducerId) {
                    console.log('removing');
                    children[i].remove();
                }
            }
        });
        this.socket = socket;
    }
    registerSocketEvents() {
        this.socket.on(SignalingMessages.RouterCapabilities, this.onRouterCapabilities);
        this.socket.on(SignalingMessages.ProducerTransportCreated, this.onProducerTransportCreated);
        this.socket.on('pause', this.onPause);
        this.socket.on(SignalingMessages.RESUMED, this.onResume);
        this.socket.on(SignalingMessages.SubTransportCreated, (data) => {
            console.log('subbbbbbbcREEEEEEt');
            this.onSubTransportCreated(data);
        });
        this.socket.on(SignalingMessages.SUBSCRIBED, (response) => {
            console.log('subscribeeeeeeeeeeed');
            this.onSubscribed(response);
        }),
            this.socket.on('user-joined', () => {
                console.log('userjoineddddddd');
                this.subscribe();
            });
        this.socket.on('producerExist', () => {
            console.log('producerExist');
            this.subscribe();
        });
        this.socket.on('user-left', this.handleLeavingUser);
        this.socket.on('no-worker', this.NoWorker);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('webrtc init');
                this.socket.emit(SignalingMessages.GETRouterRTPCapabilities);
            }
            catch (error) {
                console.error('Initialization error:', error);
            }
        });
    }
    loadDevice(routerRtpCapabilities) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('loadDevice');
            try {
                this.device = yield mediaSoupClient.Device.factory();
                yield this.device.load({ routerRtpCapabilities });
                console.log('Device loaded successfully');
            }
            catch (error) {
                if (error === 'UnsupportedError') {
                    console.log('browser not supported');
                }
                else
                    console.error('error while loading device:', error);
            }
        });
    }
    pubish() {
        this.socket.emit(SignalingMessages.CreateProducerTransport);
    }
}
