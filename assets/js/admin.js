const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const lista = document.querySelector(".lista-agendamentos");
const botoesFiltro = document.querySelectorAll(".filtros button");

let filtroAtual = "principal";
let confirmCallback = null;
let dadosRecusa = null;


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

    if(filtroAtual === "principal"){
        agendamentos = data.filter(item =>
            item.status === "pendente" ||
            item.status === "confirmado"
        );
    }

    if(filtroAtual !== "todos" && filtroAtual !== "principal"){
        agendamentos = data.filter(item => item.status === filtroAtual);
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
        const dia = escaparTexto(item.dia);
        const hora = escaparTexto(item.hora);
        const local = escaparTexto(item.local || "");
        const obs = escaparTexto(item.obs || "");

        lista.innerHTML += `
            <div class="agendamento-card">

                <div class="agendamento-topo">
                    <span class="status ${item.status}">
                        ${item.status}
                    </span>

                    <span class="data">
                        ${dia} • ${hora}
                    </span>
                </div>

                <h2>${nome}</h2>

                <div class="info">
                    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                    <p><strong>Tipo:</strong> ${tipo}</p>
                    <p><strong>Local:</strong> ${local || "Não informado"}</p>
                    <p><strong>Obs:</strong> ${obs || "Nenhuma"}</p>
                </div>

                <div class="acoes">

                    <button class="confirmar"
                        onclick="confirmarAgendamento(${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}', '${local}')">
                        Confirmar
                    </button>

                    <button class="cancelar"
                        onclick="cancelarAgendamento(${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}')">
                        Recusar
                    </button>

                    <button class="feito"
                        onclick="alterarStatus(${item.id}, 'feito')">
                        Já atendido
                    </button>

                    <button class="excluir"
                        onclick="excluirAgendamento(${item.id})">
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}


// ALTERAR STATUS

async function alterarStatus(id, status){

    const { error } = await supabaseClient
        .from("agendamentos")
        .update({ status })
        .eq("id", id);

    if(error){
        abrirAviso("Erro ao alterar status.");
        console.log(error);
        return false;
    }

    carregarAgendamentos();
    return true;
}


// FILTROS

botoesFiltro.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesFiltro.forEach(btn => btn.classList.remove("ativo"));
        botao.classList.add("ativo");

        const texto = botao.innerText.toLowerCase();

        if(texto === "principal"){
            filtroAtual = "principal";
        }

        if(texto === "todos"){
            filtroAtual = "todos";
        }

        if(texto === "pendentes"){
            filtroAtual = "pendente";
        }

        if(texto === "confirmados"){
            filtroAtual = "confirmado";
        }

        if(texto === "cancelados"){
            filtroAtual = "cancelado";
        }

        if(texto === "feitos"){
            filtroAtual = "feito";
        }

        carregarAgendamentos();

    });

});


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
    const url =
    `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

    window.open(url, "_blank");
}

async function confirmarAgendamento(id, nome, whatsapp, dia, hora, local){

    const atualizado = await alterarStatus(id, "confirmado");

    if(!atualizado){
        return;
    }

    const numero = limparNumero(whatsapp);

    const mensagem =
`Olá, ${nome}! Seu agendamento com a LZZ SportShot foi confirmado.

Data: ${dia}
Horário: ${hora}
Local: ${local || "A combinar"}

Qualquer dúvida, pode falar por aqui.`;

    abrirWhatsApp(numero, mensagem);
}


// RECUSAR COM MOTIVO

async function cancelarAgendamento(id, nome, whatsapp, dia, hora){

    dadosRecusa = {
        id,
        nome,
        whatsapp,
        dia,
        hora
    };

    document
        .getElementById("motivo-overlay")
        .classList
        .add("ativo");

}

document
.getElementById("motivo-cancelar")
.addEventListener("click", () => {

    fecharModalMotivo();

});

document
.getElementById("motivo-enviar")
.addEventListener("click", async () => {

    const motivo =
    document.getElementById("motivo-texto")
    .value
    .trim();

    if(!motivo){
        abrirAviso("Digite o motivo da recusa.");
        return;
    }

    const {
        id,
        nome,
        whatsapp,
        dia,
        hora
    } = dadosRecusa;

    const atualizado = await alterarStatus(id, "cancelado");

    if(!atualizado){
        return;
    }

    const numero = limparNumero(whatsapp);

    const mensagem =
`Olá, ${nome}.

Seu agendamento para ${dia} às ${hora} foi recusado/cancelado.

Motivo:
${motivo}

Caso queira remarcar, pode entrar em contato novamente.`;

    abrirWhatsApp(numero, mensagem);

    fecharModalMotivo();

});

function fecharModalMotivo(){

    document
        .getElementById("motivo-overlay")
        .classList
        .remove("ativo");

    document
        .getElementById("motivo-texto")
        .value = "";

    dadosRecusa = null;

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


// INICIAR

verificarLogin();
carregarAgendamentos();