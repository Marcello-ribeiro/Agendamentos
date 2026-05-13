const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const lista = document.querySelector(".lista-agendamentos");
const botoesFiltro = document.querySelectorAll(".filtros button");

const btnAvaliacoes = document.querySelector("#btnAvaliacoes");

const modalAvaliacao = document.querySelector("#modalAvaliacao");
const notaCliente = document.querySelector("#notaCliente");
const avaliacaoCliente = document.querySelector("#avaliacaoCliente");
const salvarAvaliacao = document.querySelector("#salvarAvaliacao");
const cancelarAvaliacao = document.querySelector("#cancelarAvaliacao");

let filtroAtual = "pendentes";
let confirmCallback = null;
let dadosAcao = null;
let agendamentoParaAvaliar = null;


// LOGIN

async function verificarLogin(){
    const { data } = await supabaseClient.auth.getSession();

    if(!data.session){
        window.location.href = "login.html";
    }
}


// CARREGAR AGENDAMENTOS

async function carregarAgendamentos(){

    const { data, error } = await supabaseClient
        .from("agendamentos")
        .select("*")
        .order("id", { ascending: false });

    if(error){
        console.log(error);
        return;
    }

    let agendamentos = data;

    if(filtroAtual === "pendentes"){
        agendamentos = data.filter(item => item.status === "pendente");
    }

    if(filtroAtual === "confirmados"){
        agendamentos = data.filter(item => item.status === "confirmado");
    }

    if(filtroAtual === "recusados"){
        agendamentos = data.filter(item => item.status === "recusado");
    }

    if(filtroAtual === "cancelados"){
        agendamentos = data.filter(item => item.status === "cancelado");
    }

    if(filtroAtual === "feitos"){
        agendamentos = data.filter(item => item.status === "feito");
    }

    if(filtroAtual === "avaliacoes"){
        agendamentos = data.filter(item => item.nota_cliente);
    }

    lista.innerHTML = "";

    const total = data.length;
    const pendentes = data.filter(item => item.status === "pendente").length;
    const confirmados = data.filter(item => item.status === "confirmado").length;

    document.getElementById("totalAgendamentos").innerText = total;
    document.getElementById("totalPendentes").innerText = pendentes;
    document.getElementById("totalConfirmados").innerText = confirmados;

    if(agendamentos.length === 0){
        lista.innerHTML = `
            <div class="agendamento-card">
                <h2>Nenhum agendamento encontrado</h2>
                <div class="info">
                    <p>Não existem agendamentos nesse filtro.</p>
                </div>
            </div>
        `;
        return;
    }

    agendamentos.forEach(item => {

        const nome = escaparTexto(item.nome);
        const whatsapp = escaparTexto(item.whatsapp);
        const tipo = escaparTexto(item.tipo);
        const dia = escaparTexto(formatarDia(item.dia));
        const hora = escaparTexto(String(item.hora).slice(0,5));
        const local = escaparTexto(item.local || "");
        const obs = escaparTexto(item.obs || "");
        const motivo = escaparTexto(item.motivo || "");
        const avaliacao = escaparTexto(item.avaliacao_cliente || "");

        lista.innerHTML += `
            <div class="agendamento-card">

               <div class="agendamento-topo">

   <span class="status ${item.status}">

    ${
        item.cancelado_por === "cliente"
        ?
        "cancelado pelo cliente"
        :
        item.status
    }

</span>

    <div class="bloco-data">

        <span class="titulo-data">
            DATA/HORA
        </span>

        <span class="data">
            ${dia} • ${hora}
        </span>

    </div>

</div>

                <h2>${nome}</h2>

                <div class="info">
                    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                    <p><strong>Tipo:</strong> ${tipo}</p>
                    <p><strong>Local:</strong> ${local || "Não informado"}</p>
                    <p><strong>Obs:</strong> ${obs || "Nenhuma"}</p>

                    ${
    item.motivo_cancelamento &&
    item.motivo_cancelamento !== "nullable" &&
    item.motivo_cancelamento !== "null"
    ?
    `
    <p>
        <strong>Motivo:</strong>
        ${item.motivo_cancelamento}
    </p>
    `
    :
    ""
}

                    ${
                        item.status === "feito" && item.nota_cliente
                        ? `
                            <div class="avaliacao-card">
                                <p><strong>Avaliação:</strong> ${"⭐".repeat(item.nota_cliente)}</p>
                                <p><strong>Comentário:</strong> ${avaliacao || "Sem comentário"}</p>
                            </div>
                        `
                        : ""
                    }
                </div>

                <div class="acoes">

                    ${item.status === "pendente" ? `
                        <button class="confirmar"
                            onclick="confirmarAgendamento(${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}', '${local}')">
                            Confirmar
                        </button>

                        <button class="recusar"
                            onclick="recusarAgendamento(${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}')">
                            Recusar
                        </button>
                    ` : ""}

                    ${item.status === "confirmado" ? `
                        <button class="cancelar"
                            onclick="cancelarConfirmado(${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}')">
                            Cancelar
                        </button>

                        <button class="feito"
                            onclick="abrirAvaliacao(${item.id})">
                            Já atendido
                        </button>
                    ` : ""}

                    ${
                        item.status === "recusado" ||
                        item.status === "cancelado" ||
                        item.status === "feito"
                        ? `
                            <button class="excluir"
                                onclick="excluirAgendamento(${item.id})">
                                Excluir
                            </button>
                        `
                        : ""
                    }

    <button 
    class="btn-chat-admin"
    onclick="abrirChatAdmin(${item.id}, '${item.user_id || ""}', '${nome}')"
>
    Abrir conversa
</button>

                </div>

            </div>
        `;

    });
}


