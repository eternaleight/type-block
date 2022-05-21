"use strict";
const WIDTH = 400;
const HEIGHT = 400;
class View {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');
        this.width = width;
        this.height = height;
    }
    update(model) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.beginPath();
        this.ctx.arc(model.ball.x, model.ball.y, model.ball.r, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.rect(model.paddle.left(), model.paddle.up(), model.paddle.width, model.paddle.height);
        this.ctx.stroke();
        this.ctx.fill();
        model.blocks.forEach((b) => {
            if (b.hidden) {
                return;
            }
            this.ctx.beginPath();
            this.ctx.rect(b.left(), b.up(), b.width, b.height);
            this.ctx.stroke();
            this.ctx.fill();
        });
    }
}
class Block {
    constructor(x, y) {
        this.width = 98;
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
    judge(ball) {
        if (this.up() <= ball.down() && this.down() >= ball.up()) {
            if (ball.right() >= this.left() && ball.left() <= this.right()) {
                this.hidden = true;
                if (ball.right() > this.left() && ball.left() < this.right()) {
                    ball.reflectY();
                }
                else {
                    ball.reflectX();
                }
            }
        }
    }
}
class Paddle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 10;
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
        this.x += 10;
    }
    moveLeft() {
        this.x -= 10;
    }
    isCollided(ball) {
        if (this.up() <= ball.down() && this.down() >= ball.up()) {
            if (ball.right() >= this.left() && ball.left() <= this.right()) {
                return true;
            }
        }
        return false;
    }
}
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0.5;
        this.vy = 1;
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
    constructor(width, height) {
        this.width = width;
        this.height = height;
        const initX = 100;
        const initY = 200;
        this.ball = new Ball(initX, initY);
        this.paddle = new Paddle(200, 300);
        this.blocks = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 6; j++) {
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
        this.blocks.forEach((b) => {
            if (b.hidden) {
                return;
            }
            b.judge(this.ball);
        });
        if (this.blocks.every((b) => b.hidden)) {
            this.gameOver = true;
        }
        this.ball.next();
    }
    moveRight() {
        if (this.paddle.right() >= this.width) {
            return;
        }
        this.paddle.moveRight();
    }
    moveLeft() {
        if (this.paddle.left() <= 0) {
            return;
        }
        this.paddle.moveLeft();
    }
}
class Frame {
    constructor(width, height, canvas, window) {
        this.width = width;
        this.height = height;
        this.intervalId = null;
        this.keyEventListener = null;
        this.view = new View(canvas, this.width, this.height);
        this.model = new BlockBreaking(this.width, this.height);
        this.window = window;
    }
    start() {
        this.intervalId = setInterval(() => this.next(), 10);
        this.keyEventListener = (e) => this.handleKeyEvent(e);
        this.window.addEventListener('keydown', this.keyEventListener);
    }
    handleKeyEvent(e) {
        if (e.key === 'ArrowRight') {
            this.model.moveRight();
        }
        if (e.key === 'ArrowLeft') {
            this.model.moveLeft();
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
const frame = new Frame(WIDTH, HEIGHT, canvas, window);
frame.start();
