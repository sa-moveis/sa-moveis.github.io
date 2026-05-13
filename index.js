 // Menu hambúrguer toggle
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Fecha o menu ao clicar em um link (em mobile)
        const links = document.querySelectorAll('.links a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        });

        


        document.getElementById('a2').addEventListener('click', function (e) {
            e.preventDefault();
            const linkProduto = window.location.href;
            const mensagem = `👋 Olá! Acessei a página inicial do site da *S.A Móveis* e me interessei em conhecer melhor os produtos e condições de compra.🤩 
            
🔗 https://sa-moveis.github.io`.trim();
            const url = `https://api.whatsapp.com/send?phone=5586981373829&text=${encodeURIComponent(mensagem)}`;
            window.open(url, '_blank');
        });



        document.getElementById('lwtp').addEventListener('click', function (e) {
            e.preventDefault();
            const linkProduto = window.location.href;
            const mensagem = `👋 Olá! Acessei a página inicial do *Site da S.A Móveis* e me interessei em conhecer melhor os produtos e condições de compra.🤩 
            
🔗 https://sa-moveis.github.io`.trim();
            const url = `https://api.whatsapp.com/send?phone=5586981373829&text=${encodeURIComponent(mensagem)}`;
            window.open(url, '_blank');
        });



        function scrollSuave(target, duration = 1000) {
            const targetPosition = target.getBoundingClientRect().top;
            const startPosition = window.pageYOffset;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const ease = easeInOutCubic(timeElapsed, startPosition, targetPosition, duration);
                window.scrollTo(0, ease);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function easeInOutCubic(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            }

            requestAnimationFrame(animation);
        }

        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', function (e) {
                const alvo = document.querySelector(this.getAttribute('href'));
                if (!alvo) return;
                e.preventDefault();
                scrollSuave(alvo, 1100);
            });
        });
       let swipersCriados = [];

let catalogoOriginal = {
    bloco1: [],
    bloco2: [],
    bloco3: [],
    bloco4: [],
    bloco5: []
};

const searchInput = document.getElementById("searchInput");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroPreco = document.getElementById("filtroPreco");

// ===============================
// NORMALIZAR TEXTO
// Remove acentos, hífens, símbolos e deixa tudo comparável
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
// Converte "R$ 1.299,90" em 1299.90
// ===============================
function precoParaNumero(preco) {
    let valor = String(preco || "")
        .replace(/[^\d,]/g, "")
        .replace(",", ".");

    return Number(valor) || 0;
}

// ===============================
// SINÔNIMOS E PALAVRAS RELACIONADAS
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
        "comoda",
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
// IDENTIFICAR CATEGORIA AUTOMATICAMENTE
// Ele olha nome, link e imagem do produto
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
// SIMILARIDADE SIMPLES ENTRE PALAVRAS
// Ajuda com pequenas variações digitadas pelo cliente
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
// Busca por nome, preço, link, imagem, categoria e sinônimos
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

    // Busca direta
    if (textoProduto.includes(termoPesquisa)) {
        return true;
    }

    // Busca por sinônimos da categoria
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

    // Busca por palavras separadas
    const palavrasDigitadas = termoPesquisa.split(" ");
    const palavrasDoProduto = textoProduto.split(" ");

    const encontrouPalavraParecida = palavrasDigitadas.some(palavraDigitada => {
        return palavrasDoProduto.some(palavraProduto => {
            return palavrasParecidas(palavraDigitada, palavraProduto);
        });
    });

    return encontrouPalavraParecida;
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

    return produtosFiltrados;
}

// ===============================
// CARREGAR PRODUTOS
// ===============================
async function carregarProdutos() {
    let catalogo = JSON.parse(localStorage.getItem("produtos"));

    if (!catalogo) {
        const resposta = await fetch("produtos.json");
        catalogo = await resposta.json();
    }

    if (Array.isArray(catalogo)) {
        catalogo = {
            bloco1: catalogo,
            bloco2: [],
            bloco3: [],
            bloco4: [],
            bloco5: []
        };
    }

    catalogoOriginal = {
        bloco1: catalogo.bloco1 || catalogo.roupeiros || [],
        bloco2: catalogo.bloco2 || catalogo.sofas || [],
        bloco3: catalogo.bloco3 || catalogo.mesas || [],
        bloco4: catalogo.bloco4 || catalogo.camas || [],
        bloco5: catalogo.bloco5 || catalogo.eletros || []
    };

    atualizarVitrines();
}

