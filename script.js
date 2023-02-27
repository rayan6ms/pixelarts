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
const chartBoard = document.getElementById('chart');
const boardSizeInput = document.getElementById('board-size');
const generateBoardButton = document.getElementById('generate-board');
const clearBoardButton = document.getElementById('clear-board');
const dropper = document.getElementById('dropper');
const dropperAlert = document.getElementById('dropper-alert');
const catAlert = document.getElementById('cat-alert');
const catButton = document.querySelector('#cat');
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

  const colorDivs = document.querySelectorAll('.color');
  const cssStylesheet = document.styleSheets[0];

  for (let i = 0; i < colorDivs.length; i += 1) {
    const colorDiv = colorDivs[i];
    const color = getComputedStyle(colorDiv).backgroundColor;

    cssStylesheet.insertRule(
      `:root { --g${i + 1}: ${color}; }`,
      cssStylesheet.cssRules.length
    );
  }

  for (let i = 0; i < document.querySelectorAll('.color').length; i += 1) {
    const color = getComputedStyle(
      document.querySelectorAll('.color')[i]
    ).backgroundColor;

    cssStylesheet.insertRule(
      `:root { --g${i + 1}: ${color}; }`,
      cssStylesheet.cssRules.length
    );
  }
}

renderColors();
window.addEventListener('load', renderColors);

// Função que chama a função createPixels(5 ** 2) caso o tamanho do quadro seja menor que 5
function createSmallBoard() {
  if (pixelBoard.children.length < 25) {
    createPixels(5 ** 2);
  }
}

window.addEventListener('load', createSmallBoard);

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

  selectedColor = colors[0];
};

// Adiciona o evento de click no botão de cores aleatórias
randomColorButton.addEventListener('click', generateRandomPalette);
// Adiciona o evento do botão do meio do mouse para gerar cores aleatórias
window.onmousedown = (e) => {
  if (e.button === 1) {
    generateRandomPalette();
  }
};

