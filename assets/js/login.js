const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const loginForm = document.getElementById("loginForm");


loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;

    const senha = document.getElementById("senha").value;


    const { error } = await supabaseClient.auth.signInWithPassword({

        email: email,
        password: senha

    });


    if(error){

        alert("E-mail ou senha inválidos.");

        console.log(error);

        return;
    }


    window.location.href = "admin.html";

});