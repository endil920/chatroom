function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<b>' + message + '</b>');
}

function processUserInput(chatApp, socket) {

  var message = $('#send-message').val();
  console.log(message)
  var systemMessage;

  if (message.charAt(0) == '/') {
    systemMessage = chatApp.proccesCommand(message);
    console.log(systemMessage);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
      console.log("this was a system message");
    }
  } else {

    chatApp.sendMessage($('#room').text(), message);

    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));

  }

  $('#send-message').val('');

}

var socket = io.connect();

$(document).ready(function() {
  console.log("document ready");
  var chatApp = new Chat(socket);

  socket.on('nameResult', function(result) {
    var message;

    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  socket.on('message', function(message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  socket.on('rooms', function(rooms) {
    $('#room-list').empty();

    for (var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    $('#room-list div').click(function() {
      chatApp.proccesCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  $('#send-form').submit(function() {
    console.log("form submitted");
    processUserInput(chatApp, socket);
    return false;
  });
});
