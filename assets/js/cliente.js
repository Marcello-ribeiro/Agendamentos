const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const lista = document.querySelector(".lista-cliente");
const logout = document.querySelector("#logout");
const voltarSite = document.querySelector("#voltarSite");
const nomeCliente = document.querySelector("#nomeCliente");

const modalCancelamentoCliente = document.querySelector("#modalCancelamentoCliente");
const motivoCancelamentoCliente = document.querySelector("#motivoCancelamentoCliente");
const fecharCancelamentoCliente = document.querySelector("#fecharCancelamentoCliente");
const confirmarCancelamentoCliente = document.querySelector("#confirmarCancelamentoCliente");

const abrirChatSuporte = document.querySelector("#abrirChatSuporte");
const overlayChatCliente = document.querySelector("#overlayChatCliente");
const fecharChat = document.querySelector("#fecharChatCliente");
const mensagensChatCliente = document.querySelector("#mensagensChatCliente");
const inputChatCliente = document.querySelector("#inputChatCliente");
const btnEnviarChatCliente = document.querySelector("#btnEnviarChatCliente");

let agendamentoParaCancelar = null;
let chatAgendamentoAtual = null;


async function verificarLogin(){

    const { data } = await supabaseClient.auth.getSession();

    if(!data.session){
        window.location.href = "login-cliente.html";
        return;
    }

    const email = data.session.user.email;
    const nome = email.split("@")[0];

    if(nomeCliente){
        nomeCliente.innerText = nome;
    }

    carregarAgendamentos(data.session.user.id);
}


async function carregarAgendamentos(userId){

    const { data, error } = await supabaseClient
        .from("agendamentos")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: false });

    if(error){
        console.log(error);
        lista.innerHTML = "<p>Erro ao carregar agendamentos.</p>";
        return;
    }

    lista.innerHTML = "";

    if(!data || data.length === 0){
        lista.innerHTML = `
            <p>Nenhum agendamento encontrado.</p>
        `;
        return;
    }

    data.forEach(item => {

        const podeCancelar = verificarPodeCancelar(item.dia, item.hora);

        lista.innerHTML += `

            <div class="agendamento-card cliente-card">

                <div class="agendamento-topo">
                    <div>
                        <span class="status ${item.status}">

    ${
        item.cancelado_por === "cliente"
        ?
        "cancelado por você"
        :
        item.status
    }

</span>

                        <p class="data-cliente">
                            ${formatarData(item.dia)} • ${formatarHora(item.hora)}
                        </p>
                    </div>

                    ${
                        item.status === "pendente" || item.status === "confirmado"
                        ?
                        `
                        <button 
                            class="btn-cancelar-cliente"
                            onclick="abrirCancelamentoCliente(${item.id}, '${item.dia}', '${item.hora}')"
                            ${!podeCancelar ? "disabled" : ""}
                        >
                            Cancelar
                        </button>
                        `
                        :
                        ""
                    }
                </div>

                <h2 class="titulo-local">
                    <span>📍</span>
                    ${item.local || "Local não informado"}
                </h2>

                <div class="cliente-info-compacta">
                    <p><strong>Nome:</strong> ${item.nome || "Não informado"}</p>
                    <p><strong>WhatsApp:</strong> ${item.whatsapp || "Não informado"}</p>
                    <p><strong>Tipo:</strong> ${item.tipo || "Não informado"}</p>
                    <p><strong>Observação:</strong> ${item.obs || "Nenhuma"}</p>
                </div>

                ${
                    !podeCancelar &&
                    (item.status === "pendente" || item.status === "confirmado")
                    ?
                    `<p class="aviso-cancelamento">Cancelamento disponível apenas com 24h de antecedência.</p>`
                    :
                    ""
                }

                ${
                    item.motivo_cancelamento
                    ?
                    `
                    <div class="motivo-cancelamento">
                        <strong>Motivo do cancelamento:</strong>
                        <p>${item.motivo_cancelamento}</p>
                    </div>
                    `
                    :
                    ""
                }


            </div>

        `;
    });
}


function verificarPodeCancelar(dia, hora){

    if(!dia || !hora){
        return false;
    }

    const agora = new Date();

    const partesDia = String(dia).split("/");
    const partesHora = String(hora).split(":");

    const diaNumero = Number(partesDia[0]);
    const mesNumero = Number(partesDia[1]) - 1;

    const horaNumero = Number(partesHora[0]);
    const minutoNumero = Number(partesHora[1]);

    let dataAgendamento = new Date(
        agora.getFullYear(),
        mesNumero,
        diaNumero,
        horaNumero,
        minutoNumero
    );

    if(dataAgendamento < agora){
        dataAgendamento.setFullYear(agora.getFullYear() + 1);
    }

    const diferencaHoras =
    (dataAgendamento - agora) / 1000 / 60 / 60;

    return diferencaHoras >= 24;
}


function abrirCancelamentoCliente(id, dia, hora){

    const podeCancelar = verificarPodeCancelar(dia, hora);

    if(!podeCancelar){
        alert("Você só pode cancelar com pelo menos 24h de antecedência.");
        return;
    }

    agendamentoParaCancelar = id;

    motivoCancelamentoCliente.value = "";

    modalCancelamentoCliente.classList.add("ativo");
}


