/* eslint-disable max-len */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
// Cria um grid de quadrados na página de acordo com o tamanho da tela
const wrapper = document.getElementById('tiles');

let columns = 0;
let rows = 0;

const createTile = () => {
  const tile = document.createElement('div');
  tile.classList.add('tile');
  return tile;
};

const createTiles = (quantity) => {
  Array.from(Array(quantity)).map(() => {
    wrapper.appendChild(createTile());
    return createTiles;
  });
};

const createGrid = () => {
  const size = document.body.clientWidth > 800 ? 100 : 50;

  columns = Math.floor(document.body.clientWidth / size);
  rows = Math.floor(document.body.clientHeight / size);

  wrapper.style.setProperty('--columns', columns);
  wrapper.style.setProperty('--rows', rows);

  createTiles(columns * rows);
};

createGrid();

// Pega as variáveis do HTML
const colorPalette = document.getElementById('color-palette');
const randomColorButton = document.getElementById('button-random-color');
const pixelBoard = document.getElementById('pixel-board');
const boardSizeInput = document.getElementById('board-size');
const generateBoardButton = document.getElementById('generate-board');
const clearBoardButton = document.getElementById('clear-board');
const dropper = document.getElementById('dropper');
const pixelsTotal = pixelBoard.childNodes;

let colors = [];
let selectedColor = 'rgb(0, 0, 0)';
let isMouseDown = false;
let fifthColor = null;

// Função que gera uma cor aleatória
function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Tenta recuperar a paleta salva no localStorage
const storedColors = localStorage.getItem('colorPalette');
if (storedColors) {
  colors = JSON.parse(storedColors);
} else {
  colors = ['rgb(0, 0, 0)'];
  for (let i = 0; i < 3; i += 1) {
    const color = generateRandomColor();
    if (color !== '#FFFFFF' && colors.indexOf(color) === -1) {
      colors.push(color);
    }
  }
}

// Função que renderiza as cores na paleta
function renderColors() {
  colorPalette.innerHTML = '';
  colors.forEach((color, index) => {
    const colorDiv = document.createElement('div');
    colorDiv.classList.add('color');
    if (index === 0) {
      colorDiv.classList.add('selected');
    }
    colorDiv.style.backgroundColor = color;
    colorPalette.appendChild(colorDiv);
  });
}

renderColors();

const colorDivs = document.querySelectorAll('.color');
const cssStylesheet = document.styleSheets[0];

for (let i = 0; i < colorDivs.length; i += 1) {
  const colorDiv = colorDivs[i];
  const color = getComputedStyle(colorDiv).backgroundColor;

  cssStylesheet.insertRule(`:root { --g${i + 1}: ${color}; }`, cssStylesheet.cssRules.length);
}

// Função que gera uma paleta de cores aleatórias
const generateRandomPalette = () => {
  colors = ['rgb(0, 0, 0)'];
  for (let i = 0; i < 3; i += 1) {
    const color = generateRandomColor();
    if (color !== '#FFFFFF' && colors.indexOf(color) === -1) {
      colors.push(color);
    }
  }
  localStorage.setItem('colorPalette', JSON.stringify(colors));
  renderColors();

  for (let i = 0; i < document.querySelectorAll('.color').length; i += 1) {
    const color = getComputedStyle(document.querySelectorAll('.color')[i]).backgroundColor;

    cssStylesheet.insertRule(
      `:root { --g${i + 1}: ${color}; }`,
      cssStylesheet.cssRules.length,
    );
  }
  selectedColor = colors[0];
};

// Adiciona o evento de click no botão de cores aleatórias
randomColorButton.addEventListener('click', generateRandomPalette);
// Adiciona o evento do botão do meio do mouse para gerar cores aleatórias
document.addEventListener('auxclick', generateRandomPalette);

// Adiciona o evento de scroll para mudar a cor selecionada
document.addEventListener('wheel', (event) => {
  const direction = event.deltaY > 0 ? 1 : -1; // 1 para baixo, -1 para cima

  // encontra a div .color que está selecionada atualmente
  const selectedDiv = Array.from(colorDivs).find((div) => div.classList.contains('selected'));

  // encontra o índice da div selecionada atualmente
  const selectedIndex = Array.from(colorDivs).indexOf(selectedDiv);

  // atualiza a div selecionada de acordo com a direção do scroll
  let newSelectedIndex = selectedIndex + direction;
  if (newSelectedIndex < 0) newSelectedIndex = colorDivs.length - 1;
  if (newSelectedIndex >= colorDivs.length) newSelectedIndex = 0;

  selectedDiv.classList.remove('selected');
  colorDivs[newSelectedIndex].classList.add('selected');
  selectedColor = getComputedStyle(colorDivs[newSelectedIndex]).backgroundColor;
});

// Adiciona o evento de click nas cores da paleta
colorPalette.addEventListener('click', (event) => {
  const colorDiv = event.target;
  if (colorDiv.classList.contains('color')) {
    const currentSelectedColor = document.querySelector('.color.selected');
    if (currentSelectedColor) {
      currentSelectedColor.classList.remove('selected');
    }
    selectedColor = colorDiv.style.backgroundColor;
    colorDiv.classList.add('selected');
  }
});

