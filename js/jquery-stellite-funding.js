$( document ).ready(function() {
    $('.sidenav').sidenav();
    if ( $(location).attr('pathname') == "/about" ) {
    $( "#body-load" ).load( "/about.html" );
    }
});
