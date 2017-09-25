'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

const BASE_URL = "https://curiosone-bot.herokuapp.com/"

var Messenger = function () {
  function Messenger() {
    _classCallCheck(this, Messenger);

    this.messageList = [];
    this.deletedList = [];

    this.me = 1; // completely arbitrary id
    this.them = 5; // and another one

    this.lastBotMessage = null;

    this.onRecieve = function (message) {
      return console.log('Recieved: ' + message.text);
    };
    this.onSend = function (message) {
      return console.log('Sent: ' + message.text);
    };
    this.onDelete = function (message) {
      return console.log('Deleted: ' + message.text);
    };
  }

  Messenger.prototype.send = function send() {
    var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    text = this.filter(text);

    if (this.validate(text)) {
      var message = {
        user: this.me,
        text: text,
        time: new Date().getTime()
      };

      this.messageList.push(message);

      this.onSend(message);
    }
  };

  Messenger.prototype.recieve = function recieve() {
    var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

    text = this.filter(text);

    if (this.validate(text)) {
      var message = {
        user: this.them,
        text: text,
        time: new Date().getTime()
      };

      this.messageList.push(message);

      this.onRecieve(message);
    }
  };

  Messenger.prototype.delete = function _delete(index) {
    index = index || this.messageLength - 1;

    var deleted = this.messageLength.pop();

    this.deletedList.push(deleted);
    this.onDelete(deleted);
  };

  Messenger.prototype.filter = function filter(input) {
    // such amazing filter there right?
    return input;
  };

  Messenger.prototype.validate = function validate(input) {
    return !!input.trim().length; // an amazing example of validation I swear.
  };

  return Messenger;
}();

var BuildHTML = function () {
  function BuildHTML() {
    _classCallCheck(this, BuildHTML);

    this.messageWrapper = 'message-wrapper';
    this.circleWrapper = 'circle-wrapper';
    this.textWrapper = 'text-wrapper';

    this.meClass = 'me';
    this.themClass = 'them';
  }

  BuildHTML.prototype._build = function _build(text, who) {
    return '<div class="' + this.messageWrapper + ' ' + this[who + 'Class'] + '">\n              <div class="' + this.circleWrapper + ' animated bounceIn"></div>\n              <div class="' + this.textWrapper + '">...</div>\n            </div>';
  };

  BuildHTML.prototype.me = function me(text) {
    return this._build(text, 'me');
  };

  BuildHTML.prototype.them = function them(text) {
    return this._build(text, 'them');
  };

  return BuildHTML;
}();

$(document).ready(function () {
  var messenger = new Messenger();
  var buildHTML = new BuildHTML();

  var $input = $('#input');
  var $send = $('#send');
  var $content = $('#content');
  var $inner = $('#inner');

  var statusClass = {
    ok: 'online',
    success: 'online',
    error: 'error',
    timeout: 'warning'
  }

 /**
  * Checks bot status
  */
  setInterval(function getStatus() {
    $.getJSON(BASE_URL + 'status', function(response, status){
      status = response.status || status;
      $('#badge').addClass(statusClass[status])
    });
  }, 5000);

  function safeText(text) {
    $content.find('.message-wrapper').last().find('.text-wrapper').text(text);
  }

  function animateText() {
    var wrapper = $content.find('.message-wrapper').last().find('.text-wrapper');
    setTimeout(function () {
      wrapper.addClass('animated fadeIn');
    }, 350);
  }

  function scrollBottom() {
    $($inner).animate({
      scrollTop: $($content).height()
    }, {
      queue: false,
      duration: 'ease'
    });
  }

  function buildSent(message) {
    console.log('Sending: ', message.text);

    $content.append(buildHTML.me(message.text));
    safeText(message.text);
    animateText();

    scrollBottom();
  }

  function buildRecieved(message) {
    console.log('Recieving: ', message.text);

    $content.append(buildHTML.them(message.text));
    safeText(message.text);
    animateText();

    scrollBottom();
  }

  /**
   * Clear the input box and render the message in the list.
   */
  function sendMessage() {
    var text = $input.val();
    var body = {message: text, scope: messenger.lastBotMessage ? messenger.lastBotMessage.scope : ""};

    messenger.send(text);
    if(messenger.validate(text))
      $.post(BASE_URL + 'talk', JSON.stringify(body), function(response){
          messenger.lastBotMessage = response;
          messenger.recieve(response.message);
      });

    $input.val('');
    $input.focus();
  }

  messenger.onSend = buildSent;
  messenger.onRecieve = buildRecieved;

  $input.focus();

  /**
   * Event called when the send butto is clicked
   */
  $send.on('click', function (e) {
    sendMessage();
  });

  $(window).on('resize', function() {
    scrollBottom();
  });

  /**
   * Send the message on enter key.
   */
  $input.on('keydown', function (e) {
    var key = e.which || e.keyCode;

    // enter key
    if (key === 13) {
      e.preventDefault();
      sendMessage();
    }
  });
});
