$( document ).ready(function() {
// body load
    if ( $(location).attr('pathname') == "/about" ) {
    $( "#body-load" ).load( "/about.html" );
    }
    else if ( $(location).attr('pathname') == "/login" ) {
    $( "#body-load" ).load( "/login.html" );
    }
    $.get( "/logged", function( data ) {
      if ( data != "false" ) {
        $("#menuloginlink").hide();
        $("#menulogoutlink").show();
        $("#menu_username").text(data.user_username);
        $("#menuuserlink").show();
      }
      else {
        $("#menuloginlink").show();
        $("#menulogoutlink").hide();
        $("#menuuserlink").hide();
      }
    });
// login
var email,password;
$( document ).on( 'click', '#Login', function () {
  email=$("#email").val();
  password=$("#password").val();
  $.post("/login",{email: email,password: password}, function(data){
    if ( data == "Logged" ) {
        $(location).attr('href', '/');
    }
  });
     });
});
