const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ELEMENTOS DO CHAT

const chatbotBtn = document.querySelector("#chatbotBtn");
const chatbotBox = document.querySelector("#chatbotBox");
const fecharChat = document.querySelector("#fecharChat");
const chatbotMensagens = document.querySelector("#chatbotMensagens");


// RESTAURAR POSIÇÃO DO CHAT

const posX = localStorage.getItem("chatX");
const posY = localStorage.getItem("chatY");

if(posX && posY && chatbotBox){
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


// FORMULÁRIO NORMAL DO SITE

const formAgenda = document.getElementById("formAgenda");

if(formAgenda){
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

        mostrarToast(
            `Olá, ${nome}! Seu agendamento foi enviado com sucesso. Aguarde nosso contato para confirmar todos os detalhes. Obrigado! 📸👊`
        );

        formAgenda.reset();

    });
}


// MÁSCARA DO DIA NO FORM NORMAL

const inputDia = document.getElementById("dia");

if(inputDia){
    inputDia.addEventListener("input", () => {

        let valor = inputDia.value.replace(/\D/g, "");

        if(valor.length > 2){
            valor = valor.slice(0,2) + "/" + valor.slice(2,4);
        }

        inputDia.value = valor;

    });
}


// TOAST / MODAL

function mostrarToast(mensagem){

    const overlay = document.getElementById("toast-overlay");
    const texto = document.getElementById("toast-msg");

    if(!overlay || !texto) return;

    texto.innerText = mensagem;

    overlay.classList.add("ativo");

}

const toastBtn = document.getElementById("toast-btn");

if(toastBtn){
    toastBtn.addEventListener("click", () => {

        document
        .getElementById("toast-overlay")
        .classList
        .remove("ativo");

    });
}


// ABRIR / FECHAR CHAT

if(chatbotBtn && chatbotBox){
    chatbotBtn.addEventListener("click", () => {
        chatbotBox.classList.toggle("ativo");
    });
}

if(fecharChat && chatbotBox){
    fecharChat.addEventListener("click", () => {
        chatbotBox.classList.remove("ativo");
    });
}


// MENSAGENS DO CHAT

function adicionarMensagem(texto, tipo){

    if(!texto || texto.trim() === ""){
        return;
    }

    const div = document.createElement("div");

    div.classList.add("msg", tipo);

    div.innerHTML = texto;

    chatbotMensagens.appendChild(div);

    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}

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

    }, 900);
}


// RESPOSTAS DO MENU

function responderBot(opcao){

    if(opcao === "valores"){

        adicionarMensagem("Quero saber os valores", "user");

        digitandoFake(() => {

            adicionarMensagem(`
                📸 <strong>Fotografia esportiva — Futebol</strong><br><br>

                <strong>Pacotes coletivos:</strong><br>
                • Quadro único: <strong>R$ 200</strong><br>
                • 1º e 2º quadro: <s>R$ 400</s> por <strong>R$ 350</strong><br><br>

                <strong>Pacotes individuais:</strong><br>
                • 1 foto: <strong>R$ 8</strong><br>
                • 7 fotos: <strong>R$ 45</strong><br>
                • 10 fotos: <strong>R$ 70</strong><br>
                • 15 fotos: <strong>R$ 100</strong><br>
                • 20 fotos: <strong>R$ 130</strong><br><br>

                ⚠️ Outros tipos de eventos possuem valores personalizados, definidos conforme local, duração e tipo de cobertura.
            `, "bot");

            adicionarBotaoVoltar();

        });
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

        });
    }

    if(opcao === "whatsapp"){

        adicionarMensagem("Quero falar no WhatsApp", "user");

        digitandoFake(() => {

            adicionarMensagem(`
                Ok. Clique abaixo para chamar no WhatsApp:<br><br>
                <a href="https://wa.me/5582991156122" target="_blank" class="bot-link">📞Abrir WhatsApp</a>
            `, "bot");

            adicionarBotaoVoltar();

        });
    }

    if(opcao === "banlek"){

        adicionarMensagem("Quero ver o Banlek", "user");

        digitandoFake(() => {

            adicionarMensagem(`
                Ok. Clique abaixo para ir para o Banlek:<br><br>
                <a href="https://banlek.com/Marcello1" target="_blank" class="bot-link">🔗Abrir Banlek</a>
            `, "bot");

            adicionarBotaoVoltar();

        });
    }
}


// AGENDAMENTO PELO CHAT

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
    "Qual é o seu WhatsApp? Exemplo: (82) 99999-9999",
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

    removerInputsChat();

    adicionarMensagem("Quero fazer um agendamento", "user");

    digitandoFake(() => {

        adicionarMensagem(perguntasChat[etapaChat], "bot");

        mostrarInputChat();

    });
}

function removerInputsChat(){

    const inputExistente = document.querySelector(".chatbot-input-area");

    if(inputExistente){
        inputExistente.remove();
    }
}

