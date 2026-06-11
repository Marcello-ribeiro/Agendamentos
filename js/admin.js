/* =========================
   SEGURANÇA / LOGIN
========================= */

async function verificarLogin(){
    const { data } = await supabaseClient.auth.getSession();

    if(!data.session){
        window.location.href = "login.html";
        return;
    }
}

verificarLogin();

/* =========================
   ELEMENTOS
========================= */

const lista = document.querySelector(".lista-agendamentos");
const botoesFiltro = document.querySelectorAll(".filtros button");

const btnSair = document.querySelector(".sair");

const formAdminAgendamento = document.querySelector("#formAdminAgendamento");

const formPortfolio = document.querySelector("#formPortfolio");
const portfolioAdminLista = document.querySelector("#portfolioAdminLista");

const modalAvaliacao = document.querySelector("#modalAvaliacao");
const notaCliente = document.querySelector("#notaCliente");
const avaliacaoCliente = document.querySelector("#avaliacaoCliente");
const salvarAvaliacao = document.querySelector("#salvarAvaliacao");
const cancelarAvaliacao = document.querySelector("#cancelarAvaliacao");

let filtroAtual = "pendentes";
let confirmCallback = null;
let dadosAcao = null;
let agendamentoParaAvaliar = null;

/* =========================
   TABS
========================= */

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("ativo"));
        document.querySelectorAll(".admin-tab-content").forEach(tab => tab.classList.remove("ativo"));

        btn.classList.add("ativo");

        const tab = btn.dataset.tab;
        document.querySelector(`#tab-${tab}`).classList.add("ativo");
    });
});

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

document.querySelector("#toast-btn")?.addEventListener("click", () => {
    document.querySelector("#toast-overlay").classList.remove("ativo");
});

/* =========================
   LOGOUT
========================= */

btnSair?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
});

/* =========================
   UTILITÁRIOS
========================= */

function formatarDia(data){
    if(!data) return "";

    const partes = String(data).split("-");

    if(partes.length === 3){
        return `${partes[2]}/${partes[1]}`;
    }

    return data;
}

function limparNumero(whatsapp){
    let numero = String(whatsapp).replace(/\D/g, "");

    if(!numero.startsWith("55")){
        numero = "55" + numero;
    }

    return numero;
}

