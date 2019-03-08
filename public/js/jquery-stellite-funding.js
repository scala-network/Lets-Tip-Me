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


  //body interactions
  $( document ).on( 'mouseover', '.goal_link', function () {
    $(this).css('cursor','pointer');
    $(this).css('background-color','#151b29');
  });
  $( document ).on( 'mouseout', '.goal_link', function () {
    $(this).css('background-color','#11141b');
  });
  $( document ).on( 'click', '.goal_link', function () {
    $(location).attr('href', $(this).attr('goallink'));
  });
  // body load
  if ( $(location).attr('pathname') == "/about" ) {
    $( "#body-load" ).load( "/about.html" );
  }
  else if ( $(location).attr('pathname') == "/login" ) {
    $( "#body-load" ).load( "/login.html", function() {
      if (activation_success){
        $("#ActivatedAccount").text("Account successfully activated! Please Login.");
        $("#ActivatedAccount").show();
      }
    });
  }
  else if ( $(location).attr('pathname') == "/" ) {
    $( "#body-load" ).load( "/goals_index.html", function() {
      // Get categories on load
      $.get( "/categories", function( data ) {
        $.each(data, function (index, value) {
          $("#funding_goals_index").append("<div class=\"col-md-12\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h5 class=\"text-center\">"+value.categorie+"</h5></h4><hr class=\"mb-4\"><ul class=\"list-group\" id=\"funding_goals_index_content"+value._id+"\"></ul>");

          // Get goals on load
          $.post("/goals",{"_id": value._id}, function(data){
            $.each(data, function (i, value) {

              if(value.unlimited=="true"){
                $("#funding_goals_index_content"+value.categorie).append("<li class=\"list-group-item justify-content-between list-group-item-stellite text-left goal_link\" goallink=\"/goal/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"stellite-main-color-text\"><span class=\"text-white\">"+value.amount+" XTL / Unlimited</span><div class=\"progress\"><div class=\"progress-bar progress-bar-striped progress-bar-animated bg-success\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"></div></div></div></li>");
              } else {
                const percentage = Math.round((value.amount*100)/value.goal);
                var progress_bar_bg_color;
                if(percentage<30){
                  progress_bar_bg_color="bg-danger";
                } else if((percentage>30)&&(percentage<70)){
                  progress_bar_bg_color="bg-warning";
                } else if(percentage>70){
                  progress_bar_bg_color="bg-success";
                }
                $("#funding_goals_index_content"+value.categorie).append("<li class=\"list-group-item justify-content-between list-group-item-stellite text-left goal_link\" goallink=\"/goal/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"stellite-main-color-text\"><span class=\"text-white\">"+value.amount+" XTL / "+value.goal+" XTL ("+percentage+"%)</span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></div></li>");
              }

            });
          });


          $("#funding_goals_index").append("</div>");
        });
      });
    });
  }
  else if ( $(location).attr('pathname').includes("/goal/")) {
    $( "#body-load" ).load( "/goal.html", function() {
      $.post("/goal",{_id: escape($(location).attr('pathname').replace("/goal/", ""))}, function(data){
        if(data === "Goal not found"){
          alert("Goal not found");
        } else if(data === "Bad ID")  {
          alert("Bad ID");
        } else {
          var value = data[0];
          $("#funding_goal").append("<div class=\"col-md-12\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h5 class=\"text-center\">"+value.title+"</h5></h4><hr class=\"mb-4\">");
          $("#funding_goal").append("</div>");
        }
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
