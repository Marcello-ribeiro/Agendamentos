const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const posX = localStorage.getItem("chatX");
const posY = localStorage.getItem("chatY");

if(posX && posY){
    chatbotBox.style.left = posX;
    chatbotBox.style.top = posY;

    chatbotBox.style.right = "auto";
    chatbotBox.style.bottom = "auto";
}

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

const chatbotBtn = document.querySelector("#chatbotBtn");
const chatbotBox = document.querySelector("#chatbotBox");
const fecharChat = document.querySelector("#fecharChat");
const chatbotMensagens = document.querySelector("#chatbotMensagens");

chatbotBtn.addEventListener("click", () => {
    chatbotBox.classList.toggle("ativo");
});

fecharChat.addEventListener("click", () => {
    chatbotBox.classList.remove("ativo");
});

function adicionarMensagem(texto, tipo){
    const div = document.createElement("div");
    div.classList.add("msg", tipo);
    div.innerHTML = texto;

    chatbotMensagens.appendChild(div);
    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}

function responderBot(opcao){


 if(opcao === "valores"){
    adicionarMensagem("Quero saber os valores", "user");

    digitandoFake(() => {
        adicionarMensagem(`
            📸 <strong>Fotografia esportiva — Futebol</strong><br><br>

            <strong>Pacotes coletivos:</strong><br>
            • Quadro único: <strong>R$ 200</strong><br>
            • 1º e 2º quadro: <s>R$ 400</s> por <strong>R$ 350</strong><br><br>
            • 1 foto: <strong>R$ 8</strong><br><br>
            <strong>Pacotes individuais:</strong><br>
            • 7 fotos: <strong>R$ 45</strong><br>
            • 10 fotos: <strong>R$ 70</strong><br>
            • 15 fotos: <strong>R$ 100</strong><br>
            • 20 fotos: <strong>R$ 130</strong><br><br>

            ⚠️ Outros tipos de eventos possuem valores personalizados, definidos conforme local, duração e tipo de cobertura.
        `, "bot");

        adicionarBotaoVoltar();

    }, 500);
}

   if(opcao === "horarios"){
    adicionarMensagem("Quais horários disponíveis?", "user");

    digitandoFake(() => {
        adicionarMensagem(`
            ⏰ <strong>Horários de atendimento</strong><br><br>

            📅 <strong>Dias úteis:</strong><br>
            Das <strong>13h às 21h</strong><br><br>

            ⚽ <strong>Finais de semana:</strong><br>
            Das <strong>08h às 17h</strong><br><br>

            Os horários podem variar de acordo com a agenda e disponibilidade da cobertura fotográfica.
        `, "bot");

        adicionarBotaoVoltar();

    }, 500);
}

    if(opcao === "whatsapp"){
        adicionarMensagem("Quero falar no WhatsApp", "user");

        setTimeout(() => {
            adicionarMensagem(`
                Beleza. Clique abaixo para chamar no WhatsApp:<br><br>
                <a href="https://wa.me/5582991156122" target="_blank" class="bot-link">Abrir WhatsApp</a>
            `, "bot");

adicionarBotaoVoltar();

        }, 500);
    }
}

let etapaChat = 0;

let dadosChat = {
    nome: "",
    whatsapp: "",
    tipo: "",
    dia: "",
    hora: "",
    local: "",
    obs: ""
};

const perguntasChat = [
    "Qual é o seu nome?",
    "Qual é o seu WhatsApp?",
    "Qual tipo de sessão? Futebol, Evento, Ensaio ou Outro?",
    "Qual o dia? Exemplo: 15/05",
    "Qual o horário? Exemplo: 16:30",
    "Qual o local?",
    "Tem alguma observação? Se não tiver, digite: não"
];

const camposChat = [
    "nome",
    "whatsapp",
    "tipo",
    "dia",
    "hora",
    "local",
    "obs"
];

function iniciarAgendamentoChat(){
    etapaChat = 0;

    dadosChat = {
        nome: "",
        whatsapp: "",
        tipo: "",
        dia: "",
        hora: "",
        local: "",
        obs: ""
    };

    adicionarMensagem("Quero fazer um agendamento", "user");

    digitandoFake(() => {
        adicionarMensagem(perguntasChat[etapaChat], "bot");
        mostrarInputChat();
    }, 500);
}

function mostrarInputChat(){
    const inputExistente = document.querySelector(".chatbot-input-area");

    if(inputExistente){
        inputExistente.remove();
    }

    const area = document.createElement("div");
    area.classList.add("chatbot-input-area");

    area.innerHTML = `
        <input type="text" id="inputChat" placeholder="Digite aqui...">
        <button type="button" onclick="enviarRespostaChat()">Enviar</button>
    `;

    chatbotMensagens.appendChild(area);

    const input = document.querySelector("#inputChat");

    input.focus();

    input.addEventListener("keydown", function(e){
        if(e.key === "Enter"){
            enviarRespostaChat();
        }
    });

    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}

