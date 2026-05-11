const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// CARROSSEL

const cards = document.querySelectorAll(".foto-card");

cards.forEach(card => {

    const imagens = card.querySelectorAll(".carrossel img");
    const btnPrev = card.querySelector(".prev");
    const btnNext = card.querySelector(".next");

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


// FORMULÁRIO DE AGENDAMENTO

const formAgenda = document.getElementById("formAgenda");

formAgenda.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const whatsapp = document.getElementById("whatsapp").value.trim();
    const tipo = document.getElementById("tipo").value;
    const dia = document.getElementById("dia").value;
    const hora = document.getElementById("hora").value;
    const local = document.getElementById("local").value.trim();
    const obs = document.getElementById("obs").value.trim();

    const { error } = await supabaseClient
        .from("agendamentos")
        .insert([
            {
                nome,
                whatsapp,
                tipo,
                dia,
                hora,
                local,
                obs,
                status: "pendente"
            }
        ]);

    if(error){
        mostrarToast("Erro ao enviar agendamento, tente novamente.");
        console.log(error);
        return;
    }

    const nomeCliente = document.getElementById("nome").value;

mostrarToast(
    `ola, ${nomeCliente}! seu agendamento foi enviado com sucesso! Aguarde nosso contato para confirmar todos os detalhes. Obrigado!📸👊`
);

    formAgenda.reset();

});


const inputDia = document.getElementById("dia");

inputDia.addEventListener("input", () => {

    let valor = inputDia.value.replace(/\D/g, "");

    if(valor.length > 2){
        valor = valor.slice(0,2) + "/" + valor.slice(2,4);
    }

    inputDia.value = valor;

});


// TOAST / MODAL

function mostrarToast(mensagem){

    const overlay = document.getElementById("toast-overlay");
    const texto = document.getElementById("toast-msg");

    texto.innerText = mensagem;

    overlay.classList.add("ativo");

}

const toastBtn = document.getElementById("toast-btn");

toastBtn.addEventListener("click", () => {

    document
    .getElementById("toast-overlay")
    .classList
    .remove("ativo");

});