class NeuralNetwork {
  constructor(inputNodes, hiddenNodes) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = 1;
    
    this.weights_ih = this.randomMatrix(hiddenNodes, inputNodes);
    this.weights_ho = this.randomMatrix(1, hiddenNodes);
    this.bias_h = new Array(hiddenNodes).fill(0.1);
    this.bias_o = [0.1];
  }
  
  randomMatrix(rows, cols) {
    return Array.from({length: rows}, () => 
      Array.from({length: cols}, () => (Math.random() * 3 - 1) * 0.1)
    );
  }

  copy() {
    let copy = new NeuralNetwork(this.inputNodes, this.hiddenNodes);
    copy.weights_ih = this.weights_ih.map(row => [...row]);
    copy.weights_ho = this.weights_ho.map(row => [...row]);
    copy.bias_h = [...this.bias_h];
    copy.bias_o = [...this.bias_o];
    return copy;
  }

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
}