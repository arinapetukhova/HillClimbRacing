class Player {
  constructor(human = false) {
    this.human = human;
    this.vision = [];
    this.decision = [];
    this.lifespan = 0;
    this.bestScore = 0;
    this.dead = false;
    this.kindaDead = false;
    this.score = 0;
    this.gen = 0;
    this.world = null;
    this.maxDistance = 0;
    this.lastPosition = 0;

    this.shirtColorR = floor(random(255));
    this.shirtColorG = floor(random(255));
    this.shirtColorB = floor(random(255));

    this.lastGrounded = 0;
    this.car = null;

    this.deadCount = 1;
    this.motorState = 2;
    if (!human) {
      this.brain = new NeuralNetwork(5, 4, 2);
    }
  }
  //The function adds the player and his car to the world
  //if the car already exists, then deletes it first to avoid duplication
  //after that, it creates a new machine and resets the "dead" status
  addToWorld() {
    if (!this.world) return;
    if (this.car) {
      this.removePlayerFromWorld();
    }
    this.car = new Car(350, spawningY, this.world, this);
    this.car.setShirt();
    this.dead = false;
    this.kindaDead = false;
  }
  //The function displays the car on the screen
  //renders the earth if it hasn't been rendered
  show() {
    if (!this.kindaDead || this.deadCount > 0) {
      this.car.show();
      if (!shownGround) {
        curGround.show();
        shownGround = true;
      }
    }
  }

  move() {}

  //The function for updating the player's state
  //if the player is alive, updates the score and the status of the machine
  //starts making a decision through the neural network and recalculates the score
  //updates the best score
  update() {
    if (this.kindaDead) return;

    if (this.human) {
      if (this.car.dead) {
        this.kindaDead = true;
      }
      if (!this.kindaDead || this.deadCount > 0) {
        this.lifespan++;
        this.car.update();
      } else {
        this.dead = true;
      }

      if (this.kindaDead) {
        this.deadCount--;
      }
      this.score = max(1, floor((this.car.maxDistance - 349) / 10));

      if (this.dead) {
        this.removePlayerFromWorld();
      }
    } else {
      this.car.update();
      this.AIControl();
      this.score = max(1, floor((this.car.maxDistance - 349) / 10));

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
      }
    }
  }
  //The function for controlling the machine
  //transmits data on the state machine to the neural network
  //according to output, decide accelerate or slow down
  AIControl() {
    const inputs = this.getCarState();
    const output = this.brain.predict(inputs);

    const scaledOutput = output * 0.5;
    if (scaledOutput > 0.1) {
      this.car.motorOn(true, scaledOutput);
    } else if (scaledOutput < -0.1) {
      this.car.motorOn(false, -scaledOutput);
    } else {
      this.car.motorOff();
    }
  }
  //The function returns the parameters of the current state of the machine
  //input data(position, speed, angle) for a neural network
  getCarState() {
    const carPos = this.car.chassisBody.GetPosition();
    const carVel = this.car.chassisBody.GetLinearVelocity();
    const carAngle = this.car.chassisBody.GetAngle();

    return [
      (carPos.x - panX) / width,
      carVel.x / 20,
      carVel.y / 20,
      carAngle / Math.PI,
      this.car.wheels[0].onGround ? 1 : 0,
    ];
  }
  //The function collect information about the environment for the player's
  //used to train a neural network or make decisions
  look() {
    this.vision = [];
    this.vision[0] = this.car.chassisBody.GetAngle();
    while (this.vision[0] < 0) {
      this.vision[0] += 2 * PI;
    }
    this.vision[0] = (this.vision[0] + PI) % (2 * PI);
    this.vision[0] = map(this.vision[0], 0, 2 * PI, 0, 1);
    this.lastGrounded++;
    if (this.car.wheels[0].onGround || this.car.wheels[1].onGround) {
      this.vision[1] = 1;
      this.lastGrounded = 0;
    } else {
      if (this.lastGrounded < 10) {
        this.vision[1] = 1;
      } else {
        this.vision[1] = 0;
      }
    }
    this.vision.push(
      map(this.car.chassisBody.GetAngularVelocity(), -4, 4, -1, 1)
    );

    let temp = groundTemplate.getPositions(
      this.car.chassisBody.GetPosition().x,
      2,
      5
    );
    let first = temp[0];
    this.vision.push(
      map(
        constrain(
          first -
            this.car.chassisBody.GetPosition().y -
            this.car.chassisHeight / SCALE,
          0,
          10
        ),
        0,
        10,
        0,
        1
      )
    );

    for (var i = 1; i < temp.length; i++) {
      temp[i] -= first;
      temp[i] = map(temp[i], -3, 3, -1, 1);
      this.vision.push(temp[i]);
    }
  }
  //The fuction removes the machine from the world
  removePlayerFromWorld() {
    this.world.DestroyBody(this.car.chassisBody);
    this.world.DestroyBody(this.car.wheels[0].body);
    this.world.DestroyBody(this.car.wheels[0].rimBody);
    this.world.DestroyBody(this.car.wheels[1].body);
    this.world.DestroyBody(this.car.wheels[1].rimBody);
    this.world.DestroyBody(this.car.person.head.body);
    this.world.DestroyBody(this.car.person.torso.body);
  }
  //The function remove the current car and create a new at the starting position
  resetCar() {
    this.world.DestroyBody(this.car.chassisBody);
    this.world.DestroyBody(this.car.wheels[0].body);
    this.world.DestroyBody(this.car.wheels[0].rimBody);
    this.world.DestroyBody(this.car.wheels[1].body);
    this.world.DestroyBody(this.car.wheels[1].rimBody);
    this.world.DestroyBody(this.car.person.head.body);
    this.world.DestroyBody(this.car.person.torso.body);

    this.car = new Car(150, 0, this.world, this);
    reset = false;
    resetCounter = 1;
    panX = 0;
  }
}
