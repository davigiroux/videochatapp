const parametros = {
    video: true, 
    audio: true
}

navigator.mediaDevices.getUserMedia(parametros).then(async (stream) => {
    const deveMostrarCampoParaConectar = location.hash === "#init";
    var peer = new Peer({
        initiator: deveMostrarCampoParaConectar,
        trickle: false
    });
    let connection;
    criarMeuVideo(stream)

    document.querySelector("#campoParaConectar").style.display = deveMostrarCampoParaConectar ? "block" : "none";
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
        
        document.querySelector("#mensagem").value = "";
    }

    function logarNoChat(mensagem, pessoa) {
        const novoSpan = document.createElement("span");
        novoSpan.innerHTML = `
            <strong>${pessoa}: </strong>
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
        video.muted = true;
    }

    function criarVideoDoOutro(streamDoOutro) {

        if(document.querySelector("#videoDaOutraPessoa")) return;

        const divDoVideo = document.querySelector("#outroVideo")
        const outroVideo = document.createElement("video")
        outroVideo.setAttribute("id", "videoDaOutraPessoa")
        outroVideo.setAttribute("width", "320")
        outroVideo.setAttribute("height", "240")
        divDoVideo.appendChild(outroVideo)
        outroVideo.srcObject = streamDoOutro;
        outroVideo.play();
    }

    document.querySelector("#muteVideo").addEventListener("change", e => {
        stream.getAudioTracks()[0].enabled = !e.target.checked;
    })

    document.body.addEventListener('keyup', function (e) {
        if (e.keyCode == 13) {
          // Simulate clicking on the submit button.
          enviarMensagem()
        }
      });
      

}).catch(erro => console.error(erro))
