const WIDTH = 800;
const HEIGHT = 800;

class View {

  canvas: {
    width: number
    height: number
    getContext?: any
  }
  ctx: CanvasRenderingContext2D
    width: number
    height: number
  constructor(canvas: {width: number,height: number}, width: number, height: number) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx  = this.canvas.getContext('2d');
    this.width = width;
    this.height = height;
  }

  update(model: BlockBreaking) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.beginPath();
    this.ctx.arc(model.ball.x, model.ball.y, model.ball.r, 0, 2 * Math.PI);
    this.ctx.stroke();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.rect(model.paddle.left(), model.paddle.up(), model.paddle.width, model.paddle.height);
    this.ctx.fillStyle = '#aad'
    this.ctx.fillRect(30, 30,30,30)
    this.ctx.strokeRect(90, 540,40,40)
    this.ctx.stroke();
    this.ctx.fill();
    this.ctx.fillStyle = 'aliceblue'

    model.blocks.forEach((b:any) => {
      if (b.hidden) { return }
      this.ctx.beginPath();
      this.ctx.rect(b.left(), b.up(), b.width, b.height);
      this.ctx.stroke();
      this.ctx.fill();
    });
  }
}

class Block {
  width: number
  height: number
  x: number
  y: number
  hidden: boolean
  constructor(x:number, y:number) {
    this.width = 18;
    this.height = 18;
    this.x = x;
    this.y = y;
    this.hidden = false;
  }

  left() {
    return this.x - (this.width / 2);
  }

  right() {
    return this.x + (this.width / 2);
  }

  up() {
    return this.y - (this.height / 2);
  }

  down() {
    return this.y + (this.height / 2);
  }

  judge(ball: Ball) {
    if (this.up() <= ball.down() && this.down() >= ball.up()) {
      if (ball.right() >= this.left() && ball.left() <= this.right()) {
        this.hidden = true;
        if (ball.right() > this.left() && ball.left() < this.right()) {
          ball.reflectY();
        } else {
          ball.reflectX();
        }
      }
    }
  }
}

class Paddle {
  width: number
  height: number
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 5;
  }

   paddleSize() {
    this.width = 800;
  }

  left() {
    return this.x - (this.width / 2);
  }

  right() {
    return this.x + (this.width / 2);
  }

  up() {
    return this.y - (this.height / 2);
  }

  down() {
    return this.y + (this.height / 2);
  }

  moveRight() {
    this.x += 20;
  }

  moveLeft() {
    this.x -= 20;
  }

  isCollided(ball: Ball) {

    if (this.up() <= ball.down() && this.down() >= ball.up()) {
      if (ball.right() >= this.left() && ball.left() <= this.right()) {
        return true;
      }
    }
    return false;
  }
}

class Ball {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 3.5;
    this.vy = 5;
    this.r = 10;
  }

  next() {
    this.x += this.vx;
    this.y += this.vy;
  }

  left() {
    return this.x - this.r;
  }

  right() {
    return this.x + this.r;
  }

  up() {
    return this.y - this.r;
  }

  down() {
    return this.y + this.r;
  }

  reflectY() {
    this.vy *= -1;
  }

  reflectX() {
    this.vx *= -1;
  }
}

class BlockBreaking {
  width: number
  height: number
  ball: Ball
  paddle: Paddle
  blocks: any
  gameOver: boolean
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    const initX = 100;
    const initY = 200;
    this.ball = new Ball(initX, initY);

    this.paddle = new Paddle(200, 700);

    this.blocks = [];

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 7; j++) {
        this.blocks.push(new Block((j + 1) * 100, (i + 4) * 20));
      }
    }

    this.gameOver = false;
  }

  next() {
    if (this.ball.down() > this.height) {
      this.gameOver = true;
    }

    if (this.ball.up() < 0) {
      this.ball.reflectY();
    }
    if (this.ball.left() < 0 || this.ball.right() > this.width) {
      this.ball.reflectX();
    }

    if (this.paddle.isCollided(this.ball)) {
      this.ball.reflectY();
    }

    this.blocks.forEach((b: Block) => {
      if (b.hidden) { return }
      b.judge(this.ball);
    });

    if (this.blocks.every((b: Block) => b.hidden)) { this.gameOver = true; }

    this.ball.next();
  }

  moveRight() {
    if (this.paddle.right() >= this.width) { return }
    this.paddle.moveRight();
  }

  moveLeft() {
    if (this.paddle.left() <= 0) { return }
    this.paddle.moveLeft();
  }
}

class Frame {
  width: number
  height: number
  intervalId: any
  view: View
  model: BlockBreaking
  canvas: any
  window: any
  paddle: any
  keyEventListener: any
  constructor(width: number, height: number, canvas:any , window: any) {
    this.width = width;
    this.height = height;
    this.intervalId = null;
    this.keyEventListener = null;
    this.view = new View(canvas, this.width, this.height);
    this.model = new BlockBreaking(this.width, this.height);
    this.paddle = new Paddle(this.width, this.height);
    this.window = window;
  }

  start() {
    this.intervalId = setInterval(() => this.next(), 10);
    this.keyEventListener = (e: any) => this.handleKeyEvent(e);
    this.window.addEventListener('keydown', this.keyEventListener);
  }

  handleKeyEvent(e: any) {
    if (e.key === 'ArrowRight' || e.keyCode === 76) {
      this.model.moveRight();
    }
    if (e.key === 'ArrowLeft' || e.keyCode === 74) {
      this.model.moveLeft();
    }
    if (e.keyCode === 8 ) {
      window.location.reload();
    }
  }

  next() {
    this.model.next();
    this.view.update(this.model);

    if (this.model.gameOver) {
      this.stop();
    }
  }

  stop() {
    clearInterval(this.intervalId);
    this.window.removeEventListener('keydown', this.keyEventListener);
  }
}

const canvas = document.getElementById('canvas');
canvas?.style.backgroundImage = 'url(https://i.imgur.com/iyFIaBa.png)';
canvas?.style.backgroundRepeat = 'no-repeat';
canvas?.style.backgroundSize = '100px';
canvas?.style.backgroundPosition = '670px 680px';
canvas?.style.backgroundColor = '#33507799';
const frame = new Frame(WIDTH, HEIGHT, canvas, window);
frame.start();
