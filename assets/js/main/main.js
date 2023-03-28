import { listProjects } from "./projects.js"
import { listGoals, listWeeklyGoals } from "./goals.js"

$(document).ready(function () {
  listProjects()

  $("[name=token]").val(local.get('token'))

  $("#date_display").html((new Ndate()).toString())

  $("#next_day").click(function () {
    let date = new Ndate($("#date_display").html());
    date.addDays(1);
    $("#date_display").html(date.toString());
    listGoals()
    listWeeklyGoals()
  })

  $("#prev_day").click(function () {
    let date = new Ndate($("#date_display").html());
    date.addDays(-1);
    $("#date_display").html(date.toString());
    listGoals()
    listWeeklyGoals()
  })

  $("#date-container").on('mouseover click', function () {
    $("#day_display").html((new Ndate($("#date_display").html())).toLocaleDateString('en-US', { weekday: 'long' }))
    $("#day_display").show();
  }).on('mouseout', function () {
    $("#day_display").hide()
  })

  $("#logout").click(function () {
    local.remove("id")
    local.remove("token")
    window.location.href = "membership"
  })

  $("#volumeSlider").val(session_timer.volume)
  if (session_timer.muted) {
    $("#muted").show()
    $("#unmuted").hide()
  }
  else {
    $("#muted").hide()
    $("#unmuted").show()
  }
  $(window).on('beforeunload', function(event) {
    if (session_timer.formatClock() != '00:00:00')
      return '';
  });
})

window.mute = function mute() {
  session_timer.toggleMute();

  if (session_timer.muted) {
    $("#muted").show()
    $("#unmuted").hide()
  }
  else {
    $("#muted").hide()
    $("#unmuted").show()
  }
}