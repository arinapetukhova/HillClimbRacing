class Car {
  constructor(x, y, world, player) {
    this.world = world;
    this.player = player;
    this.wheels = [];
    this.startingPosition = createVector(x, y);
    this.id = "car";
    this.chassisBody;
    this.chassisWidth = 125;
    this.chassisHeight = 40;
    this.wheelSize = 17;
    this.dead = false;
    this.changeCount = 0;
    this.number = 0;

    this.changeDiff = 0;
    this.shapes = [];
    this.carDensity = 1;
    this.carRestitution = 0.01;
    this.maxDistance = 0;
    this.motorState = 0;

    this.maxMotorSpeed = 13;
    this.currentSpeed = 0;
    this.accelerationRate = 0.2;
    this.decelerationRate = 0.3; 
    this.simpleMode = true

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2DynamicBody;
    bodyDef.position.x = x / SCALE;
    bodyDef.position.y = y / SCALE;
    bodyDef.angle = 0;

    var fixDef = new b2FixtureDef();
    fixDef.density = this.carDensity;
    fixDef.friction = 0.5;
    fixDef.restitution = this.carRestitution;
    fixDef.shape = new b2PolygonShape();

    let vectors = [];
    vectors.push(new Vec2(-this.chassisWidth / 2, 0 - this.chassisHeight / 2));
    vectors.push(
      new Vec2(this.chassisWidth / 4 + 5, 0 - this.chassisHeight / 2)
    );

    vectors.push(
      new Vec2(this.chassisWidth / 2, 0 - this.chassisHeight / 2 + 5)
    );
    vectors.push(new Vec2(this.chassisWidth / 2, this.chassisHeight / 2));
    vectors.push(new Vec2(-this.chassisWidth / 2, this.chassisHeight / 2));
    for (var vect of vectors) {
      vect.x /= SCALE;
      vect.y /= SCALE;
    }

    fixDef.shape.SetAsArray(vectors, vectors.length);
    this.shapes.push(vectors);

    this.chassisBody = this.world.CreateBody(bodyDef);

    var filtData = new b2FilterData();
    filtData.categoryBits = CHASSIS_CATEGORY;
    filtData.maskBits = CHASSIS_MASK;

    this.chassisBody.CreateFixture(fixDef).SetFilterData(filtData);

    var fixDef2 = new b2FixtureDef();
    fixDef2.density = this.carDensity;
    fixDef2.friction = 0.5;
    fixDef2.restitution = this.carRestitution;
    fixDef2.shape = new b2PolygonShape();

    var vectors2 = [];
    vectors2.push(new Vec2(this.chassisWidth / 4, 0 - this.chassisHeight / 2));
    vectors2.push(
      new Vec2(this.chassisWidth / 4 - 15, 0 - this.chassisHeight / 2 - 20)
    );
    vectors2.push(
      new Vec2(this.chassisWidth / 4 - 5, 0 - this.chassisHeight / 2 - 20)
    );
    vectors2.push(
      new Vec2(this.chassisWidth / 4 + 10, 0 - this.chassisHeight / 2)
    );
    for (var vect of vectors2) {
      vect.x /= SCALE;
      vect.y /= SCALE;
    }
    fixDef2.shape.SetAsArray(vectors2, vectors2.length);
    this.chassisBody.CreateFixture(fixDef2).SetFilterData(filtData);
    this.shapes.push(vectors2);

    var fixDef3 = new b2FixtureDef();
    fixDef3.density = this.carDensity;
    fixDef3.friction = 0.1;
    fixDef3.restitution = 0.1;
    fixDef3.shape = new b2PolygonShape();

    var vectors3 = [];
    vectors3.push(
      new Vec2(this.chassisWidth / 2, 0 - this.chassisHeight / 2 + 5)
    );
    vectors3.push(
      new Vec2(this.chassisWidth / 2 + 5, 0 - this.chassisHeight / 2 + 8)
    );
    vectors3.push(
      new Vec2(this.chassisWidth / 2 + 5, this.chassisHeight / 2 - 5)
    );
    vectors3.push(new Vec2(this.chassisWidth / 2, this.chassisHeight / 2));
    for (var vect of vectors3) {
      vect.x /= SCALE;
      vect.y /= SCALE;
    }
    fixDef3.shape.SetAsArray(vectors3, vectors3.length);
    this.chassisBody.CreateFixture(fixDef3).SetFilterData(filtData);
    this.shapes.push(vectors3);

    this.wheels.push(
      new Wheel(
        x - this.chassisWidth / 2 + this.wheelSize * 1.2,
        y + this.chassisHeight / 2 + this.wheelSize / 4,
        this.wheelSize,
        this.chassisBody,
        this.world
      )
    );
    this.wheels.push(
      new Wheel(
        x + this.chassisWidth / 2 - this.wheelSize * 1.2,
        y + this.chassisHeight / 2 + this.wheelSize / 4,
        this.wheelSize,
        this.chassisBody,
        this.world
      )
    );

    this.person = new Person(x, y, 15, 30, this.world);
    this.person.torso.colour = color(
      this.player.shirtColorR,
      this.player.shirtColorG,
      this.player.shirtColorB
    );
    var revJointDef = new b2RevoluteJointDef();
    var jointPos = new Vec2(x / SCALE, y / SCALE);
    revJointDef.Initialize(this.person.torso.body, this.chassisBody, jointPos);
    this.revJoint = this.world.CreateJoint(revJointDef);

    var distJointDef = new b2DistanceJointDef();
    var anchorPerson = new Vec2(
      x / SCALE,
      (y - (this.person.height * 2) / 3) / SCALE
    );
    var anchorCar = new Vec2(
      (x + this.chassisWidth / 2) / SCALE,
      (y - this.chassisHeight / 2) / SCALE
    );
    distJointDef.Initialize(
      this.person.torso.body,
      this.chassisBody,
      anchorPerson,
      anchorCar
    );
    distJointDef.frequencyHz = 5;
    distJointDef.dampingRatio = 0.1;
    distJointDef.length *= 1.1;
    this.distJoint = this.world.CreateJoint(distJointDef);

    this.chassisBody.SetAngularDamping(0.1);

    this.rotationTorque = 2;

    this.chassisBody.SetUserData(this);
  }
  setShirt() {
    this.person.torso.colour = color(
      this.player.shirtColorR,
      this.player.shirtColorG,
      this.player.shirtColorB
    );
  }

  show() {
    let x = this.chassisBody.GetPosition().x * SCALE;
    let y = this.chassisBody.GetPosition().y * SCALE;
    let angle = this.chassisBody.GetAngle();
    this.person.show();
    for (var i of this.wheels) {
      i.show();
    }
    push();
    translate(x - panX, y - panY);
    rotate(angle);

    image(
      carSprite,
      -this.chassisWidth / 2 - 7,
      -this.chassisHeight - 20,
      this.chassisWidth + 23,
      this.chassisHeight * 2 + 10
    );
    fill(255, 255, 0, 20);

    textAlign(CENTER, CENTER);
    textSize(15);
    stroke(255, 255, 255, 20);
    strokeWeight(1);
    pop();

    var tempPanX = x - this.startingPosition.x;
    if (
      nextPanX < tempPanX &&
      (this.player == humanPlayer || humanPlayer.dead)
    ) {
      nextPanX = tempPanX;
    }
  }

  update() {
    let x = this.chassisBody.GetPosition().x * SCALE;
    let y = this.chassisBody.GetPosition().y * SCALE;
    this.changeCount++;

    if (x > this.maxDistance) {
      this.maxDistance = x;
      if (floor(this.maxDistance) % 50 == 0) {
        this.changeCount = 0;
      }
    } else {
      if (this.changeCount > 250) {
        if (!humanPlaying) {
          this.player.dead = true;
        }
      }
    }

    if (!this.dead && y > canvas.height) {
      this.dead = true;
      this.player.dead = true;
    }
  }

  motorOnSimple(forward) {
    this.simpleMode = true;
    const motorSpeed = this.maxMotorSpeed;
    
    this.wheels[0].joint.EnableMotor(true);
    this.wheels[1].joint.EnableMotor(true);
    
    const oldState = this.motorState;
    
    if (forward) {
      this.motorState = 1;
      this.wheels[0].joint.SetMotorSpeed(-motorSpeed * PI);
      this.wheels[1].joint.SetMotorSpeed(-motorSpeed * PI);
      this.chassisBody.ApplyTorque(-this.rotationTorque);
    } else {
      this.motorState = -1;
      this.wheels[0].joint.SetMotorSpeed(motorSpeed * PI);
      this.wheels[1].joint.SetMotorSpeed(motorSpeed * PI);
    }
    
    if (oldState + this.motorState == 0 && oldState == 1) {
      this.applyTorque(this.motorState * -1);
    }
    
    this.wheels[0].joint.SetMaxMotorTorque(700);
    this.wheels[1].joint.SetMaxMotorTorque(350);
  }

  motorOnAdvanced(forward, accelerationInput = 1.0) {
    this.simpleMode = false;
    
    this.wheels[0].joint.EnableMotor(true);
    this.wheels[1].joint.EnableMotor(true);
    
    const targetSpeed = this.maxMotorSpeed * accelerationInput;
    const direction = forward ? -1 : 1;
    
    if ((forward && this.motorState > 0) || (!forward && this.motorState < 0)) {
      this.currentSpeed = this.lerp(this.currentSpeed, targetSpeed, this.accelerationRate);
    } else {
      this.currentSpeed = this.lerp(this.currentSpeed, 0, this.decelerationRate);
      if (Math.abs(this.currentSpeed) < 0.5) {
        this.currentSpeed = 0;
        this.motorState = forward ? 1 : -1;
      }
    }
    
    const wheelSpeed = this.currentSpeed * PI * direction;
    this.wheels[0].joint.SetMotorSpeed(wheelSpeed);
    this.wheels[1].joint.SetMotorSpeed(wheelSpeed);
    
    if (forward) {
      this.chassisBody.ApplyTorque(-this.rotationTorque * accelerationInput);
    }
    
    this.wheels[0].joint.SetMaxMotorTorque(700 * accelerationInput);
    this.wheels[1].joint.SetMaxMotorTorque(350 * accelerationInput);
  }

  motorOn(forward, accelerationInput) {
    if (accelerationInput !== undefined) {
      this.motorOnAdvanced(forward, accelerationInput);
    } else {
      this.motorOnSimple(forward);
    }
  }

  motorOff() {
    if (this.simpleMode) {
      switch (this.motorState) {
        case 1:
          this.chassisBody.ApplyTorque(this.motorState * this.rotationTorque);
          break;
      }
      this.motorState = 0;
      this.wheels[0].joint.EnableMotor(false);
      this.wheels[1].joint.EnableMotor(false);
    } else {
      this.currentSpeed = this.lerp(this.currentSpeed, 0, this.decelerationRate);
      
      if (Math.abs(this.currentSpeed) < 0.1) {
        this.wheels[0].joint.EnableMotor(false);
        this.wheels[1].joint.EnableMotor(false);
        this.currentSpeed = 0;
        this.motorState = 0;
      } else {
        const direction = this.motorState > 0 ? -1 : 1;
        const wheelSpeed = this.currentSpeed * PI * direction;
        this.wheels[0].joint.SetMotorSpeed(wheelSpeed);
        this.wheels[1].joint.SetMotorSpeed(wheelSpeed);
      }
      
      if (this.motorState === 1) {
        this.chassisBody.ApplyTorque(this.rotationTorque);
      }
    }
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }

  applyTorque(direction) {
    this.chassisBody.ApplyTorque(direction * this.rotationTorque);
  }
}
