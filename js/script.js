let prato = [];

// Tabela de Substituições Inteligentes 
const sugestoesTroca = {
    "Pão Francês": {
        substituto: "Pão de Forma Integral",
        novoValue: "pao-integral",
        porcaoRecomendada: 1, 
        mensagemReducao: "Redução para 1 fatia de Pão Integral para atingir nível Verde",
        receita: "Aqueça o pão integral na frigideira com uma pitada de azeite ou manteiga."
    },
    "Arroz Branco Cozido": {
        substituto: "Arroz Integral Cozido",
        novoValue: "arroz-integral",
        porcaoRecomendada: 1,
        mensagemReducao: "Redução para 1 colher de arroz integral",
        receita: "Refogue o arroz integral com alho e cebola e cozinhe com o dobro de água."
    },
    "Batata Frita": {
        substituto: "Brócolis Cozido",
        novoValue: "brocolis",
        porcaoRecomendada: 1,
        mensagemReducao: "Troca por vegetal de baixíssimo impacto glicêmico",
        receita: "Cozinhe o brócolis no vapor por 5 minutos e tempere com azeite."
    }
};

function adicionarAlimento() {
    const select = document.getElementById('alimento');
    const qtdInput = document.getElementById('quantidade');
    const numPorcoes = parseFloat(qtdInput.value);

    if (!select.value || isNaN(numPorcoes) || numPorcoes <= 0) {
        alert("Selecione um alimento e digite uma quantidade de porções válida.");
        return;
    }

    const opt = select.options[select.selectedIndex];
    const ig = parseFloat(opt.getAttribute('data-ig')) || 0;
    const carboPorPorcao = parseFloat(opt.getAttribute('data-carbo')) || 0;
    const nomePorcao = opt.getAttribute('data-porcao') || 'porção';

    const carboTotal = carboPorPorcao * numPorcoes;
    // Cálculo exato da CG: (IG * Carboidratos Líquidos) / 100
    const cgTotalItem = (carboTotal * ig) / 100;

    prato.push({
        id: Date.now(), 
        nome: opt.text.split(' (')[0].trim(),
        valueOriginal: select.value,
        numPorcoes: numPorcoes,
        nomePorcao: nomePorcao,
        ig: ig,
        carbo: carboTotal,
        cg: cgTotalItem
    });

    qtdInput.value = '1';
    atualizar();
}

function removerItem(index) {
    prato.splice(index, 1);
    atualizar();
}


function trocarAlimentoInteligente(index, novoValue, porcaoRecomendada = 1) {
    const select = document.getElementById('alimento');
    const optNovo = Array.from(select.options).find(opt => opt.value === novoValue);

    if (!optNovo) return;

    const novoIg = parseFloat(optNovo.getAttribute('data-ig')) || 0;
    const novoCarboPorPorcao = parseFloat(optNovo.getAttribute('data-carbo')) || 0;
    const novoNomePorcao = optNovo.getAttribute('data-porcao') || 'porção';
    const novoNomeLimpo = optNovo.text.split(' (')[0].trim();

   
    const novaQtdPorcoes = porcaoRecomendada;
    const carboTotal = novoCarboPorPorcao * novaQtdPorcoes;
    const cgTotalItem = (carboTotal * novoIg) / 100;

    // Atualiza o item no prato
    prato[index] = {
        id: prato[index].id,
        nome: novoNomeLimpo,
        numPorcoes: novaQtdPorcoes,
        ig: novoIg,
        carbo: carboTotal,
        cg: cgTotalItem,
        nomePorcao: novoNomePorcao
    };

    atualizar(); 

}

