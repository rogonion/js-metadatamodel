export class TestData {
    private _TestTitle: string = '';
    public get TestTitle(): string {
        return this._TestTitle;
    }
    public set TestTitle(value: string) {
        this._TestTitle = value;
    }

    private _LogErrorsIfExpectedNotOk: boolean = false;
    public get LogErrorsIfExpectedNotOk(): boolean {
        return this._LogErrorsIfExpectedNotOk;
    }
    public set LogErrorsIfExpectedNotOk(value: boolean) {
        this._LogErrorsIfExpectedNotOk = value;
    }

    public static fromJSON(json: string | object): TestData {
        let data: any = json;
        if (typeof json === 'string') {
            data = JSON.parse(json);
        }

        const instance = new TestData();
        if (data) {
            if (typeof data.TestTitle === 'string') instance.TestTitle = data.TestTitle;
            if (typeof data.LogErrorsIfExpectedNotOk === 'boolean')
                instance.LogErrorsIfExpectedNotOk = data.LogErrorsIfExpectedNotOk;
        }
        return instance;
    }

    public toJSON(): object {
        return {
            TestTitle: this.TestTitle,
            LogErrorsIfExpectedNotOk: this.LogErrorsIfExpectedNotOk
        };
    }
}
