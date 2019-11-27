//declarção de constanates
  //chama a xapi
  const xapi = require('xapi');
  //declara os caminhos basicos de requisição de API
  const wxAPIs = {
    //caminho de espaços
      'space': 'https://api.ciscospark.com/v1/rooms',
      //caminho de mensagens
      'message': 'https://api.ciscospark.com/v1/messages'
  };
  //declara o token de acesso ao bot
  const accesstoken = 'put the access token here';
  //criação da funcão principal
  function Main() {
  //declara o order dentro do contexto de contador
    let order = [{
                      "tipo": "agua",
                      "quantidade": 0
                  },
                  {
                      "tipo": "espresso",
                      "quantidade": 0
                  },
                  {
                      "tipo": "capu",
                      "quantidade": 0
                  },
                  {
                      "tipo": "chá",
                      "quantidade": 0
                  }
              ];
      //função de checagem de quando algum evento de widget acontece dentro no endpoint
    xapi.event.on('UserInterface Extensions Widget Action', (event) => {
              //switch/case para o evento , checando o nome do botão clicado, e enviando as variaveis corretas para a fução de atualizar order
              switch (event.WidgetId) {
              case "water":
                order[0] = atualizarPedido(event, order[0]);
                break;
              case "espress":
                order[1] = atualizarPedido(event, order[1]);
                break;
              case "capu":
                order[2] = atualizarPedido(event, order[2]);
                break;
              case "tea":
                order[3] = atualizarPedido(event, order[3]);
                break;
              //caso o botão clicado for pedir, ele cria a mensagem de order e envia ao webex teams.
              case "pedir":
                if (event.Type == 'clicked') {
                  //criação da mensagem
                let mensagem =
                order[0].quantidade + ' ' + order[0].tipo + ", " +
                order[1].quantidade + ' ' + order[1].tipo + ', ' +
                order[2].quantidade + ' ' + order[2].tipo + ' e ' +
                order[3].quantidade + ' ' + order[3].tipo + '.';
                  //chama a função de enviar a mensagem, e cria a interface gráfica com a parte de confirmação do envio 
                sendWebexTeams(wxAPIs.message, 'Post', "Y2lzY29zcGFyazovL3VzL1JPT00vNDg5Yzk0OTAtMDU4Mi0xMWVhLWIzZjgtMjE2ODFjMjM5NDMx", mensagem, order);
                //zera o order e guarda na variavel "order"
                order=zerarVar(order);
               }
              break;
            }
          });
      //função de validção de quando algum evento de painel acontece dentro no endpoint
    xapi.event.on('UserInterface Extensions Panel Clicked', (event) => {
            if (event.PanelId == 'panel_3' && event.Type == 'closed')
            //zera o order e guarda na variavel
            order=zerarVar(order);
          });
  }
  //criação da função de enviar mensagem ao webex teams
  function sendWebexTeams(url, method, email, message, order) {
    //é importante cercar o comando por um try catch para não crashar os macros
      try {
        //comando de requisição http
          xapi.command('HttpClient ' + method, {
                      Header: ["Content-Type: application/json", "Authorization: Bearer " + accesstoken],
                      Url: url,
                      AllowInsecureHTTPS: 'True'
                  },
                  JSON.stringify({
                      "roomId": email,
                      "text": "O pedido é de " + message
                  })
              )
              .then((result) => {
                  console.log(message);
              //cria a interface gráfica de confirmação de envio
               xapi.command('UserInterface Message Prompt Display', {
                  Title: 'Pedido enviado!',
                  Text: "O seu order é de " + message
                });
                  //zera e retorna o order zerado
                  return zerarVar(order);
              })
              .catch((err) => {
                //exie o mesmo erro na parte visual
                  xapi.command('UserInterface Message Prompt Display', {
                  Title: 'Erro:',
                  Text: err.data.StatusCode
                });
              });
      } catch (exception) {
          console.log("Erro ao enviar a mensagem");
      }
  }
  //criação d funcção de atualizar order, tanto na parte visual quanto na parte lógica
  function atualizarPedido(event, order) {
      if (event.WidgetId == event.WidgetId && event.Value == 'increment' && event.Type == 'clicked') {
          order.quantidade++;
          xapi.command("UserInterface Extensions Widget SetValue", {
              WidgetId: event.WidgetId,
              value: order.quantidade
          });
      } else if (event.WidgetId == event.WidgetId && event.Value == 'decrement' && event.Type == 'clicked') {
          order.quantidade--;
          xapi.command("UserInterface Extensions Widget SetValue", {
              WidgetId: event.WidgetId,
              value: order.quantidade
          });
      }
      return order;
  }
  //criação de função de zerar order, tanto na parte visual quanto na parte lógica
  function zerarVar(order) {
      let pedidoZerar = ['water', 'express', 'capu', 'tea'];
      
      for (let i = 0; i < pedidoZerar.length; i++) {
        order[i].quantidade=0;
          xapi.command("UserInterface Extensions Widget SetValue", {
              WidgetId: pedidoZerar[i],
              value: '0'
          });
      }
      return order;
  }
  
  //chama a função principal
  Main();
  