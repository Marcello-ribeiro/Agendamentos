/* =========================
   PORTFÓLIO DO INDEX
========================= */

const portfolioGrid = document.querySelector("#portfolioGrid");

async function carregarPortfolio(){

    if(!portfolioGrid) return;

    portfolioGrid.innerHTML = `
        <p class="portfolio-loading">
            Carregando portfólio...
        </p>
    `;

    const { data, error } = await supabaseClient
        .from("portfolio")
        .select(`
            *,
            portfolio_imagens(*)
        `)
        .eq("ativo", true)
        .order("ordem", { ascending: true });

    if(error){
        console.log(error);

        portfolioGrid.innerHTML = `
            <p class="portfolio-loading">
                Erro ao carregar portfólio.
            </p>
        `;

        return;
    }

    if(!data || data.length === 0){
        portfolioGrid.innerHTML = `
            <p class="portfolio-loading">
                Nenhum trabalho cadastrado ainda.
            </p>
        `;

        return;
    }

    portfolioGrid.innerHTML = "";

    data.forEach(item => {

        const imagens = item.portfolio_imagens || [];

        if(imagens.length === 0) return;

        const imagensOrdenadas = imagens.sort((a, b) => {
            return (a.ordem || 0) - (b.ordem || 0);
        });

        const card = document.createElement("article");

        card.className = `portfolio-card foto-card ${item.tamanho || "normal"}`;

        card.innerHTML = `
            <div class="carrossel">

                ${imagensOrdenadas.map((img, index) => `
                    <img
                        src="${img.imagem_url}"
                        class="${index === 0 ? "ativo" : ""}"
                        alt="${item.titulo}"
                    >
                `).join("")}

                ${
                    imagensOrdenadas.length > 1
                    ? `
                        <button class="prev" type="button">‹</button>
                        <button class="next" type="button">›</button>
                    `
                    : ""
                }

            </div>

            <div class="foto-info">
                <p>${item.categoria} — ${item.ano}</p>
                <h3>${item.titulo} <small>ㄥ乙乙</small></h3>
            </div>
        `;

        portfolioGrid.appendChild(card);
    });

    iniciarCarrosseis();
}


/* =========================
   CARROSSEL
========================= */

function iniciarCarrosseis(){

    const cards = document.querySelectorAll(".foto-card");

    cards.forEach(card => {

        const imagens = card.querySelectorAll(".carrossel img");
        const btnPrev = card.querySelector(".prev");
        const btnNext = card.querySelector(".next");

        if(!imagens.length || !btnPrev || !btnNext) return;

        let index = 0;

        function mostrarImagem(posicao){
            imagens.forEach(img => img.classList.remove("ativo"));
            imagens[posicao].classList.add("ativo");
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
}


/* =========================
   AGENDAMENTO NORMAL
========================= */

const formAgenda = document.querySelector("#formAgenda");

if(formAgenda){

    formAgenda.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nome = document.querySelector("#nome").value.trim();
        const whatsapp = document.querySelector("#whatsapp").value.trim();
        const tipo = document.querySelector("#tipo").value;
        const dia = document.querySelector("#dia").value;
        const hora = document.querySelector("#hora").value;
        const local = document.querySelector("#local").value.trim();
        const obs = document.querySelector("#obs").value.trim();

        const { data: sessionData } = await supabaseClient.auth.getSession();

        const userId = sessionData.session
            ? sessionData.session.user.id
            : null;

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
                    status: "pendente",
                    user_id: userId
                }
            ]);

        if(error){
            console.log(error);
            mostrarToast("Erro ao enviar agendamento. Tente novamente.");
            return;
        }

        mostrarToast(
            `Agendamento enviado com sucesso, ${nome}. Aguarde a confirmação.`
        );

        formAgenda.reset();

        carregarHorariosPublicos();
    });

}


/* =========================
   MÁSCARA DO DIA
========================= */

const inputDia = document.querySelector("#dia");

if(inputDia){

    inputDia.addEventListener("input", () => {

        let valor = inputDia.value.replace(/\D/g, "");

        if(valor.length > 2){
            valor = valor.slice(0, 2) + "/" + valor.slice(2, 4);
        }

        inputDia.value = valor;
    });

}


/* =========================
   TOAST
========================= */

function mostrarToast(mensagem){

    const overlay = document.querySelector("#toast-overlay");
    const texto = document.querySelector("#toast-msg");

    if(!overlay || !texto) return;

    texto.innerText = mensagem;
    overlay.classList.add("ativo");
}

const toastBtn = document.querySelector("#toast-btn");

