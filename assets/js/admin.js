const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const lista = document.querySelector(".lista-agendamentos");
const botoesFiltro = document.querySelectorAll(".filtros button");

let filtroAtual = "todos";
let confirmCallback = null;


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

    if(filtroAtual !== "todos"){
        agendamentos = data.filter(item => item.status === filtroAtual);
    }

    lista.innerHTML = "";

    let total = data.length;
    let pendentes = data.filter(item => item.status === "pendente").length;
    let confirmados = data.filter(item => item.status === "confirmado").length;

    document.getElementById("totalAgendamentos").innerText = total;
    document.getElementById("totalPendentes").innerText = pendentes;
    document.getElementById("totalConfirmados").innerText = confirmados;

    agendamentos.forEach(item => {

        lista.innerHTML += `
            <div class="agendamento-card">

                <div class="agendamento-topo">
                    <span class="status ${item.status}">
                        ${item.status}
                    </span>

                    <span class="data">
                        ${item.dia} • ${item.hora}
                    </span>
                </div>

                <h2>${item.nome}</h2>

                <div class="info">
                    <p><strong>WhatsApp:</strong> ${item.whatsapp}</p>
                    <p><strong>Tipo:</strong> ${item.tipo}</p>
                    <p><strong>Local:</strong> ${item.local || "Não informado"}</p>
                    <p><strong>Obs:</strong> ${item.obs || "Nenhuma"}</p>
                </div>

                <div class="acoes">

                    <button class="confirmar"
                        onclick="alterarStatus(${item.id}, 'confirmado')">
                        Confirmar
                    </button>

                    <button class="cancelar"
                        onclick="alterarStatus(${item.id}, 'cancelado')">
                        Cancelar
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
        return;
    }

    carregarAgendamentos();
}


// FILTROS

botoesFiltro.forEach(botao => {

    botao.addEventListener("click", () => {

        botoesFiltro.forEach(btn => btn.classList.remove("ativo"));
        botao.classList.add("ativo");

        const texto = botao.innerText.toLowerCase();

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


// MODAL DE AVISO SIMPLES

function abrirAviso(mensagem){

    abrirConfirmacao(mensagem, () => {});

}


// INICIAR

verificarLogin();
carregarAgendamentos();