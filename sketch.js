var Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2EdgeChainDef = Box2D.Collision.Shapes.b2EdgeChainDef;

var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2StaticBody = Box2D.Dynamics.b2Body.b2_staticBody;
var b2DynamicBody = Box2D.Dynamics.b2Body.b2_dynamicBody;
var b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var b2PrismaticJoint = Box2D.Dynamics.Joints.b2PrismaticJoint;

var b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;

var b2FilterData = Box2D.Dynamics.b2FilterData;

var b2DistanceJoint = Box2D.Dynamics.Joints.b2DistanceJoint;
var b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef;

var b2WeldJoint = Box2D.Dynamics.Joints.b2WeldJoint;
var b2WeldJointDef = Box2D.Dynamics.Joints.b2WeldJointDef;

var SCALE = 30;
var groundBody;
var wheels = [];
var groundTemplate;
var curGround;

var panX = 0;
var targetPanX = 0;
var maxPanSpeed = 100;
var panSpeed = 50;
var panAcc = 10;
var panY = 0;

var leftDown = false;
var rightDown = false;
var listener = new Box2D.Dynamics.b2ContactListener();

var carSprite;
var headSprite;
var wheelSprite;
var shownGround = false;
var reset = false;
var resetCounter = 1;

var panX = 0;
var targetPanX = 0;
var maxPanSpeed = 100;
var panSpeed = 50;
var panAcc = 10;
var panY = 0;
var spawningY = 0;

var WHEEL_CATEGORY = 0x0001;
var CHASSIS_CATEGORY = 0x0002;
var GRASS_CATEGORY = 0x0004;
var DIRT_CATEGORY = 0x0008;
var PERSON_CATEGORY = 0x0010;

var WHEEL_MASK = GRASS_CATEGORY;
var CHASSIS_MASK = DIRT_CATEGORY;
var GRASS_MASK = WHEEL_CATEGORY | PERSON_CATEGORY;
var DIRT_MASK = CHASSIS_CATEGORY;
var PERSON_MASK = GRASS_CATEGORY;

var speed = 60;

var humanPlaying = true;

var humanPlayer;

var grassSprites = [];

var otherWorld;

var skySprite;
var darknessSprite;
var difficulty = 50;

listener.BeginContact = function (contact) {
  let world = contact.GetFixtureA().GetBody().GetWorld();
  if (reset) {
    return;
  }
  if (contact.GetFixtureA().GetBody().GetUserData().id == "head") {
    if (contact.GetFixtureB().GetBody().GetUserData().id == "ground") {
      if (contact.GetFixtureA().GetBody().GetJointList() == null) {
        return;
      }
      let car = contact
        .GetFixtureA()
        .GetBody()
        .GetJointList()
        .other.GetJointList()
        .other.GetUserData();

      world.DestroyJoint(car.distJoint);
      world.DestroyJoint(car.person.distJoint);
      world.DestroyJoint(car.revJoint);
      world.DestroyJoint(car.person.headJoint);
      car.player.kindaDead = true;
    }
  }

  if (contact.GetFixtureB().GetBody().GetUserData().id == "head") {
    if (contact.GetFixtureA().GetBody().GetUserData().id == "ground") {
      if (contact.GetFixtureB().GetBody().GetJointList() == null) {
        return;
      }
      let car = contact
        .GetFixtureB()
        .GetBody()
        .GetJointList()
        .other.GetJointList()
        .other.GetUserData();
      world.DestroyJoint(car.distJoint);
      world.DestroyJoint(car.person.distJoint);
      world.DestroyJoint(car.revJoint);
      world.DestroyJoint(car.person.headJoint);
      car.player.kindaDead = true;
    }
  }

  if (contact.GetFixtureA().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureB().GetBody().GetUserData().id == "ground") {
      contact.GetFixtureA().GetBody().GetUserData().onGround = true;
    }
  }

  if (contact.GetFixtureB().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureA().GetBody().GetUserData().id == "ground") {
      contact.GetFixtureB().GetBody().GetUserData().onGround = true;
    }
  }
};

