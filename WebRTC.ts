import * as mediaSoupClient from 'mediasoup-client';
import { SignalingMessages } from './types/SignalingMessages';
import { Consumer } from 'mediasoup-client/lib/Consumer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { Producer } from 'mediasoup-client/lib/Producer';
import { ConsumerInterface, Id, Parameters, ProducerInterface, RtpCapabilities }from './interfaces' ;
import { } from 'socket.io-client'
import { Socket } from 'socket.io-client';
export class WebRTC {
    socket: typeof Socket;
    localStream: MediaStream | null = null;
    remoteStream: MediaStream | null = null;

    public producerVideo: Producer | undefined
    public producerAudio: Producer | undefined
    public consumers:Consumer[] = []
    private inTransport!: Transport
    private outTransport!: Transport
    private device: mediaSoupClient.Device | null = null;
    roomId: string | null = null;
    constraints = { 
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
    handleUserLeft: () => void = () => {};
    handleUserConnection: () => void = () => {};
    NoWorker: () => void = () => {};
    toggleMic: () => void = () => {};
    toggleCamera: () => void = () => {};
    toggleRecord: () => void = () => {};

    constructor(socket: typeof Socket) {
        this.socket = socket;
    }
    registerSocketEvents() {
        this.socket.on(SignalingMessages.RouterCapabilities, this.onRouterCapabilities)
        this.socket.on(SignalingMessages.ProducerTransportCreated, this.onProducerTransportCreated)
        this.socket.on('pause', this.onPause)
        this.socket.on(SignalingMessages.RESUMED, this.onResume)
        this.socket.on(SignalingMessages.SubTransportCreated,(data:Parameters) => {
            console.log('subbbbbbbcREEEEEEt')
            this.onSubTransportCreated(data)
        } )
        this.socket.on(SignalingMessages.SUBSCRIBED, (response: ConsumerInterface) => {
            console.log('subscribeeeeeeeeeeed')
            this.onSubscribed(response)
        } ),
        this.socket.on('user-joined', () => {
           console.log('userjoineddddddd')
            this.subscribe()
        })
        this.socket.on('producerExist', () => {
           console.log('producerExist')
           this.subscribe()
        })
        this.socket.on('user-left', this.handleLeavingUser)
        this.socket.on('no-worker', this.NoWorker)
    }

    async init() {
        try {
            console.log('webrtc init')
            this.socket.emit(SignalingMessages.GETRouterRTPCapabilities);
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    async loadDevice(routerRtpCapabilities: mediaSoupClient.types.RtpCapabilities) {
        console.log('loadDevice');
        try {
            this.device = await mediaSoupClient.Device.factory();
            await this.device.load({ routerRtpCapabilities });
            console.log('Device loaded successfully');
        } catch (error) {
            if(error === 'UnsupportedError'){
                console.log('browser not supported')
            }else console.error('error while loading device:', error);
        }
    }

    onRouterCapabilities = async (rtpCapabilities: mediaSoupClient.types.RtpCapabilities) => {
        console.log('onRouterCapabilities', rtpCapabilities)
        await this.loadDevice(rtpCapabilities)
        this.pubish()
    }

    onProducerTransportCreated = async (data: Parameters) =>{
        console.log('onProducerTransportCreated')
        let stream = await navigator.mediaDevices.getUserMedia(this.constraints)
        if(this.outTransport){
          
        }else {
            const transport = this.device?.createSendTransport(data.parameters)
            console.log('iceee candidateesssss: ', data.parameters.iceCandidates)
            this.outTransport = transport!
        transport?.on('connect', async ({dtlsParameters}, callback, errback) => {
        
            this.socket.emit(SignalingMessages.ConnectProducerTransport, dtlsParameters)
            this.socket.addEventListener('producerConnected', () => {
                console.log('producerConnected')
                callback()
            })
        })
        // begin transport on producer  in this case this is for only VIDEO!, for audio we need another transport
        transport?.on('produce', async ({kind, rtpParameters}, callback , errback) => {
            console.log('kind' , kind)
            const message: ProducerInterface = {
                transportId: transport.id,
                kind: kind,
                rtpParameters: rtpParameters
            }
            this.socket.emit(SignalingMessages.PRODUCE,message)
            this.socket.addEventListener('produced', (producerId: Id) => {
                console.log('produced')
                callback(producerId)
            })
        })
        // end transport producer
            transport?.on('connectionstatechange', (state) => {
                switch(state){
                    case 'connecting':
                        console.log('connecting')
                        break
                    case 'connected':
                        console.log('connected')
                        this.localStream = stream!
                        this.handleUserConnection()
                        break
                    case 'failed':
                        console.log('failed')
                        transport.close()
                        break
                    default:
                        break
                }
            })
            console.log('stream', stream)
            const trackVideo = stream?.getVideoTracks()[0]
            const trackAudio = stream?.getAudioTracks()[0]
            console.log('track', trackVideo)
            //const params = { track }
            try {


                this.producerAudio = await transport?.produce({ track: trackAudio})

                //update for simulcast
                this.producerVideo = await transport?.produce({
                    track: trackVideo,
                    encodings: [
                        { rid: 'r0', maxBitrate: 100_000, scaleResolutionDownBy: 4.0},
                        { rid: 'r1', maxBitrate: 300_000, scaleResolutionDownBy: 2.0},
                        { rid: 'r2', maxBitrate: 900_000, scaleResolutionDownBy: 1.0}
                    ],
                    codecOptions: {
                        videoGoogleStartBitrate: 1000
                    }
                })
                console.log(this.producerVideo?.rtpParameters.encodings)
            } catch (error) {
                console.error(error)
            }
            const settings = trackVideo.getSettings()
            console.log('Resolution: ', settings.width, ' x ', settings.height)
        }
        

    }

    onSubTransportCreated = async (data: Parameters) => {
        if(this.inTransport){
            console.log('I already have transport!')
            this.consumer()
        }else{
            console.log('onSubTransportCreated')
    
            const transport = this.device!.createRecvTransport(data.parameters)
            this.inTransport = transport

            transport?.on('connect', async ({dtlsParameters}, callback, errback) => {
                this.socket.emit(SignalingMessages.ConnectConsumerTransport, dtlsParameters)
                this.socket.addEventListener('subConnected', () => {
                    callback()
                })
            })
    
            transport?.on('connectionstatechange', async (state) => {
                switch(state){
                    case 'connecting':
                        console.log('subscribing......')
                        break
                    case 'connected':
                        console.log('connected')
                        break
                    case 'failed':
                        console.log('failed')
                        transport.close()
                        break
                    default:
                        break
                }
            })
                this.consumer()     
        }
        
    }

    consumer = () => {
        console.log('consumer')
        const rtpCapabilities =  this.device!.rtpCapabilities
        this.socket.emit(SignalingMessages.CONSUME, rtpCapabilities)
    }

    pubish(){
        this.socket.emit(SignalingMessages.CreateProducerTransport)
    }
    subscribe = () => {
       this.socket.emit(SignalingMessages.CreateConsumerTransport)
    }
    onPause = (consumerId: string) => {
        const videoContainer = document.getElementById('addvideos')
        const children = videoContainer!.children 
        for(let i= children.length-1; i >= 0; i--){
            if(children[i].getAttribute('consumerId') === consumerId ){
                console.log('addclasss')
                children[i].classList.add('displayHide')
            }
        }
    }
    onResume = (consumerId:string) => {
        const videoContainer = document.getElementById('addvideos')
        const children = videoContainer!.children 
        for(let i= children.length-1; i >= 0; i--){
            if(children[i].getAttribute('consumerId') === consumerId ){
                console.log('addclasss')
                children[i].classList.remove('displayHide')
            }
        }
    }
    onSubscribed = async (response: ConsumerInterface) => {
        console.log('responseeee: ', response)
       if(response.kind === 'video'){
        console.log('onSubscribed')
        //const {id , producerId, kind, rtpParameters} = response
        let codecOptions = {}
        const consumerVid = await this.inTransport!.consume({
            id: response.id,
            producerId: response.producerId,
            kind: response.kind,
            rtpParameters: response.rtpParameters
        })
        this.socket.emit(SignalingMessages.RESUME, response.id)
        consumerVid.appData = {producerId: response.producerId}
        this.consumers.push(consumerVid)
        const stream = new MediaStream()
        stream.addTrack(consumerVid.track)
        console.log('streeeeeeeeeeeeeam', stream)
        const videoContainer = document.getElementById('addvideos');
        const video = document.createElement('video');
        videoContainer?.appendChild(video)
        video.setAttribute('producerId', response.producerId)
        video.setAttribute('consumerId', response.id)
        video.srcObject = stream
        video.autoplay  = true
        video.playsInline = true
        video.classList.add('smallFrame')
       }else{
        console.log('onSubscribed audioo')
       // const {id , producerId, kind, rtpParameters} = response
        let codecOptions = {}
        const consumerAud = await this.inTransport!.consume({
            id: response.id,
            producerId: response.producerId,
            kind: response.kind,
            rtpParameters: response.rtpParameters
        })
        this.socket.emit(SignalingMessages.RESUME,response.id)
        consumerAud.appData = {producerId: response.producerId}
        this.consumers.push(consumerAud)
        const stream = new MediaStream()
        stream.addTrack(consumerAud.track)
        console.log('audiooo', stream)
        const audioContainer = document.getElementById('addvideos');
        const audio = document.createElement('audio');
        audioContainer?.appendChild(audio)
        audio.setAttribute('producerId', response.producerId)
        audio.srcObject = stream
        audio.autoplay  = true
        audio.muted = false
       }


    }
    handleLeavingUser = async (producerId: string, audioProducerId: string) => {
        console.log('handleLeavingUser', producerId, audioProducerId)
        const videoContainer = document.getElementById('addvideos')
        const children = videoContainer!.children
        
        var vidIndex = this.consumers.findIndex(c => JSON.stringify(c.appData) === producerId)
        var audIndex = this.consumers.findIndex(c => JSON.stringify(c.appData) === audioProducerId)
        this.consumers.splice(vidIndex,1)
        this.consumers.splice(audIndex,1)
        if(this.consumers.length === 0){
            this.inTransport.close()
            this.inTransport = null!
            this.socket.emit('close-inTransport')
        }
        const producers = {
            producerId: producerId,
            audioProducerId: audioProducerId
        }
        this.socket.emit('closeConsumers', producers)
        // this.consumerVid = null
        // this.consumerAud = null
        for(let i= children.length-1; i >= 0; i--){
            if(children[i].getAttribute('producerId') === producerId || children[i].getAttribute('producerId') === audioProducerId){
                console.log('removing')
                children[i].remove()
            }
        }
    }

}
