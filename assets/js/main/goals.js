syncManager.registerType('goal', ['id', 'amount', 'date', 'repeat', 'progress', 'project_id'])
syncManager.registerType('weekly_goal', ['project_id', 'amount', 'progress'])

$(document).on('goal-added', function (e, goal) {
  if (goal.date != $("#date_display").html())
    return;

  $("#no-goals").hide();

  $("ul[observe=goal]").append(`
    <li class="mb-3 goal" data-id="${goal.id}" id="goal-${goal.id}">
      <div class="d-flex justify-content-between">
        <span style="color:${syncManager.get('project', goal.project_id).color}">
          ${syncManager.get('project', goal.project_id).name}
        </span>
        <i class="bi bi-trash" onclick="deleteGoal($(this).closest('.goal').attr('id').split('-')[1])"></i>
      </div>

      <div class="progress my-2" style="position:relative;height:30px;">
        <div class="progress-bar" role="progressbar" style="width:${goal.progress}%;background-color:#03a9f4;" aria-valuenow="${goal.progress}" aria-valuemin="0" aria-valuemax="100"></div>
        <p class="w-100 h-100 d-absolute d-flex justify-content-center align-items-center" style="position:absolute">${goal.amount} minutes</p>
      </div>
    </li>
  `)
})

$(document).on('weekly_goal-added', function (e, goal) {
  $("#no-weekly_goals").hide();

  $("ul[observe=weekly_goal]").append(`
    <li class="mb-3 goal" data-id="${goal.project_id}" id="weekly_goal-${goal.project_id}">
      <div class="d-flex justify-content-between">
        <span style="color:${syncManager.get('project', goal.project_id).color}">
          ${syncManager.get('project', goal.project_id).name}
        </span>
      </div>

      <div class="progress my-2" style="position:relative;height:30px;">
        <div class="progress-bar" role="progressbar" style="width:${goal.progress}%;background-color:#03a9f4;" aria-valuenow="${goal.progress}" aria-valuemin="0" aria-valuemax="100"></div>
        <p class="w-100 h-100 d-absolute d-flex justify-content-center align-items-center" style="position:absolute">${goal.amount} minutes</p>
      </div>
    </li>
  `)
})

$(document).on('goal-removed', function (e, goal) {
  $(`[observe=goal] [data-id=${goal.id}]`).remove()
})

$(document).on('weekly_goal-removed', function (e, goal) {
  $(`[observe=weekly_goal] [data-id=${goal.project_id}]`).remove()
})

$(document).on('goal-changed session-changed', function () {
  listWeeklyGoals()
})

$(document).on('session-added', function(e, session) {
  for(let goal of syncManager.goal){
    if(session.project_id == goal.project_id){
      let progress = (goal.progress / 100 * goal.amount + session.time) * 100
      syncManager.edit('goal', goal.id, 'progress', progress)
      break;
    }
  }
})

$(document).on('session-removed', function(e, session) {
  for(let goal of syncManager.goal){
    if(session.project_id == goal.project_id){
      let progress = (goal.progress / 100 * goal.amount - session.time) * 100
      syncManager.edit('goal', goal.id, 'progress', progress)
      break;
    }
  }
})

$(document).on('project-removed', function (e, project) {
  let goals = syncManager.goal
  for (let id in goals)
    if (goals[id].project_id == project.id)
      syncManager.remove('goal', id)
})

$(document).on('goal-empty', function () { $("#no-goals").show() })

$(document).on('weekly_goal-empty', function () { $("#no-weekly_goals").show() })

let new_goal_form = Form.new($("#new_goal_form"))
new_goal_form.setCallback(function (xhr) {
  switch (xhr.status) {
    case 409:
      alert('Goal Already Exists For This Project')
      break;

    case 200:
      $("#new-goal-modal").modal('hide')

      if (new_goal_form.get('date') != $("#date_display").html())
        break;

      listGoals()
      break;

    default:
      alert("Something went wrong, please refresh")
  }
})

function deleteGoal(goal_id) {
  if (confirm("Are you sure you want to delete this goal?")) {
    AJAX.ajax({
      url: "api/goals/delete",
      type: "POST",
      data: {
        token: local.get('token'),
        goal_id: goal_id
      },
      complete: function (xhr) {
        switch (xhr.status) {
          case 200:
          case 204:
            syncManager.remove('goal', goal_id)
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}

window.deleteGoal = deleteGoal

let listingGoals = false;
function listGoals() {
  if (listingGoals) {
    $(document).off('goals-listed').one('goals-listed', listGoals)
    return;
  }
  listingGoals = true;

  syncManager.empty('goal')
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
      $(document).trigger('goals-listed')
      listingGoals = false;
    }
  })
}

let listingWeeklyGoals = false;
function listWeeklyGoals() {
  if (listingWeeklyGoals) {
    $(document).off('weekly_goals-listed').one('weekly_goals-listed', listWeeklyGoals)
    return;
  }
  listingWeeklyGoals = true;

  syncManager.empty('weekly_goal')
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
      $(document).trigger('weekly_goals-listed')
      listingWeeklyGoals = false;
    }
  })
}

export { listGoals, listWeeklyGoals }