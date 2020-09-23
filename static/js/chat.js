navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(async (stream) => {
    var peer = new Peer({
        initiator: location.hash === "#init",
        trickle: false
    });
    let connection;
    criarMeuVideo(stream)
    
    document.querySelector("#botaoEnviarMensagem").addEventListener("click", enviarMensagem)
    document.querySelector("#botaoConectar").addEventListener("click", conectar)

    peer.on('call', (call) => {
        call.on("stream", streamDoOutro => {
            criarVideoDoOutro(streamDoOutro);
        })
        call.answer(stream);
    });

    peer.on("open", id => {
        document.querySelector("#idDoChat").innerHTML = id
    })

    peer.on("connection", conn => {
        console.log("Conexão recebida")
        connection = conn;
        document.querySelector("#infoDeConexao").innerHTML = `<strong>Conectado com ${conn.peer}!</strong>`
        document.querySelector("#infoDeConexao").style.display = "block"

        conn.on('data', function(data) {
            logarNoChat(data, "Outra pessoa")
        });
    })

    async function conectar() {
        const id = document.querySelector("#idParaConectar").value
        connection = await peer.connect(id);

        connection.on("open", () => {
            document.querySelector("#infoDeConexao").innerHTML = `<strong>Conectado com ${id}!</strong>`
            document.querySelector("#infoDeConexao").style.display = "block"
            connection.on('data', mensagem => {
                logarNoChat(mensagem, "Outra pessoa")
            });
        })

        
        var call = await peer.call(id, stream);

        call.on("stream", streamDoOutro => {
            criarVideoDoOutro(streamDoOutro);
        })
    }

    function enviarMensagem() {
        const mensagem = document.querySelector("#mensagem").value;
        connection.send(mensagem)
        logarNoChat(mensagem, "Eu")
    }

    function logarNoChat(mensagem, pessoa) {
        const novoSpan = document.createElement("span");
        novoSpan.innerHTML = `
            <h3>${pessoa}</h3>
            ${mensagem}
            <br>
            <br>
        `;
        document.querySelector("#logDoChat").appendChild(novoSpan)
    }

    function criarMeuVideo(stream) {
        const video = document.querySelector("#meuVideo")
        video.srcObject = stream;
        video.play();
    }

    function criarVideoDoOutro(streamDoOutro) {
        console.log(streamDoOutro)
        const divDoVideo = document.querySelector("#outroVideo")
        const outroVideo = document.createElement("video")
        divDoVideo.appendChild(outroVideo)
        outroVideo.srcObject = streamDoOutro;
        outroVideo.play();
        console.log(outroVideo)
    }

}).catch(erro => console.error(erro))
