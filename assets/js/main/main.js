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

  $("[name=date]").val((new Ndate).toString())
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

while(local.get('draft')) {
  if(confirm("You haven't saved the last session. Start where you lift over ?"))
  {
    let draft = JSON.parse(local.get('draft'))
    $("#session-project_id").val(draft.project_id)
    $("#start-btn").removeAttr('disabled')
    session_timer.hrs = parseInt(draft.time.split(":")[0])
    session_timer.mins = parseInt(draft.time.split(":")[1])
    session_timer.secs = parseInt(draft.time.split(":")[2])
    session_timer.display()
    local.remove('draft')
  }
  else if(confirm("You won't be able to restore the unsaved session again"))
    local.remove('draft')
}