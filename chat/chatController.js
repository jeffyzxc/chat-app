(function(window, angular, undefined){
  angular.module('chatApp')
    .controller("chatCtrl", ['$rootScope','$scope', function($rootScope, $scope){
      var vm = this;
      var socket = window.io('localhost:3000/');
      vm.newMessage = undefined;
      vm.messages = [];
      vm.username = undefined;
      vm.isTypings = [];



      socket.on("group-message-data", function(msg_data){
          $scope.$apply(function(){
              vm.messages.push(msg_data);
          });
          console.log(msg_data);
      });

      socket.on("user-is-typing-data", function(msg_data){
          $scope.$apply(function(){

            console.log(msg_data["messages"]);
            if(msg_data['username'] != vm.username){
                if(msg_data["messages"] != "" || msg_data["message"] != null || msg_data["messages"] != "" ){
                    vm.isTypings.indexOf(msg_data["username"]) === -1 ? vm.isTypings.push(msg_data["username"]) : console.log("This item already exists");
                }
                else {
                  var index = vm.isTypings.indexOf(msg_data["username"]);
                  if (index > -1) {
                      vm.isTypings.splice(index, 1);
                  }
                }
            }

          });
      });




      var init = function(){
          console.log("THIS IS A TEST");
      };
      init();
      socket.on("receive-private-message", function(msg_data){
            //console.log(msg_data);
            $rootScope.$emit("add-private-message",msg_data);

            console.log(msg_data);
      });


      $rootScope.$on('add-private-message', function(event, msg_data){
        $scope.$apply(function(){
            vm.messages.push({ username: msg_data["username"]+" whispered you! ",
                               message: msg_data["message"]
            });
        });
      });

      vm.createUser = function(username){
        console.log("user '"+username+"' successfully TITE");
        socket.emit('new-user', username);
        $rootScope.$emit('username', username);
      };

      $rootScope.$on('username', function(event, username){
        vm.username = username;
      });
      console.log("test");
      $scope.load = function() {
        alert("Window is loaded");
      }

      vm.sendMessage = function(){
          var msgTrim = vm.newMessage;
            if(msgTrim.substring(0,2) == "/w"){

                var index = msgTrim.substring(3).trim().indexOf(" ");
                var name = msgTrim.substring(3).trim().substring(0,index);
                var message = msgTrim.substring(index+4).trim();
                var newMessage = {
                  username: name,
                  message: message
                };
                vm.messages.push({ username: "You whispered "+name,
                                   message: message
                });
                socket.emit("new-private-message",newMessage);
            } else {
              var newMessage = {
                username: vm.username,
                message: vm.newMessage
              };

              socket.emit("group-message",newMessage);
            }

      };


      socket.on("isTyping", function(msg_data){
            $rootScope.$emit("add-private-message",msg_data);
      });

      $scope.$watch(function(){
          return vm.newMessage;
      }, function(){

         var isTyping = {
           username : vm.username,
           messages : vm.newMessage
         };
         if(vm.newMessage != null || vm.newMessage != undefined){
         socket.emit("user-is-typing",isTyping);
         }
      });


      $scope.$watch(function(){
          return vm.username;
      }, function(){
        if (vm.username){
            console.log("This is the value for username" ,vm.username);
        }
      });

    }]);
})(window, window.angular);