// ALTERAR STATUS

async function alterarStatus(id, status){

    const dadosUpdate = { status };

    if(status === "confirmado" || status === "feito"){
        dadosUpdate.motivo = null;
    }

    const { error } = await supabaseClient
        .from("agendamentos")
        .update(dadosUpdate)
        .eq("id", id);

    if(error){
        abrirAviso("Erro ao alterar status.");
        console.log(error);
        return false;
    }

    carregarAgendamentos();
    return true;
}


// FILTROS NORMAIS

botoesFiltro.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesFiltro.forEach(btn => btn.classList.remove("ativo"));
        botao.classList.add("ativo");

        if(btnAvaliacoes){
            btnAvaliacoes.classList.remove("ativo");
        }

        const texto = botao.innerText.toLowerCase().trim();

        if(texto === "todos"){
            filtroAtual = "todos";
        }

        if(texto === "pendentes"){
            filtroAtual = "pendentes";
        }

        if(texto === "confirmados"){
            filtroAtual = "confirmados";
        }

        if(texto === "recusados"){
            filtroAtual = "recusados";
        }

        if(texto === "cancelados"){
            filtroAtual = "cancelados";
        }

        if(texto === "feitos"){
            filtroAtual = "feitos";
        }

        carregarAgendamentos();

    });

});


// FILTRO AVALIAÇÕES

if(btnAvaliacoes){
    btnAvaliacoes.addEventListener("click", () => {

        botoesFiltro.forEach(btn => btn.classList.remove("ativo"));
        btnAvaliacoes.classList.add("ativo");

        filtroAtual = "avaliacoes";

        carregarAgendamentos();

    });
}


// SAIR

const btnSair = document.querySelector(".sair");

if(btnSair){
    btnSair.addEventListener("click", async (e) => {
        e.preventDefault();

        await supabaseClient.auth.signOut();

        window.location.href = "login.html";
    });
}


// EXCLUIR

async function excluirAgendamento(id){

    abrirConfirmacao(
        "Deseja realmente excluir este agendamento?",
        async () => {

            const { error } = await supabaseClient
                .from("agendamentos")
                .delete()
                .eq("id", id);

            if(error){
                console.log(error);
                abrirAviso("Erro ao excluir.");
                return;
            }

            carregarAgendamentos();

        }
    );

}


// MODAL DE CONFIRMAÇÃO

function abrirConfirmacao(mensagem, callback){

    confirmCallback = callback;

    document.getElementById("confirm-msg").innerText = mensagem;

    document
        .getElementById("confirm-overlay")
        .classList
        .add("ativo");

}

function fecharConfirmacao(){

    document
        .getElementById("confirm-overlay")
        .classList
        .remove("ativo");

    confirmCallback = null;

}

document.getElementById("confirm-ok").addEventListener("click", async () => {

    if(confirmCallback){
        await confirmCallback();
    }

    fecharConfirmacao();

});

document.getElementById("confirm-cancel").addEventListener("click", () => {

    fecharConfirmacao();

});

