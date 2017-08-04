var redirect_to_local;

/*
Эта функция добавляет к текущему домену третьим уровнем  домен ```l``` 
*/

function l_hostname()
{
    var l_hostname =  window.location.hostname.split(".");
    l_hostname.splice(-2,0,"l");
    return l_hostname.join(".");
}

/*
Эта функция создаёт новый элемент script и с адресом скрипта, который должен загрузиться через локальный шлюз пользователя.

Также она создаёт функцию, которая будет вызвана этим скриптом в случае удачной загрузки.

В случае неудачи выполнится функция из переменной onerror, которая присваивается соответствующему полю элемента script.
*/

function add_redirect_script(prtocol, port, use_ip, onerror){
    var script = document.createElement("script");
    script.onerror = onerror;
    script.setAttribute("integrity", "sha384-dActyNwOxNY9fpUWleNW9Nuy3Suv8Dx3F2Tbj1QTZWUslB1h23+xUPillTDxprx7");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("defer", "");
    script.setAttribute("async", "");
    if ( use_ip )
        script.setAttribute("src", prtocol+"//127.0.0.1:"+port+"/ipns/"+window.location.hostname+"/redirect_call.js");
    else
        script.setAttribute("src", prtocol+"//"+l_hostname()+":"+port+"/redirect_call.js");

    redirect_to_local = function()
    {
        var a = document.createElement("a");
        a.href = window.location;
        a.protocol = prtocol;
        a.port = port;
        if ( use_ip ){
            a.pathname = "/ipns/" + a.hostname + a.pathname;
            a.hostname = "127.0.0.1";
        }else{
            var hostname = a.hostname.split(".");
            hostname.splice(-2,0,"l");
            a.hostname = hostname.join(".");
        }
        window.location = a.href;
    };
    document.head.appendChild(script);
}

/*
Это главная функция, которая запускается сразу. Она проверяет, не находимся ли мы уже по адресу шлюза. Если нет, то начинает проверять его доступность, перебирая варианты адресов и протоколов.
*/
!function(location){
    if ( location.protocol.indexOf("http") == 0 &&
         location.hostname.length          >  0 &&
         location.hostname.indexOf("l.")   != 0 &&
         location.hostname.indexOf(".l.")  <  0 &&
         location.hostname                 != "127.0.0.1" ) 
    {   
        add_redirect_script( "http:",  8080, false,
         function(){
            add_redirect_script( "https:", 8443, false,
             function(){
                add_redirect_script( "http:", 8080, true, 
                 function(){
                    add_redirect_script( "https:", 8443, true );
                 } );
             } );
         } );
    }
}(window.location)