listener.EndContact = function (contact) {
  if (contact.GetFixtureA().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureB().GetBody().GetUserData().id == "ground") {
      contact.GetFixtureA().GetBody().GetUserData().onGround = false;
    }
  }

  if (contact.GetFixtureB().GetBody().GetUserData().id == "wheel") {
    if (contact.GetFixtureA().GetBody().GetUserData().id == "ground") {
      contact.GetFixtureB().GetBody().GetUserData().onGround = false;
    }
  }
};

function preload() {
  headSprite = loadImage("Pics/head.png");
  skySprite = loadImage("Pics/sky.png");
  darknessSprite = loadImage("Pics/darkness.png");

  carSprite = loadImage("Pics/car.png");
  wheelSprite = loadImage("Pics/wheel.png");
  grassSprites.push(loadImage("Pics/grass.png"));
  grassSprites.push(loadImage("Pics/grass2.png"));
  grassSprites.push(loadImage("Pics/grass3.png"));
  grassSprites.push(loadImage("Pics/grass4.png"));
  grassSprites.push(loadImage("Pics/grass5.png"));
  grassSprites.push(loadImage("Pics/grass5.png"));
}

function setup() {
  window.canvas = createCanvas(1280, 720);
  canvas.parent("canvas");
  frameRate(30);
  resetGame();
}

function resetGame() {
  groundTemplate = new Ground();
  groundTemplate.randomizeGround();

  while (groundTemplate.isTooSteep()) {
    groundTemplate = new Ground();
    groundTemplate.randomizeGround();
  }

  otherWorld = new b2World(new Vec2(0, 10), true);
  curGround = new Ground(otherWorld);
  curGround.cloneFrom(groundTemplate);
  curGround.setBodies(otherWorld);
  otherWorld.SetContactListener(listener);

  humanPlayer = new Player(true);
  humanPlayer.addToWorld(otherWorld);
}

function draw() {
  shownGround = false;
  drawToScreen();
  nextPanX = -100;
  otherWorld.Step(1 / 30, 10, 10);
  if (humanPlayer.kindaDead) {
    resetGame();
    return;
  }
  humanPlayer.update();
  humanPlayer.show();
  humanPlayer.look();

  targetPanX = nextPanX;
  let tempMult = 1;
  if (abs(targetPanX - panX) > 20 * panSpeed) {
    tempMult = 5;
  }
  if (abs(targetPanX - panX) < panSpeed * tempMult) {
    panX = targetPanX;
  } else if (targetPanX - panX < 0) {
    panX -= panSpeed * tempMult;
  } else {
    panX += panSpeed * tempMult;
  }

  if (!shownGround) {
    grounds[0].show();
  }
  if (panX < 0) {
    image(darknessSprite, -panX, 400);
  } else {
    image(darknessSprite, 0, 400);
  }
}

function drawToScreen() {
  image(skySprite, 0, 0);
  writeInfo();
}

function writeInfo() {
  fill(255);
  stroke(255);
  strokeWeight(1);
  textAlign(LEFT);
  textSize(30);
  text("Score: " + humanPlayer.score, 100, 50);
}

function keyPressed() {
  switch (keyCode) {
    case UP_ARROW:
      break;
    case DOWN_ARROW:
      break;
    case LEFT_ARROW:
      leftDown = true;
      humanPlayer.car.motorOn(false);
      break;
    case RIGHT_ARROW:
      rightDown = true;
      humanPlayer.car.motorOn(true);
      break;
  }
}

function keyReleased() {
  if (humanPlaying) {
    switch (keyCode) {
      case RIGHT_ARROW:
        rightDown = false;
        if (leftDown) {
          humanPlayer.car.motorOn(false);
        } else {
          humanPlayer.car.motorOff();
        }
        break;
      case LEFT_ARROW:
        leftDown = false;
        if (rightDown) {
          humanPlayer.car.motorOn(true);
        } else {
          humanPlayer.car.motorOff();
        }
        break;
    }
  }
}
