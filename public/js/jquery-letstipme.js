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
  var datetxformat = function (timestamp) {
    var d = new Date(timestamp*1000);
    return d.toUTCString();
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

  $( document ).on( 'mouseover', '.buy_link', function () {
    $(this).css('cursor','pointer');
    $(this).css('background-color','#151b29');
  });
  $( document ).on( 'mouseout', '.buy_link', function () {
    $(this).css('background-color','#11141b');
  });
  $( document ).on( 'click', '.buy_link', function () {
    window.open($(this).attr('buy_link'), '_blank');
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
    $('#confirm_addr_to_copy').addClass("text-success");
    $('#confirm_addr_to_copy').html("<i class=\"fas fa-clipboard-check\"></i> Copied to clipboard!");
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

  ///footer click
  $( document ).on( 'mouseover', '#footer', function () {
    $(this).css('cursor','pointer');
  });
  $( document ).on( 'click', '#footer', function () {
    window.open('https://github.com/oxhak/Lets-Tip-Me', '_blank');
  });

  // body load
  if ( $(location).attr('pathname') == "/about" ) {
    $( "#body-load" ).load( "/about.html" );
  }
  else if ( $(location).attr('pathname') == "/error" ) {
    $( "#body-load" ).load( "/error_wallet.html", function() {
    });
  }
  else if ( $(location).attr('pathname') == "/error_db" ) {
    $( "#body-load" ).load( "/error_db.html", function() {
    });
  }
  else if ( $(location).attr('pathname') == "/buy" ) {
    $( "#body-load" ).load( "/buy.html", function() {
    });
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
          if(data!="no goals"){
            $.each(data, function (i, value) {
              if(value.unlimited=="true"){
                $("#funding_goals_index_content"+value.categorie).append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-left goal_link\" goallink=\"/g/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small>"+value.balance+" XTC / Unlimited · by "+value.author+"</small></span><div class=\"progress\"><div class=\"progress-bar bg-success\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"></div></div></div></li>");
              } else {
                const percentage = Math.round((value.balance*100)/value.goal);
                var progress_bar_bg_color;
                if(percentage<30){
                  progress_bar_bg_color="bg-danger";
                } else if((percentage>30)&&(percentage<70)){
                  progress_bar_bg_color="bg-warning";
                } else if(percentage>70){
                  progress_bar_bg_color="bg-success";
                }
                $("#funding_goals_index_content"+value.categorie).append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-left goal_link\" goallink=\"/g/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small>"+value.balance+" XTC / "+value.goal+" XTC ("+percentage+"%) · by "+value.author+"</small></span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></div></li>");
              }
            });
          } else {
            $("#funding_goals_index_content"+value.categorie_id).append("<li class=\"list-group-item justify-content-between list-group-item-letstipme mb-3\"><span class=\"text-white\">There are yet no goals in this categorie.<br><a href='/my_goals'><i class=\"fas fa-arrow-circle-right\"></i> Add a new goal</a></small></li>");
          }
          });


          $("#funding_goals_index").append("</div>");
        });
      });

      // Get successful goals on load
      $.get("/goals_successful", function(data){
      if(data!="no goals"){
        $.each(data, function (i, value) {
            const percentage = Math.round((value.balance*100)/value.goal);
            var progress_bar_bg_color;
            if(percentage<30){
              progress_bar_bg_color="bg-danger";
            } else if((percentage>30)&&(percentage<70)){
              progress_bar_bg_color="bg-warning";
            } else if(percentage>70){
              progress_bar_bg_color="bg-success";
            }
            $("#funding_goals_successful_index_content").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-left goal_link\" goallink=\"/g/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small>"+value.balance+" XTC / "+value.goal+" XTC ("+percentage+"%) · by "+value.author+"</small></span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></div></li>");
        });
      } else {
        $("#funding_goals_successful_index_content").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme mb-3\"><span class=\"text-white\">There are no reached goals yet.<br><a href='/my_goals'><i class=\"fas fa-arrow-circle-right\"></i> Add a new goal</a></small></li>");
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
    $( "#body-load" ).load( "/settings.html", function() {
      $.get( "/user_settings", function( data ) {
        if(data.enabled_2FA==="true"){
          $("#ul_2FA").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme bg-success\"><span class=\"text-white\"><i class=\"fas fa-check\"></i> 2FA enabled</span></li>");
        } else if(data.enabled_2FA==="false"){
          $("#ul_2FA").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-center settings_li\" id=\"settings_2FA\"><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><p class=\"text-danger\"><b>You are strongly advised to enable two-factor authentication for your account security!</b></p><button id=\"Enable2FA\" class=\"btn btn-danger mb-2\"><i class=\"fas fa-exclamation-triangle\"></i> Enable 2FA</button></<span></span></li>");
        }
      });
    });
  }
  else if ( $(location).attr('pathname') == "/add" ) {
    $( "#body-load" ).load( "/add_goal.html", function() {
      $.get("/categories", function(data){
        $.each(data, function (i, item) {
          if(item.categorie_id!="1" && item.categorie_id!="2"){
          $('#add_goal_category').append($('<option>', {value:item.categorie_id, text:item.categorie}));
          }
        });
      });
    });
  }
  else if ( $(location).attr('pathname') == "/my_goals" ) {
    $( "#body-load" ).load( "/my_goals.html", function() {

      // Get goals on load
      $.get("/my_goals_index", function(data){
        if(data==="2FA disabled"){
          $("#my_goals_content").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme mb-4\"><span class=\"text-warning\"><b>You must enable two-factor authentication before you can add and manage goals.</b></small></li>");
        } else if(data[0]){
          $.each(data, function (i, value) {
            if(value.unlimited=="true"){
              $("#my_goals_content").append("<ul class=\"list-group mb-4\"><li class=\"list-group-item justify-content-between list-group-item-letstipme text-left goal_link\" goallink=\"/g/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small>"+value.balance+" XTC / Unlimited</small></span><div class=\"progress\"><div class=\"progress-bar bg-success\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"></div></div></div></li><li class=\"list-group-item justify-content-between list-group-item-letstipme letstipme-lighter-background truncate low_padding_li\"><span class=\"text-white\"><small><i class=\"fas fa-directions\"></i> "+value.redirect_address+"</small></li></ul>");
            } else {
              const percentage = Math.round((value.balance*100)/value.goal);
              var progress_bar_bg_color;
              if(percentage<30){
                progress_bar_bg_color="bg-danger";
              } else if((percentage>30)&&(percentage<70)){
                progress_bar_bg_color="bg-warning";
              } else if(percentage>70){
                progress_bar_bg_color="bg-success";
              }
                if(value.status==="success"){
                $("#my_goals_content").append("<ul class=\"list-group mb-4\"><li class=\"list-group-item justify-content-between list-group-item-letstipme text-left goal_link\" goallink=\"/g/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small>"+value.balance+" XTC / "+value.goal+" XTC ("+percentage+"%)</small></span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></div></li><li class=\"list-group-item justify-content-between list-group-item-letstipme bg-success low_padding_li\" style=\"word-wrap:break-word;\"><span class=\"text-white\"><small><b>This goal has been successfully reached!</b></small></li><li class=\"list-group-item justify-content-between list-group-item-letstipme letstipme-lighter-background truncate low_padding_li\"><span class=\"text-white\"><small><i class=\"fas fa-directions\"></i> "+value.redirect_address+"</small></li></ul>");
                } else {
                $("#my_goals_content").append("<ul class=\"list-group mb-4\"><li class=\"list-group-item justify-content-between list-group-item-letstipme text-left goal_link\" goallink=\"/g/"+value._id+"\"><div><h5 class=\"text-white\">"+value.title+"</h5><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small>"+value.balance+" XTC / "+value.goal+" XTC ("+percentage+"%)</small></span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></div></li><li class=\"list-group-item justify-content-between list-group-item-letstipme letstipme-lighter-background truncate low_padding_li\"><span class=\"text-white\"><small><i class=\"fas fa-directions\"></i> "+value.redirect_address+"</small></li></ul>");
                }

              }
          });
        } else {
          $("#my_goals_content").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme mb-4\"><span class=\"text-white\">You have not added a goal yet.</small></li>");
        }
        if(data!="2FA disabled"){
          $("#my_goals_content").append("<button id=\"my_goals_add_goal\" class=\"btn btn-primary\"><i class=\"fas fa-plus\"></i> Add a new goal</button>");
        } else {
          $("#my_goals_content").append("<button id=\"my_goals_enable_2FA\" class=\"btn btn-warning\"><i class=\"fas fa-arrow-circle-right\"></i> Settings</button>");
        }
      });
    });
  }
  else if ($(location).attr('pathname').includes("/g/")) {
    $( "#body-load" ).load( "/goal.html", function() {
      $.post("/goal",{_id: escape($(location).attr('pathname').replace("/g/", ""))}, function(data){
        if(data === "Goal not found"){
          alert("Goal not found");
        } else if(data === "Bad ID")  {
          alert("Bad ID");
        } else if(data === "Wallet Offline")  {
          alert("Wallet is offline, please try again later...");
        } else {
          var value = data[0];
          var goal_balance=0;
          // get Transactions
          $.post("/goal_txs",{wallet_index: value.wallet_index}, function(data){
            if(data != "No TXs"){
              data.forEach(function(value, index, array) {
                // add transactions
                if(value.type==="in"){
                  var txcolor="text-success";
                  var txsign="+";
                  goal_balance+=value.amount;
                } else if(value.type==="out"){
                  var txcolor="text-danger";
                  var txsign="-";
                }
                $("#funding_goal_transactions").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme tx_link\" style=\"word-wrap:break-word;\" tx_link=\"https://explorer.torque.cash/tx/"+value.txid+"\"><span class=\"text-white\"><small><span class=\""+txcolor+"\"><b>"+txsign+""+value.amount/100+" XTC</b></span> · TX <b>"+value.txid+"</b> · "+datetxformat(value.timestamp)+"</small></li>");

                if(index === array.length - 1) {
                  $("#goal_balance").text(goal_balance/100);
                }
              });
            } else {
              $("#funding_goal_transactions").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme\"><span class=\"text-white\">There are currently no transactions for this goal.</small></li>");
            }
          });
          //goal progress
          $("#funding_goal").append("<div class=\"col-md-12 text-center\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h4 class=\"text-center\">"+value.title+"</h4></h4><hr class=\"mb-4\"><ul id=\"funding_goal_progress\" class=\"list-group\">");
          if(value.unlimited=="true"){
            $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme letstipme-lighter-background\"><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small><span id=\"goal_balance\">"+value.balance+"</span> XTC / Unlimited</small></span><div class=\"progress\"><div class=\"progress-bar bg-success\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"></div></div></li>");
          } else {
            const percentage = Math.round((value.balance*100)/value.goal);
            var progress_bar_bg_color;
            if(percentage<30){
              progress_bar_bg_color="bg-danger";
            } else if((percentage>30)&&(percentage<70)){
              progress_bar_bg_color="bg-warning";
            } else if(percentage>70){
              progress_bar_bg_color="bg-success";
            }
            $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme letstipme-lighter-background\"><span class=\"letstipme-main-color-text\"><span class=\"text-white\"><small><span id=\"goal_balance\">"+value.balance+"</span> XTC / "+value.goal+" XTC ("+percentage+"%)</small></span><div class=\"progress\"><div class=\"progress-bar "+progress_bar_bg_color+"\" role=\"progressbar\" aria-valuenow=\"75\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: "+percentage+"%\"></div></div></li>");
          }
          //goal description
          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-left\"><span class=\"text-white\"><p>"+value.description.replace(/\n/g, "<br>")+"</p></li>");

        if(value.status==="open"){
          //goal donations address
          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme goal_donate_copy\" style=\"word-wrap:break-word;\"><span class=\"text-white\"><small><b id=\"addr_to_copy\">"+value.wallet_address+"</b></small><br><small id=\"confirm_addr_to_copy\"><i class=\"far fa-copy\"></i> Copy to donate</small></li>");

          //goal address qrcode
          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme\" style=\"word-wrap:break-word;\"><span class=\"text-white\"><small><img class=\"rounded\" src=\""+value.address_qrcode+"\"></img></small></li>");
        } else if(value.status==="success") {
              //goal successful
              $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme bg-success\" style=\"word-wrap:break-word;\"><span class=\"text-white\"><small><b>This goal has been successfully reached! Thanks to all the donators!</b></small></li>");
        }

          //goal by
          $("#funding_goal_progress").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme letstipme-lighter-background low_padding_li\"><span class=\"text-white\"><small>Goal added by "+value.author+" · "+dateformat(value.creation_date)+"</small></li>");

          //goal progress end
          $("#funding_goal").append("</ul></div>");

          //transactions history
          $("#funding_goal").append("<div class=\"col-md-12\"><h4 class=\"d-flex justify-content-between align-items-center mb-3\"><h4 class=\"text-center\"><br>Transactions History</h4></h4><hr class=\"mb-4\"><ul id=\"funding_goal_transactions\" class=\"list-group\">");

          //transactions history end
          $("#funding_goal").append("</ul></div>");
        }
      });
    });
  }
  $( document ).on( 'click', '#my_goals_add_goal', function () {
    $(location).attr('href', '/add');
  });
  $( document ).on( 'click', '#my_goals_enable_2FA', function () {
    $(location).attr('href', '/settings');
  });
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
      var login_2FA_code=$("#login_2FA_code").val();
      $.post("/login",{email: email,password: password, login_2FA_code: login_2FA_code}, function(data){
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

  //Settings
  ///copy 2FA key to clipboard
  $( document ).on( 'mouseover', '.settings_li', function () {
    $(this).css('cursor','pointer');
    $(this).css('background-color','#151b29');
  });
  $( document ).on( 'mouseout', '.settings_li', function () {
    $(this).css('background-color','#11141b');
  });
  $( document ).on( 'click', '#copy_2FA_key_li', function () {
    copyToClipboard('#2FA_key_to_copy');
    $('#copy_2FA_key').addClass("text-success");
    $('#copy_2FA_key').html("<i class=\"far fa-copy\"></i> Copied to clipboard!");
  });

  $( document ).on( 'click', '#Verify2FA', function () {
    $.post("/2FA",{code_2FA: $('#code_2FA').val()}, function(data){
      if(data==="true"){
        $('#li_2FA_QRcode').remove();
        $('#copy_2FA_key_li').remove();
        $('#li_2FA_verify').remove();
        $("#ul_2FA").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme bg-success\"><span class=\"text-white\"><i class=\"fas fa-check\"></i> 2FA enabled</span></li>");
      } else if(data==="false"){
        $('#bad_2FA_error').show();
      }
    });
  });

  $( document ).on( 'click', '#Enable2FA', function () {
    $('#settings_2FA').remove();
    $.get( "/2fA", function( data ) {
      $("#ul_2FA").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-center settings_li\" id=\"li_2FA_QRcode\"><span class=\"text-white\"><p><small><b>Scan this QRcode with Google Authenticator</b></small></p><img src=\""+data.qrcode_2FA+"\"></img></span></li>");

      $("#ul_2FA").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-center settings_li\" id=\"copy_2FA_key_li\"><span class=\"text-white 2FA_key\"><small class=\"text-warning\"><b>Save this 2FA key somewhere with care!</b></small><br><b class=\"text-white\"><i class=\"fas fa-key\"></i> <span id=\"2FA_key_to_copy\">"+data.secret_2FA+"</span></b><br><small id=\"copy_2FA_key\"><i class=\"far fa-copy\"></i> Copy this 2FA key</small></span></li>");

      $("#ul_2FA").append("<li class=\"list-group-item justify-content-between list-group-item-letstipme text-center settings_li\" id=\"li_2FA_verify\"><span class=\"text-white\"><p><small><b>Enter the 2FA code shown in Google Authenticator</b></small><br></p><form role=\"form\" action=\"#\" onsubmit=\"return false;\"><label class=\"starthidden text-danger\" for=\"code_2FA\" id=\"bad_2FA_error\"><b><i class=\"fas fa-exclamation-triangle\"></i> Bad 2FA code</b></label><input type=\"text\" class=\"form-control set-input-2FA-code-width\" id=\"code_2FA\" name=\"code_2FA\" autocomplete=\"off\" placeholder=\"Enter 2FA code\" maxlength=\"6\"></div><br><button id=\"Verify2FA\" class=\"btn btn-primary mb-2\"><i class=\"fas fa-arrow-circle-right\"></i> Enable 2FA</button></form></span></li>");
    });
  });



  //add goal
  $( document ).on( 'click', '#AddGoal', function () {
    $("#AddGoalError").hide();
    if( $('#add_goal_title').val() && $('#add_goal_description').val() && $("#add_goal_category").val() && $('#add_goal_unlimited_address_redirect').val() && $('#add_goal_amount_goal').val() && $('#add_goal_amount_goal').val()<21000000001 && ValidateAmount($('#add_goal_amount_goal').val())==true && $('#add_goal_2FA_code').val()  ) {
      $('#bad_2FA_error').hide();
      $('#bad_address_redirect_error').hide();
      $('#AddGoal').hide();
      $( "#add_goal_title" ).prop( "disabled", true );
      $( "#add_goal_description" ).prop( "disabled", true );
      $( "#add_goal_category" ).prop( "disabled", true );
      $( "#add_goal_limited" ).prop( "disabled", true );
      $( "#add_goal_unlimited" ).prop( "disabled", true );
      $( "#add_goal_amount_goal" ).prop( "disabled", true );
      $( "#add_goal_unlimited_address_redirect" ).prop( "disabled", true );
      $( "#add_goal_2FA_code" ).prop( "disabled", true );
      $('#addgoal_loader').show();
      $('#addgoal_loader_text').show();
      var title=$("#add_goal_title").val();
      var description=$("#add_goal_description").val();
      var category=$("#add_goal_category").val();
      var goal=$("#add_goal_amount_goal").val();
      var redirect_address=$("#add_goal_unlimited_address_redirect").val();
      var add_goal_2FA_code=$("#add_goal_2FA_code").val();
      var unlimited;
      if($( "#add_goal_limited" ).prop('checked')===true){
        unlimited="false";
      } else if($( "#add_goal_unlimited" ).prop('checked')===true) {
        unlimited="true";
        goal=1;
      }
      $.post("/add",{title: title,description: description,category: category,goal: goal,redirect_address: redirect_address,unlimited: unlimited,add_goal_2FA_code: add_goal_2FA_code}, function(data){
        if(data.status==="success"){
          $(location).attr('href', '/g/'+data.goalID);
        }
        else if(data.status==="2FA disabled")  {
          $(location).attr('href', '/my_goals');
        }
        else if(data.status==="Not logged")  {
          $(location).attr('href', '/login');
        }
        else if(data.status==="Wallet offline")  {
          $(location).attr('href', '/error');
        }
        else if(data.status==="Bad 2FA")  {
          $('#AddGoal').show();
          $( "#add_goal_title" ).prop( "disabled", false );
          $( "#add_goal_description" ).prop( "disabled", false );
          $( "#add_goal_category" ).prop( "disabled", false );
          $( "#add_goal_limited" ).prop( "disabled", false );
          $( "#add_goal_unlimited" ).prop( "disabled", false );
          $( "#add_goal_amount_goal" ).prop( "disabled", false );
          $( "#add_goal_unlimited_address_redirect" ).prop( "disabled", false );
          $( "#add_goal_2FA_code" ).prop( "disabled", false );
          $('#addgoal_loader').hide();
          $('#addgoal_loader_text').hide();
          $('#bad_2FA_error').show();
        }
        else if(data.status==="Bad redirect address")  {
          $('#AddGoal').show();
          $( "#add_goal_title" ).prop( "disabled", false );
          $( "#add_goal_description" ).prop( "disabled", false );
          $( "#add_goal_category" ).prop( "disabled", false );
          $( "#add_goal_limited" ).prop( "disabled", false );
          $( "#add_goal_unlimited" ).prop( "disabled", false );
          $( "#add_goal_amount_goal" ).prop( "disabled", false );
          $( "#add_goal_unlimited_address_redirect" ).prop( "disabled", false );
          $( "#add_goal_2FA_code" ).prop( "disabled", false );
          $('#addgoal_loader').hide();
          $('#addgoal_loader_text').hide();
          $('#bad_address_redirect_error').show();
        }
      });
    }
  });

  $( document ).on( 'change', '#add_goal_limited', function () {
    if(this.checked) {
      $('#add_goal_unlimited').prop('checked', false);
      $('#add_goal_limited_amount_needed').show();
      $('#add_goal_unlimited_address_redirect_label').text('To which XTC address to widthdraw reached goal fund?');
    }
  });
  $( document ).on( 'change', '#add_goal_unlimited', function () {
    if(this.checked) {
      $('#add_goal_limited').prop('checked', false);
      $('#add_goal_limited_amount_needed').hide();
      $('#add_goal_unlimited_address_redirect_label').text('To which XTC address to redirect donations?');
    }
  });


});
