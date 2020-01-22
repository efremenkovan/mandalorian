const canvasSketch = require('canvas-sketch')

const settings = {
  animate: true,
  duration: 9,
  fps: 36,
  dimensions: [ 1080, 1920 ]
}

const LIMIT = 1350,
      cols = 60,
      rows = 100,
      period = 90,
      grid = [],
      imageSize = cols,
      randoms = Array.from(Array(cols), () => new Array(period)),
      image = Array.from(Array(imageSize), () => new Array(imageSize))


const sketch = ({width, height}) => {
  const size = width/cols

  class Dot {
    constructor(x, y, random) {
      this.x = x
      this.y = y
      this.random = random
      this.actualSize = size*random
      this.limit = LIMIT + Math.sin(x*y*Math.random())*this.random*40
      this.fadeTime = 0.2
      this.angle = Math.random()
    }
  
    draw(context,progress) {;
      if(progress < 0) {
        context.save()
        context.translate(this.x + size/2 - this.actualSize/2, this.y + size/2 - this.actualSize/2)
        context.fillStyle = '#fff'
        context.fillRect(0,0,this.actualSize, this.actualSize)
        context.restore()
      } else {
        let shift =  progress*500
        let shiftX = shift*Math.cos(this.angle)
        let shiftY = shift*Math.sin(this.angle)
        context.save()
        context.translate(this.x + size/2 - this.actualSize/2, this.y + size/2 - this.actualSize/2)
        context.fillStyle = `rgba(255,255,255,${1-progress})`
        context.fillRect(shiftX,shiftY,this.actualSize/2, this.actualSize/2)
        context.fillRect(-shiftX,shiftY,this.actualSize/2, this.actualSize/2)
        context.restore()
      } 
    }
  }

  let img = new Image()

  img.onload = () => {
    const canv = document.createElement('canvas')
    const ctx = canv.getContext('2d')
    canv.width = imageSize
    canv.height = imageSize

    ctx.drawImage(img,0,0,imageSize,imageSize)
    let data = ctx.getImageData(0,0,imageSize,imageSize).data;

    for(let i = 3; i < data.length; i+=4) {
      let x = (Math.floor(i/4))%imageSize
      let y = Math.floor((i/4)/imageSize)
      image[y][x] = data[i]/255
    }

    for(let i = 0; i < cols; i++) {
      for(let j = 0; j < period; j++){
        randoms[i][j] = j < imageSize ? Math.random()*0.7 + 0.3*image[j][i] : Math.random()*0.7;
      }
    }
  
    for(let col = 0; col < cols; col++) {
      for(let row = -period; row < rows; row++) {
        grid.push(new Dot(size*col, size*row, randoms[col][(row + period*2)%period]))
      }
    }
  }
  img.src='./mando.png'

  render = ({ context, width, height,playhead }) => {
    context.fillStyle = "#000"
    context.fillRect(0,0,width,height);
    context.save()
    context.translate(0,playhead*size*period)
    grid.forEach(cell => {
      cell.draw(context, (playhead*size*period+cell.y - cell.limit)/period/3);
    })
    context.restore()
  };

  return render
};

canvasSketch(sketch, settings);
