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
//PSO population and tracking variables
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
//Preloads all image assets required for the game before setup
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
//Initializes the game canvas and world setup
function setup() {
  window.canvas = createCanvas(1280, 720);
  canvas.parent("canvas");
  frameRate(30);

  //Initializing a population
  for (let i = 0; i < 50; i++) {
    population.push(new Player(false));
  }
  createGround()
  resetGame();
}

//Creates a ground template by randomizing terrain until a suitable non-steep ground is generated
function createGround() {
  groundTemplate = new Ground();
  groundTemplate.randomizeGround();

  while (groundTemplate.isTooSteep()) {
    groundTemplate = new Ground();
    groundTemplate.randomizeGround();
  }
}
//The function resets the game world to initial state
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
//Main game loop function
//handles physics simulation, player updates, rendering, camera panning, and generation transitions
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
//Draws the background elements to the screen (sky)
function drawToScreen() {
  image(skySprite, 0, 0);
  writeInfo();
}
//Displays game information(score, generation)
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
//The function handles keyboard input for human player controls
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
//The function handles keyboard release events for human player controls
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
//Advances to the next generation of players using PSO
function nextGeneration() {
  let gbest = population[0];
  for (let particle of population) {
    if (particle.bestScore > gbest.bestScore) {
      gbest = particle;
    }
  }

  population.sort((a, b) => b.bestScore - a.bestScore);
  
  bestScores.push(population[0].bestScore);
  if (bestScores.length > 20) bestScores.shift();

  const eliteCount = 9
  const newPopulation = [];
  
  for (let i = 0; i < eliteCount; i++) {
    let elite = population[i];
    elite.bestScore = 0;
    elite.addToWorld();
    newPopulation.push(elite);
  }

  for (let i = eliteCount; i < 50; i++) {
    let particle = new Player(false);
    particle.brain = new NeuralNetwork(population[i].brain.inputNodes, population[i].brain.hiddenNodes);
    

    particle.brain.weights_ih = population[i].brain.copyMatrix(population[i].brain.bestWeights_ih);
    particle.brain.weights_ho = population[i].brain.copyMatrix(population[i].brain.bestWeights_ho);
    
    particle.brain.updateParticle(0, {
      weights_ih: gbest.brain.bestWeights_ih,
      weights_ho: gbest.brain.bestWeights_ho
    });
    
    newPopulation.push(particle);
  }

  population = newPopulation;
  generation++;
}