// Adiciona o evento de mouse down no pixel board
pixelBoard.addEventListener('mousedown', () => {
  isMouseDown = true;
});

// Adiciona o evento de mouse up fora do pixel board
document.addEventListener('mouseup', () => {
  isMouseDown = false;
});

// Adiciona o evento de mouse move no pixel board
pixelBoard.addEventListener('mousemove', (event) => {
  if (!isMouseDown) return;
  const pixel = event.target.closest('.pixel');
  if (!pixel) return;
  pixel.style.backgroundColor = event.buttons === 1 ? selectedColor : 'white';
});

// Adiciona o evento de mouse click no pixel board
pixelBoard.addEventListener('click', (event) => {
  const pixel = event.target;
  if (!pixel.classList.contains('pixel')) return;
  pixel.style.backgroundColor = selectedColor;
});

// Adiciona o evento de click no pixel board
pixelBoard.addEventListener('contextmenu', (event) => {
  const pixel = event.target;
  if (pixel.classList.contains('pixel')) {
    pixel.style.backgroundColor = 'white';
  }
});

// Cria as bordas dos pixels
function addBorders() {
  const pixelBoardChildren = pixelBoard.querySelectorAll('.pixel');
  const side = Math.sqrt(pixelBoardChildren.length);
  pixelBoardChildren[0].setAttribute('id', 'pixel-top-left');
  pixelBoardChildren[side - 1].setAttribute('id', 'pixel-top-right');
  pixelBoardChildren[pixelBoardChildren.length - side].setAttribute('id', 'pixel-bottom-left');
  pixelBoardChildren[pixelBoardChildren.length - 1].setAttribute('id', 'pixel-bottom-right');
}

function createChart() {
  // objeto que armazena as contagens de cada cor encontrada
  const colorCounts = {};

  // percorre a lista de pixels
  pixelsTotal.forEach((pixel) => {
    const color = getComputedStyle(pixel).backgroundColor;

    if (!colorCounts[color]) {
      // se a cor não foi encontrada antes, cria um novo contador
      colorCounts[color] = 0;
    }

    // incrementa o contador correspondente à cor encontrada
    colorCounts[color] += 1;
  });

  // adiciona o gráfico ao DOM
  const chartContainer = document.getElementById('chart');
  chartContainer.innerHTML = '';

  // cria uma nova div.color-total para cada conjunto de cor e porcentagem
  Object.keys(colorCounts).forEach((color) => {
    const count = colorCounts[color];
    const percentage = (count / pixelsTotal.length) * 100;

    const colorTotal = document.createElement('div');
    colorTotal.classList.add('color-total');

    const chartColor = document.createElement('div');
    chartColor.classList.add('chart-color');
    chartColor.style.backgroundColor = color;

    const colorPercentage = document.createElement('p');
    colorPercentage.classList.add('color-percentage');
    colorPercentage.textContent = `${percentage.toFixed(1)}%`;

    colorTotal.appendChild(chartColor);
    colorTotal.appendChild(colorPercentage);

    chartContainer.appendChild(colorTotal);
  });
}

// Função que cria os pixels no quadro
function createPixels(numOfPixels) {
  for (let i = 0; i < numOfPixels; i += 1) {
    const side = Math.sqrt(numOfPixels);
    const pixel = document.createElement('div');
    pixel.classList.add('pixel');
    pixel.style.backgroundColor = 'white';

    pixelBoard.style.gridTemplateRows = `repeat(${side}, 1fr)`;
    pixelBoard.style.gridTemplateColumns = `repeat(${side}, 1fr)`;
    pixelBoard.appendChild(pixel);
  }
  addBorders();
}

// Tenta recuperar o quadro salvo no localStorage, caso não haja, cria um quadro de 5x5
function restorePixelBoard() {
  const storedPixelData = localStorage.getItem('pixelBoard');
  if (storedPixelData) {
    const pixelData = JSON.parse(storedPixelData);
    pixelData.forEach((pixel) => {
      const pixelDiv = document.createElement('div');
      pixelDiv.classList.add('pixel');
      pixelDiv.style.backgroundColor = pixel.backgroundColor;
      pixelDiv.style.top = pixel.top;
      pixelDiv.style.left = pixel.left;
      pixelBoard.appendChild(pixelDiv);
      pixelBoard.style.gridTemplateRows = `repeat(${Math.sqrt(
        pixelData.length,
      )}, 1fr)`;
      pixelBoard.style.gridTemplateColumns = `repeat(${Math.sqrt(
        pixelData.length,
      )}, 1fr)`;
    }); addBorders();
  }
}

// Adiciona o evento de click no botão de limpar o quadro
clearBoardButton.addEventListener('click', () => {
  const pixels = Array.from(pixelBoard.querySelectorAll('.pixel'));
  pixels.forEach((pixel) => {
    const eachPixel = pixel;
    eachPixel.style.backgroundColor = 'white';
  });
  createChart();
});

