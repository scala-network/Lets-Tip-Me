$( document ).ready(function() {
  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
  };
  var activation_success = getUrlParameter('activation');
  // body load
  if ( $(location).attr('pathname') == "/about" ) {
    $( "#body-load" ).load( "/about.html" );
  }
  else if ( $(location).attr('pathname') == "/login" ) {
    $( "#body-load" ).load( "/login.html" );
    if (activation_success){
      setTimeout(
        function()
        {
          $("#ActivatedAccount").text("Account successfully activated! Please Login.");
          $("#ActivatedAccount").show();
        }, 100);
      }
    }
    else if ( $(location).attr('pathname') == "/" ) {
      $( "#body-load" ).load( "/funding_index.html" );
      $.get( "/categories", function( data ) {
        $.each(data, function (index, value) {
          $("#funding_goals_index").append("<div class=\"col-md-12\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h5 class=\"text-center\">"+value.categorie+"</h5></h4><hr class=\"mb-4\"></div>");
          });
      });
    }
    else if ( $(location).attr('pathname') == "/register" ) {
      $( "#body-load" ).load( "/register.html" );
    }
    else if ( $(location).attr('pathname') == "/activate" ) {
      $( "#body-load" ).load( "/activate.html" );
    }
    else if ( $(location).attr('pathname') == "/settings" ) {
      $( "#body-load" ).load( "/settings.html" );
    }
    $.get( "/logged", function( data ) {
      if ( data != "false" ) {
        $("#menuloginlink").hide();
        $("#menulogoutlink").show();
        $("#menu_username").text(data.user_username);
        $("#menuuserlink").show();
        $("#menusettingslink").show();
      }
      else {
        $("#menuloginlink").show();
        $("#menulogoutlink").hide();
        $("#menuuserlink").hide();
        $("#menusettingslink").hide();
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
    $( document ).on( 'focusout', '#Register_username', function () {
      if( $(this).val().length != 0 ) {
        $("#RegisterError").hide();
        $.post("/check_username",{username: $(this).val()}, function(data){
          if(data != "Available") {
            $("#RegisterError").text(data +"!");
            $( "#RegisterError" ).show();
          }
        });
      }
    });

    $( document ).on( 'focusout', '#Register_email', function () {
      if( $(this).val().length != 0 ) {
        $("#RegisterError").hide();
        $.post("/check_email",{email: $(this).val()}, function(data){
          if(data != "Available") {
            $("#RegisterError").text(data +"!");
            $("#RegisterError").show();
          }
        });
      }
    });

    $( document ).on( 'click', '#Register', function () {
      $("#RegisterError").hide();
      if( $('#Register_username').val() && $('#Register_email').val() && $('#Register_password').val() && $('#Register_passwordcheck').val() ) {
        var username=$("#Register_username").val(), email=$("#Register_email").val(), password=$("#Register_password").val(), passwordcheck=$("#Register_passwordcheck").val();
        $.post("/register",{username: username,email: email,password: password, passwordcheck: passwordcheck}, function(data){
          if(data === "Registered") {
            $(location).attr('href', '/activate');
          } else {
            $("#RegisterError").text(data +"!");
            $("#RegisterError").show();
          }
        });
      }
    });

    //activate
    $( document ).on( 'click', '#Activate', function () {
      $("#ActivationError").hide();
      if($('#activation_code').val()) {
        var activation_code=$("#activation_code").val();
        $.post("/activate",{activation_code: activation_code}, function(data){
          if ( data == "Activated" ) {
            $(location).attr('href', '/login?activation=success');
          }
          else {
            $("#ActivationError").text(data +"!");
            $("#ActivationError").show();
          }
        });
      }
    });


  });
