$( document ).ready(function() {
// body load
    if ( $(location).attr('pathname') == "/about" ) {
    $( "#body-load" ).load( "/about.html" );
    }
    else if ( $(location).attr('pathname') == "/login" ) {
    $( "#body-load" ).load( "/login.html" );
    }
    else if ( $(location).attr('pathname') == "/register" ) {
    $( "#body-load" ).load( "/register.html" );
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
$( document ).on( 'click', '#Login', function () {
  $("#LoginError").hide();
  if( $('#email').val() && $('#password').val() ) {
    var email=$("#email").val();
    var password=$("#password").val();
    $.post("/login",{email: email,password: password}, function(data){
      if ( data == "Logged" ) {
        $(location).attr('href', '/');
      }
      else {
        $("#LoginError").text(data +"!");
        $("#LoginError").show();
      }
    });
  }
});

$( document ).on( 'click', '#LoginCreateAccount', function () {
$(location).attr('href', '/register');
});

// register
$( document ).on( 'click', '#Register', function () {
  $("#RegisterError").hide();
  if( $('#Register_username').val() && $('#Register_email').val() && $('#Register_password').val() && $('#Register_passwordcheck').val() ) {
    var username=$("#Register_username").val(), email=$("#Register_email").val(), password=$("#Register_password").val(), passwordcheck=$("#Register_passwordcheck").val();
    $.post("/register",{username: username,email: email,password: password, passwordcheck: passwordcheck}, function(data){
    if(data === "Registered") {
    alert(data);
    } else {
    $("#RegisterError").text(data +"!");
    $("#RegisterError").show();
    }
    });
  }
});


});
