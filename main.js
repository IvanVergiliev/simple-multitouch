var canvas = document.getElementById('demo');
var ctx = canvas.getContext('2d');
var w = canvas.width;
var h = canvas.height;

var image = new Image;
image.onload = function () {
  ctx.translate(w / 2, h / 2);
  ctx.drawImage(image, -w / 4, -h / 4, w / 2, h / 2);
};
image.src = 'demo.jpg';

var updateCanvas = function (deltaVector, scaleFactor, angle) {
  ctx.clearRect(-w / 2, -h / 2, w, h);
  ctx.translate(deltaVector.x, deltaVector.y);
  ctx.scale(scaleFactor, scaleFactor);
  ctx.rotate(angle);
  ctx.drawImage(image, -w / 4, -h / 4, w / 2, h / 2);
};

var Point = function (x, y) {
  this.x = x;
  this.y = y;
};

Point.prototype.add = function (p) {
  return new Point(this.x + p.x, this.y + p.y);
};

Point.prototype.subtract = function (p) {
  return new Point(this.x - p.x, this.y - p.y);
};

Point.prototype.scale = function (coef) {
  return new Point(this.x * coef, this.y * coef);
};

Point.prototype.normSquared = function () {
  return this.x * this.x + this.y * this.y;
};

Point.prototype.norm = function () {
  return Math.sqrt(this.normSquared());
};

Point.fromTouch = function (touch) {
  return new Point(touch.screenX, touch.screenY);
};

Point.findCenter = function (p1, p2) {
  return p1.add(p2).scale(.5);
};

Point.distanceSquared = function (p1, p2) {
  return p1.subtract(p2).normSquared();
};

Point.distance = function (p1, p2) {
  return p1.subtract(p2).norm();
};

Point.crossProduct = function (p1, p2) {
  return p1.x * p2.y - p1.y * p2.x;
};

var center = new Point(0, 0);
var direction = new Point(0, 0);
var distance;

canvas.addEventListener('touchstart', function (event) {
  if (event.targetTouches.length != 2) {
    // Don't get too fancy.
    return;
  }
  var p1 = Point.fromTouch(event.targetTouches[0]);
  var p2 = Point.fromTouch(event.targetTouches[1]);
  center = Point.findCenter(p1, p2);
  direction = p1.subtract(p2);
  distance = Point.distance(p1, p2);
});

canvas.addEventListener('touchmove', function (event) {
  if (event.targetTouches.length != 2) {
    return;
  }
  var p1 = Point.fromTouch(event.targetTouches[0]);
  var p2 = Point.fromTouch(event.targetTouches[1]);
  var newCenter = Point.findCenter(p1, p2);
  var newDirection = p1.subtract(p2);
  var newDistance = Point.distance(p1, p2);

  var deltaVector = newCenter.subtract(center);
  var scaleFactor = newDistance / distance;
  var crossProduct = Point.crossProduct(direction, newDirection);
  var normalizedCrossProduct = crossProduct / (direction.norm() * newDirection.norm());
  updateCanvas(deltaVector, scaleFactor, Math.asin(normalizedCrossProduct));

  center = newCenter;
  direction = newDirection;
  distance = newDistance;
});
