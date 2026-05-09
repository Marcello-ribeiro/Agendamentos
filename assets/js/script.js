const cards = document.querySelectorAll(".foto-card");

cards.forEach(card => {

    const imagens = card.querySelectorAll(".carrossel img");
    const btnPrev = card.querySelector(".prev");
    const btnNext = card.querySelector(".next");

    // ignora cards sem carrossel
    if(!imagens.length || !btnPrev || !btnNext){
        return;
    }

    let index = 0;

    function mostrarImagem(n){
        imagens.forEach(img => {
            img.classList.remove("ativo");
        });

        imagens[n].classList.add("ativo");
    }

    btnNext.addEventListener("click", () => {

        index++;

        if(index >= imagens.length){
            index = 0;
        }

        mostrarImagem(index);
    });

    btnPrev.addEventListener("click", () => {

        index--;

        if(index < 0){
            index = imagens.length - 1;
        }

        mostrarImagem(index);
    });

});

const form = document.getElementById("formAgenda");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const tipo = document.getElementById("tipo").value;
    const dia = document.getElementById("dia").value;
    const hora = document.getElementById("hora").value;
    const local = document.getElementById("local").value;
    const obs = document.getElementById("obs").value;

    const mensagem =
` *NOVO AGENDAMENTO*

*Olá, Gostaria de agendar uma sessão de* ${tipo}

 *Nome:* ${nome}
 *WhatsApp:* ${whatsapp}

 *Tipo de sessão:* ${tipo}

 *Dia:* ${dia}
 *Horário:* ${hora}

 *Local:*
${local}

 *Observações:*
${obs}`;

    const numero = "5582991156122";

    const url =
`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");

});