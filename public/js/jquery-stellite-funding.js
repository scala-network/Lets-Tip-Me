$( document ).ready(function() {
// body load
    if ( $(location).attr('pathname') == "/about" ) {
    $( "#body-load" ).load( "/about.html" );
    }
    else if ( $(location).attr('pathname') == "/login" ) {
    $( "#body-load" ).load( "/login.html" );
    }
// login
var email,password;
$( document ).on( 'click', '#Login', function () {
  email=$("#email").val();
  password=$("#password").val();
  $.post("/login",{email: email,password: password}, function(data){
        alert(data);
  });
     });
});
