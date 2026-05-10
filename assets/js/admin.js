const SUPABASE_URL = "https://tpuycopgfecvkpqfcucm.supabase.co";

const SUPABASE_KEY =
"sb_publishable_XYfs3Zf8t95r0DuedolX0g_vzi94n64";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


const lista = document.querySelector(".lista-agendamentos");


async function carregarAgendamentos(){

    const { data, error } = await supabaseClient
    .from("agendamentos")
    .select("*")
    .order("id", { ascending: false });


    if(error){

        console.log(error);

        return;
    }


    lista.innerHTML = "";


    data.forEach(item => {

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

                <p>
                    <strong>WhatsApp:</strong>
                    ${item.whatsapp}
                </p>

                <p>
                    <strong>Tipo:</strong>
                    ${item.tipo}
                </p>

                <p>
                    <strong>Local:</strong>
                    ${item.local || "Não informado"}
                </p>

                <p>
                    <strong>Obs:</strong>
                    ${item.obs || "Nenhuma"}
                </p>

            </div>

        </div>

        `;
    });

}


carregarAgendamentos();