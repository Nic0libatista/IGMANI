let prato = [];

function adicionarAlimento() {
    const select = document.getElementById('alimento');
    const qtdInput = document.getElementById('quantidade');
    const quantidade = parseFloat(qtdInput.value);

    if (!select.value || isNaN(quantidade) || quantidade <= 0) {
        alert("Selecione um alimento e digite uma quantidade válida.");
        return;
    }

    const opt = select.options[select.selectedIndex];
    const ig = parseFloat(opt.getAttribute('data-ig')) || 0;
    const carbo100g = parseFloat(opt.getAttribute('data-carbo')) || 0;

    const carbo = (carbo100g * quantidade) / 100;
    const cg = (carbo * ig) / 100;

    prato.push({
        nome: opt.text.split(' (')[0],
        quantidade,
        ig,
        carbo,
        cg
    });

    qtdInput.value = '';
    atualizar();
}

function removerItem(index) {
    prato.splice(index, 1);
    atualizar();
}
// Dicionário com sugestões de substituições inteligentes
const sugestoesTroca = {
    "Pão Francês": "Experimente trocar por Pão Integral ou Cuscuz de Milho.",
    "Arroz Branco Cozido": "Substitua por Arroz Integral ou Mandioca Cozida.",
    "Batata Inglesa Cozida": "Troque por Batata Doce Cozida (menor impacto glicémico).",
    "Massa de Tapioca": "Adicione sementes (chia/linhaça) na massa ou substitua por Aveia em Flocos.",
    "Macarrão Espaguete Cozido": "Substitua por Macarrão Integral ou adicione vegetais e proteínas."
};

function atualizar() {
    const lista = document.getElementById('lista_prato');
    const status = document.getElementById('status_refeicao');
    const cgTotalEl = document.getElementById('cg_total');
    const sugestoesContainer = document.getElementById('sugestoes_container');
    const listaSugestoes = document.getElementById('lista_sugestoes');
    
    lista.innerHTML = '';
    listaSugestoes.innerHTML = '';
    let totalCG = 0;
    let sugestoesEncontradas = [];

    prato.forEach((item, i) => {
        totalCG += item.cg;
        
        // Verifica se o item tem uma sugestão cadastrada e se a CG dele é moderada/alta
        if (item.cg > 10 && sugestoesTroca[item.nome]) {
            sugestoesEncontradas.push(sugestoesTroca[item.nome]);
        }

        lista.innerHTML += `
            <div class="card_alimento">
                <div class="card_topo">
                    <div><span>Prato</span><strong>${item.nome}</strong></div>
                    <div><span>Quantidade</span><strong>${item.quantidade}g</strong></div>
                    <div><span>IG</span><strong>${item.ig}</strong></div>
                    <button class="btn_x" onclick="removerItem(${i})">X</button>
                </div>
                <div class="card_valores">
                    <div class="bloco_azul"><span>Carbo</span><strong>${item.carbo.toFixed(1)}g</strong></div>
                    <div class="bloco_azul"><span>CG do Item</span><strong>${item.cg.toFixed(1)}</strong></div>
                </div>
            </div>
        `;
    });

    cgTotalEl.textContent = totalCG.toFixed(1);

    // Atualiza status e exibe sugestões apenas se a refeição precisar de atenção
    if (prato.length === 0) {
        status.textContent = "Adicione alimentos ao prato";
        status.className = "status_refeicao";
        sugestoesContainer.style.display = "none";
    } else if (totalCG <= 10) {
        status.textContent = "Sua refeição está segura";
        status.className = "status_refeicao segura";
        sugestoesContainer.style.display = "none";
    } else {
        // Se o prato tem CG alta, a sugestão explica COMO abaixar o valor total:
        if (totalCG > 19) {
            status.textContent = "Alerta: Alto Impacto Glicêmico!";
            status.className = "status_refeicao perigosa";
            
            listaSugestoes.innerHTML = `
                <li><strong>Para baixar a CG Total:</strong> Remova (no botão X) ou reduza a quantidade dos alimentos de alto impacto acima.</li>
                <li><strong>Dica de Substituição:</strong> Troque os carboidratos simples por opções integrais ou vegetais de baixo IG.</li>
            `;
        } else {
            status.textContent = "Alerta: Alto Impacto Glicêmico!";
            status.className = "status_refeicao perigosa";
        }

        // Se houver sugestões específicas de alimentos, mostra-as
        if (sugestoesEncontradas.length > 0) {
            sugestoesEncontradas.forEach(sugestao => {
                listaSugestoes.innerHTML += `<li>${sugestao}</li>`;
            });
        } else {
            listaSugestoes.innerHTML = "<li>Adicione mais fibras (saladas/legumes) ou proteínas para reduzir a Carga Glicémica total do prato.</li>";
        }
        sugestoesContainer.style.display = "block";
    }
}