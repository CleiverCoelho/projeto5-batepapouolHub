let nomeUsuario;
let visibilidadeSelecionada = "Público";
let contatoSelecionado = "Todos";
let flagInterval = 0;
let indiceUltimaMensagem = 0;
let usuarioLogado;

const exibirEntrada = document.querySelector(".tela-de-entrada");
exibirEntrada.classList.remove("entrada");


// enviar mensagem com o enter
document.addEventListener("keypress", function(e) {
    if(e.key == "Enter"){
        enviarMensagem();
    }
})

function realizarLogin(){

    const inputLogin = document.querySelector(".login input");
    nomeUsuario = inputLogin.value;

    const objeto = {name: nomeUsuario};
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", objeto);
    promise.then(loginSucesso);
    promise.catch(loginFalha);

    usuarioLogado = setInterval(manterUsuarioLogado, 5000, objeto);
    setInterval(buscarContatos, 10000);
}

function loginSucesso(callback){

    exibirEntrada.classList.add("entrada");

    const fecharTelaEntrada = document.querySelector(".tela-de-entrada");
    fecharTelaEntrada.classList.add("escondido");

    const upBar = document.querySelector(".up-bar");
    upBar.classList.remove("escondido");

    const footBar = document.querySelector(".foot-bar");
    footBar.classList.remove("escondido");

    const objeto = {name: nomeUsuario};
    buscarMensagens();
    buscarContatos();
    // console.log(callback);
    setInterval(manterUsuarioLogado, 5000, objeto);
    // setInterval(buscarContatos, 10000);
    // setInterval(buscarMensagens, 3000);
    // flagInterval = setInterval(buscarMensagens, 3000);

    // Remover a tela de entrada do html 
    const telaEntrada = document.querySelector(".tela-de-entrada");
    telaEntrada.remove();
}

function loginFalha(callback){
    alert("o usuario inserido já está na sala! Digite Novamente!");
    window.location.reload();
}

function manterUsuarioLogado(nome){
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", nome);
}

function buscarMensagens(){

    limparMensagens();


    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");

    promise.then(exibirMensagens);
    promise.catch(buscarMensagensFalhou);

}

function exibirMensagens(callback){
    const mensagensHTML = document.querySelector(".mensagens");
    const listaMensagens = callback.data;

    for(let i = 0; i < listaMensagens.length; i++){
        let mensagemData = listaMensagens[i];

        let horario = mensagemData.time;
        let nome = mensagemData.from;
        let texto = mensagemData.text;
        let tipoMensagem = mensagemData.type;

        adicionaMensagemNoHTML(tipoMensagem, horario, nome, texto, mensagensHTML, i, mensagemData);
    }

    // ir para a ultima mensagem
    const scrollMensagem = document.querySelector(".feed .mensagens ");
    const scroll = scrollMensagem.lastElementChild;
    console.log(scrollMensagem);
    if(scroll != null){
        scroll.scrollIntoView();
    }
}

function buscarMensagensFalhou(){
    console.log("Buscar mensagens falhou............");
}

function adicionaMensagemNoHTML(type, horario, nome, texto, mensagensHTML, indice, mensagemData){
    let mensagem = "";    
    if(type == "status"){
        mensagem = `<div data-test="message" class="mensagem status">
        <p><span>(${horario})</span> <span>${nome}</span> ${texto}</p>
    </div>`;
    
        mensagensHTML.innerHTML = mensagensHTML.innerHTML + mensagem;

    }else if(type == "message"){
        mensagem = `<div data-test="message" class="mensagem message">
        <p><span>(${horario})</span>  <span>${nome}</span> para <span>${mensagemData.to}</span>: ${texto} </p>
    </div>`;
        mensagensHTML.innerHTML = mensagensHTML.innerHTML + mensagem;
    }else if(type == "private_message"){
        if(mensagemData.to == nomeUsuario || nome == nomeUsuario){
            mensagem = `<div data-test="message" class="mensagem private">
                <p><span>(${horario})</span>  <span>${nome}</span> reservadamente para <span>${mensagemData.to}</span>: ${texto} </p>
                </div>`;

            mensagensHTML.innerHTML = mensagensHTML.innerHTML + mensagem;
        }
    }

    indiceUltimaMensagem = indice;

}

