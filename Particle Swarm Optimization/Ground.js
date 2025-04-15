//Represents the terrain/ground in the Hill Climb Racing simulation
//handles terrain generation, physics, and rendering
class Ground {
  //Creates a new ground instance
  constructor(world) {
    this.world = world;

    this.id = "ground";
    this.vectors = [];
    this.dirtBody;
    this.grassBody;

    this.distance = 15 * canvas.width;
    this.x = 0;
    this.y = 0;
    this.smoothness = 15;
    this.grassThickness = 5;
    this.steepness = 250;

    this.grassPositions = [];
    this.steepnessLevel = 50 + difficulty;
    this.estimatedDIfficulty = 0;
  }

  //Generates randomized terrain
  randomizeGround() {
    let startingPoint = random(100000);

    let totalDifference = 0;
    for (var i = 0; i < this.distance; i += this.smoothness) {
      this.steepnessLevel = map(i, 0, this.distance, 100, 180);

      let flatLength = 800;
      let noisedY = noise(
        startingPoint + (i - flatLength) / (1000 - this.steepnessLevel)
      );
      let maxHeight = 250 + map(this.steepnessLevel, 0, 200, 0, 200);
      let minHeight = 30;
      let heightAddition = 0;
      if (i < flatLength) {
        noisedY = noise(startingPoint);
        heightAddition = (flatLength - i) / 10;
      }

      this.vectors.push(
        new Vec2(
          i,
          canvas.height -
            map(noisedY, 0, 1, minHeight, maxHeight) +
            heightAddition
        )
      );
      if (i > 0) {
        totalDifference += abs(
          this.vectors[this.vectors.length - 2].y -
            this.vectors[this.vectors.length - 1].y
        );
      }

      for (var j = 0; j < 2; j++) {
        if (random(1) < 0.05) {
          this.grassPositions.push(floor(random(grassSprites.length)));
        } else {
          if (
            i != 0 &&
            this.grassPositions[this.grassPositions.length - 1] != -1 &&
            random(1) < 0.7
          ) {
            this.grassPositions.push(floor(random(grassSprites.length)));
            if (
              this.grassPositions[this.grassPositions.length - 1] ==
              this.grassPositions[this.grassPositions.length - 2]
            ) {
              this.grassPositions[this.grassPositions.length - 1] = floor(
                random(grassSprites.length)
              );
            }
          } else {
            this.grassPositions.push(-1);
          }
        }
      }
    }

    this.vectors.push(
      new Vec2(this.distance, canvas.height + this.grassThickness * 2)
    );
    this.vectors.push(new Vec2(0, canvas.height + this.grassThickness * 2));
    spawningY = this.vectors[10].y - 100;

    for (var vect of this.vectors) {
      vect.x /= SCALE;
      vect.y /= SCALE;
    }
  }

  //Checks if terrain is too steep for gameplay
  isTooSteep() {
    for (var v of this.vectors) {
      let oi = this.getPositions(v.x, 10, 1);
      var totalDifference = 0;
      for (var i = 1; i < oi.length; i++) {
        totalDifference += max(0, oi[i - 1] - oi[i]);
      }
      if (totalDifference > 5) {
        return true;
      }
    }
    return false;
  }

  //Copies terrain from another Ground instance
  cloneFrom(otherGround) {
    for (var v of otherGround.vectors) {
      this.vectors.push(createVector(v.x, v.y));
    }
    for (var g of otherGround.grassPositions) {
      this.grassPositions.push(g);
    }
  }
  //Creates physics bodies for the terrain
  setBodies(worldToAddTo) {
    this.world = worldToAddTo;
    this.makeBody();
    for (var i = 1; i < this.vectors.length; i++) {
      this.addEdge(
        this.vectors[i - 1],
        this.vectors[i],
        DIRT_MASK,
        DIRT_CATEGORY,
        false
      );
    }

    for (var i = 1; i < this.vectors.length; i++) {
      this.addEdge(
        new Vec2(
          this.vectors[i - 1].x,
          this.vectors[i - 1].y - this.grassThickness / SCALE
        ),
        new Vec2(
          this.vectors[i].x,
          this.vectors[i].y - this.grassThickness / SCALE
        ),
        GRASS_MASK,
        GRASS_CATEGORY,
        true
      );
    }
  }