// ===============================
// ATUALIZAR TODAS AS VITRINES
// ===============================
function atualizarVitrines() {
    swipersCriados.forEach(swiper => {
        swiper.destroy(true, true);
    });

    swipersCriados = [];

    let totalProdutosExibidos = 0;

    totalProdutosExibidos += renderizarVitrine(
        "listaBloco1",
        "bloco1",
        filtrarEOrdenarProdutos(catalogoOriginal.bloco1)
    );

    totalProdutosExibidos += renderizarVitrine(
        "listaBloco2",
        "bloco2",
        filtrarEOrdenarProdutos(catalogoOriginal.bloco2)
    );

    totalProdutosExibidos += renderizarVitrine(
        "listaBloco3",
        "bloco3",
        filtrarEOrdenarProdutos(catalogoOriginal.bloco3)
    );

    totalProdutosExibidos += renderizarVitrine(
        "listaBloco4",
        "bloco4",
        filtrarEOrdenarProdutos(catalogoOriginal.bloco4)
    );

    totalProdutosExibidos += renderizarVitrine(
        "listaBloco5",
        "bloco5",
        filtrarEOrdenarProdutos(catalogoOriginal.bloco5)
    );

    mostrarMensagemSemProdutos(totalProdutosExibidos);
    iniciarSwipers();
}

// ===============================
// RENDERIZAR PRODUTOS NA TELA
// ===============================
function renderizarVitrine(idLista, idBloco, produtos) {
    const lista = document.getElementById(idLista);
    const bloco = document.getElementById(idBloco);

    lista.innerHTML = "";

    if (!produtos || produtos.length === 0) {
        bloco.style.display = "none";
        return 0;
    }

    bloco.style.display = "block";

    produtos.forEach(produto => {
        const categoriaProduto = identificarCategoria(produto);
        const precoNumerico = precoParaNumero(produto.preco);

        lista.innerHTML += `
            <div class="swiper-slide produto-card"
                data-name="${normalizarTexto(produto.nome)}"
                data-categoria="${categoriaProduto}"
                data-preco="${precoNumerico}">

                <a href="${produto.link}">
                    <img src="${produto.imagem}" alt="${produto.nome}">

                    <h3 class="nome-produto">${produto.nome}</h3>

                    <p class="valor-produto">${produto.preco}</p>

                    <p class="parcelas-produto">
                        ou <span class="valor-acrescimo">${produto.precoCartao}</span>
                        em ${produto.parcelas}x de ${produto.valorParcela} no Cartão
                    </p>
                </a>
            </div>
        `;
    });

    return produtos.length;
}

// ===============================
// INICIAR SWIPER
// ===============================
function iniciarSwipers() {
    const vitrines = document.querySelectorAll(".swiper");

    vitrines.forEach((vitrine) => {
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
            loop: wrapper.children.length > 2,
            speed: 500,
            spaceBetween: 12,

            navigation: {
                nextEl: next,
                prevEl: prev,
            },

            pagination: {
                el: pagination,
                clickable: true,
            },

            breakpoints: {
                0: {
                    slidesPerView: 2,
                    slidesPerGroup: 1,
                    spaceBetween: 10,
                },
                500: {
                    slidesPerView: 2,
                    slidesPerGroup: 1,
                    spaceBetween: 12,
                },
                900: {
                    slidesPerView: 3,
                    slidesPerGroup: 1,
                },
                1100: {
                    slidesPerView: 4,
                    slidesPerGroup: 1,
                    spaceBetween: 20,
                }
            }
        });

        swipersCriados.push(swiper);
    });
}

// ===============================
// MENSAGEM QUANDO NÃO ENCONTRA PRODUTO
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

    if (total === 0) {
        mensagem.style.display = "block";
    } else {
        mensagem.style.display = "none";
    }
}

// ===============================
// EVENTOS DOS FILTROS
// ===============================
searchInput.addEventListener("input", atualizarVitrines);
filtroCategoria.addEventListener("change", atualizarVitrines);
filtroPreco.addEventListener("change", atualizarVitrines);

carregarProdutos();
