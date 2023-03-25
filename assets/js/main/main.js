import "./projects.js"
import "./sessions.js"
import "./goals.js"

(function () {
  listProjects()
  listSessions()

  $("[name=token]").val(local.get('token'))

  $("#date_display").html((new Ndate()).toString())
  listGoals()
  listWeeklyGoals();

  $("#next_day").click(function () {
    let date = new Ndate($("#date_display").html());
    date.addDays(1);
    syncManager.empty('goal')
    syncManager.empty('weekly_goal')
    $("#date_display").html(date.toString());
    listGoals()
    listWeeklyGoals()
  })

  $("#prev_day").click(function () {
    let date = new Ndate($("#date_display").html());
    date.addDays(-1);
    syncManager.empty('goal')
    syncManager.empty('weekly_goal')
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
})()

$("#logout").click(function () {
  local.remove("id")
  local.remove("token")
  window.location.href = "membership"
})

function listProjects() {
  AJAX.ajax ({
    url: "api/projects",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let project of xhr.parsed)
            syncManager.add('project', project)

          break;

        case 204:
          break;

        default:
          alert('Cannot list projects. Please, reload')
      }
    }
  })
}

function listSessions() {
  AJAX.ajax({
    url: "api/sessions",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let session of xhr.parsed)
            syncManager.add('session', session)

          break;

        case 204:
          break;

        default:
          alert('Cannot list projects. Please, reload')
      }
    }
  })
}

function listGoals() {
  AJAX.ajax({
    url: "api/goals",
    type: "GET",
    data: {
      token: local.get('token'),
      date: $("#date_display").html()
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let goal of xhr.parsed) {
            goal.date = $("#date_display").html()
            syncManager.add('goal', goal)
          }
          break;

        case 204:
          break;

        default:
          alert('Cannot list goals. Please, reload')
      }
    }
  })
}

function listWeeklyGoals() {
  AJAX.ajax({
    url: "api/goals/getWeekly",
    type: "GET",
    data: {
      token: local.get('token'),
      date: $("#date_display").html()
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let project_id in xhr.parsed) {
            xhr.parsed[project_id].project_id = project_id
            syncManager.add('weekly_goal', xhr.parsed[project_id])
          }
          break;

        case 204:
          break;

        default:
          alert('Cannot list goals. Please, reload')
      }
    }
  })
}