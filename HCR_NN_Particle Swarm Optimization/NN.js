class NeuralNetwork {
  //Creating the neural network with one hidden layer
  //sets the number of input, hidden, and output neurons
  //initialize the weights and offsets with random values
  constructor(inputNodes, hiddenNodes) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = 1;
    this.weights_ih = this.randomMatrix(hiddenNodes, inputNodes);
    this.weights_ho = this.randomMatrix(1, hiddenNodes);
    this.bias_h = new Array(hiddenNodes).fill(0.1);
    this.bias_o = [0.1];

    this.velocity_ih = this.createZeroMatrix(this.weights_ih);
    this.velocity_ho = this.createZeroMatrix(this.weights_ho);
    this.bestWeights_ih = this.copyMatrix(this.weights_ih);
    this.bestWeights_ho = this.copyMatrix(this.weights_ho);
    this.bestScore = -Infinity;
  }

  //The function generates a matrix of random weights for links between layers
  randomMatrix(rows, cols) {
    return Array.from({length: rows}, () => 
      Array.from({length: cols}, () => (Math.random() * 3 - 1) * 0.1)
    );
  }
  //The function running the input data through the neural network
  predict(inputArray) {
    let hidden = new Array(this.hiddenNodes).fill(0);
    for (let i = 0; i < this.hiddenNodes; i++) {
      for (let j = 0; j < this.inputNodes; j++) {
        hidden[i] += this.weights_ih[i][j] * inputArray[j];
      }
      hidden[i] = 1 / (1 + Math.exp(-(hidden[i] + this.bias_h[i])));
    }
    
    let output = 0;
    for (let j = 0; j < this.hiddenNodes; j++) {
      output += this.weights_ho[0][j] * hidden[j];
    }
    output += this.bias_o[0];
    
    return output;
  }
//create zero matrix
  createZeroMatrix(matrix) {
    return matrix.map(row => row.map(() => 0));
  }
//copy matrix
  copyMatrix(matrix) {
    return matrix.map(row => [...row]);
  }
//Compares the current result with the best, if better, saves the weights
  updateParticle(personalScore, globalBestWeights) {
    const w = 1.3, c1 = 2.5, c2 = 1.4;

    if (personalScore > this.bestScore) {
      this.bestScore = personalScore;
      this.bestWeights_ih = this.copyMatrix(this.weights_ih);
      this.bestWeights_ho = this.copyMatrix(this.weights_ho);
    }

    for (let i = 0; i < this.weights_ih.length; i++) {
      for (let j = 0; j < this.weights_ih[i].length; j++) {
        const r1 = Math.random(), r2 = Math.random();
        this.velocity_ih[i][j] = w * this.velocity_ih[i][j] +
          c1 * r1 * (this.bestWeights_ih[i][j] - this.weights_ih[i][j]) +
          c2 * r2 * (globalBestWeights.weights_ih[i][j] - this.weights_ih[i][j]);
        this.weights_ih[i][j] += this.velocity_ih[i][j];
      }
    }

    for (let i = 0; i < this.weights_ho.length; i++) {
      for (let j = 0; j < this.weights_ho[i].length; j++) {
        const r1 = Math.random(), r2 = Math.random();
        this.velocity_ho[i][j] = w * this.velocity_ho[i][j] +
          c1 * r1 * (this.bestWeights_ho[i][j] - this.weights_ho[i][j]) +
          c2 * r2 * (globalBestWeights.weights_ho[i][j] - this.weights_ho[i][j]);
        this.weights_ho[i][j] += this.velocity_ho[i][j];
      }
    }
  }
}