function buscarContatos(){
    const promiseParticipantes = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");

    limparContatos();
    promiseParticipantes.then(exibirContatos);
}

function exibirContatos(callback){
    const contatos = callback.data;
    let mensagem;
    let contato;
    for(let i = 0; i < contatos.length; i++ ){
        contato = contatos[i].name;
        mensagem = `<div data-test="participant" class="contato">
        <div class="online">
            <ion-icon class="icone-contato" name="person-circle-outline"></ion-icon>
            <div onclick="selecionarContato(this)">${contato}</div>
        </div>
            <ion-icon data-test="check" class="check" name="checkmark-outline"></ion-icon>
        </div>`;

        adicionaContatoNoHTML(mensagem);
    }
}

function buscarContatosFalhou(callback){
    console.log("Buscar contatos falhou");
    console.log("ERRO: ");
    console.log(callback);
}

function adicionaContatoNoHTML(html){
    const contatos = document.querySelector(".contatos");
    contatos.innerHTML = contatos.innerHTML + html;
}

function abrirSidebar(){
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.remove("escondido");

    const overlay = document.querySelector(".overlay");
    overlay.classList.remove("escondido");
}

function fecharSidebar(){
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.add("escondido");

    const overlay = document.querySelector(".overlay");
    overlay.classList.add("escondido");
}

function selecionarContato(contato){

    const contatoAnterior = document.querySelector(".contatos .selecionado");
    if(contatoAnterior != null){
        contatoAnterior.classList.remove("selecionado");
    }

    contato.parentNode.parentNode.classList.add("selecionado");
    contatoSelecionado = contato.innerHTML;

    enviandoPara();

}

function selecionarVisibilidade(visibilidade){

    const visibilidadeAnterior = document.querySelector(".visibilidades .selecionado");
    if(visibilidadeAnterior != null){
        visibilidadeAnterior.classList.remove("selecionado");
    }

    visibilidade.parentNode.parentNode.classList.add("selecionado");
    visibilidadeSelecionada = visibilidade.innerHTML;
}

function enviarMensagem(){    

    let typeMsg;
    if(visibilidadeSelecionada == "Público"){
        typeMsg = "message";
    }else{
        typeMsg = "private_message";
    }

    let mensagemInput = document.querySelector("input").value;
   
    const objMsg = {
        from: nomeUsuario,
        to: contatoSelecionado,
        text: mensagemInput,
        type: typeMsg // ou "private_message" para o bônus
    }
    const promiseMsg = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", objMsg);
    
    // caso a mensagem tenha sido enviada com sucesso para a API
    
    promiseMsg.then(buscarMensagens);
    promiseMsg.catch(tratarErroEnvioMsg);


    // Limpar input de mensagem
    const inputMsg = document.querySelector("input");
    inputMsg.value = "";
}

function enviandoPara(){
    const caixaMensagem = document.querySelector(".foot-bar p");
    if(contatoSelecionado == "Público"){
        caixaMensagem.innerHTML = "Enviando para " + contatoSelecionado;
    }else{
        caixaMensagem.innerHTML = "Enviando para " + contatoSelecionado + " (reservadamente)";
    }
}

function tratarErroEnvioMsg(callback){
    clearInterval(usuarioLogado);
    window.location.reload();
}

function limparMensagens(){
    const mensagens = document.querySelector(".mensagens");
    mensagens.innerHTML = "";
}

function limparContatos(){
    const contatos = document.querySelector(".contatos");
    const contatoTodos = `<div data-test="all" class="contato todos selecionado">
            <div class="online">
            <ion-icon class="icone-contato" name="people-outline"></ion-icon>
            <div onclick="selecionarContato(this)">Todos</div>
            </div>
            <ion-icon data-test="check" class="check" name="checkmark-outline"></ion-icon>
            </div>`;
    contatos.innerHTML = contatoTodos;
}


// file:///home/cleiver/Documents/projeto5-batepapouolHub/index.html