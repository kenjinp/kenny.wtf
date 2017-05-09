let makeFavicon = (size, tickPerLoop, tick) => {
  let canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  let ctx = canvas.getContext('2d')
  /* globals Image */
  /* globals Path2D */
  let img = new Image()
  let half = size / 2

  let circle = new Path2D()
  circle.arc(half, half, half * 0.8, 0, 2 * Math.PI)

  let circleBorder = new Path2D()
  circleBorder.arc(half, half, half, 0, 2 * Math.PI)

  if (tick < tickPerLoop) {
    let scaledAdvancement = tick * (size / tickPerLoop)

    ctx.fillStyle = '#FFFFFF'
    ctx.fill(circleBorder)

    ctx.fillStyle = '#F3928E'
    ctx.fill(circle)

    let y = () => size - scaledAdvancement
    let x = () => scaledAdvancement

    let moon = new Path2D()
    moon.arc(x(), y(), half / 4, 0, 2 * Math.PI)

    let moonBorder = new Path2D()
    moonBorder.arc(x(), y(), (half / 4) * 1.5, 0, 2 * Math.PI)
    // circle.moveTo(size, size)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill(moonBorder)
    ctx.fillStyle = '#342E3D'
    ctx.fill(moon)
  } else {
    let scaledAdvancement = (tick - tickPerLoop) * (size / tickPerLoop)
    let y = () => scaledAdvancement
    let x = () => size - scaledAdvancement

    let moon = new Path2D()
    moon.arc(x(), y(), half / 5, 0, 2 * Math.PI)
    let moonBorder = new Path2D()
    moonBorder.arc(x(), y(), (half / 5) * 1.5, 0, 2 * Math.PI)
    // circle.moveTo(size, size)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill(moonBorder)
    ctx.fillStyle = '#342E3D'
    ctx.fill(moon)

    ctx.fillStyle = '#FFFFFF'
    ctx.fill(circleBorder)

    ctx.fillStyle = '#F3928E'
    ctx.fill(circle)
  }

  ctx.drawImage(img, 0, 0)

  makeOrUpdateLink(size, canvas)
}

let render = () => {
  const MILISECONDS_PER_FRAME = 300
  const SIZES = [16, 32, 48, 62]
  const LOOP_LENGTH_MILISECONDS = 10000
  let tick = 0
  let ticksPerLoop =
    LOOP_LENGTH_MILISECONDS / MILISECONDS_PER_FRAME
  setInterval(() => {
    SIZES.forEach((size) => makeFavicon(size, ticksPerLoop, tick))
    if (tick >= (ticksPerLoop * 2)) {
      tick = 0
    } else {
      tick++
    }
  }, MILISECONDS_PER_FRAME)
}

export const makeOrUpdateLink = (size, data) => {
  let sizeString = size + 'x' + size
  let link = document.querySelector(`link[sizes="${sizeString}"]`)
  if (!link) {
    link = document.createElement('link')
    link.type = 'image/x-icon'
    link.rel = 'icon'
    link.sizes = sizeString
    document.getElementsByTagName('head')[0].appendChild(link)
  }
  if (data) {
    link.href = data.toDataURL('image/x-icon')
  }
}

export const createFavicon = () => render()
