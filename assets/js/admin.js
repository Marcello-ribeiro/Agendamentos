const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";


// SUPABASE

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// FORMULÁRIO

const formAgenda = document.getElementById("formAgenda");


formAgenda.addEventListener("submit", async (e) => {

    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const whatsapp = document.getElementById("whatsapp").value;
    const tipo = document.getElementById("tipo").value;
    const dia = document.getElementById("dia").value;
    const hora = document.getElementById("hora").value;
    const local = document.getElementById("local").value;
    const obs = document.getElementById("obs").value;


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

        alert("Erro ao enviar agendamento.");

        console.log(error);

        return;
    }


    alert("Agendamento enviado com sucesso!");

    formAgenda.reset();

});