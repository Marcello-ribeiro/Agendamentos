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

        document
            .querySelector("#toast-overlay")
            .classList
            .remove("ativo");

    });

}

/* =========================
   LOGIN
========================= */

const formLogin = document.querySelector("#formLogin");

if(formLogin){

    formLogin.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.querySelector("#email").value.trim();

        const senha =
            document.querySelector("#senha").value;

        try{

            const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password: senha
            });

            if(error){

                console.log(error);

                mostrarToast(
                    "E-mail ou senha incorretos."
                );

                return;
            }

            if(!data.user){

                mostrarToast(
                    "Não foi possível realizar o login."
                );

                return;
            }

            mostrarToast(
                "Login realizado com sucesso."
            );

            setTimeout(() => {

                window.location.href =
                    "admin.html";

            }, 1000);

        }
        catch(err){

            console.log(err);

            mostrarToast(
                "Erro ao conectar com o servidor."
            );

        }

    });

}

/* =========================
   SE JÁ ESTIVER LOGADO
========================= */

async function verificarSessaoLogin(){

    const { data } =
    await supabaseClient.auth.getSession();

    if(data.session){

        window.location.href =
            "admin.html";

    }

}

verificarSessaoLogin();