if(toastBtn){

    toastBtn.addEventListener("click", () => {
        document.querySelector("#toast-overlay").classList.remove("ativo");
    });

}


/* =========================
   HORÁRIOS PÚBLICOS
========================= */

const listaHorariosPublicos = document.querySelector("#listaHorariosPublicos");

function formatarData(data){

    if(!data) return "";

    if(data.includes("-")){
        const partes = data.split("-");
        return `${partes[2]}/${partes[1]}`;
    }

    return data;
}

function formatarHora(hora){

    if(!hora) return "";

    return String(hora).slice(0, 5);
}

function primeiroNome(nome){

    if(!nome) return "Cliente";

    return nome.split(" ")[0];
}

function statusPublico(status){

    if(status === "recusado") return "indisponível";
    if(status === "feito") return "finalizado";

    return status;
}

async function carregarHorariosPublicos(){

    if(!listaHorariosPublicos) return;

    const { data, error } = await supabaseClient
        .from("agendamentos")
        .select("nome, dia, hora, local, status, tipo")
        .order("id", { ascending: false });

    if(error){
        console.log(error);

        listaHorariosPublicos.innerHTML = `
            <p>Erro ao carregar horários.</p>
        `;

        return;
    }

    if(!data || data.length === 0){

        listaHorariosPublicos.innerHTML = `
            <p>Nenhum horário agendado no momento.</p>
        `;

        return;
    }

    listaHorariosPublicos.innerHTML = "";

    data.forEach(item => {

        const card = document.createElement("div");

        card.classList.add("horario-publico-card");

        card.innerHTML = `
            <span class="status-publico ${item.status}">
                ${statusPublico(item.status)}
            </span>

            <p class="categoria-publica">
                ${item.tipo || "Sessão"}
            </p>

            <p class="nome-publico">
                ${primeiroNome(item.nome)}
            </p>

            <div class="data-hora">
                <h3>${formatarData(item.dia)}</h3>
                <h4>${formatarHora(item.hora)}</h4>
            </div>

            <div class="linha-card"></div>

            <p class="local-publico">
                ${item.local || "Local a combinar"}
            </p>
        `;

        listaHorariosPublicos.appendChild(card);
    });

}


/* =========================
   CHATBOT
========================= */

const chatbotBtn = document.querySelector("#chatbotBtn");
const chatbotBox = document.querySelector("#chatbotBox");
const fecharChat = document.querySelector("#fecharChat");
const chatbotMensagens = document.querySelector("#chatbotMensagens");

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

function adicionarMensagem(texto, tipo){

    if(!chatbotMensagens) return;
    if(!texto || texto.trim() === "") return;

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
    }, 700);
}

function responderBot(opcao){

    if(opcao === "valores"){

        adicionarMensagem("Quero saber os valores", "user");

        digitandoFake(() => {

            adicionarMensagem(`
                <strong>Fotografia esportiva</strong><br><br>

                <strong>Coletivo:</strong><br>
                • Quadro único: <strong>R$ 200</strong><br>
                • 1º e 2º quadro: <strong>R$ 350</strong><br><br>

                <strong>Individual:</strong><br>
                • 1 foto: <strong>R$ 8</strong><br>
                • 7 fotos: <strong>R$ 45</strong><br>
                • 10 fotos: <strong>R$ 70</strong><br>
                • 15 fotos: <strong>R$ 100</strong><br>
                • 20 fotos: <strong>R$ 130</strong>
            `, "bot");

            adicionarBotaoVoltar();
        });
    }

    if(opcao === "horarios"){

        adicionarMensagem("Quais horários disponíveis?", "user");

        digitandoFake(() => {

            adicionarMensagem(`
                <strong>Horários de atendimento</strong><br><br>

                Dias úteis: <strong>13h às 21h</strong><br>
                Finais de semana: <strong>08h às 17h</strong><br><br>

                A disponibilidade depende da agenda.
            `, "bot");

            adicionarBotaoVoltar();
        });
    }

    if(opcao === "whatsapp"){

        adicionarMensagem("Quero falar no WhatsApp", "user");

        digitandoFake(() => {

            adicionarMensagem(`
                Clique abaixo para chamar no WhatsApp:<br><br>
                <a href="https://wa.me/558293462789" target="_blank" class="bot-link">
                    Abrir WhatsApp
                </a>
            `, "bot");

            adicionarBotaoVoltar();
        });
    }

    if(opcao === "banlek"){

        adicionarMensagem("Quero ver o Banlek", "user");

        digitandoFake(() => {

            adicionarMensagem(`
                Clique abaixo para acessar o Banlek:<br><br>
                <a href="https://banlek.com/Marcello1" target="_blank" class="bot-link">
                    Abrir Banlek
                </a>
            `, "bot");

            adicionarBotaoVoltar();
        });
    }
}


