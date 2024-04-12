var fs=require("fs");
var http=require('http');
var net=require('net')
var HTTP_PORT=8000;
var TCP_PORT=9000;
var TIMEOUT = 30*1000;
var tcpClient=null;

//建立HTTP
var httpServer=http.createServer((request,response)=>{
    console.log(request.method+':'+request.url);
    switch(request.url){
        case "/":
            response.end(fs.readFileSync('./index.html'));
            break;
        case "/open":
            openLed()
            response.end('succeed');
            break;
        case "/close":
            closeLed()
            response.end('succeed');
            break;
        case "/data":
            var data=getData()||"无数据";
            var id1=getId1()||"无数据";
            var addr = "无连接";
           if(tcpClient && tcpClient.addr){
            addr = tcpClient.addr
            }

            var result = JSON.stringify({id1:id1,addr:addr,data:data});
            response.end(result);
            break;
           default:
            response.writeHead(400);
            response.end();
            break;
    }
});
httpServer.listen(HTTP_PORT);
httpServer.on('error', onError);
//httpServer.on('listening', onListening);

//建立tcp
var tcpServer=net.createServer((socket)=>{
    var addr=socket.remoteAddress+':'+socket.remotePort
    console.log(addr,"connect",socket)
    socket.addr=addr
    tcpClient=socket

    socket.on("data",data=>{
        var str = addr+" --> " + data.toString('ascii') + '\n'
        console.log(str)
        if(!socket.lastValue)
        {
            socket.id1=data.toString('ascii');
        }
        socket.lastValue=data.toString('ascii');
        
    })
    socket.on('close',()=>{
        console.log(addr,"close")
        tcpClient=null;
    })
    socket.on('error',(err)=>{
        console.log("error",err)
        tcpClient=null;
    })
    socket.setTimeout(TIMEOUT);

    socket.on('timeout',()=>{
        console.log(socket.id1,socket.addr,'socket timeout');
        socket.end();
        tcpClient=null;
    });
})


tcpServer.on("error",(err)=>{
    console.log(err)
    tcpClient = null;
  })

  tcpServer.listen({port: TCP_PORT,host: '0.0.0.0'}, () => {
    console.log('demo0.1 tcp server running on', tcpServer.address())
  })


//函数
function openLed(){
    if(tcpClient)
    {
        tcpClient.write('1', 'ascii')
    }
    else
    {
        console.log("openLed error:not tcpClient.")
    }
}
function closeLed(){
    if(tcpClient){
        tcpClient.write('0', 'ascii')
    }
    else{
        console.log("closeLed error:not tcpClient.")
    }
}
function getData(){
    if(tcpClient){
        return tcpClient.lastValue
    }
    else{
        console.log("getData error:not tcpClient.")
    }
}
function onError(error)
{
    if (error.syscall !== 'listen') {
        throw error;
      }
      console.error(error)
}
function getId1(){
    if(tcpClient){
        return tcpClient.id1
    }
    else{
        console.log("getId1 error:not tcpClient.")
    }
}

