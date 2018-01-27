var socket = io.connect('http://localhost:8080');

socket.on('connect', function (data) {
    $('#status').html('Connected to Chat...');
    var nickname = prompt('What is your nickname?');

    socket.emit('join', nickname);
});

socket.on('messages', function (data) {
    insertMessage(data);
});

socket.on('add chatter', function (name) {
    var chatter = $('<li>').html(name).addClass('chatter-name');
    $(chatter).attr('name', name);
    $('#chatters').append(chatter);
});

socket.on('remove chatter', function (name) {
    $('#chatters li[name=' + name + ']').remove();
});

$('#chat_form').submit(function (e) {
    var message = $('#chat_input').val();
    if (message) {
        socket.emit('messages', message);
        $('#chat_input').val('');
    }
});

function insertMessage(data) {
    $('.message-content').append($('#message').clone().attr('id', '').html(data));
}