// Adiciona uma função para salvar o quadro no localStorage
function savePixelBoard() {
  const pixels = Array.from(pixelBoard.querySelectorAll('.pixel'));
  const pixelData = pixels.map((pixel) => ({
    backgroundColor: pixel.style.backgroundColor,
    top: pixel.style.top,
    left: pixel.style.left,
  }));
  localStorage.setItem('pixelBoard', JSON.stringify(pixelData));
}

pixelBoard.addEventListener('mouseup', savePixelBoard);
window.addEventListener('beforeunload', savePixelBoard);
restorePixelBoard();

// Adiciona o evento de click no botão de gerar o quadro
generateBoardButton.addEventListener('click', () => {
  const boardSize = parseInt(boardSizeInput.value, 10);

  if (boardSize === Math.sqrt(pixelsTotal.length)) {
    generateBoardButton.classList.add('shake');
    setTimeout(() => {
      generateBoardButton.classList.remove('shake');
    }, 300);
  } else if (boardSize > 50) {
    pixelBoard.innerHTML = '';
    createPixels(50 ** 2);
    // salva o quadro no localStorage caso ele seja gerado
    savePixelBoard();
  } else if (boardSize > 5) {
    pixelBoard.innerHTML = '';
    createPixels(boardSize ** 2);
  } else if (boardSize < 6 && boardSize > 0) {
    pixelBoard.innerHTML = '';
    createPixels(5 ** 2);
  } else {
    alert('Board inválido!');
  }
  createChart();
});

document
  .getElementById('drawing-board')
  .addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

// Recebe os valores dos seguintes botões clicados
function setStep(increment) {
  let step = parseInt(boardSizeInput.step, 10);
  if (boardSizeInput.value === '0' && increment) {
    step = 5;
  }
  if (boardSizeInput.value === '5' && !increment) {
    step = 5;
  }
  return step;
}

// Adiciona o evento de click nos botões de incremento e decremento
function stepper(button) {
  const increment = button.id === 'increment';
  const input = parseInt(boardSizeInput.value, 10);
  const newValue = input + (increment ? setStep(true) : -setStep(false));
  if (newValue >= 5 && newValue <= 16) {
    boardSizeInput.value = newValue;
  }
}

if (pixelBoard.childElementCount === 0) {
  createPixels(5 ** 2);
}

// chama a função createChart toda vez que o pixelBoard for alterado
pixelBoard.addEventListener('click', createChart);
pixelBoard.addEventListener('contextmenu', createChart);
pixelBoard.addEventListener('mouseleave', createChart);
window.onload = createChart;

function handlePixelClick(event) {
  const pixel = event.target;
  selectedColor = pixel.style.backgroundColor;

  if (!fifthColor && !Array.from(colorDivs).some((div) => div.style.backgroundColor === selectedColor)) {
    createFifthColor();
  }

  if (fifthColor) {
    if (Array.from(colorDivs).some((div) => div.style.backgroundColor === selectedColor)) {
      removeFifthColor();
      Array.from(colorDivs).forEach((div) => {
        if (div.style.backgroundColor === selectedColor) {
          div.classList.add('selected');
        }
      });
    } else {
      fifthColor.style.backgroundColor = selectedColor;
    }
  }

  removePixelClickHandlers();
}

function handleChartColorClick(event) {
  const chartColor = event.target;
  selectedColor = chartColor.style.backgroundColor;

  if (!fifthColor && !Array.from(colorDivs).some((div) => div.style.backgroundColor === selectedColor)) {
    createFifthColor();
  }

  if (fifthColor) {
    if (Array.from(colorDivs).some((div) => div.style.backgroundColor === selectedColor)) {
      removeFifthColor();
      Array.from(colorDivs).forEach((div) => {
        if (div.style.backgroundColor === selectedColor) {
          div.classList.add('selected');
        }
      });
    } else {
      fifthColor.style.backgroundColor = selectedColor;
    }
  }

  removeChartColorClickHandlers();
}

function removePixelClickHandlers() {
  const pixels = Array.from(pixelBoard.querySelectorAll('.pixel'));
  pixels.forEach((pixel) => {
    pixel.removeEventListener('click', handlePixelClick);
  });
}

function removeChartColorClickHandlers() {
  const chartColors = document.querySelectorAll('.chart-color');
  chartColors.forEach((chartColor) => {
    chartColor.removeEventListener('click', handleChartColorClick);
  });
}

dropper.addEventListener('click', () => {
  // Remove os event listeners dos pixels e chart colors
  const chart = document.getElementById('chart');
  removePixelClickHandlers();
  removeChartColorClickHandlers();

  // Adiciona event listener para selecionar a cor de um pixel ao clicar
  pixelBoard.addEventListener('click', handlePixelClick);

  // Adiciona event listener para selecionar a cor de um chart color ao clicar
  chart.addEventListener('click', handleChartColorClick);
});
