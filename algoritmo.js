const fs = require('fs');
const parse = require('csv-parse');

// Passo 1: Ler a planilha CSV com os critérios e pesos
const criteriosCsv = fs.readFileSync('criterios-pesos.csv', 'utf8');
const criteriosData = parse(criteriosCsv, {
  columns: true,
  skip_empty_lines: true
});

// Extrair critérios e pesos para um objeto
const criterios = {};
for (const row of criteriosData) {
  criterios[row.Critério] = parseFloat(row.Peso);
}

// Passo 2: Ler a planilha CSV com os dados dos projetos e notas
const projetosCsv = fs.readFileSync('projetos-notas.csv', 'utf8');
const projetosData = parse(projetosCsv, {
  columns: true,
  skip_empty_lines: true
});

// Passo 3: Calcular as médias ponderadas dos projetos
const mediasPonderadas = projetosData.map(projeto => {
  const notas = Object.keys(projeto)
    .filter(key => key.startsWith('n')) // aqui seleciona apenas as colunas de notas (n1, n2, ..., n7)
    .map(key => parseFloat(projeto[key]));
  
  const idProjeto = projeto['ID Projeto'];
  
  const media = notas.reduce((acc, nota, index) => {
    return acc + nota * criterios[`Critério ${index + 1}`];
  }, 0);
  
  return [idProjeto, media];
});

// Função para calcular a matriz de Copeland a partir das médias ponderadas
function calcularMatrizCopeland(mediasPonderadas) {
  const numProjetos = mediasPonderadas.length;
  const matrizCopeland = new Array(numProjetos).fill(0).map(() => new Array(numProjetos).fill(0));

  for (let i = 0; i < numProjetos; i++) {
    for (let j = i + 1; j < numProjetos; j++) {
      // Comparar os projetos i e j em relação a cada critério
      for (let k = 1; k < mediasPonderadas[i].length; k++) { // Começando de 1, pois o ID do projeto está na primeira coluna
        if (mediasPonderadas[i][k] > mediasPonderadas[j][k]) {
          matrizCopeland[i][j]++;
        } else if (mediasPonderadas[i][k] < mediasPonderadas[j][k]) {
          matrizCopeland[j][i]++;
        }
      }
    }
  }

  return matrizCopeland;
}

// Aqui, chamamos a função para calcular a matriz de Copeland a partir das médias ponderadas.
const matrizCopeland = calcularMatrizCopeland(mediasPonderadas);
// Agora, 'matrizCopeland' contém a matriz de Copeland.

//prosseguir com análises adicionais
