var canvas = document.getElementById('demo');
var ctx = canvas.getContext('2d');
var w = canvas.width;
var h = canvas.height;

var image = new Image;

// Read more about canvas transformations here:
// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Transformations

image.onload = function () {
  // (0, 0) is a fixed point ( http://en.wikipedia.org/wiki/Fixed_point_(mathematics) )
  // with respect to scaling and rotation.
  // We're using this property here to position the image and canvas coordinate system
  // in such a way that the center of the image is at (0, 0) to make sure that the center
  // of the image stays fixed during rotation and scaling.
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

// This type represents a vector that starts at the beginning of the coordinate system
// and end at (x, y).
// It can also be used to represent the point (x, y).
var Vector = function (x, y) {
  this.x = x;
  this.y = y;
};

Vector.prototype.add = function (p) {
  return new Vector(this.x + p.x, this.y + p.y);
};

Vector.prototype.subtract = function (p) {
  return new Vector(this.x - p.x, this.y - p.y);
};

Vector.prototype.scale = function (coef) {
  return new Vector(this.x * coef, this.y * coef);
};

Vector.prototype.normSquared = function () {
  return this.x * this.x + this.y * this.y;
};

Vector.prototype.norm = function () {
  return Math.sqrt(this.normSquared());
};

Vector.fromTouch = function (touch) {
  return new Vector(touch.screenX, touch.screenY);
};

Vector.findCenter = function (p1, p2) {
  return p1.add(p2).scale(.5);
};

Vector.distanceSquared = function (p1, p2) {
  return p1.subtract(p2).normSquared();
};

Vector.distance = function (p1, p2) {
  return p1.subtract(p2).norm();
};

// Calculates the cross product ( http://en.wikipedia.org/wiki/Cross_product ) of two vectors.
Vector.crossProduct = function (p1, p2) {
  return p1.x * p2.y - p1.y * p2.x;
};

var center = new Vector(0, 0);
var direction = new Vector(0, 0);
var distance;

canvas.addEventListener('touchstart', function (event) {
  if (event.targetTouches.length != 2) {
    // Don't get too fancy.
    return;
  }
  var p1 = Vector.fromTouch(event.targetTouches[0]);
  var p2 = Vector.fromTouch(event.targetTouches[1]);
  center = Vector.findCenter(p1, p2);
  direction = p1.subtract(p2);
  distance = Vector.distance(p1, p2);
});

canvas.addEventListener('touchmove', function (event) {
  if (event.targetTouches.length != 2) {
    return;
  }
  var p1 = Vector.fromTouch(event.targetTouches[0]);
  var p2 = Vector.fromTouch(event.targetTouches[1]);

  // Calculate the center of mass and the distance it has travelled from its previous position.
  var newCenter = Vector.findCenter(p1, p2);
  var deltaVector = newCenter.subtract(center);

  // Calculate the distance and how much larger it is than the previous distance.
  var newDistance = Vector.distance(p1, p2);
  var scaleFactor = newDistance / distance;

  // Finally, calculate the vector with endpoints at the fingers, and find the angle it has
  // been rotated by.
  // NOTE: Since the touches are not guaranteed to be in the same order in different events,
  // for better portability you may need to match the touches via Touch.identifier
  // ( https://developer.mozilla.org/en-US/docs/Web/API/Touch.identifier ) which is guaranteed
  // to stay the same.
  var newDirection = p1.subtract(p2);
  var crossProduct = Vector.crossProduct(direction, newDirection);
  // We use the fact that cp(a, b) = ||a|| * ||b|| * sin(theta), where theta is the angle between
  // vectors a and b, to find theta.
  // This will not always give the correct result for any two vectors a and b, but
  // should be enough for handling touch events.
  var normalizedCrossProduct = crossProduct / (direction.norm() * newDirection.norm());
  var rotationAngle = Math.asin(normalizedCrossProduct);

  updateCanvas(deltaVector, scaleFactor, rotationAngle);

  center = newCenter;
  direction = newDirection;
  distance = newDistance;
});
