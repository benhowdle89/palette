const targetSelector = 'data-palette-target'
const targetOutput = 'data-palette-output'

class Palette {
    constructor(target) {
        this.target = target
        this.output = this.target.parentElement ? this.target.parentElement.querySelector(`[${targetOutput}]`) : null
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
        this.imageDimensions = {
            width: 0,
            height: 0
        }
        this.imageData = []
        this.readImage()
    }

    readImage() {
        this.imageDimensions.width = this.target.width * 0.1
        this.imageDimensions.height = this.target.height * 0.1
        this.render()
    }

    getImageData() {
        let imageData = this.ctx.getImageData(
            0, 0, this.imageDimensions.width, this.imageDimensions.height
        ).data
        this.imageData = Array.from(imageData)
    }

    getChunkedImageData() {
        const perChunk = 4

        let chunked = this.imageData.reduce((ar, it, i) => {
            const ix = Math.floor(i / perChunk)
            if (!ar[ix]) {
                ar[ix] = []
            }
            ar[ix].push(it)
            return ar
        }, [])

        let filtered = chunked.filter(rgba => {
            return rgba.slice(0, 2).every(val => val < 250) && rgba.slice(0, 2).every(val => val > 0)
        })

        return filtered
    }

    getUniqValues(chunked) {
        return chunked.reduce((accum, current) => {
            let key = current.join('|')
            if (!accum[key]) {
                accum[key] = 1
                return accum
            }
            accum[key] = ++(accum[key])
            return accum
        }, {})
    }

    renderPalette() {
        let top = null
        let chunked = this.getChunkedImageData()
        let uniq = this.getUniqValues(chunked)
        let sortable = []
        for (let rgba in uniq) {
            sortable.push([rgba, uniq[rgba]])
        }
        let sorted = sortable.sort((a, b) => {
            return a[1] - b[1]
        }).reverse().map(s => {
            const rgba = s[0].split('|')
            return {
                r: rgba[0],
                g: rgba[1],
                b: rgba[2],
                occurs: s[1]
            }
        }).slice(0, 5)
        return sorted
    }

    buildPaletteOutput(rendered) {
        const outputNodeType = this.output.nodeName.toLowerCase()
        const frag = document.createDocumentFragment()
        rendered.forEach(r => {
            const childElement = outputNodeType == 'ul' ? document.createElement('li') : document.createElement('span')
            childElement.style.backgroundColor = `rgb(${r.r}, ${r.g}, ${r.b})`
            childElement.classList.add('palette-output')
            frag.appendChild(childElement)
        })
        this.output.appendChild(frag)
    }

    render() {
        this.canvas.width = this.imageDimensions.width
        this.canvas.height = this.imageDimensions.height
        this.ctx.drawImage(this.target, 0, 0, this.imageDimensions.width, this.imageDimensions.height)
        this.getImageData()
        const rendered = this.renderPalette()
        if(!this.output) {
            return console.log(rendered)
        }
        return this.buildPaletteOutput(rendered)
    }
}

module.exports = () => {
    const targets = document.querySelectorAll(`[${targetSelector}]`)
    Array.from(targets).map(t => new Palette(t))
}
