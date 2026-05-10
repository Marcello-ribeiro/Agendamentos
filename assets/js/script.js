const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";







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

// SUPABASE

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// FORMULÁRIO

const formAgenda = document.getElementById("formAgenda");


formAgenda.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const tipo = document.getElementById("tipo").value;
    const dia = document.getElementById("dia").value;
    const hora = document.getElementById("hora").value;
    const local = document.getElementById("local").value;
    const obs = document.getElementById("obs").value;


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

        alert("Erro ao enviar agendamento.");

        console.log(error);

        return;
    }


    alert("Agendamento enviado com sucesso!");

    formAgenda.reset();

});