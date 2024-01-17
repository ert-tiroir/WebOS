
export class Message {
    constructor (json) {
        this.data = json.data;

        this.provider  = json['provider'];
        this.answer_to = json['answer_to'];

        this.uuid = json.uuid;
    }

    answer () {

    }
}
