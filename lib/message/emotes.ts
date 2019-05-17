export class TwitchEmote {
    public id: number;
    public startIndex: number;
    public endIndex: number;
    public text: string;

    public constructor(id: number, startIndex: number, endIndex: number, text: string) {
        this.id = id;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.text = text;
    }
}

export class TwitchEmoteList extends Array<TwitchEmote> {
}
