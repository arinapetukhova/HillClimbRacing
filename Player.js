class Player {
  constructor(differentWorld) {
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
    this.world = otherWorld;

    this.shirtColorR = floor(random(255));
    this.shirtColorG = floor(random(255));
    this.shirtColorB = floor(random(255));

    this.lastGrounded = 0;
    this.car;

    this.deadCount = 1;
    this.motorState = 2;
  }

  addToWorld() {
    this.car = new Car(350, spawningY, this.world, this);
    this.car.setShirt();
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
  update() {
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
