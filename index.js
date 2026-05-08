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



        document.getElementById('a3').addEventListener('click', function (e) {
            e.preventDefault();
            const linkProduto = window.location.href;
            const mensagem = `👋 Olá! Acessei a página inicial do *Site da S.A Móveis* e me interessei em conhecer melhor os produtos e condições de compra.🤩 
            
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



const vitrines = document.querySelectorAll('.swiper');

vitrines.forEach((vitrine) => {

    const next = vitrine.querySelector('.swiper-button-next');
    const prev = vitrine.querySelector('.swiper-button-prev');

    const pagination = document.createElement('div');
    pagination.classList.add('swiper-pagination');
    vitrine.appendChild(pagination);

    new Swiper(vitrine, {
        loop: true,
        speed: 500,
        spaceBetween: 12,

        slidesPerView: 2,
        slidesPerGroup: 2,

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
                slidesPerGroup: 2,
            },

            768: {
                slidesPerView: 2,
                slidesPerGroup: 2,
            },

            1100: {
                slidesPerView: 4,
                slidesPerGroup: 1,
            }
        }
    });
});

const searchInput = document.getElementById("searchInput");
const slides = document.querySelectorAll(".produto-card");

searchInput.addEventListener("input", function () {
    const termo = this.value.toLowerCase().trim();

    slides.forEach(slide => {
        const titulo = slide.querySelector(".nome-produto");

        if (!titulo) return;

        const textoProduto = titulo.textContent.toLowerCase();

        if (textoProduto.includes(termo) || termo === "") {
            slide.style.display = "";
        } else {
            slide.style.display = "none";
        }
    });

    swiper.update();
});
