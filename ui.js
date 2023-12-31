class UI {
    canvas = null
    font = "sans-serif"
    fontLoaded = true
    autoOutline = 4.5
    relative = true
    doScroll = true
    textShadow = {top: 0, bottom: 0, left: 0, right: 0, multiply: 0.5}
    targetSize = {x: 1500, y: 1000}
    setFont(font, fontPath="") {
        this.fontLoaded = false
        this.font = font
        if (font == "font") {
            let font2 = new FontFace("font", "url("+fontPath+")")
            font2.load().then(function(loadedFont) {
                ui.fontLoaded = true
                document.fonts.add(loadedFont)
            })
            let style = document.createElement("style")
            style.textContent = `
                @font-face {
                    font-family: "font";
                    src: url("${fontPath}");
                }
            `
            document.head.appendChild(style)
        } else {
            this.fontLoaded = true
        }
    }
    setC(canvas) {
        ctx.restore()
        this.canvas = canvas
        if (this.canvas) {
            ctx.beginPath()
            ctx.rect(this.canvas.x-this.canvas.width/2, this.canvas.y-this.canvas.height/2, this.canvas.width, this.canvas.height)
            ctx.closePath()
            ctx.save()
            ctx.clip()
        }
    }
    resizeCanvas() {
        window.canvas.width = window.innerWidth
        window.canvas.height = window.innerHeight
        document.body.style.cursor = ""
        document.body.style.zoom = "100%"
        window.scrollTo(0, 0)
    }
    getSu() {
        let w = window.innerWidth
    	let h = window.innerHeight
    
    	let aspect = w / this.targetSize.x
    
    	window.su = aspect
    	if (su > h / this.targetSize.y) {
    		su = h / this.targetSize.y
    	}
        return su
    }
    newImg(src) {
        let img = new Image()
        img.src = src
        return img
    }
    rect(x, y, width, height, colour=[0, 0, 0, 1], outlineSize=0, outlineColour=[0, 0, 0, 1]) {
        if (this.relative && this.canvas) {
            x += this.canvas.x-this.canvas.width/2
            y += this.canvas.y-this.canvas.height/2
        }
        if (this.doScroll && this.canvas) {
            x += this.canvas.off.x
            y += this.canvas.off.y
        }
        ctx.fillStyle = `rgba(${colour[0]},${colour[1]},${colour[2]},${colour[3]})`
        if (outlineSize > 0) {
            ctx.lineWidth = outlineSize
            ctx.strokeStyle = `rgba(${outlineColour[0]},${outlineColour[1]},${outlineColour[2]},${outlineColour[3]})`
            ctx.strokeRect(x - width/2, y - height/2, width, height)
        }
        ctx.fillRect(x - width/2, y - height/2, width, height)
    }
    text(x, y, size, text, options={}) {
        if (!this.fontLoaded) { return {lines: 0, width: 0} }

        var {align="left", colour=[255, 255, 255, 1], outlineColour=[0, 0, 0, 1], outlineSize="auto", wrap=-1} = options

        if (this.relative && this.canvas) {
            x += this.canvas.x-this.canvas.width/2
            y += this.canvas.y-this.canvas.height/2
        }
        if (this.doScroll && this.canvas) {
            x += this.canvas.off.x
            y += this.canvas.off.y
        }
        
        ctx.fillStyle = `rgba(${colour[0]},${colour[1]},${colour[2]},${colour[3]})`
        ctx.font = `${size}px ${this.font}`
        ctx.lineJoin = "round"
        ctx.textAlign = align
        ctx.textBaseline = "middle"
        ctx.strokeStyle = `rgba(${outlineColour[0]},${outlineColour[1]},${outlineColour[2]},${outlineColour[3]})`
        if (outlineSize == "auto") {
            outlineSize = size/this.autoOutline
        }
        ctx.lineWidth = outlineSize
        let words = text.split(" ")
        let lines = []
        let line = ""
        for (let word of words) {
            let newLine = word.includes("\n")
            word = word.replace("\n", "")
            if ((ctx.measureText(line + word + " ").width < wrap || wrap == -1) && !newLine) {
                line += word + " "
            } else {
                if (line[line.length-1] == " ") {
                    line = line.substring(0, line.length-1)
                }
                
                // console.log(line.replace(" ", "/"))
                lines.push(line)
                line = word + " "
            }
        }
        if (line[line.length-1] == " ") {
            line = line.substring(0, line.length-1)
        }
        lines.push(line)

        for (let i = 0; i < lines.length; i++) {
            while (ctx.measureText(lines[i]).width > wrap && wrap != -1) {
                lines[i] = lines[i].slice(0, -1)
            }
        }
        let maxWidth = 0
        let dirs = ["top", "bottom", "left", "right"]
        let i2 = 0
        let links2 = []
        for (let i in lines) {
            let fixed = lines[i]
            // if (fixed[fixed.length-1] == " ") {
            //     fixed = fixed.substring(0, fixed.length-1)
            // }

            ctx.strokeStyle = `rgba(${outlineColour[0]},${outlineColour[1]},${outlineColour[2]},${outlineColour[3]})` 
            ctx.strokeText(fixed, x, y + i*size)
            
            ctx.fillStyle = `rgba(${colour[0]*this.textShadow.multiply},${colour[1]*this.textShadow.multiply},${colour[2]*this.textShadow.multiply},${colour[3]*this.textShadow.multiply})`
            ctx.strokeStyle = `rgba(${outlineColour[0]*this.textShadow.multiply},${outlineColour[1]*this.textShadow.multiply},${outlineColour[2]*this.textShadow.multiply},${outlineColour[3]*this.textShadow.multiply})`         
            for (let dir of dirs) {
                if (this.textShadow[dir] != 0) {
                    let amt = this.textShadow[dir]
                    if (amt == "auto") {
                        amt = Math.round(outlineSize/3)
                    }
                    if (dir == "left") {
                        ctx.strokeText(fixed, x - amt, y + i*size)
                        ctx.fillText(fixed, x - amt, y + i*size)
                    } else if (dir == "right") {
                        ctx.strokeText(fixed, x + amt, y + i*size)
                        ctx.fillText(fixed, x + amt, y + i*size)
                    } else if (dir == "top") {
                        ctx.strokeText(fixed, x, y - amt + i*size)
                        ctx.fillText(fixed, x, y - amt + i*size)
                    } else if (dir == "bottom") {
                        ctx.strokeText(fixed, x, y + amt + i*size)
                        ctx.fillText(fixed, x, y + amt + i*size)
                    }
                }
            }
            
            ctx.fillStyle = `rgba(${colour[0]},${colour[1]},${colour[2]},${colour[3]})`
            ctx.fillText(fixed, x, y + i*size)
            
            let width = ctx.measureText(fixed).width
            if (width > maxWidth) {
                maxWidth = width
            }
        }
        return {lines: lines.length, width: maxWidth}
    }
    circle(x, y, radius, colour=[0, 0, 0, 1], options={}) {
        var {outlineColour=[0, 0, 0, 0], outlineSize=0, clockwise=true, sangle=0, eangle=Math.PI*2} = options
        if (this.relative && this.canvas) {
            x += this.canvas.x-this.canvas.width/2
            y += this.canvas.y-this.canvas.height/2
        }
        if (this.doScroll && this.canvas) {
            x += this.canvas.off.x
            y += this.canvas.off.y
        }
        ctx.beginPath()
        ctx.arc(x, y, radius, sangle, eangle, !clockwise)
        ctx.closePath()
        ctx.fillStyle = `rgba(${colour[0]},${colour[1]},${colour[2]},${colour[3]})`
        if (outlineSize > 0) {
            ctx.stokeStyle = `rgba(${outlineColour[0]},${outlineColour[1]},${outlineColour[2]},${outlineColour[3]})`
            ctx.lineWidth = outlineSize
            ctx.stroke()
        }
        ctx.fill()
    }
    measureText(size, text, options={}) {
        if (!this.fontLoaded) { return {lines: 0, width: 0} }

        var {outlineSize="auto", wrap=-1} = options

        ctx.font = `${size}px ${this.font}`
        ctx.lineJoin = "round"
        ctx.textBaseline = "middle"
        if (outlineSize == "auto") {
            outlineSize = size/this.autoOutline
        }
        ctx.lineWidth = outlineSize
        let words = text.split(" ")
        let lines = []
        let line = ""
        for (let word of words) {
            let newLine = word.includes("\n")
            word = word.replace("\n", "")
            if ((ctx.measureText(line + word + " ").width < wrap || wrap == -1) && !newLine) {
                line += word + " "
            } else {
                if (line[line.length-1] == " ") {
                    line = line.substring(0, line.length-1)
                }
                lines.push(line)
                line = word + " "
            }
        }
        if (line[line.length-1] == " ") {
            line = line.substring(0, line.length-1)
        }
        lines.push(line)

        for (let i = 0; i < lines.length; i++) {
            while (ctx.measureText(lines[i]).width > wrap && wrap != -1) {
                lines[i] = lines[i].slice(0, -1)
            }
        }
        let maxWidth = 0
        let dirs = ["top", "bottom", "left", "right"]
        let i2 = 0
        let links2 = []
        for (let i in lines) {
            let fixed = lines[i]

            let width = ctx.measureText(fixed).width
            if (width > maxWidth) {
                maxWidth = width
            }
        }
        return {lines: lines.length, width: maxWidth}
    }
    img(x, y, width, height, img, clip="none") {
        if (this.relative && this.canvas) {
            x += this.canvas.x-this.canvas.width/2
            y += this.canvas.y-this.canvas.height/2
        }
        if (this.doScroll && this.canvas) {
            x += this.canvas.off.x
            y += this.canvas.off.y
        }
        if (clip == "none") {
            clip = {use: false}
        } else {
            clip = {use: true, x: clip[0], y: clip[1], width: clip[2], height: clip[3]}
        }
        x = Math.round(x)
        y = Math.round(y)
        width = Math.round(width/2)*2
        height = Math.round(height/2)*2
        ctx.imageSmoothingEnabled = false
        if (clip.use) {
            ctx.drawImage(img, clip.x, clip.y, clip.width, clip.height, x-width/2, y-height/2, width, height)
        } else {
            ctx.drawImage(img, x-width/2, y-height/2, width, height)
        }
    }
    link(x, y, size, text, options={}) {
        if (!this.fontLoaded) { return {lines: 0, width: 0} }

        var {align="left", colour=[0, 200, 255, 1], outlineColour=[0, 0, 0, 1], outlineSize="auto"} = options

        let width = ui.text(x, y, size, text, {colour: colour, align: align}).width
        ui.rect(x + width/2, y + size/2, width, size/7, [0, 200, 255, 1])
        ui.text(x, y, size, text, {colour: colour, align: align}).width

        if (this.relative && this.canvas) {
            x += this.canvas.x-this.canvas.width/2
            y += this.canvas.y-this.canvas.height/2
        }
        if (this.doScroll && this.canvas) {
            x += this.canvas.off.x
            y += this.canvas.off.y
        }

        let x2 = 0
        if (align == "left") {
            x2 = x + width/2
        }
        if (align == "right") {
            x2 = x - width/2
        }
        if (align == "center") {
            x2 = x + width/2
        }
        
        return [x2, y, width, size]
    }
    hovered(x, y, width, height) {
        return (
            input.mouse.x > x-width/2 && input.mouse.x < x+width/2 &&
            input.mouse.y > y-height/2 && input.mouse.y < y+height/2
        )
    }
    get Object2D() {
        return class {
            x
            y
            width
            height
            constructor(x=0, y=0, width=0, height=0) {
                this.x = x
                this.y = y
                this.width = width
                this.height = height
            }
            set(x, y, width, height) {
                this.x = x
                this.y = y
                this.width = width
                this.height = height
            }
            collidingRect(rect) {
                return (
                    this.x+this.width/2 > rect.x-rect.width/2 &&
                    this.x-this.width/2 < rect.x+rect.width/2 &&
                    this.y+this.height/2 > rect.y-rect.height/2 &&
                    this.y-this.height/2 < rect.y+rect.height/2
                )
            }
            hasPoint(x, y) {
                return (
                    x > this.x-this.width/2 && x < this.x+this.width/2 &&
                    y > this.y-this.height/2 && y < this.y+this.height/2
                )
            }
        }
    }

    get TextBox() {
        return class extends ui.Object2D {
            text = ""
            placeholder = ""
            textO
            focused = false
            indicator
            time = 0
            lastText = ""
            mulX = 1
            mulY = 1
            focusTime = 0
            canvas
            outlineSize = 10
            outlineColour = [0, 0, 0, 1]
            colour = [0, 0, 0, 1]
            hide = false
            flash = 0
            maxCopies = 100
            flashA = 0
            copies = []
            lastText = null
            sp = 0
            twi = 0
            off = 0
            constructor(placeholder="", colour=[127, 127, 127, 1]) {
                super()
                this.placeholder = placeholder
                this.colour = colour
            }
            checkFocus(event) {
                if (this.hovered() && input.mouse.lclick) {
                    input.focused = this
                    this.focused = true
                    input.getInput.focus()
                    event.preventDefault()
                    this.time = 0
                    input.getInput.value = this.text
                }
            }
            hovered() {
                if (this.canvas) {
                    return this.hasPoint(input.mouse.x-this.canvas.x+this.canvas.width/2-this.canvas.off.x, input.mouse.y-this.canvas.y+this.canvas.height/2-this.canvas.off.y) && this.canvas.hovered()
                } else {
                    return this.hasPoint(input.mouse.x, input.mouse.y)
                }
            }
            hover() {
                if (this.hovered()) {
                    document.body.style.cursor = "text"
                    this.mulX = utils.lerp(this.mulX, 0.995, delta*15)
                    this.mulY = utils.lerp(this.mulY, 0.95, delta*15)
                } else {
                    this.mulX = utils.lerp(this.mulX, 1, delta*15)
                    this.mulY = utils.lerp(this.mulY, 1, delta*15)
                }

                if (this.sp < 0) {
                    this.sp = 0
                }

                if (this.sp > this.text.length) {
					this.sp = this.text.length
				}

                if (this.lastText != this.text) {
                    this.addCopy()
                    this.lastText = this.text
                }

                if (this.focused && input.mouse.lclick) {
                    let x = input.mouse.x - this.x + this.width/2 + this.off
                    let stext = ""
                    let i = 0
                    this.sp = 0
                    for (let letter of this.text) {
                        stext += letter
                        if (x > ui.measureText(this.height*0.75, stext).width) {
                            this.sp = i+1
                        }
                        i++
                    }
                }

                this.flash -= delta
                if (this.flash > 0) {
                    this.flashA = utils.lerp(this.flashA, 0.8, delta*20)
                } else {
                    this.flashA = utils.lerp(this.flashA, 0, delta*20)
                }
            }
            addCopy() {
                this.time = 0
                this.copies.push([this.text, this.sp])
                if (this.copies.length > this.maxCopies) {
                    this.copies.splice(0, 1)
                }
            }
            revert() {
                if (this.copies.length > 1) {
                    this.text = this.copies[this.copies.length-2][0]
                    this.sp = this.copies[this.copies.length-2][1]
                    this.copies.splice(this.copies.length-1, 1)
                    this.lastText = this.text
                    this.time = 0
                } else if (this.copies.length > 0) {
                    this.text = this.copies[0][0]
                    this.sp = this.copies[0][1]
                    this.lastText = this.text
                    this.time = 0
                }
            }
            draw() {
                ctx.save()

                ctx.beginPath()
                let w = this.width * this.mulX + this.outlineSize/2
                let h = this.height * this.mulY + this.outlineSize/2
                ctx.rect(this.x - w/2, this.y - h/2, w, h)
                ctx.clip()

                ui.rect(this.x, this.y, this.width * this.mulX, this.height * this.mulY, this.colour)

                let off = this.off
                // let off = this.twi - this.width + this.outlineSize*1.5*2
                // if (off < 0) off = 0
                // this.off = off

                if (!this.focused) {
                    this.sp = this.text.length
                }

                if (this.text.length < 1) {
                    ui.text(this.x - this.width/2 + this.height * 0.75 * 0.25 - off, this.y, this.height*0.75, this.placeholder, {colour: [100, 100, 100, 1]}).width
                    this.twi = utils.lerp(this.twi, 0, delta*20)
                } else {
                    let text2 = this.text
                    if (this.hide) {
                        text2 = ""
                        for (let i = 0; i < this.text.length; i++) {
                            text2 += "*"
                        }
                    }
                    ui.text(this.x - this.width/2 + this.height * 0.75 * 0.25 - off, this.y, this.height*0.75, text2)
                    this.twi = utils.lerp(this.twi, ui.measureText(this.height*0.75, text2.substring(0, this.sp)).width, delta*20)
                }

                this.time += delta
                if (this.time > 1) {
                    this.time = 0
                }
                if (this.focused && this.time < 0.5) {
                    ui.rect(this.x - this.width/2 + this.height * 0.75 * 0.25 + this.twi - off, this.y, this.height*0.75/7, this.height*0.75, [225, 225, 225, 1])
                }
                if (this.lastText != this.text) {
                    this.time = 0
                }
                this.lastText = this.text

                let s = this.height/7 * 2
                
                if (this.focused) {
                    this.focusTime += delta
                    if (this.focusTime > 1/10) {
                        this.focusTime = 1/10
                    }
                } else {
                    this.focusTime -= delta
                    if (this.focusTime < 0) {
                        this.focusTime = 0
                    }
                }
                
                let max = this.twi - this.width + this.height*0.75 * 0.75
                if (max - this.off > 0) {
                    this.off = utils.lerp(this.off, max, delta*10)
                }
                let min = this.twi - this.height*0.75 * 0.75
                if (min - this.off < 0) {
                    this.off = utils.lerp(this.off, min, delta*10)
                }
                if (this.off < 0) {
                    this.off = 0
                }

                ui.rect(this.x, this.y, this.width * this.mulX, this.height * this.mulY, [0, 0, 0, 0], this.outlineSize/2, this.outlineColour)

                ui.rect(this.x, this.y, this.width * this.mulX, this.height * this.mulY, [255, 255, 255, this.flashA])
                
                ctx.restore()

                ui.rect(this.x, this.y, this.width + s, this.height + s, [0, 0, 0, 0], this.outlineSize/4, [0, 0, 255, this.focusTime*10])
            }
        }
    }
    get Button() {
        return class extends ui.Object2D {
            type = ""
            bg
            text = ""
            textO
            textSize = 0
            bgColour = [0, 0, 0, 1]
            bgAlpha = 1
            visHeight = 0
            visWidth = 0
            mulVel = 0
            mul = 1
            hoverMul = 0.9
            clickMul = 0.2
            img
            scaleText = false
            clip
            canvas
            textOff = 0
            colour = [255, 255, 255, 1]
            constructor(type, text="") {
                super()
                this.text = text
                this.type = type
            }
            hovered() {
                if (this.canvas) {
                    return this.hasPoint(input.mouse.x-this.canvas.x+this.canvas.width/2-this.canvas.off.x, input.mouse.y-this.canvas.y+this.canvas.height/2-this.canvas.off.y) && this.canvas.hovered()
                } else {
                    return this.hasPoint(input.mouse.x, input.mouse.y)
                }
            }
            click() {
                this.mulVel = -this.clickMul
            }
            basic() {
                this.mulVel += delta * 5
                this.mul += this.mulVel * delta * 120
                if (this.mul > 1) {
                    this.mul = 1
                }
                if (this.mul < 0) {
                    this.mul = 0
                }
                if (this.hovered()) {
                    this.visWidth = utils.lerp(this.visWidth, this.width*this.hoverMul*this.mul, delta*15)
                    this.visHeight = utils.lerp(this.visHeight, this.height*this.hoverMul*this.mul, delta*15)
                    document.body.style.cursor = "pointer"
                } else {
                    this.visWidth = utils.lerp(this.visWidth, this.width*this.mul, delta*15)
                    this.visHeight = utils.lerp(this.visHeight, this.height*this.mul, delta*15)
                }
            }
            draw() {
                let last = ctx.globalAlpha
                ctx.globalAlpha *= this.bgAlpha
                if (this.type == "rect") {
                    ui.rect(this.x, this.y, this.visWidth, this.visHeight, this.bgColour)
                } else if (this.type == "img") {
                    ui.img(this.x, this.y, this.visWidth, this.visHeight, this.img, this.clip)
                }
                ctx.globalAlpha = last
                if (this.scaleText) {
                    ui.text(this.x + this.textOff, this.y, this.textSize * ((this.visWidth/this.width + this.visHeight/this.height) / 2), this.text, {align: "center", colour: this.colour})
                } else {
                    ui.text(this.x + this.textOff, this.y, this.textSize, this.text, {align: "center", colour: this.colour})
                }
            }
        }
    }
    get ScrollBar() {
        return class extends ui.Object2D {
            value = 50
            maxValue = 100
            handleImg
            handleClip = {use: false, x: 0, y: 0, width: 0, height: 0}
            handleWidth = 0
            handleHeight = 0
            bound = 3*4
            gOff = {x: 0, y: 0}
            img
            clip
            constructor(img, handleImg, clip={use: false, x: 0, y: 0, width: 0, height: 0}, handleClip={use: false, x: 0, y: 0, width: 0, height: 0}) {
                super()
                this.handleImg = handleImg
                this.handleClip = handleClip
                this.img = img
                this.clip = clip
            }
            setH(width, height) {
                this.handleWidth = width
                this.handleHeight = height
            }
            hovered() {
                return this.hasPoint(input.mouse.x-this.gOff.x, input.mouse.y-this.gOff.y)
            }
            convert(x) {
                return (x-this.x + this.width/2 - this.bound) / (this.width-this.bound*2) * this.maxValue
            }
            capValue() {
                if (this.value < 0) {
                    this.value = 0
                }
                if (this.value > this.maxValue) {
                    this.value = this.maxValue
                }
            }
            draw() {
                ui.img(this.x, this.y, this.width, this.height, this.img, this.clip)
                ui.img(this.x-this.width/2+this.bound + (this.width-this.bound*2) * (this.value/this.maxValue), this.y, this.handleWidth, this.handleHeight, this.handleImg, this.handleClip)
            }
        }
    }
    get Canvas() {
        return class extends ui.Object2D {
            colour = [0, 0, 0, 1]
            bounds = {minX: 0, minY: 0, maxX: 0, maxY: 0}
            tVis = 0
            vis = 0
            stop = 0
            off = {x: 0, y: 0}
            loff = {x: 0, y: 0}
            constructor(colour=[0, 0, 0, 1]) {
                super()
                this.colour = colour
            }
            update() {
                if (this.off.x < this.bounds.minX) {
                    this.off.x = this.bounds.minX
                }
                if (this.off.x > this.bounds.maxX) {
                    this.off.x = this.bounds.maxX
                }
                if (this.off.y < this.bounds.minY) {
                    this.off.y = this.bounds.minY
                }
                if (this.off.y > this.bounds.maxY) {
                    this.off.y = this.bounds.maxY
                }
            }
            hovered() {
                return this.hasPoint(input.mouse.x, input.mouse.y)
            }
            draw() {
                ui.rect(this.x, this.y, this.width, this.height, this.colour)
            }
            off() {
                return {x: this.x-this.width/2+this.ctx.off.x, y: this.y-this.height/2+this.ctx.off.y}
            }
            drawScroll(off={x: 10, y: 10}, size=10, force=false) {
                let oldS = ui.doScroll
                ui.doScroll = false
                this.stop -= delta
                if (this.stop <= 0 || this.tVis-this.vis >= 0) {
                    this.vis = utils.lerp(this.vis, this.tVis, delta*10)
                }

                this.tVis = 0
                if (this.hasPoint(input.mouse.x, input.mouse.y) && input.mouse.x-this.x > this.width/2-30 && input.mouse.y-this.y+this.height/2 > 10 && input.mouse.y-this.y+this.height/2 < this.height-10) {
                    this.tVis = 0.9
                    this.stop = 0.5
                    if (input.mouse.ldown) {
                        this.off.y = (input.mouse.y-this.y+this.height/2-size) / (this.height-size*2) * this.bounds.minY
                    }
                }

                if (this.loff.y != this.off.y) {
                    this.tVis = 0.9
                    this.stop = 0.5
                }
                this.loff.y = this.off.y

                ui.rect(this.width-off.x-size/2, this.height/2, size, this.height-off.y*2, [150, 150, 150, this.vis])

                ui.circle(this.width-off.x-size/2, Math.abs(this.off.y)/Math.abs(this.bounds.minY) * (this.height-off.y*2) + off.y, size*0.75, [200, 200, 200, this.vis])
                ui.doScroll = oldS
            }
            drawBorder(size, colour) {
                let oldS = ui.doScroll
                ui.doScroll = false
                ui.rect(this.width/2, this.height/2, this.width, this.height, [0, 0, 0, 0], size, colour)
                ui.doScroll = oldS
            }
        }
    }
}

var ui = new UI()
