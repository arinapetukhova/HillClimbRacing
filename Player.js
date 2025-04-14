class Player {
  constructor(human = false) {
    this.human = human;
    this.fitness = 0;
    this.vision = [];
    this.decision = [];
    this.unadjustedFitness;
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

  loadPresetWeights() {
    // Example preset weights that might work okay
    this.brain.weights_ih = [
      [1000, 1, 1, 1, 4],
      [1, 1, 1, 1, 4],
      [1, 1, 1, 1, 4],
      [1, 1, 1, 1, 4],
    ];

    this.brain.weights_ho = [
      [3.4, 6.3, 7.5, 9.2],
      [1.5, 9.2, 7.4, 8.3],
    ];
  }

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

  AIControl() {
    const inputs = this.getCarState();
    const output = this.brain.predict(inputs); // Single value
    console.log(output);
    // Interpret output:
    // > 0 = right acceleration (0-1)
    // < 0 = left acceleration (0-1)
    if (output > 0) {
      this.car.motorOn(true, output); // Right with intensity
    } else if (output < 0) {
      this.car.motorOn(true, -output); // Left with intensity
    } else {
      this.car.motorOff();
    }
  }

  getCarState() {
    // Get relevant car information
    const carPos = this.car.chassisBody.GetPosition();
    const carVel = this.car.chassisBody.GetLinearVelocity();
    const carAngle = this.car.chassisBody.GetAngle();

    // Normalize inputs (values between 0 and 1)
    return [
      (carPos.x - panX) / width, 
      carVel.x / 20, 
      carVel.y / 20, 
      carAngle / Math.PI, 
      this.car.wheels[0].onGround ? 1 : 0, 
    ];
  }

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

  removePlayerFromWorld() {
    this.world.DestroyBody(this.car.chassisBody);
    this.world.DestroyBody(this.car.wheels[0].body);
    this.world.DestroyBody(this.car.wheels[0].rimBody);
    this.world.DestroyBody(this.car.wheels[1].body);
    this.world.DestroyBody(this.car.wheels[1].rimBody);
    this.world.DestroyBody(this.car.person.head.body);
    this.world.DestroyBody(this.car.person.torso.body);
  }
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
