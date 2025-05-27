import * as mediasoup from 'mediasoup-client'
export declare type MediaKind = 'audio' | 'video';
export interface ConsumerInterface {
    id: string,
    producerId: string
    kind: MediaKind
    rtpParameters: mediasoup.types.RtpParameters 
}
export interface ProducerInterface {
    transportId: string,
    kind: MediaKind,
    rtpParameters: mediasoup.types.RtpParameters
}
export interface RtpCapabilities {
    rtpCapabilities: mediasoup.types.RtpCapabilities
}
export interface Parameters {
    parameters: {
        id: string,
        iceParameters: mediasoup.types.IceParameters,
        iceCandidates: mediasoup.types.IceCandidate[],
        dtlsParameters: mediasoup.types.DtlsParameters
    }
}
export interface Id {
    id: string
}