function abrirAviso(mensagem){

    abrirConfirmacao(mensagem, () => {});

}


// WHATSAPP

function limparNumero(whatsapp){
    let numero = String(whatsapp).replace(/\D/g, "");

    if(!numero.startsWith("55")){
        numero = "55" + numero;
    }

    return numero;
}

function abrirWhatsApp(numero, mensagem){
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.location.href = url;
}


// CONFIRMAR AGENDAMENTO

async function confirmarAgendamento(id, nome, whatsapp, dia, hora, local){

    const atualizado = await alterarStatus(id, "confirmado");

    if(!atualizado){
        return;
    }

    const numero = limparNumero(whatsapp);

    const mensagem =
`
*assistente virtual Milly*

Olá, ${nome}!  Seu agendamento com a LzzSportShot foi confirmado.

Data: ${dia}
Horário: ${hora}
Local: ${local || "A combinar"}

Qualquer dúvida, pode falar por aqui.`;

    abrirWhatsApp(numero, mensagem);
}


// RECUSAR PENDENTE

function recusarAgendamento(id, nome, whatsapp, dia, hora){

    dadosAcao = {
        tipo: "recusar",
        id,
        nome,
        whatsapp,
        dia,
        hora
    };

    document.getElementById("motivo-overlay").classList.add("ativo");
}


// CANCELAR CONFIRMADO

function cancelarConfirmado(id, nome, whatsapp, dia, hora){

    dadosAcao = {
        tipo: "cancelar",
        id,
        nome,
        whatsapp,
        dia,
        hora
    };

    document.getElementById("motivo-overlay").classList.add("ativo");
}


// MODAL MOTIVO

document
.getElementById("motivo-cancelar")
.addEventListener("click", () => {

    fecharModalMotivo();

});

document
.getElementById("motivo-enviar")
.addEventListener("click", async () => {

   const motivo = document.getElementById("motivo-texto").value.trim();
const semMotivo = document.getElementById("semMotivo").checked;

if(!motivo && !semMotivo){
    abrirAviso("Digite o motivo ou marque a opção de não informar.");
    return;
}

const motivoFinal = semMotivo
    ? "Motivo não informado."
    : motivo;

    if(!dadosAcao){
        abrirAviso("Erro ao carregar os dados.");
        return;
    }

    const { tipo, id, nome, whatsapp, dia, hora } = dadosAcao;

    const novoStatus = tipo === "recusar" ? "recusado" : "cancelado";

    const { error } = await supabaseClient
        .from("agendamentos")
        .update({
            status: novoStatus,
            motivo: motivoFinal
        })
        .eq("id", id);

    if(error){
        abrirAviso("Erro ao salvar motivo.");
        console.log(error);
        return;
    }

    const numero = limparNumero(whatsapp);

    const textoAcao = tipo === "recusar" ? "recusado" : "cancelado";
    const textoFinal = tipo === "recusar" ? "remarcar" : "reagendar";

fecharModalMotivo();
carregarAgendamentos();

if(!semMotivo){

    const mensagem =
`
*assistente virtual Milly*

Olá, ${nome}.

Seu agendamento para ${dia} às ${hora} foi ${textoAcao}.

Motivo:
${motivoFinal}

Caso queira ${textoFinal}, pode entrar em contato novamente.`;

    abrirWhatsApp(numero, mensagem);

}

});

function fecharModalMotivo(){

    document
        .getElementById("motivo-overlay")
        .classList
        .remove("ativo");

    document
        .getElementById("motivo-texto")
        .value = "";

        document.getElementById("semMotivo").checked = false;

    dadosAcao = null;

    

}


// MODAL AVALIAÇÃO

function abrirAvaliacao(id){

    agendamentoParaAvaliar = id;

    notaCliente.value = "";
    avaliacaoCliente.value = "";

    modalAvaliacao.classList.add("ativo");

}

if(cancelarAvaliacao){
    cancelarAvaliacao.addEventListener("click", () => {

        modalAvaliacao.classList.remove("ativo");
        agendamentoParaAvaliar = null;

    });
}

