
export type MessageType = {
    data     : any;
    provider : string,
    answer_to?: number,
    uuid     ?: number
}

export class Message {
    data: any;

    provider : string;
    answer_to: number | undefined;

    uuid: number | undefined;

    constructor (json: MessageType) {
        this.data = json.data;

        this.provider  = json['provider'];
        this.answer_to = json['answer_to'];

        this.uuid = json.uuid;
    }

    answer () {

    }
}