function mostrarInputChat(){

    removerInputsChat();

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

function mensagemErroValidacao(texto){

    digitandoFake(() => {

        adicionarMensagem(texto, "bot");

        mostrarInputChat();

    });
}

function validarRespostaChat(resposta){

    const campoAtual = camposChat[etapaChat];

    if(campoAtual === "nome"){

        if(resposta.length < 2 || /\d/.test(resposta)){
            mensagemErroValidacao(`
                ⚠️ Digite um nome válido.<br><br>
                Exemplo:<br>
                <strong>Marcello</strong>
            `);

            return false;
        }
    }

    if(campoAtual === "whatsapp"){

        const numero = resposta.replace(/\D/g, "");

        if(numero.length < 10 || numero.length > 13){
            mensagemErroValidacao(`
                ⚠️ Digite um WhatsApp válido.<br><br>
                Exemplo:<br>
                <strong>(82) 99999-9999</strong>
            `);

            return false;
        }
    }

    if(campoAtual === "tipo"){

        const tiposPermitidos = ["futebol", "evento", "ensaio", "outro", "vaquejada", "rodeio", "corrida", "treino", "partida", "campeonato", "jogo", "competição", "exposição", "workshop", "aula", "palestra", "entrevista", "lancamento", "aniversário", "casamento", "formatura", "show", "festival", "outros","torneio","confraternização","encontro","reunião","evento social","evento corporativo"];
        const tipoNormalizado = resposta.toLowerCase().trim();

        if(!tiposPermitidos.includes(tipoNormalizado)){
            mensagemErroValidacao(`
                ⚠️ Digite um tipo válido.<br><br>
                Opções aceitas:<br>
                <strong>Futebol, Evento, Ensaio ou Outro</strong>
            `);

            return false;
        }
    }

    if(campoAtual === "dia"){

        const diaValido = /^\d{2}\/\d{2}$/.test(resposta);

        if(!diaValido){
            mensagemErroValidacao(`
                ⚠️ Digite uma data válida.<br><br>
                Exemplo correto:<br>
                <strong>15/05</strong>
            `);

            return false;
        }

        const [dia, mes] = resposta.split("/").map(Number);

        if(dia < 1 || dia > 31 || mes < 1 || mes > 12){
            mensagemErroValidacao(`
                ⚠️ Essa data não parece válida.<br><br>
                Exemplo correto:<br>
                <strong>15/05</strong>
            `);

            return false;
        }
    }

    if(campoAtual === "hora"){

        const horaValida =
        /^([01]\d|2[0-3]):([0-5]\d)$/.test(resposta);

        if(!horaValida){
            mensagemErroValidacao(`
                ⚠️ Digite um horário válido.<br><br>
                Exemplo correto:<br>
                <strong>16:30</strong>
            `);

            return false;
        }
    }

    if(campoAtual === "local"){

        if(resposta.length < 3){
            mensagemErroValidacao(`
                ⚠️ Digite um local válido.<br><br>
                Exemplo:<br>
                <strong>Campo do CSA</strong>
            `);

            return false;
        }
    }

    return true;
}

async function enviarRespostaChat(){

    const input = document.querySelector("#inputChat");

    if(!input) return;

    const resposta = input.value.trim();

    if(resposta === ""){
        return;
    }

    const valido = validarRespostaChat(resposta);

    if(!valido){
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

function mostrarResumoAgendamento(){

    const observacao = dadosChat.obs.toLowerCase() === "não"
        ? "Nenhuma"
        : dadosChat.obs;

    adicionarMensagem(`
        📋 <strong>Confira seu agendamento:</strong><br><br>

        <strong>Nome:</strong> ${dadosChat.nome}<br>
        <strong>WhatsApp:</strong> ${dadosChat.whatsapp}<br>
        <strong>Tipo:</strong> ${dadosChat.tipo}<br>
        <strong>Dia:</strong> ${dadosChat.dia}<br>
        <strong>Horário:</strong> ${dadosChat.hora}<br>
        <strong>Local:</strong> ${dadosChat.local}<br>
        <strong>Observação:</strong> ${observacao}<br><br>

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
            obs: dadosChat.obs.toLowerCase() === "não" ? "" : dadosChat.obs,
            status: "pendente"
        }]);

    if(error){

        console.log(error);

        adicionarMensagem(`
            Não consegui enviar seu agendamento agora.<br>
            Tente novamente ou chame no WhatsApp.
        `, "bot");

        adicionarBotaoVoltar();

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

        Agora é só aguardar a confirmação da LzzSportShot 📸
    `, "bot");

    adicionarBotaoVoltar();
}


// MENU / VOLTAR

function mostrarMenuInicial(){

    removerInputsChat();

    const opcoesAntigas = document.querySelectorAll(".chatbot-opcoes");

    opcoesAntigas.forEach(op => op.remove());

    const botoesAntigos = document.querySelectorAll(".btn-voltar-chat");

    botoesAntigos.forEach(btn => btn.remove());

    const div = document.createElement("div");

    div.classList.add("chatbot-opcoes");

    div.innerHTML = `
        <button onclick="iniciarAgendamentoChat()">Agendamento 📋</button>
        <button onclick="responderBot('valores')">Valores 💰</button>
        <button onclick="responderBot('horarios')">Horários 🕔</button>
        <button onclick="responderBot('whatsapp')">Falar no WhatsApp 📲</button>
        <button onclick="responderBot('banlek')">Ver Banlek 🔗</button>
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


// ARRASTAR CHAT

const headerChat = document.querySelector(".chatbot-header");

let movendo = false;

let offsetX = 0;
let offsetY = 0;

if(headerChat && chatbotBox){
    headerChat.addEventListener("mousedown", (e) => {

        movendo = true;

        offsetX = e.clientX - chatbotBox.offsetLeft;
        offsetY = e.clientY - chatbotBox.offsetTop;

    });
}

document.addEventListener("mousemove", (e) => {

    if(!movendo || !chatbotBox) return;

    chatbotBox.style.left = (e.clientX - offsetX) + "px";
    chatbotBox.style.top = (e.clientY - offsetY) + "px";

    chatbotBox.style.right = "auto";
    chatbotBox.style.bottom = "auto";

    localStorage.setItem("chatX", chatbotBox.style.left);
    localStorage.setItem("chatY", chatbotBox.style.top);

});

document.addEventListener("mouseup", () => {
    movendo = false;
});