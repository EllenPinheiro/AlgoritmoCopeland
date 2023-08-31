const fs = require('fs');
const parse = require('csv-parse/lib/sync');

// Lendo a planilha de avaliações e calculando as médias ponderadas
const rawData = fs.readFileSync('planilha.csv', 'utf8');
const data = parse(rawData, { columns: true });

const pesos = [0.1, 0.15, 0.15, 0.15, 0.1, 0.15, 0.2]; // pesos dos critérios
const projetos = {}; // objeto para armazenar as médias por projeto

data.forEach(avaliacao => {
    const projetoId = avaliacao['Id do Projeto'];
    const notas = [parseFloat(avaliacao['n1']), parseFloat(avaliacao['n2']), parseFloat(avaliacao['n3']),
                   parseFloat(avaliacao['n4']), parseFloat(avaliacao['n5']), parseFloat(avaliacao['n6']),
                   parseFloat(avaliacao['n7'])];
    const media = notas.reduce((total, nota, index) => total + nota * pesos[index], 0) / pesos.reduce((total, peso) => total + peso, 0);

    if (!projetos[projetoId]) {
        projetos[projetoId] = [];
    }
    projetos[projetoId].push(media);
});

// Gerando a matriz de médias
const matrizMedias = [];
for (const projetoId in projetos) {
    matrizMedias.push([projetoId, ...projetos[projetoId]]);
}

// Aplicando o método de Copeland
const matrizDecisao = [];
for (let i = 0; i < matrizMedias.length; i++) {
    const linha = [];
    for (let j = 0; j < matrizMedias.length; j++) {
        let pontos = 0;
        for (let k = 1; k <= 7; k++) { // comparar critérios 1 a 7
            if (matrizMedias[i][k] > matrizMedias[j][k]) {
                pontos++;
            } else if (matrizMedias[i][k] < matrizMedias[j][k]) {
                pontos--;
            }
        }
        linha.push(pontos);
    }
    matrizDecisao.push(linha);
}

// Somando os pontos para classificação final
const pontosFinais = matrizDecisao.map(linha => linha.reduce((total, pontos) => total + pontos, 0));

// Ordenando os projetos por pontos finais
const projetosOrdenados = matrizMedias.map((projeto, index) => [projeto[0], pontosFinais[index]])
                                      .sort((a, b) => b[1] - a[1]);

// Imprimindo a classificação final
console.log('Classificação final dos projetos:');
projetosOrdenados.forEach((projeto, index) => {
    console.log(`${index + 1}. Projeto ${projeto[0]} - Pontos: ${projeto[1]}`);
});
