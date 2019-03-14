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

  function copyToClipboard(element) {
   var $temp = $("<input>");
   $("body").append($temp);
   $temp.val($(element).html()).select();
   document.execCommand("copy");
   $temp.remove();
  }

 var dateformat = function (timestamp) {
        var d = new Date(timestamp*1000);
        var month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        var m = month[d.getMonth()];
        return m+" "+d.getDate()+", "+d.getFullYear();
  }

  function ValidateAmount(inputText)
  {
    var amountformat = /^([0-9]+)$/;
    if(inputText.match(amountformat)&&inputText.length<12)
    {
      return true;
    }
    else
    {
      return false;
    }
  }

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

  ///copy address to donate to clipboard
  $( document ).on( 'mouseover', '.goal_donate_copy', function () {
    $(this).css('cursor','pointer');
    $(this).css('background-color','#151b29');
  });
  $( document ).on( 'mouseout', '.goal_donate_copy', function () {
    $(this).css('background-color','#11141b');
  });
  $( document ).on( 'click', '.goal_donate_copy', function () {
    copyToClipboard('#addr_to_copy');
    $('#confirm_addr_to_copy_user').removeClass("text-success");
    $('#confirm_addr_to_copy_user').html("<i class=\"far fa-copy\"></i> Copy to donate as " + $('#confirm_addr_to_copy_user').attr('username'));

    $('#confirm_addr_to_copy').addClass("text-success");
    $('#confirm_addr_to_copy').html("<i class=\"fas fa-clipboard-check\"></i> Copied to clipboard to donate!");
  });

  ///tx click to explorer
  $( document ).on( 'mouseover', '.tx_link', function () {
    $(this).css('cursor','pointer');
    $(this).css('background-color','#151b29');
  });
  $( document ).on( 'mouseout', '.tx_link', function () {
    $(this).css('background-color','#11141b');
  });
  $( document ).on( 'click', '.tx_link', function () {
    window.open($(this).attr('tx_link'), '_blank');
  });


  ///copy address to donate as user to clipboard
  $( document ).on( 'mouseover', '.goal_donate_copy_user', function () {
    $(this).css('cursor','pointer');
    $(this).css('background-color','#151b29');
  });
  $( document ).on( 'mouseout', '.goal_donate_copy_user', function () {
    $(this).css('background-color','#11141b');
  });
  $( document ).on( 'click', '.goal_donate_copy_user', function () {
    copyToClipboard('#addr_to_copy_user');
    $('#confirm_addr_to_copy').removeClass("text-success");
    $('#confirm_addr_to_copy').html("<i class=\"far fa-copy\"></i> Copy to donate");

    $('#confirm_addr_to_copy_user').addClass("text-success");
    $('#confirm_addr_to_copy_user').html("<i class=\"fas fa-clipboard-check\"></i> Copied to clipboard to donate as " + $('#confirm_addr_to_copy_user').attr('username')+"!");
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
          $("#funding_goals_index").append("<div class=\"col-md-12\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h4 class=\"text-center\">"+value.categorie+"</h4></h4><hr class=\"mb-4\"><ul class=\"list-group\" id=\"funding_goals_index_content"+value.categorie_id+"\"></ul>");

          // Get goals on load
          $.post("/goals",{"categorie_id": value.categorie_id}, function(data){
            $.each(data, function (i, value) {

              if(value.unlimited=="true"){
                $("#funding_goals_index_content"+value.categorie).append("<li class=\"list-group-item justify-content-between list-group-item-stellite text-left goal_link\" goallink=\"/goal/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"stellite-main-color-text\"><span class=\"text-white\"><small>"+value.amount+" XTL / Unlimited</small></span><div class=\"progress\"><div class=\"progress-bar bg-success\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"></div></div></div></li>");
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
                $("#funding_goals_index_content"+value.categorie).append("<li class=\"list-group-item justify-content-between list-group-item-stellite text-left goal_link\" goallink=\"/goal/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"stellite-main-color-text\"><span class=\"text-white\"><small>"+value.amount+" XTL / "+value.goal+" XTL ("+percentage+"%)</small></span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></div></li>");
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
          //goal progress
          $("#funding_goal").append("<div class=\"col-md-12 text-center\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h4 class=\"text-center\">"+value.title+"</h4></h4><hr class=\"mb-4\"><ul id=\"funding_goal_progress\" class=\"list-group\">");
          if(value.unlimited=="true"){
            $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-stellite stellite-lighter-background\"><span class=\"stellite-main-color-text\"><span class=\"text-white\"><small>"+value.amount+" XTL / Unlimited</small></span><div class=\"progress\"><div class=\"progress-bar bg-success\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"></div></div></li>");
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
            $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-stellite stellite-lighter-background\"><span class=\"stellite-main-color-text\"><span class=\"text-white\"><small>"+value.amount+" XTL / "+value.goal+" XTL ("+percentage+"%)</small></span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></li>");
          }
          //goal description
          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-stellite text-left\"><span class=\"text-white\"><p>"+value.description.replace(/\n/g, "<br>")+"</p></li>");
          //goal donations address
          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-stellite goal_donate_copy_user \" style=\"word-wrap:break-word;\"><span class=\"text-white\"><small><b id=\"addr_to_copy_user\">Se2K2QkvTcvCwd8cjsjK5YDxkrizwTSAFga8X8zBYuXdUiV46fHiQ5E5A43krzyxMvBtoM38HhcJM9QDa6sy6WAv1yd2gUem8</b></small><br><small id=\"confirm_addr_to_copy_user\" username=\"oxhak\"><i class=\"far fa-copy\"></i> Copy to donate as oxhak</small></li>");

          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-stellite goal_donate_copy\" style=\"word-wrap:break-word;\"><span class=\"text-white\"><small><b id=\"addr_to_copy\">Se3giBG4UnbV3PaTpT4ezJjdnDrAeDLHaeZS3Kqe6KPcZD6BfL8B9NLaXcyRMtwh332a97WD92enaDvPNigb4CwB1r5uchuHD</b></small><br><small id=\"confirm_addr_to_copy\"><i class=\"far fa-copy\"></i> Copy to donate</small></li>");

          //goal by
          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-stellite stellite-lighter-background\"><span class=\"text-white\"><small>Goal added by "+value.author+" · "+dateformat(value.creation_date)+"</small></li>");

          //goal progress end
          $("#funding_goal").append("</ul></div>");

          //transactions history
          $("#funding_goal").append("<div class=\"col-md-12\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h4 class=\"text-center\"><br>Transactions History</h4></h4><hr class=\"mb-4\"><ul id=\"funding_goal_transactions\" class=\"list-group\">");

          //transactions
          $("#funding_goal_transactions").append("<li class=\"list-group-item justify-content-between list-group-item-stellite tx_link\" style=\"word-wrap:break-word;\" tx_link=\"https://explorer.stellite.cash/tx/1d23778925306ce10f3a308af6bdd061c01bf2576259f7ee4791c2c786856d53\"><span class=\"text-white\"><small><span class=\"text-success\"><b>+12165.70 XTL</b></span> · TX <b>1d23778925306ce10f3a308af6bdd061c01bf2576259f7ee4791c2c786856d53</b> · 2019-03-11 10:29:45</small></li>");
          $("#funding_goal_transactions").append("<li class=\"list-group-item justify-content-between list-group-item-stellite tx_link\" style=\"word-wrap:break-word;\" tx_link=\"https://explorer.stellite.cash/tx/1d357b1baeb22ecf8be4554f84b794a2309c3473cbc40a80628ff23890e227fa\"><span class=\"text-white\"><small><span class=\"text-success\"><b>+12169.30 XTL</b></span> · TX <b>1d357b1baeb22ecf8be4554f84b794a2309c3473cbc40a80628ff23890e227fa</b> · 2019-03-11 10:20:19</small></li>");

          //transactions history end
          $("#funding_goal").append("</ul></div>");
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
  else if ( $(location).attr('pathname') == "/add" ) {
    $( "#body-load" ).load( "/add_goal.html" );
  }
  $.get( "/logged", function( data ) {
    if ( data != "false" ) {
      $("#menuloginlink").hide();
      $("#menulogoutlink").show();
      $("#menu_username").text(data.user_username);
      $("#menuuserlink").show();
      $("#menusettingslink").show();
      $("#menuuseraddgoallink").show();
    }
    else {
      $("#menuloginlink").show();
      $("#menulogoutlink").hide();
      $("#menuuserlink").hide();
      $("#menusettingslink").hide();
      $("#menuuseraddgoallink").hide();
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

  //add goal
  $( document ).on( 'click', '#AddGoal', function () {
    $("#AddGoalError").hide();
    if( $('#add_goal_title').val() && $('#add_goal_description').val() && $('#add_goal_amount_goal').val() && $('#add_goal_amount_goal').val()<21000000001 && ValidateAmount($('#add_goal_amount_goal').val())==true ) {
      $('#AddGoal').hide();
      $( "#add_goal_title" ).prop( "disabled", true );
      $( "#add_goal_description" ).prop( "disabled", true );
      $( "#add_goal_amount_goal" ).prop( "disabled", true );
      $('#addgoal_loader').show();
      $('#addgoal_loader_text').show();
      var title=$("#add_goal_title").val();
      var description=$("#add_goal_description").val();
      var goal=$("#add_goal_amount_goal").val();
      $.post("/add",{title: title,description: description,goal: goal}, function(data){
         if(data.status==="success"){
           $(location).attr('href', '/goal/'+data.goalID);
         }
      });
    }
  });


});
