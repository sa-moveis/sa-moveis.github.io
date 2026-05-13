document.addEventListener('DOMContentLoaded', async () => {
    const parametros = new URLSearchParams(window.location.search);
    const idProduto = parametros.get('id');

    const areaProduto = document.getElementById('areaProduto');

    if (!idProduto) {
        mostrarErro('Produto não informado no link.');
        return;
    }

    let produtos = [];
let produto = null;

try {
    const dadosLocais = JSON.parse(localStorage.getItem("produtos")) || null;

    if (dadosLocais) {
        produtos = normalizarProdutos(dadosLocais);
        produto = encontrarProdutoPorId(produtos, idProduto);
    }

    if (!produto) {
        const resposta = await fetch('../produtos.json');
        const dados = await resposta.json();

        produtos = normalizarProdutos(dados);
        produto = encontrarProdutoPorId(produtos, idProduto);
    }
} catch (erro) {
    mostrarErro('Erro ao carregar o catálogo de produtos.');
    console.error(erro);
    return;
}

function normalizarProdutos(dados) {
    if (Array.isArray(dados)) {
        return dados;
    }

    if (Array.isArray(dados.produtos)) {
        return dados.produtos;
    }

    return Object.values(dados)
        .flat()
        .filter(item => item && typeof item === "object");
}

function encontrarProdutoPorId(listaProdutos, idBuscado) {
    return listaProdutos.find(produto => {
        return String(produto.id).trim() === String(idBuscado).trim();
    });
}

if (!produto) {
    mostrarErro('Produto não encontrado.');
    return;
}

    montarProduto(produto);

    function montarProduto(produto) {
        const nomeProduto = produto.nome || produto.titulo || 'Produto';
        const precoProduto = produto.preco || produto.valor || 'Consulte o valor';
        const precoAntigoProduto = produto.precoCartao || produto.precoPrazo || '';
        const economiaProduto = calcularEconomia(precoAntigoProduto, precoProduto);
        const parcelasProduto = produto.condicao ||
        produto.parcelamento ||
        (
            produto.precoCartao && produto.parcelas && produto.valorParcela
                ? `Ou ${produto.precoCartao} em ${produto.parcelas}x de ${produto.valorParcela} no cartão`
                : 'Consulte condições de pagamento no WhatsApp'
        );

        const resumoProduto = produto.resumo ||
            produto.descricaoCurta ||
            (
                Array.isArray(produto.descricao)
                    ? produto.descricao[0]
                    : produto.descricao || ''
            );

        const imagensProduto = pegarImagensProduto(produto);
        const descricaoProduto = pegarDescricaoProduto(produto);

        document.title = `${nomeProduto} | SA Móveis & Eletro`;

        document.getElementById('nome-produto').innerText = nomeProduto;
        document.getElementById('preco-produto').innerText = precoProduto;
        document.getElementById('parcelas-produto').innerText = parcelasProduto;
        document.getElementById('resumo-produto').innerText = resumoProduto;

        const precoAntigoEl = document.getElementById('preco-antigo-produto');
        const economiaPixEl = document.getElementById('economia-pix-produto');

        if (precoAntigoProduto && economiaProduto > 0) {
            precoAntigoEl.innerText = precoAntigoProduto;
            economiaPixEl.innerText = `À vista no PIX você economiza ${formatarMoedaBR(economiaProduto)}`;
        } else {
            precoAntigoEl.style.display = 'none';
            economiaPixEl.style.display = 'none';
        }

        const imagemPrincipal = document.getElementById('imagemPrincipal');
        const miniaturasProduto = document.getElementById('miniaturasProduto');
        const listaDescricao = document.getElementById('info-produto');

        let imagemAtual = 0;

        miniaturasProduto.innerHTML = '';
        listaDescricao.innerHTML = '';

        imagensProduto.forEach((imagem, index) => {
            const caminho = ajustarCaminhoImagem(imagem);

            const botao = document.createElement('button');
            botao.className = 'miniatura';
            botao.type = 'button';
            botao.dataset.img = caminho;

            botao.innerHTML = `
                <img src="${caminho}" alt="${nomeProduto} - imagem ${index + 1}">
            `;

            botao.addEventListener('click', () => {
                atualizarImagem(index);
            });

            miniaturasProduto.appendChild(botao);
        });

        descricaoProduto.forEach(item => {
            const li = document.createElement('li');
            li.innerText = item;
            listaDescricao.appendChild(li);


        });

        function atualizarImagem(index) {
            if (!imagensProduto.length) return;

            if (index < 0) {
                index = imagensProduto.length - 1;
            }

            if (index >= imagensProduto.length) {
                index = 0;
            }

            imagemAtual = index;

            const caminho = ajustarCaminhoImagem(imagensProduto[imagemAtual]);

            imagemPrincipal.src = caminho;
            imagemPrincipal.alt = nomeProduto;

            document.querySelectorAll('.miniatura').forEach((miniatura, i) => {
                miniatura.classList.toggle('ativa', i === imagemAtual);
            });
        }

        atualizarImagem(0);

        const btnAnterior = document.querySelector('.galeria-seta.anterior');
        const btnProxima = document.querySelector('.galeria-seta.proxima');

        btnAnterior.addEventListener('click', () => {
            atualizarImagem(imagemAtual - 1);
        });

        btnProxima.addEventListener('click', () => {
            atualizarImagem(imagemAtual + 1);
        });

        configurarZoom(imagemPrincipal, nomeProduto);

        configurarWhatsapp({
            nome: nomeProduto,
            preco: precoProduto,
            parcelas: parcelasProduto,
            descricao: descricaoProduto
        });

        montarProdutosRelacionados(produto, produtos);
    }

    function pegarImagensProduto(produto) {
        if (Array.isArray(produto.imagens)) return produto.imagens;
        if (Array.isArray(produto.fotos)) return produto.fotos;
        if (Array.isArray(produto.galeria)) return produto.galeria;

        if (produto.imagem) return [produto.imagem];
        if (produto.foto) return [produto.foto];
        if (produto.img) return [produto.img];

        return ['imagens/logo/logo.jpg'];
    }

    function pegarDescricaoProduto(produto) {
        if (Array.isArray(produto.descricao)) return produto.descricao;
        if (Array.isArray(produto.especificacoes)) return produto.especificacoes;
        if (Array.isArray(produto.info)) return produto.info;

        if (typeof produto.descricao === 'string') return [produto.descricao];
        if (typeof produto.resumo === 'string') return [produto.resumo];

        return ['Consulte mais informações pelo WhatsApp.'];
    }

    function ajustarCaminhoImagem(caminho) {
        if (!caminho) return '../imagens/logo/logo.jpg';

        if (
            caminho.startsWith('http') ||
            caminho.startsWith('../') ||
            caminho.startsWith('/')
        ) {
            return caminho;
        }

        caminho = caminho.replace('./', '');

        return `../${caminho}`;
    }

    function configurarZoom(imagemPrincipal, nomeProduto) {
        const zoomProduto = document.getElementById('zoomProduto');
        const imagemZoom = document.getElementById('imagemZoom');
        const fecharZoom = document.getElementById('fecharZoom');

        imagemPrincipal.addEventListener('click', () => {
            imagemZoom.src = imagemPrincipal.src;
            imagemZoom.alt = nomeProduto;
            zoomProduto.classList.add('ativo');
            document.body.style.overflow = 'hidden';
        });

        function fecharImagemAmpliada() {
            zoomProduto.classList.remove('ativo');
            document.body.style.overflow = '';
        }

        fecharZoom.addEventListener('click', fecharImagemAmpliada);

        zoomProduto.addEventListener('click', event => {
            if (event.target === zoomProduto) {
                fecharImagemAmpliada();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                fecharImagemAmpliada();
            }
        });
    }

    function configurarWhatsapp(produto) {
        const btnWhatsapp = document.getElementById('bnt-whatsapp');

        btnWhatsapp.addEventListener('click', event => {
            event.preventDefault();

            const especificacoes = produto.descricao
                .map(item => `- ${item}`)
                .join('\n');

            const mensagem = `
👋 Olá! Vim pelo *Site da S.A MÓVEIS* e me interessei pelo produto abaixo 👇🤩

🛋️ *${produto.nome}*

💰 *Preço:* ${produto.preco}

💳 *Condição:* ${produto.parcelas}

📋 *Especificações:*
${especificacoes}

🚚 *Entrega grátis em Teresina e Timon*
🛠️ *Montagem grátis dos móveis*

🔗 *Link do produto:*
${window.location.href}
`.trim();

            const url = `https://api.whatsapp.com/send?phone=5586981373829&text=${encodeURIComponent(mensagem)}`;

            window.open(url, '_blank');
        });
    }

    function mostrarErro(mensagem) {
        areaProduto.innerHTML = `
            <div class="descricaop">
                <h2>${mensagem}</h2>
                <p>Verifique se o link do produto está correto.</p>
                <br>
                <a class="wtzp" href="../index.html">Voltar para a loja</a>
            </div>
        `;
    }

    function montarProdutosRelacionados(produtoAtual, todosProdutos) {
    const section = document.getElementById('relacionadosSection');
    const lista = document.getElementById('listaRelacionados');

    if (!section || !lista || !Array.isArray(todosProdutos)) return;

    const categoriaAtual = produtoAtual.categoria || identificarCategoriaRelacionado(produtoAtual);

    let relacionados = todosProdutos.filter(produto => {
        const mesmoProduto = String(produto.id) === String(produtoAtual.id);
        const categoriaProduto = produto.categoria || identificarCategoriaRelacionado(produto);

        return !mesmoProduto && categoriaProduto === categoriaAtual;
    });

    if (relacionados.length < 4) {
        const outrosProdutos = todosProdutos.filter(produto => {
            const mesmoProduto = String(produto.id) === String(produtoAtual.id);
            const jaExiste = relacionados.some(item => String(item.id) === String(produto.id));

            return !mesmoProduto && !jaExiste;
        });

        relacionados = [...relacionados, ...outrosProdutos];
    }

    relacionados = relacionados.slice(0, 4);

    if (relacionados.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    lista.innerHTML = relacionados.map(produto => {
        const nome = produto.nome || 'Produto';
        const preco = produto.preco || 'Consulte o valor';
        const imagem = ajustarCaminhoImagem(produto.imagem || produto.img || produto.foto || pegarPrimeiraImagem(produto));
        const link = `produto.html?id=${encodeURIComponent(produto.id)}`;

        return `
            <a href="${link}" class="relacionado-card">
                <div class="relacionado-img">
                    <img src="${imagem}" alt="${nome}">
                </div>

                <div class="relacionado-info">
                    <h3>${nome}</h3>
                    <p class="relacionado-preco">${preco}</p>
                    <span class="relacionado-ver">Ver produto</span>
                </div>
            </a>
        `;
    }).join('');
}

function pegarPrimeiraImagem(produto) {
    if (Array.isArray(produto.imagens) && produto.imagens.length > 0) {
        return produto.imagens[0];
    }

    if (Array.isArray(produto.fotos) && produto.fotos.length > 0) {
        return produto.fotos[0];
    }

    if (Array.isArray(produto.galeria) && produto.galeria.length > 0) {
        return produto.galeria[0];
    }

    return 'imagens/logo/logo.jpg';
}

function identificarCategoriaRelacionado(produto) {
    const texto = normalizarTextoRelacionado(`
        ${produto.nome || ''}
        ${produto.link || ''}
        ${produto.imagem || ''}
        ${produto.resumo || ''}
        ${Array.isArray(produto.descricao) ? produto.descricao.join(' ') : produto.descricao || ''}
    `);

    const categorias = {
        roupeiros: [
            'roupeiro',
            'roupeiros',
            'guarda roupa',
            'guarda roupas',
            'guarda-roupa',
            'guardaroupa',
            'armario',
            'armario de quarto'
        ],

        sofas: [
            'sofa',
            'sofas',
            'sofá',
            'sofás',
            'estofado',
            'poltrona',
            'retratil',
            'reclinavel'
        ],

        camas: [
            'cama',
            'camas',
            'colchao',
            'colchão',
            'colchoes',
            'colchões',
            'box',
            'beliche',
            'bicama',
            'cabeceira'
        ],

        mesas: [
            'mesa',
            'mesas',
            'cadeira',
            'cadeiras',
            'jantar',
            'cozinha'
        ],

        eletros: [
            'eletro',
            'eletrodomestico',
            'fogao',
            'fogão',
            'geladeira',
            'freezer',
            'bebedouro',
            'microondas',
            'maquina',
            'tanquinho',
            'ventilador'
        ],

        outros: [
            'rack',
            'painel',
            'comoda',
            'balcao',
            'sapateira',
            'estante',
            'multiuso'
        ]
    };

    for (const categoria in categorias) {
        const encontrou = categorias[categoria].some(palavra => {
            return texto.includes(normalizarTextoRelacionado(palavra));
        });

        if (encontrou) {
            return categoria;
        }
    }

    return 'outros';
}

function normalizarTextoRelacionado(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-_/]/g, ' ')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim();
}
function converterMoedaParaNumero(valor) {
    if (!valor) return 0;

    let texto = String(valor)
        .replace(/\s/g, '')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .replace(/[^\d.]/g, '');

    return Number(texto) || 0;
}

function calcularEconomia(precoMaior, precoMenor) {
    const valorMaior = converterMoedaParaNumero(precoMaior);
    const valorMenor = converterMoedaParaNumero(precoMenor);

    if (!valorMaior || !valorMenor) {
        return 0;
    }

    return valorMaior - valorMenor;
}

function formatarMoedaBR(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}
});