// Adiciona o evento de scroll para mudar a cor selecionada
document.addEventListener('wheel', (event) => {
  const direction = event.deltaY > 0 ? 1 : -1; // 1 para baixo, -1 para cima

  // encontra a div .color que está selecionada atualmente
  const selectedDiv = Array.from(colorPalette.children).find((div) =>
    div.classList.contains('selected')
  );
  // encontra o índice da div selecionada atualmente
  const selectedIndex = Array.from(colorPalette.children).indexOf(selectedDiv);

  // atualiza a div selecionada de acordo com a direção do scroll
  let newSelectedIndex = selectedIndex + direction;
  if (newSelectedIndex < 0) newSelectedIndex = colorPalette.children.length - 1;
  if (newSelectedIndex >= colorPalette.children.length) newSelectedIndex = 0;

  selectedDiv.classList.remove('selected');
  colorPalette.children[newSelectedIndex].classList.add('selected');
  selectedColor = getComputedStyle(
    colorPalette.children[newSelectedIndex]
  ).backgroundColor;
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

function toggleBoardEvent(action) {
  const addOrRemove = action === 'add' ? 'addEventListener' : 'removeEventListener';
  
  pixelBoard[addOrRemove]('mousedown', onMouseDown);
  document[addOrRemove]('mouseup', onMouseUp);
  pixelBoard[addOrRemove]('mousemove', onMouseMove);
  pixelBoard[addOrRemove]('click', onClick);
  pixelBoard[addOrRemove]('contextmenu', onContextMenu);
}

function onMouseDown(event) {
  if (event.button === 1) return;
  isMouseDown = true;
}

function onMouseUp() {
  isMouseDown = false;
}

function onMouseMove(event) {
  if (!isMouseDown) return;
  const pixel = event.target.closest('.pixel');
  if (!pixel) return;
  pixel.style.backgroundColor = event.buttons === 1 ? selectedColor : 'white';
}

function onClick(event) {
  const pixel = event.target;
  if (!pixel.classList.contains('pixel')) return;
  pixel.style.backgroundColor = selectedColor;
}

function onContextMenu(event) {
  const pixel = event.target;
  if (pixel.classList.contains('pixel')) {
    pixel.style.backgroundColor = 'white';
  }
}
toggleBoardEvent('add');

// Cria as bordas dos pixels
function addBorders() {
  const pixelBoardChildren = pixelBoard.querySelectorAll('.pixel');
  const side = Math.sqrt(pixelBoardChildren.length);
  pixelBoardChildren[0].setAttribute('id', 'pixel-top-left');
  pixelBoardChildren[side - 1].setAttribute('id', 'pixel-top-right');
  pixelBoardChildren[pixelBoardChildren.length - side].setAttribute(
    'id',
    'pixel-bottom-left'
  );
  pixelBoardChildren[pixelBoardChildren.length - 1].setAttribute(
    'id',
    'pixel-bottom-right'
  );
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

  // Muda o tamanho do gráfico de acordo com a quantidade de cores
  chartContainer.style.width = `${Object.keys(colorCounts).length * 2.64}px`;

  // Muda o left do menu de acordo com o tamanho do chart
  const chartWidth = document.querySelector('#chart').offsetWidth;
  const menuLeft = chartWidth < 422 ? '40.8%' : '38%';
  document.querySelector('#menu').style.left = menuLeft;
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

// Tenta recuperar o quadro salvo no localStorage
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
        pixelData.length
      )}, 1fr)`;
      pixelBoard.style.gridTemplateColumns = `repeat(${Math.sqrt(
        pixelData.length
      )}, 1fr)`;
    });
    addBorders();
  }
}

function createCatPixelBoard() {
  pixelBoard.innerHTML = '';
  catAlert.classList.add('alert');
  catAlert.style.top = '35%';
  setTimeout(() => {
    catAlert.classList.remove('alert');
  }, 4500);

  fetch('cat.json')
    .then((response) => response.json())
    .then((pixelData) => {
      pixelData.forEach((pixel) => {
        const pixelDiv = document.createElement('div');
        pixelDiv.classList.add('pixel');
        pixelDiv.style.backgroundColor = pixel.backgroundColor;
        pixelDiv.style.top = pixel.top;
        pixelDiv.style.left = pixel.left;
        pixelBoard.appendChild(pixelDiv);
        pixelBoard.style.gridTemplateRows = `repeat(${Math.sqrt(
          pixelData.length
        )}, 1fr)`;
        pixelBoard.style.gridTemplateColumns = `repeat(${Math.sqrt(
          pixelData.length
        )}, 1fr)`;
      });
      addBorders();
      createChart();
    });
}

catButton.addEventListener('click', createCatPixelBoard);

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
pixelBoard.addEventListener('mouseup', createChart);
window.addEventListener('beforeunload', savePixelBoard);
restorePixelBoard();

// Adiciona o evento de click no botão de gerar o quadro
generateBoardButton.addEventListener('click', () => {
  const boardSize = parseInt(boardSizeInput.value, 10);

  if (
    boardSize === Math.sqrt(pixelsTotal.length) ||
    (boardSize > 16 && Math.sqrt(pixelsTotal.length) === 16)
  ) {
    generateBoardButton.classList.add('shake');
    setTimeout(() => {
      generateBoardButton.classList.remove('shake');
    }, 300);
  } else if (boardSize > 16) {
    pixelBoard.innerHTML = '';
    createPixels(16 ** 2);
    // salva o quadro no localStorage caso ele seja gerado
    savePixelBoard();
  } else if (boardSize > 5) {
    pixelBoard.innerHTML = '';
    createPixels(boardSize ** 2);
  } else if (boardSize <= 5) {
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

// Define o valor do input como o total de pixels
const currentPixels = pixelBoard.querySelectorAll('.pixel').length;
document.getElementById('board-size').value = Math.sqrt(currentPixels);

// Chama a função createChart toda vez que o pixelBoard for alterado
pixelBoard.addEventListener('click', createChart);
pixelBoard.addEventListener('contextmenu', createChart);
pixelBoard.addEventListener('mouseleave', createChart);
window.onload = createChart;

function handleColorClick(event) {
  const color = event.target;
  selectedColor = color.style.backgroundColor;

  const selectedColorInPalette = Array.from(colorPalette.children).some(
    (div) => div.style.backgroundColor === selectedColor
  );

  if (!fifthColor && !selectedColorInPalette) {
    createFifthColor();
  } else if (fifthColor) {
    if (
      selectedColorInPalette &&
      fifthColor.style.backgroundColor !== selectedColor
    ) {
      removeFifthColor();
      Array.from(colorPalette.children).forEach((div) => {
        if (div.style.backgroundColor === selectedColor) {
          div.classList.add('selected');
        }
      });
    } else {
      fifthColor.style.backgroundColor = selectedColor;
    }
  } else {
    Array.from(colorPalette.children).forEach((div) => {
      div.classList.remove('selected');
      if (div.style.backgroundColor === selectedColor) {
        div.classList.add('selected');
      }
    });
  }

  removeColorClickHandlers();
  toggleBoardEvent('add');
  document.body.style.cursor = 'default';
}

function createFifthColor() {
  const pixels = Array.from(pixelBoard.querySelectorAll('.pixel'));
  const chartColors = Array.from(chartBoard.querySelectorAll('.chart-color'));
  const dropperColors = [...pixels, ...chartColors];
  dropperColors.forEach((color) => {
    color.addEventListener('click', handleColorClick);
  });

  fifthColor = document.createElement('div');
  fifthColor.classList.add('color');
  Array.from(colorPalette.children).forEach((div) => {
    div.classList.remove('selected');
  });
  fifthColor.classList.add('selected');
  fifthColor.style.backgroundColor = selectedColor;
  colorPalette.appendChild(fifthColor);
}

function removeFifthColor() {
  if (fifthColor) {
    fifthColor.remove();
    fifthColor = null;
  }
}

function removeColorClickHandlers() {
  const pixels = Array.from(pixelBoard.querySelectorAll('.pixel'));
  const chartColors = Array.from(chartBoard.querySelectorAll('.chart-color'));
  const dropperColors = [...pixels, ...chartColors];
  dropperColors.forEach((color) => {
    color.removeEventListener('click', handleColorClick);
  });
}

dropper.addEventListener('click', () => {
  toggleBoardEvent('remove');
  // Muda o cursor para o cursor de pipeta
  document.body.style.cursor = 'url(./dropper.cur), auto';

  // Adiciona a classe alert para a variável alert para que o alerta apareça, espera 4 segundos e remove a classe
  dropperAlert.classList.add('alert');
  setTimeout(() => {
    dropperAlert.classList.remove('alert');
  }, 4500);

  // Adiciona event listener para selecionar a cor de um pixel ou chart color ao clicar
  const pixels = Array.from(pixelBoard.querySelectorAll('.pixel'));
  const chartColors = Array.from(chartBoard.querySelectorAll('.chart-color'));
  const dropperColors = [...pixels, ...chartColors];
  dropperColors.forEach((color) => {
    color.addEventListener('click', handleColorClick);
  });
});