function abrirWhatsApp(numero, mensagem){
    const url = `https://wa.me/${limparNumero(numero)}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
}

function escaparTexto(texto){
    return String(texto || "")
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

/* =========================
   AGENDAMENTOS
========================= */

async function carregarAgendamentos(){
    const { data, error } = await supabaseClient
        .from("agendamentos")
        .select("*")
        .order("id", { ascending: false });

    if(error){
        console.log(error);
        mostrarToast("Erro ao carregar agendamentos.");
        return;
    }

    const total = data.length;
    const pendentes = data.filter(item => item.status === "pendente").length;
    const confirmados = data.filter(item => item.status === "confirmado").length;

    document.querySelector("#totalAgendamentos").innerText = total;
    document.querySelector("#totalPendentes").innerText = pendentes;
    document.querySelector("#totalConfirmados").innerText = confirmados;

    let agendamentos = data;

    if(filtroAtual !== "todos"){
        agendamentos = data.filter(item => item.status === filtroAtual);
    }

    lista.innerHTML = "";

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
        const hora = escaparTexto(String(item.hora).slice(0, 5));
        const local = escaparTexto(item.local || "");
        const obs = escaparTexto(item.obs || "");
        const avaliacao = escaparTexto(item.avaliacao || "");

        lista.innerHTML += `
            <div class="agendamento-card">

                <div class="agendamento-topo">
                    <span class="status ${item.status}">
                        ${item.status}
                    </span>

                    <div class="bloco-data">
                        <span class="titulo-data">DATA/HORA</span>
                        <span class="data">${dia} • ${hora}</span>
                    </div>
                </div>

                <h2>${nome}</h2>

                <div class="info">
                    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                    <p><strong>Tipo:</strong> ${tipo}</p>
                    <p><strong>Local:</strong> ${local || "Não informado"}</p>
                    <p><strong>Obs:</strong> ${obs || "Nenhuma"}</p>

                    ${
                        item.status === "feito" && item.nota
                        ? `
                            <div class="avaliacao-card">
                                <p><strong>Avaliação:</strong> ${"⭐".repeat(item.nota)}</p>
                                <p><strong>Comentário:</strong> ${avaliacao || "Sem comentário"}</p>
                            </div>
                        `
                        : ""
                    }
                </div>

                <div class="acoes">

                    ${
                        item.status === "pendente"
                        ? `
                            <button class="confirmar"
                                onclick="confirmarAgendamento(${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}', '${local}')">
                                Confirmar
                            </button>

                            <button class="recusar"
                                onclick="abrirMotivo('recusar', ${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}')">
                                Recusar
                            </button>
                        `
                        : ""
                    }

                    ${
                        item.status === "confirmado"
                        ? `
                            <button class="cancelar"
                                onclick="abrirMotivo('cancelar', ${item.id}, '${nome}', '${whatsapp}', '${dia}', '${hora}')">
                                Cancelar
                            </button>

                            <button class="feito"
                                onclick="abrirAvaliacao(${item.id})">
                                Já feito
                            </button>
                        `
                        : ""
                    }

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

                    <button class="btn-chat-admin"
                        onclick="abrirWhatsApp('${whatsapp}', 'Olá, ${nome}! Estou entrando em contato sobre seu agendamento com a LZZ SportShot para ${dia} às ${hora}.')">
                        WhatsApp
                    </button>

                </div>
            </div>
        `;
    });
}

async function alterarStatus(id, status){
    const { error } = await supabaseClient
        .from("agendamentos")
        .update({ status })
        .eq("id", id);

    if(error){
        console.log(error);
        mostrarToast("Erro ao alterar status.");
        return false;
    }

    await carregarAgendamentos();
    return true;
}

async function confirmarAgendamento(id, nome, whatsapp, dia, hora, local){
    const ok = await alterarStatus(id, "confirmado");

    if(!ok) return;

    const mensagem = `
Olá, ${nome}.

Seu agendamento com a LZZ SportShot foi confirmado.

Data: ${dia}
Horário: ${hora}
Local: ${local || "A combinar"}

Qualquer dúvida, pode falar por aqui.
`;

    abrirWhatsApp(whatsapp, mensagem);
}

function abrirMotivo(tipo, id, nome, whatsapp, dia, hora){
    dadosAcao = { tipo, id, nome, whatsapp, dia, hora };

    document.querySelector("#motivo-overlay").classList.add("ativo");
}

document.querySelector("#motivo-cancelar")?.addEventListener("click", fecharModalMotivo);

document.querySelector("#motivo-enviar")?.addEventListener("click", async () => {
    const motivo = document.querySelector("#motivo-texto").value.trim();
    const semMotivo = document.querySelector("#semMotivo").checked;

    if(!motivo && !semMotivo){
        mostrarToast("Digite o motivo ou marque para não informar.");
        return;
    }

    if(!dadosAcao){
        mostrarToast("Erro ao carregar ação.");
        return;
    }

    const motivoFinal = semMotivo ? "Motivo não informado." : motivo;
    const novoStatus = dadosAcao.tipo === "recusar" ? "recusado" : "cancelado";

    const { error } = await supabaseClient
        .from("agendamentos")
        .update({
            status: novoStatus,
            obs: motivoFinal
        })
        .eq("id", dadosAcao.id);

    if(error){
        console.log(error);
        mostrarToast("Erro ao salvar ação.");
        return;
    }

    fecharModalMotivo();
    await carregarAgendamentos();

    if(!semMotivo){
        const textoAcao = dadosAcao.tipo === "recusar" ? "recusado" : "cancelado";

        const mensagem = `
Olá, ${dadosAcao.nome}.

Seu agendamento para ${dadosAcao.dia} às ${dadosAcao.hora} foi ${textoAcao}.

Motivo:
${motivoFinal}

Caso queira remarcar, pode falar por aqui.
`;

        abrirWhatsApp(dadosAcao.whatsapp, mensagem);
    }
});

function fecharModalMotivo(){
    document.querySelector("#motivo-overlay").classList.remove("ativo");
    document.querySelector("#motivo-texto").value = "";
    document.querySelector("#semMotivo").checked = false;
    dadosAcao = null;
}

function abrirAvaliacao(id){
    agendamentoParaAvaliar = id;
    notaCliente.value = "";
    avaliacaoCliente.value = "";
    modalAvaliacao.classList.add("ativo");
}

cancelarAvaliacao?.addEventListener("click", () => {
    modalAvaliacao.classList.remove("ativo");
    agendamentoParaAvaliar = null;
});

salvarAvaliacao?.addEventListener("click", async () => {
    const nota = notaCliente.value;
    const avaliacao = avaliacaoCliente.value.trim();

    if(!nota){
        mostrarToast("Escolha uma nota.");
        return;
    }

    const { error } = await supabaseClient
        .from("agendamentos")
        .update({
            status: "feito",
            nota: Number(nota),
            avaliacao
        })
        .eq("id", agendamentoParaAvaliar);

    if(error){
        console.log(error);
        mostrarToast("Erro ao salvar avaliação.");
        return;
    }

    modalAvaliacao.classList.remove("ativo");
    agendamentoParaAvaliar = null;

    await carregarAgendamentos();
});

async function excluirAgendamento(id){
    abrirConfirmacao("Deseja realmente excluir este agendamento?", async () => {
        const { error } = await supabaseClient
            .from("agendamentos")
            .delete()
            .eq("id", id);

        if(error){
            console.log(error);
            mostrarToast("Erro ao excluir.");
            return;
        }

        await carregarAgendamentos();
    });
}

/* =========================
   FILTROS
========================= */

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach(btn => btn.classList.remove("ativo"));
        botao.classList.add("ativo");

        const texto = botao.innerText.toLowerCase().trim();

        if(texto === "todos") filtroAtual = "todos";
        if(texto === "pendentes") filtroAtual = "pendente";
        if(texto === "confirmados") filtroAtual = "confirmado";
        if(texto === "feitos") filtroAtual = "feito";
        if(texto === "cancelados") filtroAtual = "cancelado";
        if(texto === "recusados") filtroAtual = "recusado";

        carregarAgendamentos();
    });
});

/* =========================
   CRIAR AGENDAMENTO ADMIN
========================= */

formAdminAgendamento?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
        nome: document.querySelector("#adminNome").value.trim(),
        whatsapp: document.querySelector("#adminWhatsapp").value.trim(),
        tipo: document.querySelector("#adminTipo").value,
        dia: document.querySelector("#adminDia").value.trim(),
        hora: document.querySelector("#adminHora").value,
        local: document.querySelector("#adminLocal").value.trim(),
        obs: document.querySelector("#adminObs").value.trim(),
        status: "confirmado"
    };

    const { error } = await supabaseClient
        .from("agendamentos")
        .insert([dados]);

    if(error){
        console.log(error);
        mostrarToast("Erro ao criar agendamento.");
        return;
    }

    mostrarToast("Agendamento criado com sucesso.");
    formAdminAgendamento.reset();
    await carregarAgendamentos();

    abrirWhatsApp(
        dados.whatsapp,
        `Olá, ${dados.nome}. Seu agendamento com a LZZ SportShot foi confirmado para ${dados.dia} às ${dados.hora}.`
    );
});

/* =========================
   CONFIRMAÇÃO
========================= */

function abrirConfirmacao(mensagem, callback){
    confirmCallback = callback;
    document.querySelector("#confirm-msg").innerText = mensagem;
    document.querySelector("#confirm-overlay").classList.add("ativo");
}

function fecharConfirmacao(){
    document.querySelector("#confirm-overlay").classList.remove("ativo");
    confirmCallback = null;
}

document.querySelector("#confirm-ok")?.addEventListener("click", async () => {
    if(confirmCallback){
        await confirmCallback();
    }

    fecharConfirmacao();
});

document.querySelector("#confirm-cancel")?.addEventListener("click", fecharConfirmacao);

/* =========================
   PORTFÓLIO
========================= */

async function carregarPortfolioAdmin(){
    const { data, error } = await supabaseClient
        .from("portfolio")
        .select(`
            *,
            portfolio_imagens(*)
        `)
        .order("ordem", { ascending: true });

    if(error){
        console.log(error);
        portfolioAdminLista.innerHTML = "<p>Erro ao carregar portfólio.</p>";
        return;
    }

    if(!data || data.length === 0){
        portfolioAdminLista.innerHTML = `
    <p>Nenhum trabalho cadastrado ainda. Adicione o primeiro card do portfólio acima.</p>`;
        return;
    }

    portfolioAdminLista.innerHTML = "";

    data.forEach(item => {
        const primeiraImagem =
            item.portfolio_imagens && item.portfolio_imagens.length > 0
            ? item.portfolio_imagens[0].imagem_url
            : "";

        portfolioAdminLista.innerHTML += `
            <div class="portfolio-admin-card">

                <div class="portfolio-admin-thumb">
                    ${
                        primeiraImagem
                        ? `<img src="${primeiraImagem}" alt="${item.titulo}">`
                        : ""
                    }
                </div>

                <div class="portfolio-admin-info">
                    <h3>${item.titulo}</h3>
                    <p>
                        <span>${item.categoria}</span> — ${item.ano}<br>
                        Tamanho: ${item.tamanho} • Ordem: ${item.ordem || 0}<br>
                        Status: ${item.ativo ? "Visível no site" : "Oculto"}
                    </p>
                </div>

                <div class="portfolio-admin-acoes">
                    <button class="btn-editar-portfolio" onclick="editarPortfolio(${item.id})">
                        Editar
                    </button>

                    <button class="btn-excluir-portfolio" onclick="excluirPortfolio(${item.id})">
                        Excluir
                    </button>
                </div>

            </div>
        `;
    });
}

formPortfolio?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.querySelector("#portfolioId").value;

    const titulo = document.querySelector("#portfolioTitulo").value.trim();
    const categoria = document.querySelector("#portfolioCategoria").value;
    const ano = Number(document.querySelector("#portfolioAno").value);
    const tamanho = document.querySelector("#portfolioTamanho").value;
    const ordem = Number(document.querySelector("#portfolioOrdem").value || 0);
    const ativo = document.querySelector("#portfolioAtivo").checked;
    const arquivos = fotosSelecionadas.map(f => f.file);

    let portfolioId = id;

    if(id){
        const { error } = await supabaseClient
            .from("portfolio")
            .update({ titulo, categoria, ano, tamanho, ordem, ativo })
            .eq("id", id);

        if(error){
            console.log(error);
            mostrarToast("Erro ao atualizar trabalho.");
            return;
        }
    }
    else{
        const { data, error } = await supabaseClient
            .from("portfolio")
            .insert([{ titulo, categoria, ano, tamanho, ordem, ativo }])
            .select()
            .single();

        if(error){
            console.log(error);
            mostrarToast("Erro ao criar trabalho.");
            return;
        }

        portfolioId = data.id;
    }

    if(arquivos.length > 0){
        await uploadImagensPortfolio(portfolioId, arquivos);
    }

    mostrarToast(
    id
    ? "Trabalho atualizado com sucesso."
    : "Trabalho adicionado ao portfólio com sucesso."
);

    formPortfolio.reset();
    document.querySelector("#portfolioId").value = "";
    document.querySelector("#portfolioAtivo").checked = true;
    fotosSelecionadas = [];
    previewFotos.innerHTML = "";

    await carregarPortfolioAdmin();
});

async function uploadImagensPortfolio(portfolioId, arquivos){
    for(let i = 0; i < arquivos.length; i++){
        const arquivo = arquivos[i];

        const extensao = arquivo.name.split(".").pop();
        const nomeArquivo = `${portfolioId}/${Date.now()}-${i}.${extensao}`;

        const { error: uploadError } = await supabaseClient.storage
            .from("portfolio")
            .upload(nomeArquivo, arquivo);

        if(uploadError){
            console.log(uploadError);
            mostrarToast("Erro ao enviar imagem.");
            return;
        }

        const { data: publicUrlData } = supabaseClient.storage
            .from("portfolio")
            .getPublicUrl(nomeArquivo);

        const { error: insertError } = await supabaseClient
            .from("portfolio_imagens")
            .insert([{
                portfolio_id: portfolioId,
                imagem_url: publicUrlData.publicUrl,
                ordem: i
            }]);

        if(insertError){
            console.log(insertError);
            mostrarToast("Erro ao salvar imagem.");
            return;
        }
    }
}

async function editarPortfolio(id){
    const { data, error } = await supabaseClient
        .from("portfolio")
        .select("*")
        .eq("id", id)
        .single();

    if(error){
        console.log(error);
        mostrarToast("Erro ao buscar trabalho.");
        return;
    }

    document.querySelector("#portfolioId").value = data.id;
    document.querySelector("#portfolioTitulo").value = data.titulo;
    document.querySelector("#portfolioCategoria").value = data.categoria;
    document.querySelector("#portfolioAno").value = data.ano;
    document.querySelector("#portfolioTamanho").value = data.tamanho;
    document.querySelector("#portfolioOrdem").value = data.ordem;
    document.querySelector("#portfolioAtivo").checked = data.ativo;

    document.querySelector('[data-tab="portfolio"]').click();

    window.scrollTo({
        top: document.querySelector("#tab-portfolio").offsetTop - 40,
        behavior: "smooth"
    });
}

async function excluirPortfolio(id){portfolioAdminLista.innerHTML

    abrirConfirmacao(
        "Deseja excluir este trabalho do portfólio?",
        async () => {

            const { error } = await supabaseClient
                .from("portfolio")
                .delete()
                .eq("id", id);

            if(error){
                console.log(error);
                mostrarToast("Erro ao excluir trabalho.");
                return;
            }

            mostrarToast("Trabalho removido do portfólio com sucesso.");

            await carregarPortfolioAdmin();
        }
    );
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", async () => {
    await carregarAgendamentos();
    await carregarPortfolioAdmin();
});

const inputFotos = document.getElementById("portfolioImagens");
const previewFotos = document.getElementById("previewFotos");

let fotosSelecionadas = [];

if(inputFotos && previewFotos){
    inputFotos.addEventListener("change", () => {
        const novasFotos = Array.from(inputFotos.files);

        novasFotos.forEach(file => {
            fotosSelecionadas.push({
                file,
                preview: URL.createObjectURL(file)
            });
        });

        inputFotos.value = "";
        renderizarPreviews();
    });
}

function renderizarPreviews() {
    previewFotos.innerHTML = "";

    fotosSelecionadas.forEach((foto, index) => {

        const item = document.createElement("div");

        item.className = "preview-item";

        item.innerHTML = `
            <span class="preview-ordem">${index + 1}</span>

            <img src="${foto.preview}" alt="">

            <div class="preview-actions">
                <button type="button" onclick="moverFoto(${index}, -1)">↑</button>
                <button type="button" onclick="moverFoto(${index}, 1)">↓</button>
                <button type="button" class="remove" onclick="removerFoto(${index})">×</button>
            </div>
        `;

        previewFotos.appendChild(item);
    });
}

function moverFoto(index, direcao){

    const novoIndex = index + direcao;

    if(novoIndex < 0 || novoIndex >= fotosSelecionadas.length){
        return;
    }

    [fotosSelecionadas[index], fotosSelecionadas[novoIndex]] =
    [fotosSelecionadas[novoIndex], fotosSelecionadas[index]];

    renderizarPreviews();
}

function removerFoto(index){

    fotosSelecionadas.splice(index, 1);

    renderizarPreviews();
}