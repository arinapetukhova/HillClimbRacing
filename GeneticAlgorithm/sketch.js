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
var accelerationInput = 0;
var targetAcceleration = 0;
var accelerationStep = 0.1;
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

var humanPlaying = false;

var humanPlayer;

var grassSprites = [];

var otherWorld;

var skySprite;
var darknessSprite;
var difficulty = 50;

var population = [];
var generation = 1;
var bestScores = [];
var grounds = [];
var cameraOffsetX = 400;
var cameraOffsetY = 200;

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

  for (let i = 0; i < 50; i++) {
    population.push(new Player(false));
  }
  createGround();
  resetGame();
}

function createGround() {
  groundTemplate = new Ground();
  groundTemplate.randomizeGround();

  while (groundTemplate.isTooSteep()) {
    groundTemplate = new Ground();
    groundTemplate.randomizeGround();
  }
}

function resetGame() {
  otherWorld = new b2World(new Vec2(0, 10), true);
  curGround = new Ground(otherWorld);
  curGround.cloneFrom(groundTemplate);
  curGround.setBodies(otherWorld);
  otherWorld.SetContactListener(listener);

  grounds = [curGround];

  for (let player of population) {
    player.world = otherWorld;
    player.addToWorld();
    player.dead = false;
    player.kindaDead = false;
    player.score = 0;
    player.car.maxDistance = 0;
  }
}

function draw() {
  shownGround = false;
  drawToScreen();
  nextPanX = -100;
  otherWorld.Step(1 / 30, 10, 10);

  let allDead = true;
  let bestX = 0;
  let bestPlayer = null;

  for (let player of population) {
    if (!player.dead && !player.kindaDead) {
      allDead = false;
      player.update();
      player.show();
      player.look();

      if (player.car.chassisBody) {
        let x = player.car.chassisBody.GetPosition().x * SCALE;
        if (x > bestX) {
          bestX = x;
          bestPlayer = player;
        }
      }
    }
  }

  if (allDead) {
    nextGeneration();
    resetGame();
    return;
  }
  targetPanX = nextPanX;
  let tempMult = 1;

  if (bestPlayer && bestPlayer.car.chassisBody) {
    let carX = bestPlayer.car.chassisBody.GetPosition().x * SCALE;
    let carY = bestPlayer.car.chassisBody.GetPosition().y * SCALE;

    targetPanX = carX - cameraOffsetX;
    targetPanY = carY - cameraOffsetY;

    targetPanX = max(0, targetPanX);
    targetPanY = max(0, min(targetPanY, height / 2));

    panX = lerp(panX, targetPanX, 0.1);
    panY = lerp(panY, targetPanY, 0.1);
  }

  if (!shownGround && grounds.length > 0) {
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

  let bestScore = 0;
  for (let player of population) {
    if (player.bestScore > bestScore) {
      bestScore = player.bestScore;
    }
  }
  text("Score: " + bestScore, 100, 50);
  text("Generation: " + generation, 100, 90);

  textSize(20);
  let startIndex = max(0, bestScores.length - 5);
  for (let i = startIndex; i < bestScores.length; i++) {
    text(
      "Gen " + (generation - (bestScores.length - i)) + ": " + bestScores[i],
      100,
      130 + (i - startIndex) * 25
    );
  }
}

function keyPressed() {
  if (key === " ") {
    createGround();
    resetGame();
    return;
  }

  if (humanPlaying) {
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

function nextGeneration() {
  population.sort((a, b) => b.bestScore - a.bestScore);

  bestScores.push(population[0].bestScore);
  if (bestScores.length > 20) bestScores.shift();

  const eliteCount = 10;
  const topParents = population.slice(0, 20);
  const newPopulation = [];

  for (let i = 0; i < eliteCount; i++) {
    let elite = topParents[i];
    elite.bestScore = 0;
    elite.addToWorld();
    newPopulation.push(elite);
  }

  for (let i = eliteCount; i < 50; i++) {
    let parentA, parentB;
    do {
      parentA = random(topParents);
      parentB = random(topParents);
    } while (parentA === parentB && topParents.length > 1);

    let child = new Player(false);
    child.brain = crossover(parentA.brain, parentB.brain);

    const mutationRate = map(i, eliteCount, 50, 0.1, 0.3);
    child.brain.mutate(mutationRate, 0.3);

    newPopulation.push(child);
  }
  population = newPopulation;
  generation++;
}

function crossover(brainA, brainB) {
  let newBrain = new NeuralNetwork(brainA.inputNodes, brainA.hiddenNodes);

  for (let i = 0; i < brainA.weights_ih.length; i++) {
    for (let j = 0; j < brainA.weights_ih[i].length; j++) {
      newBrain.weights_ih[i][j] =
        random() > 0.5 ? brainA.weights_ih[i][j] : brainB.weights_ih[i][j];
    }
  }

  for (let i = 0; i < brainA.weights_ho.length; i++) {
    for (let j = 0; j < brainA.weights_ho[i].length; j++) {
      newBrain.weights_ho[i][j] =
        random() > 0.5 ? brainA.weights_ho[i][j] : brainB.weights_ho[i][j];

      if (random() < 0.1) {
        newBrain.weights_ho[i][j] += random(-0.2, 0.2);
      }
    }
  }

  for (let i = 0; i < brainA.bias_h.length; i++) {
    newBrain.bias_h[i] = random() > 0.5 ? brainA.bias_h[i] : brainB.bias_h[i];

    if (random() < 0.1) {
      newBrain.bias_h[i] += random(-0.2, 0.2);
    }
  }

  for (let i = 0; i < brainA.bias_o.length; i++) {
    newBrain.bias_o[i] = random() > 0.5 ? brainA.bias_o[i] : brainB.bias_o[i];

    if (random() < 0.1) {
      newBrain.bias_o[i] += random(-0.2, 0.2);
    }
  }

  return newBrain;
}
