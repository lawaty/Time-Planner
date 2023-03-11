syncManager.registerType('goal', ['id', 'color', 'progress', 'amount', 'date', 'repeat', 'project_name', 'project_id'])

document.addEventListener('goal-added', function (e) {
  let goal = e.added

  $("#no-goals").hide();

  $("ul[observe=goals]").append(`
    <li class="mb-3 goal" data-id="${goal.id}" id="goal-${goal.id}">
      <div class="d-flex justify-content-between">
        <span style="color:${goal.color}">
          ${goal.project_name}
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

document.addEventListener('goal-removed', function (e) {
  let goal = e.removed

  $(`[observe=goals] [data-id=${goal.id}]`).remove()
})

document.addEventListener('goal-empty', function() {$("#no-goals").show()})

let new_goal_form = Form.new($("#new_goal_form"))
new_goal_form.setCallback(function (xhr) {
  switch (xhr.status) {
    case 409:
      alert('Goal Already Exists For This Project')
      break;

    case 200:
      if(new_goal_form.get('date') != $("#date_display").html())
        break;
      
      let project = syncManager.get('project', new_goal_form.get('project_id'))
      let goal = {
        id: xhr.parsed.id,
        color: syncManager.get('project', new_goal_form.get('project_id')).color,
        progress: xhr.parsed.progress,
        amount: new_goal_form.get('amount'),
        date: new_goal_form.get('date'),
        repeat: new_goal_form.get('repeat'),
        project_id: project.id,
        project_name: project.name
      }
      syncManager.add('goal', goal);

      $("#new-goal-modal").modal('hide')
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

window.deleteGoal = deleteGoal;