async function abrirChatCliente(id){

    chatAgendamentoAtual = id;

    overlayChatCliente.classList.add("ativo");

    await carregarMensagensChat();
}


async function carregarMensagensChat(){

    if(!chatAgendamentoAtual){
        return;
    }

    const { data, error } = await supabaseClient
        .from("mensagens_agendamento")
        .select("*")
        .eq("agendamento_id", chatAgendamentoAtual)
        .order("criado_em", { ascending: true });

    if(error){
        console.log(error);
        mensagensChatCliente.innerHTML = "<p>Erro ao carregar mensagens.</p>";
        return;
    }

    mensagensChatCliente.innerHTML = "";

    if(!data || data.length === 0){
        mensagensChatCliente.innerHTML = "<p>Nenhuma mensagem ainda.</p>";
        return;
    }

  data.forEach(msg => {

    mensagensChatCliente.innerHTML += `
        <div class="msg-cliente ${msg.remetente}">
            <span>
                ${msg.remetente === "cliente" ? "Você" : "Marcello"}
            </span>

            <p>${msg.mensagem}</p>
        </div>
    `;

});

    await supabaseClient
        .from("mensagens_agendamento")
        .update({ lida: true })
        .eq("agendamento_id", chatAgendamentoAtual)
        .eq("remetente", "admin");

    mensagensChatCliente.scrollTop =
    mensagensChatCliente.scrollHeight;
}


async function enviarMensagemChatCliente(){

    const mensagem = inputChatCliente.value.trim();

    if(!mensagem || !chatAgendamentoAtual){
        return;
    }

    const { data: sessionData } =
    await supabaseClient.auth.getSession();

    if(!sessionData.session){
        window.location.href = "login-cliente.html";
        return;
    }

    const { error } = await supabaseClient
        .from("mensagens_agendamento")
        .insert([
            {
                agendamento_id: chatAgendamentoAtual,
                user_id: sessionData.session.user.id,
                remetente: "cliente",
                mensagem,
                lida: false
            }
        ]);

    if(error){
        console.log(error);
        alert("Erro ao enviar mensagem.");
        return;
    }

    inputChatCliente.value = "";

    carregarMensagensChat();
}


async function abrirChatSuportePadrao(){

    const { data: sessionData } =
    await supabaseClient.auth.getSession();

    if(!sessionData.session){
        window.location.href = "login-cliente.html";
        return;
    }

    const userId = sessionData.session.user.id;

    const { data, error } = await supabaseClient
        .from("agendamentos")
        .select("id")
        .eq("user_id", userId)
        .order("id", { ascending: false })
        .limit(1);

    if(error){
        console.log(error);
        alert("Erro ao abrir conversa.");
        return;
    }

    if(!data || data.length === 0){
        alert("Faça um agendamento primeiro.");
        return;
    }

    abrirChatCliente(data[0].id);
}


if(fecharCancelamentoCliente){
    fecharCancelamentoCliente.addEventListener("click", () => {
        modalCancelamentoCliente.classList.remove("ativo");
        agendamentoParaCancelar = null;
    });
}


if(confirmarCancelamentoCliente){
    confirmarCancelamentoCliente.addEventListener("click", async () => {

        const motivo = motivoCancelamentoCliente.value.trim();

        if(motivo.length < 3){
            alert("Informe um motivo válido.");
            return;
        }

        const { error } = await supabaseClient
            .from("agendamentos")
            .update({
                status: "cancelado",
                motivo_cancelamento: motivo,
                cancelado_por: "cliente"
            })
            .eq("id", agendamentoParaCancelar);

        if(error){
            console.log(error);
            alert("Erro ao cancelar agendamento.");
            return;
        }

        modalCancelamentoCliente.classList.remove("ativo");
        agendamentoParaCancelar = null;

        verificarLogin();
    });
}


if(voltarSite){
    voltarSite.addEventListener("click", () => {
        window.location.href = "../../index.html";
    });
}


if(logout){
    logout.addEventListener("click", async () => {

        await supabaseClient.auth.signOut();

        localStorage.removeItem("continuarSemLogin");

        window.location.href = "../../index.html";
    });
}


if(btnEnviarChatCliente){
    btnEnviarChatCliente.addEventListener("click", enviarMensagemChatCliente);
}


if(inputChatCliente){
    inputChatCliente.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
            enviarMensagemChatCliente();
        }
    });
}


if(fecharChat){
    fecharChat.addEventListener("click", () => {
        overlayChatCliente.classList.remove("ativo");
        chatAgendamentoAtual = null;
    });
}


if(abrirChatSuporte){
    abrirChatSuporte.addEventListener("click", abrirChatSuportePadrao);
}


function formatarData(data){

    if(!data){
        return "Sem data";
    }

    const partes = String(data).split("/");

    if(partes.length < 2){
        return data;
    }

    return `${partes[0]}/${partes[1]}`;
}


function formatarHora(hora){

    if(!hora){
        return "Sem horário";
    }

    const partes = String(hora).split(":");

    return `${partes[0]}:${partes[1]}`;
}


verificarLogin();