/* =========================
   AGENDAMENTO PELO CHAT
========================= */

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

    input.addEventListener("keydown", (e) => {
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
            mensagemErroValidacao("Digite um nome válido.");
            return false;
        }
    }

    if(campoAtual === "whatsapp"){

        const numero = resposta.replace(/\D/g, "");

        if(numero.length < 10 || numero.length > 13){
            mensagemErroValidacao("Digite um WhatsApp válido.");
            return false;
        }
    }

    if(campoAtual === "dia"){

        const diaValido = /^\d{2}\/\d{2}$/.test(resposta);

        if(!diaValido){
            mensagemErroValidacao("Digite a data no formato dd/mm.");
            return false;
        }
    }

    if(campoAtual === "hora"){

        let horaNormalizada = resposta
            .toLowerCase()
            .trim()
            .replace(/\s/g, "")
            .replace("h", ":")
            .replace("/", ":")
            .replace(".", ":");

        if(/^\d{1,2}$/.test(horaNormalizada)){
            horaNormalizada = horaNormalizada + ":00";
        }

        if(/^\d{1,2}:$/.test(horaNormalizada)){
            horaNormalizada = horaNormalizada.replace(":", ":00");
        }

        const horaValida =
        /^([01]?\d|2[0-3]):([0-5]\d)$/.test(horaNormalizada);

        if(!horaValida){
            mensagemErroValidacao("Digite um horário válido. Exemplo: 16:30");
            return false;
        }

        return horaNormalizada;
    }

    return resposta;
}

async function enviarRespostaChat(){

    const input = document.querySelector("#inputChat");

    if(!input) return;

    const resposta = input.value.trim();

    if(resposta === "") return;

    const respostaValidada = validarRespostaChat(resposta);

    if(!respostaValidada) return;

    adicionarMensagem(respostaValidada, "user");

    dadosChat[camposChat[etapaChat]] = respostaValidada;

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
        <strong>Confira seu agendamento:</strong><br><br>

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
        <button onclick="salvarAgendamentoChat()">Confirmar agendamento</button>
        <button onclick="iniciarAgendamentoChat()">Refazer</button>
    `;

    chatbotMensagens.appendChild(area);
    chatbotMensagens.scrollTop = chatbotMensagens.scrollHeight;
}

async function salvarAgendamentoChat(){

    document.querySelectorAll(".chatbot-opcoes").forEach(op => op.remove());

    adicionarMensagem("Enviando seu agendamento...", "bot");

    const { data: sessionData } = await supabaseClient.auth.getSession();

    const userId = sessionData.session
        ? sessionData.session.user.id
        : null;

    const { error } = await supabaseClient
        .from("agendamentos")
        .insert([
            {
                nome: dadosChat.nome,
                whatsapp: dadosChat.whatsapp,
                tipo: dadosChat.tipo,
                dia: dadosChat.dia,
                hora: dadosChat.hora,
                local: dadosChat.local,
                obs: dadosChat.obs.toLowerCase() === "não" ? "" : dadosChat.obs,
                status: "pendente",
                user_id: userId
            }
        ]);

    if(error){
        console.log(error);

        adicionarMensagem(`
            Não consegui enviar agora. Tente novamente ou chame no WhatsApp.
        `, "bot");

        adicionarBotaoVoltar();

        return;
    }

    adicionarMensagem(`
        <strong>Agendamento enviado com sucesso.</strong><br><br>
        Aguarde a confirmação da LZZ SportShot.
    `, "bot");

    carregarHorariosPublicos();
    adicionarBotaoVoltar();
}

function mostrarMenuInicial(){

    removerInputsChat();

    document.querySelectorAll(".chatbot-opcoes").forEach(op => op.remove());
    document.querySelectorAll(".btn-voltar-chat").forEach(btn => btn.remove());

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

    document.querySelectorAll(".btn-voltar-chat").forEach(btn => btn.remove());

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


/* =========================
   ARRASTAR CHAT NO DESKTOP
========================= */

const headerChat = document.querySelector(".chatbot-header");

let movendo = false;
let offsetX = 0;
let offsetY = 0;

if(headerChat && chatbotBox){

    headerChat.addEventListener("mousedown", (e) => {

        if(window.innerWidth <= 768) return;

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
});

document.addEventListener("mouseup", () => {
    movendo = false;
});


/* =========================
   INICIAR
========================= */

document.addEventListener("DOMContentLoaded", () => {
    carregarPortfolio();
    iniciarCarrosseis();
    carregarHorariosPublicos();
});