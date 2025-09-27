export class BridgeRabbitMQException extends Error {
    constructor(message: string, cause?: Error) {
        super(message);
        this.name = 'BridgeRabbitMQException';

        if (cause) {
            this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
        }
    }
}