async function enviarRespostaChat(){
    const input = document.querySelector("#inputChat");

    if(!input) return;

    const resposta = input.value.trim();

    if(resposta === ""){
        return;
    }

    adicionarMensagem(resposta, "user");

    dadosChat[camposChat[etapaChat]] = resposta;

    input.parentElement.remove();

    etapaChat++;


if(etapaChat < perguntasChat.length){

    digitandoFake(() => {

        adicionarMensagem(perguntasChat[etapaChat], "bot");

        mostrarInputChat();

    });

    return;
}

digitandoFake(() => {
    mostrarResumoAgendamento();
});
}

async function salvarAgendamentoChat(){

    document.querySelectorAll(".chatbot-opcoes").forEach(op => op.remove());

    adicionarMensagem("Enviando seu agendamento...", "bot");

    const { error } = await supabaseClient
        .from("agendamentos")
        .insert([{
            nome: dadosChat.nome,
            whatsapp: dadosChat.whatsapp,
            tipo: dadosChat.tipo,
            dia: dadosChat.dia,
            hora: dadosChat.hora,
            local: dadosChat.local,
            obs: dadosChat.obs === "não" ? "" : dadosChat.obs,
            status: "pendente"
        }]);

    if(error){
        console.log(error);

        adicionarMensagem(`
            Não consegui enviar seu agendamento agora.<br>
            Tente novamente ou chame no WhatsApp.
        `, "bot");

        return;
    }

    adicionarMensagem(`
        ✅ <strong>Agendamento enviado com sucesso!</strong><br><br>

        <strong>Nome:</strong> ${dadosChat.nome}<br>
        <strong>WhatsApp:</strong> ${dadosChat.whatsapp}<br>
        <strong>Tipo:</strong> ${dadosChat.tipo}<br>
        <strong>Dia:</strong> ${dadosChat.dia}<br>
        <strong>Horário:</strong> ${dadosChat.hora}<br>
        <strong>Local:</strong> ${dadosChat.local}<br><br>

        Agora é só aguardar a confirmação da LZZ SportShot 📸
    `, "bot");

    adicionarBotaoVoltar();
}

function mostrarMenuInicial(){

    const opcoesAntigas = document.querySelectorAll(".chatbot-opcoes");

    opcoesAntigas.forEach(op => op.remove());

    const div = document.createElement("div");

    div.classList.add("chatbot-opcoes");

    div.innerHTML = `
        <button onclick="iniciarAgendamentoChat()">Agendamento</button>
        <button onclick="responderBot('valores')">Valores</button>
        <button onclick="responderBot('horarios')">Horários</button>
        <button onclick="responderBot('whatsapp')">Falar no WhatsApp</button>
    `;

    chatbotMensagens.appendChild(div);

    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}


function adicionarBotaoVoltar(){

    const botoesAntigos = document.querySelectorAll(".btn-voltar-chat");

    botoesAntigos.forEach(btn => btn.remove());

    const botao = document.createElement("button");

    botao.innerText = "← Voltar";

    botao.classList.add("btn-voltar-chat");

    botao.onclick = () => {

        adicionarMensagem("Voltei ao menu inicial", "user");

        mostrarMenuInicial();
    };

    chatbotMensagens.appendChild(botao);

    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}

const headerChat = document.querySelector(".chatbot-header");

let movendo = false;

let offsetX = 0;
let offsetY = 0;

headerChat.addEventListener("mousedown", (e) => {

    movendo = true;

    offsetX = e.clientX - chatbotBox.offsetLeft;
    offsetY = e.clientY - chatbotBox.offsetTop;

});

document.addEventListener("mousemove", (e) => {

    if(!movendo) return;

    chatbotBox.style.left = (e.clientX - offsetX) + "px";
    chatbotBox.style.top = (e.clientY - offsetY) + "px";

    chatbotBox.style.right = "auto";
    chatbotBox.style.bottom = "auto";
});

document.addEventListener("mouseup", () => {
    movendo = false;
});

localStorage.setItem("chatX", chatbotBox.style.left);
localStorage.setItem("chatY", chatbotBox.style.top);

function digitandoFake(callback){

    const div = document.createElement("div");

    div.classList.add("digitando");

    div.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    chatbotMensagens.appendChild(div);

    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;

    setTimeout(() => {

        div.remove();

        callback();

    }, 1200);
}


function mostrarResumoAgendamento(){

    adicionarMensagem(`
        📋 <strong>Confira seu agendamento:</strong><br><br>

        <strong>Nome:</strong> ${dadosChat.nome}<br>
        <strong>WhatsApp:</strong> ${dadosChat.whatsapp}<br>
        <strong>Tipo:</strong> ${dadosChat.tipo}<br>
        <strong>Dia:</strong> ${dadosChat.dia}<br>
        <strong>Horário:</strong> ${dadosChat.hora}<br>
        <strong>Local:</strong> ${dadosChat.local}<br>
        <strong>Observação:</strong> ${dadosChat.obs}<br><br>

        Está tudo certo?
    `, "bot");

    const area = document.createElement("div");
    area.classList.add("chatbot-opcoes");

    area.innerHTML = `
        <button onclick="salvarAgendamentoChat()">Confirmar agendamento ✅</button>
        <button onclick="iniciarAgendamentoChat()">Refazer 🔄</button>
    `;

    chatbotMensagens.appendChild(area);
    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}