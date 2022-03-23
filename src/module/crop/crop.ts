export default class Crop {
    private _cropper: Cropper

    private _src: string

    private _config: CropConfig

    private _callback: { [key: string]: (...p: any) => any } = {}

    private _crop_page: HTMLDivElement

    constructor(src: string, config: CropConfig = {}) {
        this._src = src
        this._config = config

        var page: HTMLDivElement = document.querySelector("#CropPage")

        // Create when the page does not exist
        if (!page) {
            page = document.createElement("div")
            page.className = "crop-base"
            page.id = "CropPage"
            // Write string html
            page.innerHTML = this._getHtml()

            // Get all scale node
            const scale_items: NodeListOf<HTMLDivElement> = page.querySelectorAll(".crop-scale-item[data-scale]")

            for (let i = 0; i< scale_items.length; i++) {
                let scale_item = scale_items[i]

                // Get scale string formula
                let scaleFn: string = scale_item.dataset.scale

                // Use new Function run string formula
                let scale: number = new Function(`return ${scaleFn}`)()

                // Determine whether to specify aspectRatio
                if (config.aspectRatio) {
                    // If specify a specified, set the correspond class
                    scale_item.classList.add(`crop-scale-item-${config.aspectRatio === scale ? 'activity' : 'prohibit'}`)
                } else {

                    // Default is free
                    !scale && scale_item.classList.add('crop-scale-item-activity')

                    // Set onclick function
                    scale_item.onclick = (evt: any) => {
                        let scale_item_activity = page.querySelector(".crop-scale-item-activity")
    
                        // Determine whether to click repeatedly
                        if (scale_item_activity !== evt.srcElement) {
                            scale_item_activity.classList.remove("crop-scale-item-activity")
                            evt.srcElement.classList.add("crop-scale-item-activity")
    
                            // Set aspect ratio
                            this._cropper.setAspectRatio(scale)
                        }
                    }
                }
            }

            // Put page append body
            document.body.appendChild(page)
        }

        // Get confirm button element
        const confirm: HTMLDivElement = page.querySelector("#CropConfirm")
        // Set confirm click event
        confirm.onclick = this.__onConfirm.bind(this)

        // Get close button element
        const close: HTMLDivElement = page.querySelector("#CropClose")
        // Set close click event
        close.onclick = this.close.bind(this)

        // Cache page element
        this._crop_page = page
    }

    /**
     * process error
     * @param err message
     */
    private __onError(err: string): void {
        this._callback.error && this._callback.error(err)
    }

    /**
     * process error
     */
    private async __onConfirm(): Promise<void> {
        // Whether to confirm the callback
        if (this._callback.confirm) {
            const canvas = this._cropper.getCroppedCanvas()

            var dataURL = canvas.toDataURL()

            // There is a specified width and height
            if (this._config.width && this._config.height) {

                // Change canvas size
                canvas.width = this._config.width
                canvas.height = this._config.height

                // Redraw after modifying the size
                await this.__drawImage(canvas, dataURL)

                // Modify the size to get dataURL again
                dataURL = canvas.toDataURL()
            }

            canvas.toBlob((blob: Blob) => {
                this._callback.confirm({ dataURL, blob })

                // Close page
                this.close()
            })
        }
    }

    private __drawImage(canvas: HTMLCanvasElement, dataURL: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const image = new Image()

            image.onload = () => {
                canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)

                resolve()
            }

            image.onerror = reject

            image.src = dataURL
        })
    }

    /**
     * Check parameter
     * @param a {b: parameter , e: message}[]
     */
    private __check(a: { b: boolean, e: string }[]): boolean {

        for (let i = 0; i < a.length; i++) {
            if (!a[i].b) {
                this.__onError(a[i].e)
                return false
            }
        }

        return true
    }

    /**
     * Imitation forEach loop
     * @param a array
     * @param cb callback function
     */
    private __each<T>(a: T[], cb: (v: T, i: number, e: boolean) => void | "break" | "delete" | T): T[] {

        for (let i = 0; i < a.length; i++) {

            let _cb = cb(a[i], i, i === a.length - 1)

            if (_cb === "delete") {
                a.splice(i, 1)
                i--
            } else if (_cb === "break") {
                break
            } else if (_cb) {
                a[i] = _cb
            }
        }

        return a
    }

    public close(): void {
        document.body.removeChild(this._crop_page)
    }

    public destroy(): void {
        document.body.removeChild(this._crop_page)
    }

    public show() {
        document.body.appendChild(this._crop_page)
    }

    /**
     * callback error
     * @param cb callback function
     */
    public onError(cb: (err: string) => void): Crop {
        this._callback.error = cb

        return this
    }

    /**
     * callback confirm
     * @param cb callback function
     */
    public onConfirm(cb: (data: { dataURL: string, blob: Blob }) => void): Crop {
        this._callback.confirm = cb

        return this
    }

    /**
     * build
     */
    public build(): Crop {
        // Check parameter
        if (!this.__check([
            { b: !!this._crop_page, e: "Please import corp.html before build" },
            { b: !!this._src, e: "src cannot be empty" }
        ])) { return null }

        const image: HTMLImageElement = document.querySelector("#CropImage")

        image.onload = () => {
            this._cropper = new Cropper(image, {
                aspectRatio: this._config.aspectRatio,
                checkImageOrigin: false
            })

            this._crop_page.hidden = false
        }

        image.onerror = () => {
            this.__onError("Image failed to load")
        }

        image.src = this._src

        return this
    }

    private _getHtml(): string {
        return `
            <div class="crop-box">
                <div class="crop-title">
                    <img class="crop-icon" src="/modules/crop/icon/crop.svg" />
                    <p class="crop-name">裁剪工具</p>
                    <div class="close" id="CropClose">
                        <img src="/modules/crop/icon/close.svg" />
                    </div>
                </div>
                <div class="crop-content">
                    <img id="CropImage" class="crop-image" />
                </div>
                <div class="crop-operating">
                    <div class="crop-operating-box">
                        ${this._config.aspectRatio ? "": `
                            <div class="crop-operating-box">
                                <div class="crop-operating-scale">
                                    <div class="crop-scale-item" data-scale="16/9">16:9</div>
                                    <div class="crop-scale-item" data-scale="4/3">4:3</div>
                                    <div class="crop-scale-item" data-scale="2/3">2:3</div>
                                    <div class="crop-scale-item" data-scale="1/1">1:1</div>
                                    <div class="crop-scale-item" data-scale="NaN">自定义</div>
                                </div>
                            </div>
                        `}
                    </div>
                    <div class="crop-operating-box">
                        <button class="crop-operating-button" id="CropConfirm">确认</button>
                    </div>
                </div>
            </div>
        `
    }
}

interface Cropper {
    getCroppedCanvas?: () => HTMLCanvasElement

    setAspectRatio?: (s: number) => void
}

interface CropConfig {
    aspectRatio?: number

    width?: number
    height?: number
}

declare var Cropper