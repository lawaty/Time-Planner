import "./projects.js"
import "./sessions.js"
import "./goals.js"

(function () {


  // listGoals()

  $("[name=token]").val(local.get('token'))
})()

function logout() {
  local.remove("id")
  local.remove("token")
  window.location.href = "membership"
}

function listGoals() {
  AJAX.ajax({
    url: "api/goals",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let goal of xhr.parsed) {
            let remaining = goal.percent < 100 ? parseInt(((100 - goal.percent) / 100) * goal.goal_time) : 0;
            $("#goals-list").append(`
              <li class="mb-3 goal" id="goal-${goal.id}">
                <div class="d-flex justify-content-between">
                  <span style="color:${goal.color}">
                    ${goal.project_name}
                  </span>
                  <i class="bi bi-trash" onclick="deleteGoal($(this).closest('.goal').attr('id').split('-')[1])"></i>
                </div>

                <div class="progress my-2" style="position:relative;height:30px;">
                  <div class="progress-bar" role="progressbar" style="width: ${goal.percent}%;background-color:#03a9f4;" aria-valuenow="${goal.percent}" aria-valuemin="0" aria-valuemax="100"></div>
                  <p class="w-100 h-100 d-absolute d-flex justify-content-center align-items-center" style="position:absolute">${remaining} minutes</p>
                </div>

              </li>
            `)
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
            $(`#goal-${goal_id}`).remove()
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}