function atualizar() {
    const lista = document.getElementById('lista_prato');
    const status = document.getElementById('status_refeicao');
    const cgTotalEl = document.getElementById('cg_total');
    const sugestoesContainer = document.getElementById('sugestoes_container');
    const listaSugestoes = document.getElementById('lista_sugestoes');
    
    lista.innerHTML = '';
    listaSugestoes.innerHTML = ''; // Limpa a lista antes de reavaliar o prato
    let totalCG = 0;

    prato.forEach((item, i) => {
        totalCG += item.cg;

        let corBolinha = 'verde';
        if (item.cg >= 11 && item.cg <= 19) {
            corBolinha = 'amarela';
        } else if (item.cg >= 20) {
            corBolinha = 'vermelha';
        }

        lista.innerHTML += `
            <div class="card_alimento">
                <div class="card_topo">
                    <div><span>Prato:</span> <strong>${item.nome}</strong></div>
                    <div><span>Porção:</span> <strong>${item.numPorcoes}x (${item.nomePorcao})</strong></div>
                    <div><span>IG:</span> <strong>${item.ig}</strong></div>
                    <span class="dot ${corBolinha}"></span>
                    <button class="btn_x" onclick="removerItem(${i})">X</button> 
                </div>
                <div class="card_valores">
                    <div class="bloco_azul"><span>Carbo:</span> <strong>${item.carbo.toFixed(1)}g</strong></div>
                    <div class="bloco_azul"><span>CG do Item:</span> <strong>${item.cg.toFixed(1)}</strong></div>
                </div>
            </div>
        `;
    });

    cgTotalEl.textContent = totalCG.toFixed(1);

    // Avaliação de estado e acumulação de sugestões
    if (prato.length === 0) {
        status.textContent = "Adicione alimentos ao prato";
        status.className = "status_refeicao";
        sugestoesContainer.style.display = "none";
    } else if (totalCG <= 10.9) {
        status.textContent = "Refeição Segura (Baixa Carga Glicêmica ≤ 10)";
        status.className = "status_refeicao segura";
        sugestoesContainer.style.display = "none";
    } else {
        if (totalCG >= 11 && totalCG <= 19) {
            status.textContent = "Atenção: Médio Impacto Glicêmico (CG entre 11 e 19)";
            status.className = "status_refeicao alerta";
        } else {
            status.textContent = "Alerta: Alto Impacto Glicêmico! (CG ≥ 20)";
            status.className = "status_refeicao perigosa";
        }

        // Procura TODOS os itens com impacto individual médio/alto (CG > 10) que tenham troca cadastrada
        const itensCriticos = prato
            .map((item, index) => ({ ...item, index }))
            .filter(item => item.cg > 10 && sugestoesTroca[item.nome]);

        if (itensCriticos.length > 0) {
            // Percorre todos os itens críticos e acumula as sugestões
            itensCriticos.forEach(contribuinte => {
                gerarSugestoesInteligentes(contribuinte, listaSugestoes);
            });
        } else {
            listaSugestoes.innerHTML = `
                <li><strong>Dica Geral:</strong> Reduza as porções dos carboidratos ou adicione fibras e proteínas para baixar a Carga Glicêmica total.</li>
            `;
        }

        sugestoesContainer.style.display = "block";
    }
}

function gerarSugestoesInteligentes(contribuinte, container) {
    if (contribuinte && sugestoesTroca[contribuinte.nome]) {
        const troca = sugestoesTroca[contribuinte.nome];
        const porcaoRecomendada = troca.porcaoRecomendada || 1;

        container.innerHTML += `
            <li class="item_sugestao" style="margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
                <strong>Sugestão Inteligente:</strong> O item <em>"${contribuinte.nome}"</em> está elevando a carga glicêmica do prato.<br>
                Substitua por <strong>${porcaoRecomendada} porção de ${troca.substituto}</strong> para garantir a redução da Carga Glicêmica.
                <br><br>
                <button class="btn_ajuste" onclick="trocarAlimentoInteligente(${contribuinte.index}, '${troca.novoValue}', ${porcaoRecomendada})">
                    Substituir por "${troca.substituto}" em 1 Clique 
                </button>
                <br><small style="margin-top: 5px; display: block;"><strong>Modo de Preparo:</strong> ${troca.receita}</small>
            </li>
        `;
    }
     else {
        container.innerHTML = `
            <li><strong>Dica Geral:</strong> Adicione proteínas (ex: ovos, frango) ou vegetais ricos em fibras para desacelerar a absorção de glicose.</li>
        `;
    }
}

function fecharDisclaimer() {
    const disclaimer = document.getElementById('disclaimer_medico');
    if (disclaimer) {
        disclaimer.style.display = 'none';
    }
}