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
  }

  //The function generates a matrix of random weights for links between layers
  randomMatrix(rows, cols) {
    return Array.from({length: rows}, () => 
      Array.from({length: cols}, () => (Math.random() * 3 - 1) * 0.1)
    );
  }

  //The function creates a copy of the NN
  copy() {
    let copy = new NeuralNetwork(this.inputNodes, this.hiddenNodes);
    copy.weights_ih = this.weights_ih.map(row => [...row]);
    copy.weights_ho = this.weights_ho.map(row => [...row]);
    copy.bias_h = [...this.bias_h];
    copy.bias_o = [...this.bias_o];
    return copy;
  }

  //The function running the input data through the neural network
  predict(inputArray) {
    //calculation of hidden layer values
    let hidden = new Array(this.hiddenNodes).fill(0);
    for (let i = 0; i < this.hiddenNodes; i++) {
      for (let j = 0; j < this.inputNodes; j++) {
        hidden[i] += this.weights_ih[i][j] * inputArray[j];
      }
      hidden[i] = 1 / (1 + Math.exp(-(hidden[i] + this.bias_h[i])));
    }
    
    //calculation of hidden layer values
    let output = 0;
    for (let j = 0; j < this.hiddenNodes; j++) {
      output += this.weights_ho[0][j] * hidden[j];
    }
    output += this.bias_o[0];
    
    //number will be the neural network's response to the current set of input data
    return output;
  }
}