if(salvarAvaliacao){
    salvarAvaliacao.addEventListener("click", async () => {

        const nota = notaCliente.value;
        const avaliacao = avaliacaoCliente.value.trim();

        if(!nota){
            abrirAviso("Escolha uma nota.");
            return;
        }

        if(!agendamentoParaAvaliar){
            abrirAviso("Erro ao encontrar o agendamento.");
            return;
        }

        const { error } = await supabaseClient
            .from("agendamentos")
            .update({
                status: "feito",
                motivo: null,
                nota_cliente: Number(nota),
                avaliacao_cliente: avaliacao
            })
            .eq("id", agendamentoParaAvaliar);

        if(error){
            console.log(error);
            abrirAviso("Erro ao salvar avaliação.");
            return;
        }

        modalAvaliacao.classList.remove("ativo");
        agendamentoParaAvaliar = null;

        carregarAgendamentos();

    });
}


function formatarDia(data){

    if(!data){
        return "";
    }

    const partes = String(data).split("-");

    if(partes.length === 3){
        const ano = partes[0];
        const mes = partes[1];
        const dia = partes[2];

        return `${dia}/${mes}`;
    }

    return data;
}

// SEGURANÇA SIMPLES PARA TEXTOS NO HTML

function escaparTexto(texto){
    return String(texto)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}



const overlayChatAdmin = document.querySelector("#overlayChatAdmin");
const fecharChatAdmin = document.querySelector("#fecharChatAdmin");
const mensagensChatAdmin = document.querySelector("#mensagensChatAdmin");
const inputChatAdmin = document.querySelector("#inputChatAdmin");
const btnEnviarChatAdmin = document.querySelector("#btnEnviarChatAdmin");

let chatAdminAgendamentoId = null;
let chatAdminUserId = null;
let nomeClienteAtual = "Cliente";

function abrirChatAdmin(agendamentoId, userId, nome){

    if(!userId){
        abrirAviso("Esse cliente não fez login.");
        return;
    }

    chatAdminAgendamentoId = agendamentoId;
    chatAdminUserId = userId;

    nomeClienteAtual = nome;

    overlayChatAdmin.classList.add("ativo");

    carregarChatAdmin();
}

async function carregarChatAdmin(){

    const { data, error } = await supabaseClient
        .from("mensagens_agendamento")
        .select("*")
        .eq("agendamento_id", chatAdminAgendamentoId)
        .order("criado_em", { ascending: true });

    if(error){
        console.log(error);
        mensagensChatAdmin.innerHTML = "<p>Erro ao carregar mensagens.</p>";
        return;
    }

    mensagensChatAdmin.innerHTML = "";

    if(!data || data.length === 0){
        mensagensChatAdmin.innerHTML = "<p>Nenhuma mensagem ainda.</p>";
        return;
    }

   data.forEach(msg => {
    mensagensChatAdmin.innerHTML += `
        <div class="msg-chat-admin ${msg.remetente}">
            <span>
                ${
    msg.remetente === "admin"
    ?
    "Você"
    :
    nomeClienteAtual
}
            </span>

            <p>${escaparTexto(msg.mensagem)}</p>
        </div>
    `;
});

    mensagensChatAdmin.scrollTop = mensagensChatAdmin.scrollHeight;
}

if(btnEnviarChatAdmin){
    btnEnviarChatAdmin.addEventListener("click", async () => {

        const mensagem = inputChatAdmin.value.trim();

        if(!mensagem){
            return;
        }

        const { error } = await supabaseClient
            .from("mensagens_agendamento")
            .insert([
                {
                    agendamento_id: chatAdminAgendamentoId,
                    user_id: chatAdminUserId,
                    remetente: "admin",
                    mensagem,
                    lida: false
                }
            ]);

        if(error){
            console.log(error);
            abrirAviso("Erro ao enviar mensagem: " + error.message);
            return;
        }

        inputChatAdmin.value = "";

        carregarChatAdmin();
    });
}

if(fecharChatAdmin){
    fecharChatAdmin.addEventListener("click", () => {
        overlayChatAdmin.classList.remove("ativo");
        chatAdminAgendamentoId = null;
        chatAdminUserId = null;
    });
}


// INICIAR

// INICIAR

verificarLogin();
carregarAgendamentos();

supabaseClient
.channel("chat-admin-tempo-real")

.on(
    "postgres_changes",
    {
        event: "INSERT",
        schema: "public",
        table: "mensagens_agendamento"
    },

    payload => {

        if(
            chatAdminAgendamentoId &&
            payload.new.agendamento_id === chatAdminAgendamentoId
        ){
            carregarChatAdmin();
        }

    }
)

.subscribe();