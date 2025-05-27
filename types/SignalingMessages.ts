export enum SignalingMessages {
    GETRouterRTPCapabilities = 'getRouterRtpCapabilities',
    CreateProducerTransport = 'createProducerTransport',
    ConnectProducerTransport = 'connectProducerTransport',
    PRODUCE = 'produce',
    CreateConsumerTransport = 'createConsumerTransport',
    ConnectConsumerTransport = 'connectConsumerTransport',
    CONSUME = 'consume',
    RESUME = 'resume',
    //
    RouterCapabilities = 'routerCapabilities',
    ProducerTransportCreated = 'producerTransportCreated',
    SubTransportCreated = 'subTransportCreated',
    RESUMED = 'resumed',
    SUBSCRIBED = 'subscribed' 
}