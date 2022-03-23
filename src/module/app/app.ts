export default class App {

    private static app: any

    public static set(app: any): void {
        this.app = app
    }

    public static get(): any {
        return this.app
    }
}