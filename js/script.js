let nomeUsuario = prompt("Digite o nome do seu usuario");
let visibilidadeSelecionada = "Público";
let contatoSelecionado = "Todos";
let flagInterval = 0;
let indiceUltimaMensagem = 0;
let usuarioLogado;

function realizarLogin(nome){
    const objeto = {name: nome};
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", objeto);
    promise.then(loginSucesso);
    promise.catch(loginFalha);

    usuarioLogado = setInterval(manterUsuarioLogado, 5000, objeto);
    setInterval(buscarContatos, 10000);
}

function loginSucesso(callback){
    // console.log(callback);
    setInterval(buscarMensagens, 3000);
    // flagInterval = setInterval(buscarMensagens, 3000);
}

function loginFalha(callback){
    alert("o usuario inserido já está na sala! Digite Novamente!");
    nomeUsuario = prompt("Digite o nome do seu usuario");
    realizarLogin(nomeUsuario);
}

function manterUsuarioLogado(nome){
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/status", nome);
}

function buscarMensagens(){

    limparMensagens();

    // ir para a ultima mensagem
    const scrollMensagem = document.querySelector(".mensagens:last-child");
    if(scrollMensagem != null){
        scrollMensagem.scrollIntoView();
    }

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
        if(mensagemData.to == nomeUsuario){
            mensagem = `<div data-test="message" class="mensagem message private">
                <p><span>(${horario})</span>  <span>${nome}</span> reservadamente para <span>${mensagemData.to}</span>: ${texto} </p>
                </div>`;

            mensagensHTML.innerHTML = mensagensHTML.innerHTML + mensagem;
        }
    }

    indiceUltimaMensagem = indice;

}

function buscarContatos(){
    const promiseParticipantes = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");

    promiseParticipantes.then(exibirContatos);
}

function exibirContatos(callback){
    const contatos = callback.data;
    let mensagem;
    let contato;
    for(let i = 0; i < contatos.length; i++ ){
        contato = contatos[i].name;
        mensagem = `<div class="contato">
        <div class="online">
            <ion-icon class="icone-contato" name="person-circle-outline"></ion-icon>
            <div onclick="selecionarContato(this)">${contato}</div>
        </div>
            <ion-icon class="check" name="checkmark-outline"></ion-icon>
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
}
function fecharSidebar(){
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.add("escondido");
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
}

function enviandoPara(){
    const caixaMensagem = document.querySelector(".foot-bar p");
    caixaMensagem.innerHTML = "Enviando para " + contatoSelecionado;
}

function tratarErroEnvioMsg(callback){
    clearInterval(usuarioLogado);
    window.location.reload();
}

function limparMensagens(){
    const mensagens = document.querySelector(".mensagens");
    mensagens.innerHTML = "";

    const inputMsg = document.querySelector("input");
    inputMsg.value = "";
}

realizarLogin(nomeUsuario);
buscarMensagens();
buscarContatos();