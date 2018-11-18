interface IConfig {
    itemClass: string
    paneClass: string
    slideSpeed: number
    autoInterval: number
    pointsClass?: string
}

declare global {
    interface HTMLCollectionBase {
        toArray: () => HTMLElement[]
    }
}

if (!HTMLCollection.prototype.toArray) {
    HTMLCollection.prototype.toArray = function() {
        const result = []

        for (let n = 0; n < this.length; n++) {
            result.push(this[n])
        }
        
        return result
    }
}

export class NECarousel {
    private readonly itemClass: string
    private readonly paneClass: string
    private readonly slideSpeed: number
    private readonly autoInterval: number
    private readonly pointsClass: string|null
    private touchstartX = 0
    private touchendX = 0
    private cols: HTMLElement[]
    private pane: HTMLDivElement 
    private points: HTMLDivElement
    private pointsItems: HTMLElement[] = []
    private current = 0

    constructor(private readonly element: HTMLElement, config: IConfig) {
        if (!config || !config.itemClass) {
            throw new Error('Native Elements Carousel: option itemClass is not specified')
        }
        this.itemClass = config.itemClass
        this.paneClass = config.paneClass ? config.paneClass : 'purePane'
        this.slideSpeed = config.slideSpeed ? config.slideSpeed : .3
        this.autoInterval = config.autoInterval ? config.autoInterval : 0
        this.pointsClass = config.pointsClass ? config.pointsClass : null

        this.initialize()
    }

    private initialize() {
        this.cols = this.element.getElementsByClassName(this.itemClass).toArray()
        this.pane = document.createElement('div')
        this.points = this.pointsClass ? document.createElement('div') : null

        this.pane.style.position = 'relative'
        this.pane.classList.add(this.paneClass)
        this.element.appendChild(this.pane)
        this.element.style.overflow = 'hidden'
        for (let n = 0; n < this.cols.length; n++) {
            const col = this.cols[n]

            col.remove()
            this.pane.appendChild(col)
            if (this.points) {
                let point = document.createElement('b')

                point.onclick = () => {
                    this.current = n
                    this.scrollToCurrent()
                }
                this.pointsItems.push(point)
                this.points.appendChild(this.pointsItems[this.pointsItems.length - 1])
            }
        }
        if (this.points) {
            this.points.classList.add(this.pointsClass as string)
            this.element.appendChild(this.points)
            this.pointsItems[0].classList.add('active')
        }

        this.managePhantomCols()
        this.addEventListeners()

        if (this.autoInterval) {
            this.initializeAutoInterval()
        }
    }

    private onResize() {
        const elements = this.element.getElementsByClassName(this.itemClass).toArray()

        this.pane.style.width = 'auto'
        for (const element of elements) {
            element.style.width = 'auto'
            element.style.cssFloat = 'none'
            element.style.width = element.clientWidth + 'px'
            element.style.cssFloat = 'left'
        }
        this.updateTranslate()

        const col = this.pane.getElementsByClassName(this.itemClass)[0]

        if (col.classList.contains('cloned')) {
            this.pane.style.left = '-' + this.cols[0].clientWidth + 'px'
        }
        this.pane.style.width = this.element.clientWidth * elements.length + 'px'
    }

    private managePhantomCols() {
        if (this.current === 0) {
            const clone = this.cols[this.cols.length - 1].cloneNode(true) as HTMLElement

            clone.classList.add('cloned')
            this.pane.insertBefore(clone, this.cols[0])
            this.pane.style.left = '-' + this.cols[0].clientWidth + 'px'
        } else if (this.current > 0) {
            const col = this.pane.getElementsByClassName(this.itemClass)[0]

            if (col.classList.contains('cloned')) {
                col.remove()
                this.pane.style.left = '0'
            }
        }
        if (this.current === this.cols.length - 1) {
            const clone = this.cols[0].cloneNode(true) as HTMLElement

            clone.classList.add('cloned')
            this.pane.appendChild(clone)
        } else if (this.current < this.cols.length - 1) {
            const items = this.pane.getElementsByClassName(this.itemClass)
            const col = items[items.length - 1]

            if (col.classList.contains('cloned')) {
                col.remove()
            }
        }
        this.onResize()
    }

    private scrollToCurrent() {
        let append = null

        if (this.current < 0) {
            this.current = this.current = this.cols.length - 1
            append = 'prepend'
        } else if (this.current >= this.cols.length) {
            this.current = 0
            append = 'append'
        }
        if (this.points) {
            for (const item of this.pointsItems) {
                item.classList.remove('active')
            }
            this.pointsItems[this.current].classList.add('active')
        }
        this.pane.style.transition = 'transform ' + this.slideSpeed + 's'
        if (append === 'prepend') {
            this.pane.style.transform = 'translate(' + (parseInt(this.pane.style.left as string) * -1) + 'px)'
        } else if (append === 'append') {
            this.pane.style.transform = 'translate(' + (-this.cols.length * this.element.clientWidth) + 'px)'
        } else {
            this.pane.style.transform = 'translate(' + (-this.current * this.element.clientWidth) + 'px)'
        }
        setTimeout(() => {
            this.managePhantomCols()
            this.pane.style.transition = 'none'
            this.updateTranslate()
        }, this.slideSpeed * 1000)
    }

    private updateTranslate() {
        this.pane.style.transform = 'translate(' + (-this.current * this.element.clientWidth) + 'px)'
    }

    private addEventListeners() {
        window.addEventListener('resize', () => this.onResize(), false)
        this.element.addEventListener('touchstart', (event) => {
            this.touchstartX = event.changedTouches[0].screenX
            this.pane.style.transition = 'none'
        }, false)
        this.element.addEventListener('touchend', (event) => {
            this.touchendX = event.changedTouches[0].screenX
            this.current = this.current + (this.touchstartX < this.touchendX ? -1 : 1)
            this.scrollToCurrent()
        }, false)
        this.element.addEventListener("touchmove", (event) => {
            this.touchendX = event.changedTouches[0].screenX
            this.pane.style.transform = 'translate(' + (-this.current * this.element.clientWidth + this.touchendX - this.touchstartX) + 'px)'
        }, false)
    }

    private initializeAutoInterval() {
        setInterval(() => {
            this.current++
            this.scrollToCurrent()
        }, this.autoInterval * 1000)
    }
}

(window as any).NECarousel = (element: HTMLElement, config: IConfig) => new NECarousel(element, config)
export default NECarousel