  //Renders the terrain with grass decorations
  show() {
    fill(88, 35, 0);
    stroke(0, 120, 0);
    strokeWeight(this.grassThickness * 2);

    beginShape();
    push();
    translate(-panX, -panY);

    for (var i = 0; i < this.vectors.length - 3; i++) {
      if (this.grassPositions[2 * i] != -1) {
        image(
          grassSprites[this.grassPositions[2 * i]],
          this.vectors[i].x * SCALE -
            grassSprites[this.grassPositions[2 * i]].width / 2,
          this.vectors[i].y * SCALE -
            grassSprites[this.grassPositions[2 * i]].height / 2 -
            15
        );
      }
      if (this.grassPositions[2 * i + 1] != -1) {
        let tempX =
          ((this.vectors[i].x + this.vectors[i + 1].x) / 2) * SCALE -
          grassSprites[this.grassPositions[2 * i + 1]].width / 2;
        let tempY =
          ((this.vectors[i].y + this.vectors[i + 1].y) / 2) * SCALE -
          grassSprites[this.grassPositions[2 * i + 1]].height / 2 -
          15;
        image(grassSprites[this.grassPositions[2 * i + 1]], tempX, tempY);
      }
    }
    for (var i = 0; i < this.vectors.length - 2; i++) {
      vertex(this.vectors[i].x * SCALE, this.vectors[i].y * SCALE);
    }

    vertex(this.distance, canvas.height + this.grassThickness * 2 + panY);
    vertex(0, canvas.height + this.grassThickness * 2 + panY);

    endShape(CLOSE);

    strokeWeight(3);
    stroke(66, 60, 0);
    for (var i = 0; i < this.vectors.length - 3; i++) {
      line(
        this.vectors[i].x * SCALE,
        this.vectors[i].y * SCALE + 9,
        this.vectors[i + 1].x * SCALE,
        this.vectors[i + 1].y * SCALE + 9
      );
    }
    stroke(44, 90, 0);

    for (var i = 0; i < this.vectors.length - 3; i++) {
      line(
        this.vectors[i].x * SCALE,
        this.vectors[i].y * SCALE + 6,
        this.vectors[i + 1].x * SCALE,
        this.vectors[i + 1].y * SCALE + 6
      );
    }

    strokeWeight(3);
    stroke(0, 140, 0);

    for (var i = 0; i < this.vectors.length - 3; i++) {
      line(
        this.vectors[i].x * SCALE,
        this.vectors[i].y * SCALE - 5,
        this.vectors[i + 1].x * SCALE,
        this.vectors[i + 1].y * SCALE - 5
      );
    }
    stroke(0, 130, 0);

    for (var i = 0; i < this.vectors.length - 3; i++) {
      line(
        this.vectors[i].x * SCALE,
        this.vectors[i].y * SCALE - 3,
        this.vectors[i + 1].x * SCALE,
        this.vectors[i + 1].y * SCALE - 3
      );
    }
    strokeWeight(1);

    pop();
  }

  //Creates the base physics bodies
  makeBody() {
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2StaticBody;
    bodyDef.position.x = 0;
    bodyDef.position.y = 0;
    this.dirtBody = this.world.CreateBody(bodyDef);
    this.grassBody = this.world.CreateBody(bodyDef);
    this.dirtBody.SetUserData(this);
    this.grassBody.SetUserData(this);
  }

  //Adds a physics edge between two points
  addEdge(vec1, vec2, mask, category, isGrass) {
    var fixDef = new b2FixtureDef();
    fixDef.friction = 0.99;
    fixDef.restitution = 0.1;
    fixDef.shape = new b2PolygonShape();

    fixDef.shape.SetAsEdge(vec1, vec2);

    var filtData = new b2FilterData();
    filtData.categoryBits = category;
    filtData.maskBits = mask;

    if (isGrass) {
      this.grassBody.CreateFixture(fixDef).SetFilterData(filtData);
    } else {
      this.dirtBody.CreateFixture(fixDef).SetFilterData(filtData);
    }
  }

  //Gets terrain heights at a position
  getPositions(x, numberOfPositions, skip) {
    var returnList = [];
    for (var i = 0; i < this.vectors.length; i++) {
      if (this.vectors[i].x >= x) {
        for (
          var j = 0;
          j < min(skip * numberOfPositions, this.vectors.length - i);
          j += skip
        ) {
          returnList.push(this.vectors[i + j].y);
        }
        break;
      }
    }
    while (returnList.length < numberOfPositions) {
      returnList.push(returnList[returnList.length - 1]);
    }
    return returnList;
  }

  //Function to show terrain sampling points
  showPoints(x, numberOfPositions, skip) {
    push();
    translate(-panX, -panY);
    var returnList = [];
    for (var i = 0; i < this.vectors.length; i++) {
      if (this.vectors[i].x >= x) {
        for (
          var j = 0;
          j < min(skip * numberOfPositions, this.vectors.length - i);
          j += skip
        ) {
          fill(255);
          noStroke();
          ellipse(
            this.vectors[i + j].x * SCALE,
            this.vectors[i + j].y * SCALE,
            10
          );
        }
        break;
      }
    }

    pop();
  }
}
