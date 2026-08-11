// ===============================
// MENU HAMBÚRGUER
// ===============================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        menuToggle.classList.toggle("active");
    });
}

const links = document.querySelectorAll(".links a");

links.forEach(link => {
    link.addEventListener("click", function () {
        if (window.innerWidth <= 768) {
            navLinks.classList.remove("active");
            menuToggle.classList.remove("active");
        }
    });
});


// ===============================
// WHATSAPP DA PÁGINA INICIAL
// ===============================

function abrirWhatsappPaginaInicial(e) {
    e.preventDefault();

    const mensagem = `👋 Olá! Acessei a página inicial do site da *S.A Móveis* e me interessei em conhecer melhor os produtos e condições de compra.🤩 

🔗 https://sa-moveis.github.io`.trim();

    const url = `https://api.whatsapp.com/send?phone=5586981373829&text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
}

const botaoWhatsappFrente = document.getElementById("a2");
const botaoWhatsappNav = document.getElementById("lwtp");

if (botaoWhatsappFrente) {
    botaoWhatsappFrente.addEventListener("click", abrirWhatsappPaginaInicial);
}

if (botaoWhatsappNav) {
    botaoWhatsappNav.addEventListener("click", abrirWhatsappPaginaInicial);
}


// ===============================
// SCROLL SUAVE
// ===============================

function scrollSuave(target, duration = 1000) {
    const targetPosition = target.getBoundingClientRect().top;
    const startPosition = window.pageYOffset;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) {
            startTime = currentTime;
        }

        const timeElapsed = currentTime - startTime;
        const ease = easeInOutCubic(timeElapsed, startPosition, targetPosition, duration);

        window.scrollTo(0, ease);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;

        if (t < 1) {
            return c / 2 * t * t * t + b;
        }

        t -= 2;

        return c / 2 * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
        const alvo = document.querySelector(this.getAttribute("href"));

        if (!alvo) {
            return;
        }

        e.preventDefault();
        scrollSuave(alvo, 1100);
    });
});


// ===============================
// SISTEMA DE PRODUTOS
// ===============================

let swipersCriados = [];
let catalogoOriginal = [];

const PRODUTOS_POR_BLOCO = 5;

const searchInput = document.getElementById("searchInput");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroPreco = document.getElementById("filtroPreco");
const containerVitrines = document.getElementById("vitrinesProdutos");
const btnCompartilharFiltro = document.getElementById("btnCompartilharFiltro");



// ===============================
// NORMALIZAR TEXTO
// ===============================

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[-_/]/g, " ")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .trim();
}


// ===============================
// PREÇO PARA NÚMERO
// ===============================

function precoParaNumero(preco) {
    const valor = String(preco || "")
        .replace(/[^\d,]/g, "")
        .replace(",", ".");

    return Number(valor) || 0;
}


// ===============================
// SINÔNIMOS DAS CATEGORIAS
// ===============================

const sinonimosCategorias = {
    roupeiros: [
        "roupeiro",
        "roupeiros",
        "guarda roupa",
        "guarda roupas",
        "guarda roupa casal",
        "guarda roupa solteiro",
        "guardaroupa",
        "guardaroupas",
        "armario",
        "armarios",
        "armario de quarto",
        "roupeiro casal",
        "roupeiro solteiro"
    ],

    sofas: [
        "sofa",
        "sofas",
        "sofa retratil",
        "sofa reclinavel",
        "estofado",
        "estofados",
        "poltrona",
        "poltronas",
        "chaise",
        "canto",
        "sala de estar"
    ],

    camas: [
        "cama",
        "camas",
        "cama box",
        "box",
        "colchao",
        "colchoes",
        "colchao casal",
        "colchao solteiro",
        "beliche",
        "bicama",
        "base box",
        "cabeceira",
        "quarto"
    ],

    comodas: [
        "comoda",
        "comodas",
        "cômoda",
        "cômodas",
        "comoda quarto",
        "comoda de quarto",
        "cômoda quarto",
        "cômoda de quarto",
        "comoda infantil",
        "cômoda infantil",
        "comoda sapateira",
        "cômoda sapateira",
        "gaveteiro",
        "gaveteiros",
        "gavetas",
        "movel com gavetas",
        "móvel com gavetas",
        "roupeiro comoda",
        "guarda roupa com comoda",
        "quarto comoda"
    ],

    mesas: [
        "mesa",
        "mesas",
        "mesa jantar",
        "mesa de jantar",
        "cadeira",
        "cadeiras",
        "conjunto de mesa",
        "sala de jantar",
        "jantar",
        "cozinha",
        "bancada"
    ],

    eletros: [
        "eletro",
        "eletros",
        "eletrodomestico",
        "eletrodomesticos",
        "fogao",
        "geladeira",
        "freezer",
        "bebedouro",
        "liquidificador",
        "microondas",
        "micro ondas",
        "maquina",
        "maquina de lavar",
        "tanquinho",
        "ventilador",
        "air fryer",
        "forno"
    ],

    outros: [
        "rack",
        "painel",
        "balcao",
        "balcão",
        "escrivaninha",
        "sapateira",
        "estante",
        "criado",
        "multiuso"
    ]
};


// ===============================
// IDENTIFICAR CATEGORIA
// ===============================

function identificarCategoria(produto) {
    const texto = normalizarTexto(`
        ${produto.nome}
        ${produto.link}
        ${produto.imagem}
    `);

    for (const categoria in sinonimosCategorias) {
        const palavras = sinonimosCategorias[categoria];

        const encontrou = palavras.some(palavra => {
            return texto.includes(normalizarTexto(palavra));
        });

        if (encontrou) {
            return categoria;
        }
    }

    return "outros";
}


// ===============================
// PALAVRAS PARECIDAS
// ===============================

function palavrasParecidas(palavraDigitada, palavraProduto) {
    palavraDigitada = normalizarTexto(palavraDigitada);
    palavraProduto = normalizarTexto(palavraProduto);

    if (palavraDigitada.length < 4 || palavraProduto.length < 4) {
        return false;
    }

    if (palavraProduto.includes(palavraDigitada)) {
        return true;
    }

    if (palavraDigitada.includes(palavraProduto)) {
        return true;
    }

    const inicioDigitado = palavraDigitada.slice(0, 5);
    const inicioProduto = palavraProduto.slice(0, 5);

    return inicioDigitado === inicioProduto;
}


// ===============================
// BUSCA INTELIGENTE
// ===============================

function produtoCombinaComPesquisa(produto, termoPesquisa) {
    if (termoPesquisa === "") {
        return true;
    }

    const categoriaProduto = identificarCategoria(produto);

    const textoProduto = normalizarTexto(`
        ${produto.nome}
        ${produto.preco}
        ${produto.precoCartao}
        ${produto.link}
        ${produto.imagem}
        ${categoriaProduto}
    `);

    if (textoProduto.includes(termoPesquisa)) {
        return true;
    }

    const sinonimosDaCategoria = sinonimosCategorias[categoriaProduto] || [];

    const encontrouSinonimo = sinonimosDaCategoria.some(sinonimo => {
        const sinonimoNormalizado = normalizarTexto(sinonimo);

        return (
            sinonimoNormalizado.includes(termoPesquisa) ||
            termoPesquisa.includes(sinonimoNormalizado) ||
            palavrasParecidas(termoPesquisa, sinonimoNormalizado)
        );
    });

    if (encontrouSinonimo) {
        return true;
    }

    const palavrasDigitadas = termoPesquisa.split(" ");
    const palavrasDoProduto = textoProduto.split(" ");

    return palavrasDigitadas.some(palavraDigitada => {
        return palavrasDoProduto.some(palavraProduto => {
            return palavrasParecidas(palavraDigitada, palavraProduto);
        });
    });
}


// ===============================
// TRANSFORMAR CATÁLOGO EM LISTA ÚNICA
// ===============================

function transformarCatalogoEmListaUnica(catalogo) {
    if (Array.isArray(catalogo)) {
        return catalogo;
    }

    if (!catalogo || typeof catalogo !== "object") {
        return [];
    }

    if (Array.isArray(catalogo.produtos)) {
        return catalogo.produtos;
    }

    const blocosAntigos = Object.keys(catalogo)
        .filter(chave => /^bloco\d+$/i.test(chave))
        .sort((a, b) => {
            const numeroA = Number(a.replace(/\D/g, ""));
            const numeroB = Number(b.replace(/\D/g, ""));

            return numeroA - numeroB;
        })
        .map(chave => catalogo[chave]);

    const existeBlocoAntigo = blocosAntigos.some(bloco => Array.isArray(bloco));

    if (existeBlocoAntigo) {
        return blocosAntigos.flatMap(bloco => {
            return Array.isArray(bloco) ? bloco : [];
        });
    }

    const categoriasAntigas = [
        catalogo.roupeiros,
        catalogo.sofas,
        catalogo.camas,
        catalogo.comodas,
        catalogo.mesas,
        catalogo.eletros,
        catalogo.outros
    ];

    return categoriasAntigas.flatMap(categoria => {
        return Array.isArray(categoria) ? categoria : [];
    });
}


// ===============================
// FILTRAR E ORDENAR PRODUTOS
// ===============================

function filtrarEOrdenarProdutos(produtos) {
    const termo = normalizarTexto(searchInput.value);
    const categoriaSelecionada = filtroCategoria.value;
    const ordemSelecionada = filtroPreco.value;

    let produtosFiltrados = produtos.filter(produto => {
        const categoriaProduto = identificarCategoria(produto);

        const combinaCategoria =
            categoriaSelecionada === "todos" ||
            categoriaProduto === categoriaSelecionada;

        const combinaPesquisa = produtoCombinaComPesquisa(produto, termo);

        return combinaCategoria && combinaPesquisa;
    });

    if (ordemSelecionada === "maior") {
        produtosFiltrados.sort((a, b) => {
            return precoParaNumero(b.preco) - precoParaNumero(a.preco);
        });
    }

    if (ordemSelecionada === "menor") {
        produtosFiltrados.sort((a, b) => {
            return precoParaNumero(a.preco) - precoParaNumero(b.preco);
        });
    }

    if (ordemSelecionada === "recente") {
        produtosFiltrados.reverse();
    }

    produtosFiltrados.sort((a, b) => {
    const produtoAEsgotado = a.esgotado === true || a.esgotado === "true";
    const produtoBEsgotado = b.esgotado === true || b.esgotado === "true";

    if (produtoAEsgotado === produtoBEsgotado) {
        return 0;
    }

    return produtoAEsgotado ? 1 : -1;
    });
    return produtosFiltrados;
}


// ===============================
// DIVIDIR PRODUTOS EM BLOCOS DE 5
// ===============================

function dividirProdutosEmBlocos(produtos, quantidadePorBloco = PRODUTOS_POR_BLOCO) {
    const blocos = [];

    for (let i = 0; i < produtos.length; i += quantidadePorBloco) {
        blocos.push(produtos.slice(i, i + quantidadePorBloco));
    }

    return blocos;
}


// ===============================
// CARREGAR PRODUTOS
// ===============================

async function carregarProdutos() {
    try {
        let catalogo = null;
        const produtosSalvos = localStorage.getItem("produtos");

        if (produtosSalvos) {
            catalogo = JSON.parse(produtosSalvos);
        }

        if (!catalogo) {
            const resposta = await fetch("produtos.json");

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o arquivo produtos.json");
            }

            catalogo = await resposta.json();
        }

        catalogoOriginal = transformarCatalogoEmListaUnica(catalogo);

        aplicarFiltrosPelaURL();
        atualizarVitrines();
    } catch (erro) {
        console.error("Erro ao carregar os produtos:", erro);

        if (containerVitrines) {
            containerVitrines.innerHTML = `
                <div class="mensagem-sem-produtos" style="display: block;">
                    Não foi possível carregar os produtos.
                </div>
            `;
        }
    }
}



// ===============================
// ATUALIZAR VITRINES
// ===============================

function atualizarVitrines() {
    swipersCriados.forEach(swiper => {
        swiper.destroy(true, true);
    });

    swipersCriados = [];

    if (!containerVitrines) {
        console.error("Container #vitrinesProdutos não encontrado.");
        return;
    }

    containerVitrines.innerHTML = "";

    const produtosFiltrados = filtrarEOrdenarProdutos(catalogoOriginal);
    const blocosAutomaticos = dividirProdutosEmBlocos(produtosFiltrados);

    blocosAutomaticos.forEach((produtosDoBloco, index) => {
        const numeroBloco = index + 1;

        const bloco = document.createElement("div");
        bloco.className = "bloco-vitrine";
        bloco.id = `bloco${numeroBloco}`;

        bloco.innerHTML = `
            <div class="swiper vitrine-bloco${numeroBloco}">
                <div class="swiper-wrapper" id="listaBloco${numeroBloco}">
                    ${produtosDoBloco.map(produto => criarSlideProduto(produto)).join("")}
                </div>

                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        `;

        containerVitrines.appendChild(bloco);
    });

    mostrarMensagemSemProdutos(produtosFiltrados.length);
    iniciarSwipers();
    atualizarBotaoCompartilharFiltro();
}


// ===============================
// CRIAR CARD DO PRODUTO
// ===============================

function criarSlideProduto(produto) {
    const categoriaProduto = identificarCategoria(produto);
    const precoNumerico = precoParaNumero(produto.preco);
    const produtoEsgotado = produto.esgotado === true || produto.esgotado === "true";

    return `
        <div class="swiper-slide"
            data-name="${normalizarTexto(produto.nome)}"
            data-categoria="${categoriaProduto}"
            data-preco="${precoNumerico}">

            <div class="produto-card ${produtoEsgotado ? "produto-esgotado" : ""}">
                ${produtoEsgotado ? '<div class="faixa-esgotado">ESGOTADO</div>' : ""}

                <a
                    href="${produtoEsgotado ? "#" : produto.link}"
                    ${produtoEsgotado ? 'onclick="event.preventDefault(); return false;" aria-disabled="true"' : ""}>

                    <img src="${produto.imagem}" alt="${produto.nome}">

                    <h3 class="nome-produto">${produto.nome}</h3>

                    <p class="valor-produto">${produto.preco}</p>

                    <p class="parcelas-produto">
                        ou <span class="valor-acrescimo">${produto.precoCartao}</span>
                        em ${produto.parcelas}x de ${produto.valorParcela} no Cartão
                    </p>
                </a>
            </div>
        </div>
    `;
}


// ===============================
// INICIAR SWIPER
// ===============================

function iniciarSwipers() {
    const vitrines = document.querySelectorAll("#vitrinesProdutos .swiper");

    vitrines.forEach(vitrine => {
        const wrapper = vitrine.querySelector(".swiper-wrapper");

        if (!wrapper || wrapper.children.length === 0) {
            return;
        }

        const next = vitrine.querySelector(".swiper-button-next");
        const prev = vitrine.querySelector(".swiper-button-prev");

        const paginationAntiga = vitrine.querySelector(".swiper-pagination");

        if (paginationAntiga) {
            paginationAntiga.remove();
        }

        const pagination = document.createElement("div");
        pagination.classList.add("swiper-pagination");
        vitrine.appendChild(pagination);

        const swiper = new Swiper(vitrine, {
            loop: true,
            rewind: true,
            watchOverflow: true,
            centerInsufficientSlides: false,
            centeredSlides: false,
            freeMode: false,
            roundLengths: true,

            speed: 500,
            spaceBetween: 20,
            slidesPerGroup: 1,

            navigation: {
                nextEl: next,
                prevEl: prev
            },

            pagination: {
                el: pagination,
                clickable: true
            },

            breakpoints: {
                0: {
                    slidesPerView: 2,
                    slidesPerGroup: 1,
                    spaceBetween: 10
                },

                768: {
                    slidesPerView: 3,
                    slidesPerGroup: 1,
                    spaceBetween: 12
                },

                1100: {
                    slidesPerView: 4,
                    slidesPerGroup: 1,
                    spaceBetween: 18
                }
            }
        });

        swipersCriados.push(swiper);
    });
}


// ===============================
// MENSAGEM SEM PRODUTOS
// ===============================

function mostrarMensagemSemProdutos(total) {
    let mensagem = document.getElementById("mensagemSemProdutos");

    if (!mensagem) {
        mensagem = document.createElement("div");
        mensagem.id = "mensagemSemProdutos";
        mensagem.className = "mensagem-sem-produtos";
        mensagem.textContent = "Nenhum produto encontrado com esses filtros.";
        document.getElementById("produtosi").appendChild(mensagem);
    }

    mensagem.style.display = total === 0 ? "block" : "none";
}


// ===============================
// EVENTOS DOS FILTROS
// ===============================

if (searchInput) {
    searchInput.addEventListener("input", atualizarVitrines);
}

if (filtroCategoria) {
    filtroCategoria.addEventListener("change", atualizarVitrines);
}

if (filtroPreco) {
    filtroPreco.addEventListener("change", atualizarVitrines);
}


// ===============================
// INICIAR SITE
// ===============================

// ===============================
// APLICAR FILTRO PELA URL
// ===============================

function aplicarFiltrosPelaURL() {
    const parametros = new URLSearchParams(window.location.search);

    const categoriaURL = parametros.get("categoria");
    const buscaURL = parametros.get("busca");
    const ordemURL = parametros.get("ordem");

    if (categoriaURL && filtroCategoria) {
        const existeCategoria = [...filtroCategoria.options].some(option => {
            return option.value === categoriaURL;
        });

        if (existeCategoria) {
            filtroCategoria.value = categoriaURL;
        }
    }

    if (buscaURL && searchInput) {
        searchInput.value = buscaURL;
    }

    if (ordemURL && filtroPreco) {
        const existeOrdem = [...filtroPreco.options].some(option => {
            return option.value === ordemURL;
        });

        if (existeOrdem) {
            filtroPreco.value = ordemURL;
        }
    }
}

// ===============================
// COMPARTILHAR FILTRO
// ===============================

function gerarLinkDoFiltroAtual() {
    const url = new URL(window.location.origin + window.location.pathname);

    const categoriaSelecionada = filtroCategoria ? filtroCategoria.value : "todos";
    const termoBuscado = searchInput ? searchInput.value.trim() : "";
    const ordemSelecionada = filtroPreco ? filtroPreco.value : "relevancia";

    if (categoriaSelecionada !== "todos") {
        url.searchParams.set("categoria", categoriaSelecionada);
    }

    if (termoBuscado !== "") {
        url.searchParams.set("busca", termoBuscado);
    }

    if (ordemSelecionada !== "relevancia") {
        url.searchParams.set("ordem", ordemSelecionada);
    }

    url.hash = "produtosi";

    return url.toString();
}

function copiarLinkDoFiltro() {
    const linkGerado = gerarLinkDoFiltroAtual();

    navigator.clipboard.writeText(linkGerado).then(() => {
        const textoOriginal = btnCompartilharFiltro.innerHTML;

        btnCompartilharFiltro.innerHTML = `<i class="fa fa-check"></i> Link copiado`;
        btnCompartilharFiltro.classList.add("copiado");

        setTimeout(() => {
            btnCompartilharFiltro.innerHTML = textoOriginal;
            btnCompartilharFiltro.classList.remove("copiado");
        }, 2000);
    }).catch(() => {
        prompt("Copie o link abaixo:", linkGerado);
    });
}

if (btnCompartilharFiltro) {
    btnCompartilharFiltro.addEventListener("click", copiarLinkDoFiltro);
}

function atualizarBotaoCompartilharFiltro() {
    if (!btnCompartilharFiltro) {
        return;
    }

    const temCategoriaFiltrada = filtroCategoria && filtroCategoria.value !== "todos";
    const temBuscaDigitada = searchInput && searchInput.value.trim() !== "";

    const temFiltroAtivo = temCategoriaFiltrada || temBuscaDigitada;

    if (temFiltroAtivo) {
        btnCompartilharFiltro.classList.add("ativo");
    } else {
        btnCompartilharFiltro.classList.remove("ativo");
    }
}



carregarProdutos();