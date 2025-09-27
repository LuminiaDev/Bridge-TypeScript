export interface BridgeRabbitMQCredentials {
    username: string;
    password: string;
}

export interface BridgeRabbitMQConfig {
    host?: string;
    port?: number;
    credentials: BridgeRabbitMQCredentials;
    virtualHost?: string;
    serviceId?: string;
}