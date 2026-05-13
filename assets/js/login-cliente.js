const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const email = document.querySelector("#email");
const senha = document.querySelector("#senha");

const entrar = document.querySelector("#entrar");
const criarConta = document.querySelector("#criarConta");

const msg = document.querySelector("#msg");


entrar.addEventListener("click", async () => {

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email.value,
        password: senha.value
    });

    if(error){
        msg.innerText = "E-mail ou senha inválidos.";
        return;
    }

    msg.innerText = "Login realizado com sucesso.";

    setTimeout(() => {

        localStorage.setItem(
            "continuarSemLogin",
            "sim"
        );

        window.location.href = "../../index.html";

    }, 800);
});


criarConta.addEventListener("click", async () => {

    const { error } = await supabaseClient.auth.signUp({
        email: email.value,
        password: senha.value
    });

    if(error){
        msg.innerText = error.message;
        return;
    }

    msg.innerText =
    "Conta criada com sucesso. Agora é só apertar em Entrar.";
});