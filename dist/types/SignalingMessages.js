export var SignalingMessages;
(function (SignalingMessages) {
    SignalingMessages["GETRouterRTPCapabilities"] = "getRouterRtpCapabilities";
    SignalingMessages["CreateProducerTransport"] = "createProducerTransport";
    SignalingMessages["ConnectProducerTransport"] = "connectProducerTransport";
    SignalingMessages["PRODUCE"] = "produce";
    SignalingMessages["CreateConsumerTransport"] = "createConsumerTransport";
    SignalingMessages["ConnectConsumerTransport"] = "connectConsumerTransport";
    SignalingMessages["CONSUME"] = "consume";
    SignalingMessages["RESUME"] = "resume";
    //
    SignalingMessages["RouterCapabilities"] = "routerCapabilities";
    SignalingMessages["ProducerTransportCreated"] = "producerTransportCreated";
    SignalingMessages["SubTransportCreated"] = "subTransportCreated";
    SignalingMessages["RESUMED"] = "resumed";
    SignalingMessages["SUBSCRIBED"] = "subscribed";
})(SignalingMessages || (SignalingMessages = {}));
