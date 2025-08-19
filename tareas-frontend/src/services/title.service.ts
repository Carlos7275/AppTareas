export class TitleService {
    setTitle(str: string) {
        window.document.title = str
    }

    getTitle() {
        return window.document.title
    }
}