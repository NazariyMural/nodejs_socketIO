const socket = io();

function scrollToBottom() {
  // Selectors
  const messages = $("#messages");
  const newMessage = messages.children("li:last-child");
  // Heights
  const clientHeight = messages.prop("clientHeight");
  const scrollTop = messages.prop("scrollTop");
  const scrollHeight = messages.prop("scrollHeight");
  const newMessageHeight = newMessage.innerHeight();
  const lastMessageHeight = newMessage.prev().innerHeight();

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on("connect", function() {
  const params = $.deparam(window.location.search);

  socket.emit("join", params, function(err) {
    if (err) {
      alert(err);
      window.location.href = "/";
    } else {
      console.log("No error");
    }
  });
});

socket.on("disconnect", function() {
  console.log("Disconnected from server");
});

//generate people list on the left side
socket.on("updateUserList", function(users) {
  const ol = $("<ol></ol>");

  users.forEach(function(user) {
    ol.append($("<li></li>").text(user));
  });

  $("#users").html(ol);
});

//lissten new message from server and render it to the screen
socket.on("newMessage", function(message) {
  const formattedTime = moment(message.createdAt).format("h:mm a");
  const template = $("#message-template").html();
  const html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  $("#messages").append(html);
  scrollToBottom();
});

//locanion message listener
socket.on("newLocationMessage", function(message) {
  const formattedTime = moment(message.createdAt).format("h:mm a");
  const template = $("#location-message-template").html();
  const html = Mustache.render(template, {
    from: message.from,
    url: message.url,
    createdAt: formattedTime
  });

  $("#messages").append(html);
  scrollToBottom();
});

//Send message to the server
$("#message-form").on("submit", function(e) {
  e.preventDefault();

  const inputValue = $("[name=message]");
  if (inputValue) {
    socket.emit(
      "createMessage",
      {
        from: "Nazariy",
        text: inputValue.val()
      },
      function() {
        inputValue.val("");
      }
    );
  }
});

//add geolocation
const locationButton = $("#send-location");
locationButton.on("click", function() {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition(
    function(position) {
      socket.emit("createLocationMessage", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    function() {
      alert("Unable to fetch location.");
    }
  );
});
