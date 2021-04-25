$(document).ready(() => {
  // API requests
  $("#login-form").hide();
  $("#login-button").click(function() {
      $("#login-button").hide();
      $("#login-form").show();
      $("#login-form").submit(function(event) {
          const password = $("#password:text").val();
          if (password != "") {
              const data = {
                  password: password
              };
              fetch('https://sourscarcountdown.herokuapp.com/', {
                      method: 'POST',
                      mode: 'cors',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(data),
                  })
                  .then(response => response.text())
                  .then(function(data) {
                      if (data === 'Correct Password') {
                          window.location.href = 'admin.html';
                      }
                  });
          }
          event.preventDefault();
      });
  });

  // Socket io
  const socket = io();

  const timeLabel = $("#timer-label");
  const timeLeft = $("#time-left");
  const breakLength = $("#break-length");
  const sessionLength = $("#session-length");
  const beep = $("#beep");
  const counterStartBeep = $("#counter-start-beep");
  const counter60Beep = $("#counter-60-beep");
  const counter30Beep = $("#counter-30-beep");
  const counter15Beep = $("#counter-15-beep");
  const counter5Beep = $("#counter-5-beep");

  const btnStop = $("#stop");
  const btnStartPause = $("#start_stop");
  const btnReset = $("#reset");

  const btnBreakIncrement = $("#break-increment");
  const btnBreakDecrement = $("#break-decrement");
  const btnSessionIncrement = $("#session-increment");
  const btnSessionDecrement = $("#session-decrement");

  const SETTING_MODE = {
      INCREMENT: "INCREMENT",
      DECREMENT: "DECREMENT"
  }

  const MODE = {
      BREAK: "Break Time",
      SESSION: "Session Time"
  }

  let currentMode = MODE.SESSION;
  let countDownInterval = null;

  // Break Length Setting
  btnBreakIncrement.click(() => {
      setTimeLength(breakLength, SETTING_MODE.INCREMENT);
  })

  btnBreakDecrement.click(() => {
      setTimeLength(breakLength, SETTING_MODE.DECREMENT);
  })

  // Session Length Setting
  btnSessionIncrement.click(() => {
      setTimeLength(sessionLength, SETTING_MODE.INCREMENT);

      if (isClockRunning()) {
          return;
      }
      setTimer(sessionLength.text(), 0);
  })

  btnSessionDecrement.click(() => {
      setTimeLength(sessionLength, SETTING_MODE.DECREMENT);

      if (isClockRunning()) {
          return;
      }
      setTimer(sessionLength.text(), 0);
  })

  // Button Reset
  btnReset.click(() => {
      if (isClockRunning()) {
          btnStartPause.removeClass("active");
          clearInterval(countDownInterval);
      }

      beep.trigger("pause");
      beep.prop("currentTime", 0);

      currentMode = MODE.SESSION;
      timeLabel.text(MODE.SESSION);
      breakLength.text(5);
      sessionLength.text(62);
      setTimer(62, 0);
  });

  // Button Stop
  socket.on('buttonStop', message => {
      location.reload();
  })
  btnStop.click(() => {
      if (isClockRunning()) {
          btnStartPause.removeClass("active");
          clearInterval(countDownInterval);
      }

      beep.trigger("pause");
      beep.prop("currentTime", 0);

      if (currentMode === MODE.BREAK) {
          setTimer(breakLength.text(), 0);
      } else {
          setTimer(sessionLength.text(), 0);
      }
  });

  const setTimeLength = (element, mode) => {
      const currentValue = parseInt(element.text());

      if (isClockRunning()) {
          return;
      }

      if (mode === SETTING_MODE.INCREMENT && currentValue < 65) {
          element.text(currentValue + 1);
      } else if (mode === SETTING_MODE.DECREMENT && currentValue > 1) {
          element.text(currentValue - 1);
      }
  }

  const isClockRunning = () => {
      return btnStartPause.hasClass("active");
  }

  const addLeadingZero = (value) => {
      const newValue = value.toString();
      return newValue.length === 1 ? `0${newValue}` : newValue;
  }

  const setTimer = (min, sec) => {
      const newMin = addLeadingZero(min);
      const newSec = addLeadingZero(sec);
      timeLeft.text(`${newMin}:${newSec}`);
  }

  // Initialize Value 
  socket.on('timerTime', message => {
      if (message != "" || message.length != 0 || message != null) {
          const time = message.split("-")
          if (time[0] >= 60) {
              $("#time-left").css("color", "lightgreen");
              if (time[1] === 4 && time[0] === 60) {
                  counter60Beep.trigger("play");
              }
              if (time[1] === 0 && time[0] === 62) {
                  counterStartBeep.trigger("play");
              }
          } else {
              $("#time-left").css("color", "red");
              if (time[1] === 2 && time[0] === 30) {
                  counter30Beep.trigger("play");
              }
              if (time[1] === 3 && time[0] === 15) {
                  counter15Beep.trigger("play");
              }
              if (time[1] === 6 && time[0] === 5) {
                  counter5Beep.trigger("play");
              }
              if (time[1] === 6 && time[0] === 0) {
                  beep.trigger("play");
              }
          }
          setTimer(time[0], time[1]);
      } else {
          $("#time-left").css("color", "lightgreen");
          setTimer(62, 0);
      }
  })
  $("#time-left").css("color", "lightgreen");
  breakLength.text('5');
  sessionLength.text('62');
});